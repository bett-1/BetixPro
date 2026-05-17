import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { SEVEN_DAY_WINDOW_MS } from "../config/sportsConfig";
import { refreshCategorySummaries } from "./eventProcessingService";
import { createCompleteOddsWhere } from "../utils/oddsValidator";

function marketsFromRawData(rawData: Prisma.JsonValue | null): string[] {
  if (!rawData || typeof rawData !== "object") return ["h2h"];
  const event = rawData as { bookmakers?: Array<{ markets?: Array<{ key?: unknown }> }> };
  const keys = new Set<string>();

  for (const bookmaker of event.bookmakers ?? []) {
    for (const market of bookmaker.markets ?? []) {
      if (typeof market.key === "string" && market.key.trim()) {
        keys.add(market.key);
      }
    }
  }

  return keys.size ? Array.from(keys) : ["h2h"];
}

export async function activateAllEventsWithOdds(): Promise<void> {
  console.log("[AutoConfigure] Starting auto-activation scan...");

  const now = new Date();
  const windowEnd = new Date(now.getTime() + SEVEN_DAY_WINDOW_MS);

  const eventsWithOdds = await prisma.sportEvent.findMany({
    where: {
      displayedOdds: { some: { isVisible: true, displayOdds: { gt: 0 } } },
      commenceTime: { gte: now, lte: windowEnd },
      status: { in: ["UPCOMING", "LIVE"] },
    },
    select: {
      eventId: true,
      homeTeam: true,
      awayTeam: true,
      rawData: true,
      isActive: true,
      oddsVerified: true,
      autoConfigured: true,
      marketsEnabled: true,
    },
  });

  let activated = 0;
  for (const event of eventsWithOdds) {
    try {
      const marketsEnabled = event.marketsEnabled.length ? event.marketsEnabled : marketsFromRawData(event.rawData);
      await prisma.sportEvent.update({
        where: { eventId: event.eventId },
        data: {
          isActive: true,
          oddsVerified: true,
          autoConfigured: true,
          marketsEnabled,
          syncedAt: new Date(),
        },
      });

      if (!event.isActive || !event.oddsVerified || !event.autoConfigured) {
        activated += 1;
        console.log(`[AutoConfigure] Activated: ${event.homeTeam} vs ${event.awayTeam}`);
      }
    } catch (err) {
      console.warn(
        `[AutoConfigure] Failed to activate ${event.eventId}:`,
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  const stale = await prisma.sportEvent.updateMany({
    where: {
      status: { notIn: ["LIVE"] },
      commenceTime: { lt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      isActive: true,
    },
    data: { isActive: false, status: "FINISHED", archivedAt: new Date() },
  });

  await refreshCategorySummaries().catch((err) =>
    console.warn("[AutoConfigure] Category summary refresh failed:", err instanceof Error ? err.message : String(err)),
  );

  console.log("[AutoConfigure] Auto-activation complete", { scanned: eventsWithOdds.length, activated, stale: stale.count });
}

export async function markEventsAsConfigured(): Promise<number> {
  const result = await prisma.sportEvent.updateMany({
    where: {
      isActive: true,
      autoConfigured: false,
      ...createCompleteOddsWhere(),
    },
    data: { autoConfigured: true, oddsVerified: true },
  });
  return result.count;
}
