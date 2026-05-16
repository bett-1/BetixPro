import redis from "./redisClient";

export const LIVE_ODDS_TTL_SECONDS = 240;
export const NEAR_UPCOMING_ODDS_TTL_SECONDS = 840;
export const FAR_UPCOMING_ODDS_TTL_SECONDS = 3540;
const ONE_DAY_SECONDS = 24 * 60 * 60;

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

async function expireTrackingKey(key: string) {
  const ttl = await redis.ttl(key);
  if (ttl < 0) {
    await redis.expire(key, ttlForTrackingKey());
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
  if (ttlSeconds <= 0) return;
  const now = new Date();
  const envelope: CachedOddsEnvelope = {
    data,
    fetchedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
  };
  await redis.setex(`odds:${eventId}`, ttlSeconds, JSON.stringify(envelope));
}

export async function getOddsCache<T = unknown>(eventId: string): Promise<T | null> {
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
}

export async function getAllCachedOddsKeys(): Promise<string[]> {
  return redis.keys("odds:*");
}

export async function setCreditBalance(used: number, remaining: number): Promise<void> {
  await redis.hset("odds:credits", {
    used: String(used),
    remaining: String(remaining),
    updatedAt: String(Date.now()),
  });
  await redis.expire("odds:credits", ONE_DAY_SECONDS);
}

export async function getCreditBalance(): Promise<{ used: number; remaining: number; updatedAt: number } | null> {
  const data = await redis.hgetall("odds:credits");
  if (!data || !data.remaining) return null;
  return {
    used: Number.parseInt(data.used || "0", 10),
    remaining: Number.parseInt(data.remaining, 10),
    updatedAt: Number.parseInt(data.updatedAt || "0", 10),
  };
}

export async function setPollingMode(mode: PollingMode): Promise<void> {
  await redis.set("odds:pollingMode", mode, "EX", ONE_DAY_SECONDS);
}

export async function getPollingMode(): Promise<PollingMode> {
  const mode = await redis.get("odds:pollingMode");
  return mode === "reduced" || mode === "emergency" ? mode : "normal";
}

export async function setLastPollForSport(sport: string, timestamp = Date.now()): Promise<void> {
  await redis.set(`odds:lastPoll:${sport}`, String(timestamp), "EX", ONE_DAY_SECONDS);
}

export async function getLastPollForSport(sport: string): Promise<number | null> {
  const value = await redis.get(`odds:lastPoll:${sport}`);
  return value ? Number.parseInt(value, 10) : null;
}

export async function incrementDailyCallCount(): Promise<number> {
  const key = "odds:dailyCount";
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, getSecondsUntilMidnight());
  }
  return count;
}

export async function getDailyCallCount(): Promise<number> {
  const val = await redis.get("odds:dailyCount");
  return val ? Number.parseInt(val, 10) : 0;
}

export async function isWithinDailyLimit(): Promise<boolean> {
  return (await getDailyCallCount()) < 100;
}

export async function recordCacheHit(): Promise<void> {
  const key = "odds:cacheHits";
  await redis.incr(key);
  await expireTrackingKey(key);
}

export async function recordCacheMiss(): Promise<void> {
  const key = "odds:cacheMisses";
  await redis.incr(key);
  await expireTrackingKey(key);
}

export async function getCacheHitRate(): Promise<number> {
  const [hitsRaw, missesRaw] = await Promise.all([redis.get("odds:cacheHits"), redis.get("odds:cacheMisses")]);
  const hits = hitsRaw ? Number.parseInt(hitsRaw, 10) : 0;
  const misses = missesRaw ? Number.parseInt(missesRaw, 10) : 0;
  const total = hits + misses;
  return total > 0 ? Number(((hits / total) * 100).toFixed(2)) : 0;
}
