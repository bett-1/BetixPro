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
import { validateSendGridKey } from "./utils/sendgridGuard";
import { initializeRedis } from "./services/redisClient";
import { hydrateCreditStateFromRedis } from "./services/creditTracker";
import { startOddsScheduler } from "./services/oddsScheduler";
import { refreshActiveSportsList } from "./services/sportsRefreshService";
import { activateAllEventsWithOdds } from "./services/autoConfigureService";

const port = Number(process.env.PORT ?? 5000);

async function startServer() {
  logSendGridConfigurationHealth();

  try {
    await validateSendGridKey();
  } catch (error) {
    console.warn("SendGrid validation failed; continuing without email.", error);
  }

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed; continuing without DB.", error);
  }

  const server = createHttpServerWithSockets(app);
  server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });

  setTimeout(async () => {
    try {
      await initializeProductionAdmin();
      console.log("Admin bootstrap complete.");
    } catch (error) {
      console.error("Admin bootstrap failed:", error);
    }

    try {
      await initializeRedis();
      const creditState = await hydrateCreditStateFromRedis();
      console.log("[OddsCredits] Current cached credit balance:", {
        remaining: Number.isFinite(creditState.remaining ?? Number.POSITIVE_INFINITY)
          ? creditState.remaining
          : "unknown",
        used: creditState.used ?? "unknown",
        pollingMode: creditState.pollingMode,
      });
    } catch (error) {
      console.error("Redis initialization failed:", error);
    }

    try {
      await import("./workers/oddsFetchWorker.js");
      console.log("Odds fetch worker started.");
    } catch (error) {
      console.error("Odds fetch worker failed to start:", error);
    }

    try {
      await refreshActiveSportsList();
      console.log("Active sports list refreshed.");
    } catch (error) {
      console.error("Active sports refresh failed:", error);
    }

    try {
      startOddsScheduler();
      console.log("Odds scheduler started.");
    } catch (error) {
      console.error("Odds scheduler failed:", error);
    }

    try {
      await activateAllEventsWithOdds();
      console.log("Auto-configure completed.");
    } catch (error: any) {
      if (error?.code === "P2022" || error?.code === "P2021") {
        console.warn(
          "[AutoConfigure] Skipped - DB migration pending. Run: npx prisma migrate dev --name add_odds_and_markets_data",
        );
      } else {
        console.error("[AutoConfigure] Failed:", error);
      }
    }

    try {
      startLiveFeed();
      console.log("Live feed started.");
    } catch (error) {
      console.error("Live feed failed:", error);
    }
  }, 3000);
}

void startServer();
