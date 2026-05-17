import { Queue, QueueEvents } from "bullmq";

type BullMqConnection = {
  username?: string;
  password: string;
  host: string;
  port: number;
  tls?: Record<string, never>;
};

export function parseRedisUrl(url: string): BullMqConnection {
  const parsed = new URL(url);
  if (!["redis:", "rediss:"].includes(parsed.protocol)) {
    throw new Error("Invalid REDIS_URL protocol");
  }

  return {
    username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
    password: decodeURIComponent(parsed.password),
    host: parsed.hostname,
    port: Number.parseInt(parsed.port || "6379", 10),
    ...(parsed.protocol === "rediss:" ? { tls: {} } : {}),
  };
}

export function getBullMqConnection(): BullMqConnection {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("[BullMQ] REDIS_URL is not set; queues will target local Redis until configured.");
    return {
      username: "default",
      password: "",
      host: "127.0.0.1",
      port: 6379,
    };
  }
  return parseRedisUrl(redisUrl);
}

export const connection = getBullMqConnection();

export const oddsQueue = new Queue("odds-fetch", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 30_000 },
    removeOnComplete: 50,
    removeOnFail: 20,
  },
});

export const configureQueue = new Queue("event-configure", { connection });
export const healthQueue = new Queue("health-check", { connection });

export const oddsQueueEvents = new QueueEvents("odds-fetch", { connection });
