import { Router } from "express";
import { prisma } from "../lib/prisma";

const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return res.status(503).json({
      status: "ok",
      db: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

export { healthRouter };
