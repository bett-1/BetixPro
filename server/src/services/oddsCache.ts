import redis from "./redisClient";

export const LIVE_ODDS_TTL_SECONDS = 240;
export const NEAR_UPCOMING_ODDS_TTL_SECONDS = 840;
export const FAR_UPCOMING_ODDS_TTL_SECONDS = 3540;
const ONE_DAY_SECONDS = 24 * 60 * 60;
export const DAILY_API_CALL_LIMIT = 80;

export type PollingMode = "normal" | "reduced" | "emergency";

export type CachedOddsEnvelope<T = unknown> = {
  data: T;
  fetchedAt: string;
  expiresAt: string;
};

export function getSecondsUntilMidnight(now = new Date()) {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / 1000));
}

function ttlForTrackingKey() {
  return getSecondsUntilMidnight();
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function expireTrackingKey(key: string) {
  if (!redis) return;
  try {
    const ttl = await redis.ttl(key);
    if (ttl < 0) {
      await redis.expire(key, ttlForTrackingKey());
    }
  } catch (error) {
    console.warn("[Redis] expireTrackingKey failed:", getErrorMessage(error));
  }
}

export function getTTLForEvent(input: { status?: string | null; commenceTime?: Date | string | null }) {
  const status = input.status?.toUpperCase();
  if (status === "FINISHED" || status === "CANCELLED") return 0;
  if (status === "LIVE") return LIVE_ODDS_TTL_SECONDS;

  const commenceTime = input.commenceTime ? new Date(input.commenceTime).getTime() : Number.NaN;
  if (Number.isFinite(commenceTime)) {
    const startsInMs = commenceTime - Date.now();
    if (startsInMs <= 2 * 60 * 60 * 1000) {
      return NEAR_UPCOMING_ODDS_TTL_SECONDS;
    }
  }

  return FAR_UPCOMING_ODDS_TTL_SECONDS;
}

export async function setOddsCache(eventId: string, data: unknown, ttlSeconds: number): Promise<void> {
  if (!redis) return;
  if (ttlSeconds <= 0) return;
  try {
    const now = new Date();
    const envelope: CachedOddsEnvelope = {
      data,
      fetchedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
    };
    await redis.setex(`odds:${eventId}`, ttlSeconds, JSON.stringify(envelope));
  } catch (error) {
    console.warn("[Redis] setOddsCache failed:", getErrorMessage(error));
  }
}

export async function getOddsCache<T = unknown>(eventId: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const cached = await redis.get(`odds:${eventId}`);
    if (!cached) {
      await recordCacheMiss().catch(() => undefined);
      return null;
    }

    await recordCacheHit().catch(() => undefined);

    const parsed = JSON.parse(cached) as CachedOddsEnvelope<T> | T;
    if (parsed && typeof parsed === "object" && "data" in parsed) {
      return (parsed as CachedOddsEnvelope<T>).data;
    }
    return parsed as T;
  } catch (error) {
    console.warn("[Redis] getOddsCache failed:", getErrorMessage(error));
    return null;
  }
}

export async function getAllCachedOddsKeys(): Promise<string[]> {
  if (!redis) return [];
  try {
    return await redis.keys("odds:*");
  } catch (error) {
    console.warn("[Redis] getAllCachedOddsKeys failed:", getErrorMessage(error));
    return [];
  }
}

export async function setCreditBalance(used: number, remaining: number): Promise<void> {
  if (!redis) return;
  try {
    await redis.hset("odds:credits", {
      used: String(used),
      remaining: String(remaining),
      updatedAt: String(Date.now()),
    });
    await redis.expire("odds:credits", ONE_DAY_SECONDS);
  } catch (error) {
    console.warn("[Redis] setCreditBalance failed:", getErrorMessage(error));
  }
}

