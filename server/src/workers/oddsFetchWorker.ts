import { Job, Worker } from "bullmq";
import { prisma } from "../lib/prisma";
import { SPORTS_CONFIG } from "../config/sportsConfig";
import { connection } from "../queues";
import { incrementDailyCallCount, setOddsCache } from "../services/oddsCache";
import { recordOddsApiCredits } from "../services/creditTracker";
import { processAndSaveEvents } from "../services/eventProcessingService";
import { getOddsApiKey, mapApiSportKeyToCategoryKey } from "../services/oddsAutomationConfig";
import type { OddsApiEvent } from "../services/oddsApiService";

interface OddsFetchJob {
  sport: string;
  sportLabel: string;
  sidebarLabel?: string;
  tier: "live" | "upcoming_soon" | "upcoming_far";
}

function getMarketsForSport(sport: string) {
  if (/(winner|championship|outright)/i.test(sport)) return "outrights";
  return "h2h,spreads";
}

function buildOddsUrl(sport: string) {
  const apiKey = getOddsApiKey();
  const now = new Date();
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    apiKey,
    regions: "eu,uk",
    markets: getMarketsForSport(sport),
    dateFormat: "iso",
    oddsFormat: "decimal",
    commenceTimeFrom: now.toISOString().replace(/\.\d{3}Z$/, "Z"),
    commenceTimeTo: inSevenDays.toISOString().replace(/\.\d{3}Z$/, "Z"),
  });

  return `https://api.the-odds-api.com/v4/sports/${sport}/odds/?${params.toString()}`;
}

async function countEventsForSidebarSport(sidebarLabel: string) {
  const configs = SPORTS_CONFIG.filter((item) => item.sidebarLabel === sidebarLabel);
  const keys = configs.flatMap((item) => [item.key, ...(item.alternateKeys ?? [])]);
  const now = new Date();
  return prisma.sportEvent.count({
    where: {
      sportKey: { in: keys },
      isActive: true,
      oddsVerified: true,
      status: { in: ["UPCOMING", "LIVE"] },
      commenceTime: {
        gte: now,
        lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    },
  });
}

const worker = new Worker<OddsFetchJob>(
  "odds-fetch",
  async (job: Job<OddsFetchJob>) => {
    const { sport, sportLabel, sidebarLabel, tier } = job.data;
    console.log(`[OddsWorker] Processing: ${sport} (${tier})`);

    const apiKey = getOddsApiKey();
    if (!apiKey) {
      throw new Error("THE_ODDS_API_KEY or ODDS_API_KEY is required");
    }

    const response = await fetch(buildOddsUrl(sport));
    await recordOddsApiCredits(response.headers);
    await incrementDailyCallCount().catch((err) =>
      console.warn("[OddsWorker] Failed to increment daily call count:", err instanceof Error ? err.message : String(err)),
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[OddsWorker] ${sport} not in season, skipping`);
        return { skipped: true, reason: "not_in_season" };
      }

      const message = await response.text().catch(() => "");
      throw new Error(`API error ${response.status}: ${message.slice(0, 200)}`);
    }

    const remaining = response.headers.get("x-requests-remaining");
    const used = response.headers.get("x-requests-used");
    console.log(`[OddsWorker] Credits: ${used ?? "unknown"} used, ${remaining ?? "unknown"} remaining`);

    const events = (await response.json()) as OddsApiEvent[];
    if (!Array.isArray(events) || events.length === 0) {
      console.log(`[OddsWorker] No events for ${sport}`);
      return { sport, processed: 0 };
    }

    const categoryKey = mapApiSportKeyToCategoryKey(sport);
    if (!categoryKey) {
      console.warn(`[OddsWorker] No category mapping for ${sport}; caching only.`);
      await Promise.allSettled(events.map((event) => setOddsCache(event.id, event, tier === "live" ? 240 : 3540)));
      return { sport, processed: 0, cachedOnly: events.length };
    }

    const result = await processAndSaveEvents(events, categoryKey);

    const ttl = tier === "live" ? 240 : tier === "upcoming_soon" ? 840 : 3540;
    await Promise.allSettled(events.map((event) => setOddsCache(event.id, event, ttl)));

    const sidebarCount = sidebarLabel ? await countEventsForSidebarSport(sidebarLabel) : null;
    console.log(`[OddsWorker] ${sportLabel}: saved=${result.saved}, skipped=${result.skipped}, sidebarCount=${sidebarCount ?? "n/a"}`);

    return { sport, saved: result.saved, skipped: result.skipped, sidebarCount };
  },
  {
    connection,
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 60_000,
    },
  },
);

worker.on("completed", (job) => {
  console.log(`[OddsWorker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[OddsWorker] Job ${job?.id} failed:`, err.message);
});

export default worker;
