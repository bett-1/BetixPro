import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { mapApiSportKeyToCategoryKey } from "./oddsAutomationConfig";
import {
  DAILY_API_CALL_LIMIT,
  getCreditBalance,
  getDailyCallCount,
  getLastPollForSport,
  getPollingMode,
} from "./oddsCache";
import { hydrateCreditStateFromRedis, getCurrentPollingMode } from "./creditTracker";
import { fetchOddsBatch } from "./oddsApiService";
import { processAndSaveEvents, transitionToLive } from "./eventProcessingService";

const STAGGER_DELAY_MS = 2_000;
const MAX_SPORTS_PER_CYCLE = 2;

type PollTier = "live" | "near" | "far";

const NORMAL_INTERVALS: Record<PollTier, number> = {
  live: 5 * 60 * 1000,
  near: 20 * 60 * 1000,
  far: 90 * 60 * 1000,
};

const REDUCED_INTERVALS: Record<PollTier, number> = {
  live: 30 * 60 * 1000,
  near: 3 * 60 * 60 * 1000,
  far: 4 * 60 * 60 * 1000,
};

let started = false;
let running = false;
let hourlySummaryStarted = false;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tierForEvent(event: { status: string; commenceTime: Date }): PollTier | null {
  if (event.status === "FINISHED" || event.status === "CANCELLED") return null;
  if (event.status === "LIVE") return "live";

  const startsInMs = event.commenceTime.getTime() - Date.now();
  return startsInMs <= 2 * 60 * 60 * 1000 ? "near" : "far";
}

async function getSportsDueForPolling() {
  const mode = getCurrentPollingMode();
  if (mode === "emergency") {
    console.error("[OddsScheduler] Emergency mode active; all Odds API polling is stopped.");
    return [];
  }

  const dailyCount = await getDailyCallCount().catch((error) => {
    console.error("[OddsScheduler] Could not read daily API call count:", error);
    return 0;
  });
  if (dailyCount >= DAILY_API_CALL_LIMIT) {
    console.warn("[OddsScheduler] Daily API call limit reached; skipping this polling cycle.");
    return [];
  }

  const intervals = mode === "reduced" ? REDUCED_INTERVALS : NORMAL_INTERVALS;
  const events = await prisma.sportEvent.findMany({
    where: {
      isActive: true,
      oddsVerified: true,
      status: { in: ["UPCOMING", "LIVE"] },
      sportKey: { not: null },
    },
    select: {
      eventId: true,
      sportKey: true,
      status: true,
      commenceTime: true,
    },
    orderBy: [{ status: "asc" }, { commenceTime: "asc" }],
    take: 500,
  });

  const dueSports = new Map<string, PollTier>();

  for (const event of events) {
    if (!event.sportKey) continue;
    const tier = tierForEvent(event);
    if (!tier) continue;

    const lastPoll = await getLastPollForSport(event.sportKey).catch(() => null);
    if (lastPoll && Date.now() - lastPoll < intervals[tier]) continue;

    const existing = dueSports.get(event.sportKey);
    if (!existing || tier === "live" || (tier === "near" && existing === "far")) {
      dueSports.set(event.sportKey, tier);
    }
  }

  return Array.from(dueSports.entries())
    .slice(0, Math.min(MAX_SPORTS_PER_CYCLE, Math.max(0, DAILY_API_CALL_LIMIT - dailyCount)))
    .map(([sportKey, tier]) => ({ sportKey, tier }));
}

function startHourlyCreditSummary() {
  if (hourlySummaryStarted) return;
  hourlySummaryStarted = true;

  setInterval(() => {
    void (async () => {
      const count = await getDailyCallCount().catch(() => 0);
      const credits = await getCreditBalance().catch(() => null);
      console.log("[OddsScheduler] Hourly credit summary:", {
        dailyCallsUsed: count,
        dailyCallLimit: DAILY_API_CALL_LIMIT,
        creditsRemaining: credits?.remaining ?? "unknown",
        creditsUsed: credits?.used ?? "unknown",
      });
    })();
  }, 60 * 60 * 1000);
}

export async function runOddsPollingCycle() {
  if (running) return;
  running = true;

  try {
    await hydrateCreditStateFromRedis();
    await transitionToLive();

    const dueSports = await getSportsDueForPolling();
    if (!dueSports.length) return;

    for (const [index, item] of dueSports.entries()) {
      if (index > 0) {
        await delay(STAGGER_DELAY_MS);
      }

      const pollingMode = await getPollingMode().catch(() => getCurrentPollingMode());
      if (pollingMode === "emergency") {
        console.error("[OddsScheduler] Polling stopped mid-cycle because emergency mode is active.");
        break;
      }

      const events = await fetchOddsBatch(item.sportKey);
      if (!events?.length) continue;

      const categoryKey = mapApiSportKeyToCategoryKey(item.sportKey);
      if (!categoryKey) {
        console.warn(`[OddsScheduler] No category mapping for sport ${item.sportKey}; cache updated only.`);
        continue;
      }

      await processAndSaveEvents(events, categoryKey);
      console.info("[OddsScheduler] Polled odds batch", {
        sport: item.sportKey,
        tier: item.tier,
        events: events.length,
      });
    }
  } catch (error) {
    console.error("[OddsScheduler] Polling cycle failed:", error);
  } finally {
    running = false;
  }
}

export function startOddsScheduler() {
  if (started) return;
  started = true;

  // No API call is made here. The cron waits for its first scheduled tick, which
  // keeps deploys/restarts from spending credits immediately.
  cron.schedule("* * * * *", () => {
    void runOddsPollingCycle();
  });
  startHourlyCreditSummary();

  console.info("[OddsScheduler] Credit-safe odds polling scheduled.");
}