export async function getCreditBalance(): Promise<{ used: number; remaining: number; updatedAt: number } | null> {
  if (!redis) return null;
  try {
    const data = await redis.hgetall("odds:credits");
    if (!data || !data.remaining) return null;
    return {
      used: Number.parseInt(data.used || "0", 10),
      remaining: Number.parseInt(data.remaining, 10),
      updatedAt: Number.parseInt(data.updatedAt || "0", 10),
    };
  } catch (error) {
    console.warn("[Redis] getCreditBalance failed:", getErrorMessage(error));
    return null;
  }
}

export async function setPollingMode(mode: PollingMode): Promise<void> {
  if (!redis) return;
  try {
    await redis.set("odds:pollingMode", mode, "EX", ONE_DAY_SECONDS);
  } catch (error) {
    console.warn("[Redis] setPollingMode failed:", getErrorMessage(error));
  }
}

export async function getPollingMode(): Promise<PollingMode> {
  if (!redis) return "normal";
  try {
    const mode = await redis.get("odds:pollingMode");
    return mode === "reduced" || mode === "emergency" ? mode : "normal";
  } catch (error) {
    console.warn("[Redis] getPollingMode failed:", getErrorMessage(error));
    return "normal";
  }
}

export async function setLastPollForSport(sport: string, timestamp = Date.now()): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(`odds:lastPoll:${sport}`, String(timestamp), "EX", ONE_DAY_SECONDS);
  } catch (error) {
    console.warn("[Redis] setLastPollForSport failed:", getErrorMessage(error));
  }
}

export async function getLastPollForSport(sport: string): Promise<number | null> {
  if (!redis) return null;
  try {
    const value = await redis.get(`odds:lastPoll:${sport}`);
    return value ? Number.parseInt(value, 10) : null;
  } catch (error) {
    console.warn("[Redis] getLastPollForSport failed:", getErrorMessage(error));
    return null;
  }
}

export async function incrementDailyCallCount(): Promise<number> {
  if (!redis) return 0;
  try {
    const key = "odds:dailyCount";
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, getSecondsUntilMidnight());
    }
    return count;
  } catch (error) {
    console.warn("[Redis] incrementDailyCallCount failed:", getErrorMessage(error));
    return 0;
  }
}

export async function getDailyCallCount(): Promise<number> {
  if (!redis) return 0;
  try {
    const val = await redis.get("odds:dailyCount");
    return val ? Number.parseInt(val, 10) : 0;
  } catch (error) {
    console.warn("[Redis] getDailyCallCount failed:", getErrorMessage(error));
    return 0;
  }
}

export async function isWithinDailyLimit(): Promise<boolean> {
  if (!redis) return true;
  try {
    return (await getDailyCallCount()) < DAILY_API_CALL_LIMIT;
  } catch (error) {
    console.warn("[Redis] isWithinDailyLimit failed, allowing call:", getErrorMessage(error));
    return true;
  }
}

export async function recordCacheHit(): Promise<void> {
  if (!redis) return;
  const key = "odds:cacheHits";
  try {
    await redis.incr(key);
    await expireTrackingKey(key);
  } catch (error) {
    console.warn("[Redis] recordCacheHit failed:", getErrorMessage(error));
  }
}

export async function recordCacheMiss(): Promise<void> {
  if (!redis) return;
  const key = "odds:cacheMisses";
  try {
    await redis.incr(key);
    await expireTrackingKey(key);
  } catch (error) {
    console.warn("[Redis] recordCacheMiss failed:", getErrorMessage(error));
  }
}

export async function getCacheHitRate(): Promise<number> {
  if (!redis) return 0;
  try {
    const [hitsRaw, missesRaw] = await Promise.all([redis.get("odds:cacheHits"), redis.get("odds:cacheMisses")]);
    const hits = hitsRaw ? Number.parseInt(hitsRaw, 10) : 0;
    const misses = missesRaw ? Number.parseInt(missesRaw, 10) : 0;
    const total = hits + misses;
    return total > 0 ? Number(((hits / total) * 100).toFixed(2)) : 0;
  } catch (error) {
    console.warn("[Redis] getCacheHitRate failed:", getErrorMessage(error));
    return 0;
  }
}
