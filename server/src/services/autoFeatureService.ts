import { prisma } from "../lib/prisma";
import redis from "./redisClient";

// ── Prominence scoring ──

const LEAGUE_IMPORTANCE: Record<string, number> = {
  // Top football leagues
  soccer_epl: 25,
  soccer_spain_la_liga: 24,
  soccer_italy_serie_a: 22,
  soccer_germany_bundesliga: 21,
  soccer_france_ligue_one: 20,
  soccer_uefa_champs_league: 28,
  // Other popular sports
  basketball_nba: 22,
  icehockey_nhl: 18,
  americanfootball_nfl: 20,
  tennis_atp_french_open: 16,
  cricket_ipl: 18,
  mma_mixed_martial_arts: 15,
  baseball_mlb: 14,
};

function getLeagueBonus(sportKey: string | null): number {
  if (!sportKey) return 0;
  return LEAGUE_IMPORTANCE[sportKey] ?? 5;
}

function calculateProminenceScore(event: {
  sportKey: string | null;
  commenceTime: Date;
  status: string;
  displayedOdds?: { id: string }[];
}): number {
  let score = 0;

  // League importance bonus
  score += getLeagueBonus(event.sportKey);

  // Live events get a significant boost
  if (event.status === "LIVE") {
    score += 30;
  }

  // Time proximity bonus: closer events score higher
  const hoursAway =
    (new Date(event.commenceTime).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursAway <= 2) score += 20;
  else if (hoursAway <= 6) score += 15;
  else if (hoursAway <= 24) score += 10;
  else if (hoursAway <= 48) score += 5;

  // Odds availability bonus
  const oddsCount = event.displayedOdds?.length ?? 0;
  if (oddsCount >= 6) score += 10;
  else if (oddsCount >= 3) score += 5;

  return score;
}

// ── Auto-feature service ──

const AUTO_FEATURE_LIMIT = 15;

export async function autoFeatureEvents(): Promise<void> {
  console.log("[AutoFeature] Running...");

  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get all active upcoming/live events with their odds count
    const events = await prisma.sportEvent.findMany({
      where: {
        isActive: true,
        oddsVerified: true,
        status: { in: ["UPCOMING", "LIVE"] },
        commenceTime: { lte: in7Days },
      },
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        sportKey: true,
        commenceTime: true,
        status: true,
        featuredManual: true,
        featuredAuto: true,
        isFeatured: true,
        displayedOdds: {
          where: { isVisible: true },
          select: { id: true },
        },
      },
    });

    // Score every event
    const scored = events
      .map((event) => ({
        id: event.id,
        label: `${event.homeTeam} vs ${event.awayTeam}`,
        score: calculateProminenceScore(event),
        featuredManual: event.featuredManual,
      }))
      .sort((a, b) => b.score - a.score);

    // Auto-feature top N non-manually-featured events
    let autoCount = 0;
    const manualCount = scored.filter((e) => e.featuredManual).length;

    for (const event of scored) {
      // Never touch manually featured events
      if (event.featuredManual) {
        // Update prominence score only
        await prisma.sportEvent.update({
          where: { id: event.id },
          data: { prominenceScore: event.score },
        });
        continue;
      }

      const shouldAutoFeature = autoCount < AUTO_FEATURE_LIMIT;

      await prisma.sportEvent.update({
        where: { id: event.id },
        data: {
          featuredAuto: shouldAutoFeature,
          // featured = manual OR auto
          isFeatured: shouldAutoFeature,
          prominenceScore: event.score,
        },
      });

      if (shouldAutoFeature) autoCount++;
    }

    // Record last run time in Redis
    if (redis) {
      await redis
        .set("autofeature:lastRun", new Date().toISOString(), "EX", 86400)
        .catch(() => undefined);
    }

    console.log(
      `[AutoFeature] ✅ Auto-featured: ${autoCount}, Manual-featured preserved: ${manualCount}`,
    );
  } catch (err) {
    console.error(
      "[AutoFeature] Error:",
      err instanceof Error ? err.message : String(err),
    );
  }
}
