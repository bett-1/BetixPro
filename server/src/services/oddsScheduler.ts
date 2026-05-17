import { prisma } from "../lib/prisma";
import { oddsQueue, deepFetchQueue } from "../queues";
import { DAILY_CREDIT_BUDGET, MAX_DAILY_CALLS, SPORTS_CONFIG, SEVEN_DAY_WINDOW_MS } from "../config/sportsConfig";
import { getCreditBalance, getDailyCallCount } from "./oddsCache";
import { activateAllEventsWithOdds, syncEventStatuses } from "./autoConfigureService";
import { getActiveSportsList, refreshActiveSportsList } from "./sportsRefreshService";
import { autoFeatureEvents } from "./autoFeatureService";

type PollingMode = "normal" | "reduced" | "emergency";

let started = false;
let running = false;
let healthRunning = false;

function getPollingMode(remaining: number): PollingMode {
  if (remaining < 500) return "emergency";
  if (remaining < 2_000) return "reduced";
  return "normal";
}

async function getActiveSportSet() {
  let active = await getActiveSportsList();
  if (!active.length) {
    active = await refreshActiveSportsList();
  }
  return new Set(active);
}

function getPollKeysForSport(config: (typeof SPORTS_CONFIG)[number], activeSports: Set<string>) {
  return [config.key, ...(config.alternateKeys ?? [])].filter((key) => activeSports.has(key));
}

async function getLiveSports() {
  const liveEvents = await prisma.sportEvent.findMany({
    where: { status: "LIVE", isActive: true, sportKey: { not: null } },
    select: { sportKey: true },
    distinct: ["sportKey"],
  });

  return new Set(liveEvents.map((event) => event.sportKey).filter((sportKey): sportKey is string => Boolean(sportKey)));
}

export async function scheduleOddsPolling(): Promise<void> {
  if (running) return;
  running = true;

  try {
    const [credits, dailyCallsUsed, activeSports, liveSports] = await Promise.all([
      getCreditBalance().catch(() => null),
      getDailyCallCount().catch(() => 0),
      getActiveSportSet(),
      getLiveSports(),
    ]);

    const remaining = credits?.remaining ?? DAILY_CREDIT_BUDGET;
    const pollingMode = getPollingMode(remaining);
    const remainingDailyCalls = Math.max(0, MAX_DAILY_CALLS - dailyCallsUsed);
    if (remainingDailyCalls <= 0) {
      console.warn("[Scheduler] Daily Odds API call budget reached; no jobs queued.");
      return;
    }

    let queued = 0;
    const missingActiveKeys: string[] = [];

    for (const sport of SPORTS_CONFIG) {
      if (!sport.active || queued >= remainingDailyCalls) continue;

      const keys = getPollKeysForSport(sport, activeSports);
      if (!keys.length) {
        missingActiveKeys.push(sport.key);
        continue;
      }

      for (const key of keys) {
        if (queued >= remainingDailyCalls) break;
        const isLive = liveSports.has(key);
        if (pollingMode === "emergency" && !isLive) continue;

        await oddsQueue.add(
          `fetch-${key}`,
          {
            sport: key,
            sportLabel: key === sport.key ? sport.label : `${sport.label} (${key})`,
            sidebarLabel: sport.sidebarLabel,
            tier: isLive ? "live" : "upcoming_far",
          },
          {
            jobId: `odds-${key}`,
            priority: sport.priority,
            attempts: pollingMode === "normal" ? 3 : 2,
            backoff: { type: "exponential", delay: 30_000 },
            removeOnComplete: 50,
            removeOnFail: 20,
          },
        );
        queued += 1;
      }
    }

    console.log("[Scheduler] Odds jobs queued", {
      queued,
      pollingMode,
      dailyCallsUsed,
      remainingDailyCalls,
      activeSports: activeSports.size,
      inactiveConfiguredKeys: missingActiveKeys.length,
    });
  } finally {
    running = false;
  }
}

