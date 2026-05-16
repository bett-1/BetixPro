import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn('[Redis] REDIS_URL not set - Redis disabled');
}

const redis = redisUrl
  ? new Redis(redisUrl, {
      tls: {
        rejectUnauthorized: false, // required for Upstash
      },
      retryStrategy: (times) => {
        if (times > 5) {
          console.error('[Redis] Max retries reached, giving up');
          return null; // stop retrying
        }
        return Math.min(times * 500, 5000);
      },
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      lazyConnect: false,
      connectTimeout: 10000,
    })
  : null;

if (redis) {
  redis.on('connect', () =>
    console.log('[Redis] Connected to Upstash'));
  redis.on('ready', () =>
    console.log('[Redis] Ready to accept commands'));
  redis.on('error', (err) =>
    console.error('[Redis] Error:', err.message));
  redis.on('close', () =>
    console.warn('[Redis] Connection closed'));
  redis.on('reconnecting', () =>
    console.log('[Redis] Reconnecting...'));
}

export async function initializeRedis() {
  if (!redis) return;

  try {
    if (redis.status === "wait" || redis.status === "end") {
      await redis.connect();
    }
  } catch (error) {
    console.error("[Redis] Startup connection failed; continuing without Redis cache:", error);
  }
}

export default redis;
