import { Job, Worker } from "bullmq";
import { prisma } from "../lib/prisma";
import { SPORTS_CONFIG } from "../config/sportsConfig";
import { connection } from "../queues";
import { incrementDailyCallCount, setOddsCache } from "../services/oddsCache";
import { recordOddsApiCredits } from "../services/creditTracker";
import { processAndSaveEvents } from "../services/eventProcessingService";
import { getOddsApiKey, mapApiSportKeyToCategoryKey } from "../services/oddsAutomationConfig";
import {
  BOOKMAKERS_TO_FETCH,
  MARKETS_TO_FETCH,
  REGIONS_TO_FETCH,
  type OddsApiEvent,
} from "../services/oddsApiService";

interface OddsFetchJob {
  sport: string;
  sportLabel: string;
  sidebarLabel?: string;
  tier: "live" | "upcoming_soon" | "upcoming_far";
}

function hasValidOdds(event: OddsApiEvent): boolean {
  if (!event?.bookmakers?.length) return false;

  for (const bookmaker of event.bookmakers) {
    for (const market of bookmaker.markets || []) {
      for (const outcome of market.outcomes || []) {
        if (typeof outcome.price === "number" && outcome.price > 1) {
          return true;
        }
      }
    }
  }

  return false;
}

function formatMarketName(marketKey: string) {
  const names: Record<string, string> = {
    h2h: "Moneyline",
    spreads: "Spread",
    totals: "Totals",
    outrights: "Outrights",
  };

  return names[marketKey] ?? marketKey.replace(/_/g, " ");
}

function extractMarkets(bookmakers: OddsApiEvent["bookmakers"]): any[] {
  if (!bookmakers?.length) return [];

  const bestBookmaker = bookmakers.reduce((best, current) => {
    const currentMarkets = current.markets?.length ?? 0;
    const bestMarkets = best.markets?.length ?? 0;
    return currentMarkets > bestMarkets ? current : best;
  }, bookmakers[0]);

  return (bestBookmaker.markets || [])
    .filter((market) => (market.outcomes?.length ?? 0) > 0)
    .map((market) => ({
      key: market.key,
      name: formatMarketName(market.key),
      outcomes: market.outcomes?.map((outcome) => ({
        name: outcome.name,
        price: outcome.price,
        point: outcome.point ?? null,
      })) ?? [],
    }));
}

function buildOddsUrl(sport: string) {
  const apiKey = getOddsApiKey();
  const now = new Date();
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    apiKey,
    regions: REGIONS_TO_FETCH,
    markets: MARKETS_TO_FETCH.join(","),
    dateFormat: "iso",
    oddsFormat: "decimal",
    bookmakers: BOOKMAKERS_TO_FETCH.join(","),
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

    const validEvents = events.filter(hasValidOdds);
    const invalidEvents = events.length - validEvents.length;
    if (invalidEvents > 0) {
      console.warn(`[OddsWorker] ${sport}: filtered ${invalidEvents} event(s) without priced odds before save`, {
        totalEvents: events.length,
        eventsWithExtractableMarkets: events.filter((event) => extractMarkets(event.bookmakers).length > 0).length,
      });
    }

    const categoryKey = mapApiSportKeyToCategoryKey(sport);
    if (!categoryKey) {
      console.warn(`[OddsWorker] No category mapping for ${sport}; caching only.`);
      await Promise.allSettled(events.map((event) => setOddsCache(event.id, event, tier === "live" ? 240 : 3540)));
      return { sport, processed: 0, cachedOnly: events.length };
    }

    const result = await processAndSaveEvents(validEvents, categoryKey);
    const skipped = result.skipped + invalidEvents;

    const ttl = tier === "live" ? 240 : tier === "upcoming_soon" ? 840 : 3540;
    await Promise.allSettled(events.map((event) => setOddsCache(event.id, event, ttl)));

    const sidebarCount = sidebarLabel ? await countEventsForSidebarSport(sidebarLabel) : null;
    console.log(`[OddsWorker] ${sportLabel}: saved=${result.saved}, skipped=${skipped}, sidebarCount=${sidebarCount ?? "n/a"}`);

    return { sport, saved: result.saved, skipped, sidebarCount };
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
