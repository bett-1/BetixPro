import redis from "./redisClient";
import { getOddsApiKey } from "./oddsAutomationConfig";

export const ACTIVE_SPORTS_REDIS_KEY = "odds:active_sports";
const ACTIVE_SPORTS_TTL_SECONDS = 24 * 60 * 60;

export async function refreshActiveSportsList(): Promise<string[]> {
  try {
    const apiKey = getOddsApiKey();
    if (!apiKey) {
      console.warn("[SportsRefresh] Missing Odds API key; active sports cache not refreshed.");
      return [];
    }

    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/?apiKey=${encodeURIComponent(apiKey)}&all=false`,
    );

    if (!response.ok) {
      console.warn(`[SportsRefresh] Failed with status ${response.status}`);
      return [];
    }

    const sports = await response.json();
    const keys = Array.isArray(sports)
      ? sports
          .map((sport: { key?: unknown }) => (typeof sport.key === "string" ? sport.key : null))
          .filter((key: string | null): key is string => Boolean(key))
      : [];

    if (redis) {
      await redis.setex(ACTIVE_SPORTS_REDIS_KEY, ACTIVE_SPORTS_TTL_SECONDS, JSON.stringify(keys));
    }

    console.log(`[SportsRefresh] ${keys.length} active sports cached`);
    return keys;
  } catch (err) {
    console.warn("[SportsRefresh] Failed:", err instanceof Error ? err.message : String(err));
    return [];
  }
}

export async function getActiveSportsList(): Promise<string[]> {
  if (!redis) return [];

  try {
    const cached = await redis.get(ACTIVE_SPORTS_REDIS_KEY);
    if (!cached) return [];
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? parsed.filter((key): key is string => typeof key === "string") : [];
  } catch (err) {
    console.warn("[SportsRefresh] Could not read active sports cache:", err instanceof Error ? err.message : String(err));
    return [];
  }
}
