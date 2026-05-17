import { Job, Worker } from "bullmq";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { connection } from "../queues";
import { setOddsCache } from "./oddsCache";
import { recordOddsApiCredits } from "./creditTracker";
import { getOddsApiKey } from "./oddsAutomationConfig";
import { processMarketsFromBookmakers } from "./marketProcessor";

// ── Job interface ──

export interface DeepMarketFetchJob {
  eventId: string; // internal DB id (uuid)
  externalId: string; // The Odds API event id
  sport: string; // e.g. "soccer_epl"
  priority: "high" | "normal" | "low";
}

// ── Additional markets available via the event-level endpoint ──

const DEEP_MARKETS = [
  "h2h",
  "spreads",
  "totals",
  "alternate_spreads",
  "alternate_totals",
  "btts",
  "draw_no_bet",
  "h2h_lay",
  "outrights",
  "outrights_lay",
  "h2h_3_way",
].join(",");

const DEEP_REGIONS = "eu,uk";

const ODDS_API_BASE_URL =
  process.env.ODDS_API_BASE_URL?.trim() || "https://api.the-odds-api.com/v4";

function suppressBullMqEvictionWarning<T>(fn: () => T): T {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const first = args[0];
    if (typeof first === "string" && first.includes("Eviction policy")) {
      return;
    }
    originalWarn(...args);
  };

  try {
    return fn();
  } finally {
    console.warn = originalWarn;
  }
}

function isMissingColumnError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2022" || error.code === "P2021")
  );
}

// ── Worker ──

const deepFetchWorker = suppressBullMqEvictionWarning(
  () =>
    new Worker<DeepMarketFetchJob>(
      "deep-market-fetch",
      async (job: Job<DeepMarketFetchJob>) => {
        const { externalId, sport, eventId } = job.data;
        console.log(`[DeepFetch] Processing: ${externalId} (${sport})`);

        const apiKey = getOddsApiKey();
        if (!apiKey) {
          throw new Error("ODDS_API_KEY is required for deep market fetch");
        }

        const params = new URLSearchParams({
          apiKey,
          regions: DEEP_REGIONS,
          markets: DEEP_MARKETS,
          oddsFormat: "decimal",
          dateFormat: "iso",
        });

        const url = `${ODDS_API_BASE_URL}/sports/${sport}/events/${externalId}/odds?${params.toString()}`;

        const response = await fetch(url);
        await recordOddsApiCredits(response.headers);

        if (!response.ok) {
          if (response.status === 404) {
            console.log(`[DeepFetch] Event ${externalId} no longer available on API`);
            return { skipped: true, reason: "not_found" };
          }
          const errorBody = await response.text().catch(() => "");
          throw new Error(`API error ${response.status}: ${errorBody.slice(0, 200)}`);
        }

        const remaining = response.headers.get("x-requests-remaining");
        const used = response.headers.get("x-requests-used");
        console.log(
          `[DeepFetch] Credits: ${used ?? "?"} used, ${remaining ?? "?"} remaining`,
        );

        const eventData = await response.json();
        const bookmakers = eventData.bookmakers;

        if (!Array.isArray(bookmakers) || bookmakers.length === 0) {
          console.log(`[DeepFetch] No bookmakers returned for ${externalId}`);
          return { eventId, marketsFound: 0 };
        }

        const allMarkets = processMarketsFromBookmakers(bookmakers);

        // Save to DB — use try/catch for the new columns
        try {
          await prisma.sportEvent.update({
            where: { id: eventId },
            data: {
              oddsData: bookmakers as unknown as Prisma.InputJsonValue,
              marketsData: allMarkets as unknown as Prisma.InputJsonValue,
              syncedAt: new Date(),
            },
          });
        } catch (writeError) {
          if (isMissingColumnError(writeError)) {
            console.warn(
              "[DeepFetch] markets_data/odds_data column missing; saving rawData only",
            );
            await prisma.sportEvent.update({
              where: { id: eventId },
              data: {
                rawData: eventData as unknown as Prisma.InputJsonValue,
                syncedAt: new Date(),
              },
            });
          } else {
            throw writeError;
          }
        }

        // Update Redis cache (1 hour TTL)
        await setOddsCache(externalId, eventData, 3600).catch((err) =>
          console.warn("[DeepFetch] Redis cache write failed:", err instanceof Error ? err.message : String(err)),
        );

        console.log(
          `[DeepFetch] ✅ ${eventData.home_team} vs ${eventData.away_team}: ${allMarkets.length} markets saved`,
        );

        return { eventId, marketsFound: allMarkets.length };
      },
      {
        connection,
        concurrency: 1, // One event at a time to respect rate limits
        limiter: {
          max: 6, // Max 6 jobs per minute (matches API rate limit)
          duration: 60_000,
        },
      },
    ),
);

deepFetchWorker.on("completed", (job) => {
  console.log(`[DeepFetch] Job ${job.id} completed`);
});

deepFetchWorker.on("failed", (job, err) => {
  console.error(`[DeepFetch] Job ${job?.id} failed:`, err.message);
});

export default deepFetchWorker;
