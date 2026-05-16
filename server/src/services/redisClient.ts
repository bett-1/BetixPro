import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL?.trim() || "redis://localhost:6379";

const redis = new Redis(redisUrl, {
  retryStrategy: (times) => Math.min(times * 100, 3000),
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
  lazyConnect: true,
});

redis.on("connect", () => console.log("[Redis] Connected."));
redis.on("ready", () => console.log("[Redis] Ready for odds cache traffic."));
redis.on("close", () => console.warn("[Redis] Connection closed; odds cache will fall back gracefully."));
redis.on("error", (error) => console.error("[Redis] Error:", error.message));

export async function initializeRedis() {
  try {
    if (redis.status === "wait" || redis.status === "end") {
      await redis.connect();
    }
  } catch (error) {
    console.error("[Redis] Startup connection failed; continuing without Redis cache:", error);
  }
}

export default redis;
