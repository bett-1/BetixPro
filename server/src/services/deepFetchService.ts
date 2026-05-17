import { Job, Worker } from "bullmq";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { connection } from "../queues";
import { setOddsCache } from "./oddsCache";
import { recordOddsApiCredits } from "./creditTracker";
import { getOddsApiKey } from "./oddsAutomationConfig";
import { processMarketsFromBookmakers } from "./marketProcessor";
import { getMarketsForSport } from "../config/sportsConfig";

// ── Job interface ──

export interface DeepMarketFetchJob {
  eventId: string; // internal DB id (uuid)
  externalId: string; // The Odds API event id
  sport: string; // e.g. "soccer_epl"
  priority: "high" | "normal" | "low";
}

const DEEP_REGIONS = "eu,uk";
const BASIC_MARKETS = "h2h,spreads,totals"; // safe fallback for any sport

const ODDS_API_BASE_URL =
  process.env.ODDS_API_BASE_URL?.trim() || "https://api.the-odds-api.com/v4";

// ── Shared save helper ──

async function saveEventMarkets(
  eventId: string,
  externalId: string,
  eventData: Record<string, unknown>,
): Promise<number> {
  const bookmakers = Array.isArray(eventData.bookmakers)
    ? eventData.bookmakers
    : [];

  if (bookmakers.length === 0) {
    console.log(`[DeepFetch] No bookmakers in response for ${externalId}`);
    return 0;
  }

  const allMarkets = processMarketsFromBookmakers(bookmakers);

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
    if (
      writeError instanceof Prisma.PrismaClientKnownRequestError &&
      (writeError.code === "P2022" || writeError.code === "P2021")
    ) {
      // Columns not yet migrated — fall back to rawData only
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

  // Cache in Redis (1h TTL)
  await setOddsCache(externalId, eventData, 3600).catch((err) =>
    console.warn(
      "[DeepFetch] Redis cache write failed:",
      err instanceof Error ? err.message : String(err),
    ),
  );

  const home = String(eventData.home_team ?? "");
  const away = String(eventData.away_team ?? "");
  console.log(`[DeepFetch] ✅ ${home} vs ${away}: ${allMarkets.length} markets saved`);

  return allMarkets.length;
}

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

        // Use per-sport valid markets to avoid 422 INVALID_MARKET_COMBO
        const markets = getMarketsForSport(sport);
        console.log(`[DeepFetch] Markets for ${sport}: ${markets}`);

        const buildUrl = (marketsStr: string) =>
          `${ODDS_API_BASE_URL}/sports/${sport}/events/${externalId}/odds?` +
          new URLSearchParams({
            apiKey,
            regions: DEEP_REGIONS,
            markets: marketsStr,
            oddsFormat: "decimal",
            dateFormat: "iso",
          }).toString();

        let response = await fetch(buildUrl(markets));
        await recordOddsApiCredits(response.headers);

        const remaining = response.headers.get("x-requests-remaining");
        const used = response.headers.get("x-requests-used");
        console.log(`[DeepFetch] Credits: ${used ?? "?"} used, ${remaining ?? "?"} remaining`);

        // ── 422: invalid market combo for this sport → retry with safe fallback ──
        if (response.status === 422) {
          const errBody = await response.text().catch(() => "");
          console.warn(
            `[DeepFetch] 422 for ${sport} with markets="${markets}". ` +
              `Error: ${errBody.slice(0, 200)}. Retrying with ${BASIC_MARKETS}`,
          );
          response = await fetch(buildUrl(BASIC_MARKETS));
          await recordOddsApiCredits(response.headers);
          if (!response.ok) {
            console.error(`[DeepFetch] Fallback also failed for ${sport}: ${response.status}`);
            return { eventId, marketsFound: 0, skipped: true };
          }
        }

        // ── 404: event gone from API ──
        if (response.status === 404) {
          console.log(`[DeepFetch] Event ${externalId} not found on API — skipping`);
          return { skipped: true, reason: "not_found" };
        }

        if (!response.ok) {
          const errorBody = await response.text().catch(() => "");
          throw new Error(`API error ${response.status}: ${errorBody.slice(0, 200)}`);
        }

        const eventData = await response.json() as Record<string, unknown>;
        const marketsFound = await saveEventMarkets(eventId, externalId, eventData);

        return { eventId, marketsFound };
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