export async function runOddsHealthCheck(): Promise<void> {
  if (healthRunning) return;
  healthRunning = true;

  try {
    const activeSports = await getActiveSportSet();
    const now = new Date();
    const windowEnd = new Date(now.getTime() + SEVEN_DAY_WINDOW_MS);

    for (const sport of SPORTS_CONFIG) {
      const keys = getPollKeysForSport(sport, activeSports);
      if (!keys.length) {
        console.warn(`[HealthCheck] ${sport.sidebarLabel}/${sport.label} has no currently active Odds API key.`);
        continue;
      }

      const count = await prisma.sportEvent.count({
        where: {
          sportKey: { in: keys },
          isActive: true,
          oddsVerified: true,
          status: { in: ["UPCOMING", "LIVE"] },
          commenceTime: { gte: now, lte: windowEnd },
          displayedOdds: { some: { isVisible: true, displayOdds: { gt: 0 } } },
        },
      });

      if (count > 0) continue;

      for (const key of keys) {
        console.log(`[HealthCheck] ${sport.sidebarLabel}/${key} has 0 events; triggering fetch.`);
        await oddsQueue.add(
          `emergency-fetch-${key}`,
          {
            sport: key,
            sportLabel: key === sport.key ? sport.label : `${sport.label} (${key})`,
            sidebarLabel: sport.sidebarLabel,
            tier: "upcoming_far",
          },
          {
            jobId: `health-odds-${key}-${Math.floor(Date.now() / (30 * 60 * 1000))}`,
            priority: 1,
            attempts: 5,
            backoff: { type: "exponential", delay: 30_000 },
            removeOnComplete: 50,
            removeOnFail: 20,
          },
        );
      }
    }

    await activateAllEventsWithOdds();
  } catch (err) {
    console.error("[HealthCheck] Error:", err instanceof Error ? err.message : String(err));
  } finally {
    healthRunning = false;
  }
}

export function startOddsScheduler() {
  if (started) return;
  started = true;

  setInterval(() => void scheduleOddsPolling(), 5 * 60 * 1000);
  setInterval(() => {
    console.log("[Scheduler] Hourly full refresh starting...");
    void scheduleOddsPolling();
    void activateAllEventsWithOdds();
  }, 60 * 60 * 1000);
  setInterval(() => void refreshActiveSportsList(), 24 * 60 * 60 * 1000);
  setInterval(() => void runOddsHealthCheck(), 30 * 60 * 1000);

  // Deep market fetch: check every hour, run at 1am UTC (4am EAT)
  setInterval(() => {
    const hour = new Date().getUTCHours();
    if (hour === 1) {
      console.log("[Scheduler] Daily deep market refresh starting...");
      void scheduleDeepMarketFetch();
    }
  }, 60 * 60 * 1000);

  void scheduleOddsPolling();
  void runOddsHealthCheck();

  // Trigger initial deep fetch 30s after startup for immediate market population
  setTimeout(() => void scheduleDeepMarketFetch(), 30_000);

  // Auto-feature: run every 30 minutes + on startup
  setInterval(() => void autoFeatureEvents(), 30 * 60 * 1000);
  setTimeout(() => void autoFeatureEvents(), 15_000);

  // Sync event statuses every 5 minutes + on startup
  setInterval(() => {
    syncEventStatuses().catch((err) =>
      console.error("[StatusSync] Error:", err instanceof Error ? err.message : String(err)),
    );
  }, 5 * 60 * 1000);
  setTimeout(() => void syncEventStatuses(), 5_000);

  console.info("[Scheduler] BullMQ odds polling scheduled (with deep market fetch + auto-featuring).");
}

// ── Deep market fetch: per-event additional markets ──

let deepFetchRunning = false;

export async function scheduleDeepMarketFetch(): Promise<void> {
  if (deepFetchRunning) return;
  deepFetchRunning = true;

  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + SEVEN_DAY_WINDOW_MS);

    const events = await prisma.sportEvent.findMany({
      where: {
        isActive: true,
        oddsVerified: true,
        status: { in: ["UPCOMING", "LIVE"] },
        commenceTime: { gte: now, lte: windowEnd },
      },
      select: {
        id: true,
        eventId: true,
        externalEventId: true,
        sportKey: true,
        homeTeam: true,
        awayTeam: true,
        commenceTime: true,
      },
      orderBy: { commenceTime: "asc" }, // soonest events first
    });

    console.log(`[DeepFetch] Scheduling deep fetch for ${events.length} events`);

    let queued = 0;
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const apiEventId = event.externalEventId ?? event.eventId;
      if (!apiEventId || !event.sportKey) continue;

      // Stagger jobs: 10 seconds apart to stay under rate limits
      const delayMs = i * 10_000;

      await deepFetchQueue.add(
        `deep-${apiEventId}`,
        {
          eventId: event.id,
          externalId: apiEventId,
          sport: event.sportKey,
          priority: "normal" as const,
        },
        {
          jobId: `deep-market-${apiEventId}-${Math.floor(Date.now() / (12 * 60 * 60 * 1000))}`,
          delay: delayMs,
          attempts: 2,
          removeOnComplete: 30,
          removeOnFail: 15,
        },
      );
      queued += 1;
    }

    console.log(
      `[DeepFetch] Queued ${queued} deep fetches (estimated cost: ~${queued * 5} credits)`,
    );
  } catch (error) {
    console.error(
      "[DeepFetch] Failed to schedule deep market fetches:",
      error instanceof Error ? error.message : String(error),
    );
  } finally {
    deepFetchRunning = false;
  }
}
