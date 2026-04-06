import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/authenticate";
import { computePossiblePayout, generateBetCode } from "../../utils/betUtils";

const userBetsRouter = Router();

const placeBetBodySchema = z.object({
  eventId: z.string().trim().min(1),
  marketType: z.string().trim().min(1),
  side: z.string().trim().min(1),
  stake: z.number().positive(),
  odds: z.number().positive(),
});

userBetsRouter.use("/user/bets", authenticate);

userBetsRouter.post("/user/bets/place", async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsedBody = placeBetBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: "Please enter a valid bet." });
    }

    const { eventId, marketType, side, stake } = parsedBody.data;

    if (stake < 50) {
      return res.status(400).json({ error: "Minimum stake is KES 50." });
    }

    if (stake > 100000) {
      return res.status(400).json({ error: "Maximum stake is KES 100,000." });
    }

    const stakeInCents = Math.round(stake * 100);

    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.sportEvent.findUnique({
        where: { eventId },
        select: {
          eventId: true,
          homeTeam: true,
          awayTeam: true,
          isActive: true,
          status: true,
        },
      });

      if (!event || !event.isActive || event.status === "FINISHED") {
        throw new Error("Event not available for betting");
      }

      const wallet = await tx.wallet.findUnique({
        where: { userId },
        select: {
          id: true,
          balance: true,
        },
      });

      if (!wallet) {
        throw new Error("Wallet not found. Please deposit first.");
      }

      if (wallet.balance < stakeInCents) {
        throw new Error("Insufficient balance");
      }

      const dbOdds = await tx.displayedOdds.findFirst({
        where: {
          eventId,
          marketType,
          side,
          isVisible: true,
        },
        orderBy: { displayOdds: "desc" },
        select: {
          bookmakerId: true,
          displayOdds: true,
        },
      });

      if (!dbOdds) {
        throw new Error("Odds no longer available");
      }

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            decrement: stakeInCents,
          },
        },
        select: {
          balance: true,
        },
      });

      let bet = null as {
        id: string;
        betCode: string;
        stake: number;
        displayOdds: number;
        potentialPayout: number;
        status: "PENDING" | "WON" | "LOST" | "VOID";
      } | null;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          bet = await tx.bet.create({
            data: {
              betCode: generateBetCode(),
              userId,
              eventId: event.eventId,
              bookmakerId: dbOdds.bookmakerId,
              marketType,
              side,
              selectionsSnapshot: [
                {
                  eventId: event.eventId,
                  homeTeam: event.homeTeam,
                  awayTeam: event.awayTeam,
                  marketType,
                  side,
                  odds: dbOdds.displayOdds,
                },
              ],
              stake,
              displayOdds: dbOdds.displayOdds,
              potentialPayout: computePossiblePayout(stake, dbOdds.displayOdds),
              status: "PENDING",
            },
            select: {
              id: true,
              betCode: true,
              stake: true,
              displayOdds: true,
              potentialPayout: true,
              status: true,
            },
          });
          break;
        } catch (createError) {
          const duplicateCode =
            createError instanceof Error &&
            createError.message.includes("bets_bet_code_key");

          if (!duplicateCode || attempt === 2) {
            throw createError;
          }
        }
      }

      if (!bet) {
        throw new Error("Could not place bet. Please try again.");
      }

      await tx.walletTransaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: "BET_STAKE",
          status: "COMPLETED",
          amount: stakeInCents,
          currency: "KES",
          channel: "betting",
          reference: `BET-${bet.id}`,
          description: `Bet on ${event.homeTeam} vs ${event.awayTeam}`,
        },
      });

      return {
        bet,
        newBalance: updatedWallet.balance / 100,
      };
    });

    return res.status(200).json({
      success: true,
      bet: result.bet,
      newBalance: result.newBalance,
    });
  } catch (error) {
    if (error instanceof Error) {
      const knownErrors = new Set([
        "Event not available for betting",
        "Wallet not found. Please deposit first.",
        "Insufficient balance",
        "Odds no longer available",
      ]);

      if (knownErrors.has(error.message)) {
        return res.status(400).json({ error: error.message });
      }
    }

    next(error);
  }
});

userBetsRouter.get("/user/bets/my", async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const bets = await prisma.bet.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            homeTeam: true,
            awayTeam: true,
            leagueName: true,
            commenceTime: true,
            status: true,
            sportKey: true,
          },
        },
      },
      orderBy: { placedAt: "desc" },
      take: 50,
    });

    return res.status(200).json({ bets });
  } catch (error) {
    next(error);
  }
});

export { userBetsRouter };
