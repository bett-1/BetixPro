import "./bootstrap/env";
console.log(
  "[Env Check] THE_ODDS_API_KEY loaded:",
  !!(process.env.THE_ODDS_API_KEY || process.env.ODDS_API_KEY),
);
import { app } from "./app";
import { prisma } from "./lib/prisma";
import { createHttpServerWithSockets } from "./lib/socket";
import { startLiveFeed } from "./services/liveFeed";
import { initializeProductionAdmin } from "./services/adminInitializer";
import { logSendGridConfigurationHealth } from "./utils/email";
import { initializeRedis } from "./services/redisClient";
import { hydrateCreditStateFromRedis } from "./services/creditTracker";
import { startOddsScheduler } from "./services/oddsScheduler";

const port = Number(process.env.PORT ?? 5000);

async function startServer() {
  try {
    logSendGridConfigurationHealth();
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connected successfully.");
    await initializeProductionAdmin();
    await initializeRedis();
    const creditState = await hydrateCreditStateFromRedis();
    console.log("[OddsCredits] Current cached credit balance:", {
      remaining: Number.isFinite(creditState.remaining ?? Number.POSITIVE_INFINITY)
        ? creditState.remaining
        : "unknown",
      used: creditState.used ?? "unknown",
      pollingMode: creditState.pollingMode,
    });

    const server = createHttpServerWithSockets(app);
    startLiveFeed();
    startOddsScheduler();

    server.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Database connection failed. Server not started.", error);
    process.exit(1);
  }
}

void startServer();
