import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import {
  getAdminDashboardSummary,
  getBettingAnalytics,
  createUser,
  getAllUsers,
  getUserDetails,
  updateUser,
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
  updateUserPassword,
  getAdminPayments,
  getAdminPaymentsStats,
  getAdminSettings,
  updateAdminSettings,
  getRiskAlerts,
  getRiskAlertDetail,
  updateRiskAlert,
  getRiskSummary,
  getBanAppeals,
  getBanAppealDetail,
  respondToBanAppeal,
} from "../controllers/admin.controller";
import { requireAdmin } from "../middleware/requireAdmin";
import { getCacheHitRate, getCreditBalance, getDailyCallCount, getPollingMode } from "../services/oddsCache";
import { getCreditState } from "../services/creditTracker";
import { MAX_DAILY_CALLS, TOTAL_MONTHLY_CREDITS } from "../config/sportsConfig";

const adminRouter = Router();

// Dashboard
adminRouter.get(
  "/admin/dashboard/summary",
  authenticate,
  requireAdmin,
  getAdminDashboardSummary,
);
adminRouter.get(
  "/admin/analytics",
  authenticate,
  requireAdmin,
  getBettingAnalytics,
);

adminRouter.get("/admin/credits", authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const [redisBalance, dailyCallCount, pollingMode, cacheHitRate] = await Promise.all([
      getCreditBalance().catch(() => null),
      getDailyCallCount().catch(() => 0),
      getPollingMode().catch(() => "normal"),
      getCacheHitRate().catch(() => 0),
    ]);

    const memoryState = getCreditState();
    const used = redisBalance?.used ?? memoryState.used ?? 0;
    const remaining = redisBalance?.remaining ?? memoryState.remaining ?? 20_000;
    const percentage = Math.round((remaining / TOTAL_MONTHLY_CREDITS) * 100);
    const dayOfMonth = Math.max(1, new Date().getDate());
    const dailyAverage = Number((used / dayOfMonth).toFixed(2));
    const projectedMonthEnd = Math.round(dailyAverage * 30);
    const daysUntilEmpty = dailyAverage > 0 ? Math.floor(remaining / dailyAverage) : null;
    const safeUntil =
      daysUntilEmpty === null
        ? null
        : new Date(Date.now() + daysUntilEmpty * 24 * 60 * 60 * 1000).toISOString();

    res.status(200).json({
      remaining,
      used,
      total: TOTAL_MONTHLY_CREDITS,
      percentage,
      display: `${remaining.toLocaleString()} (${percentage}%)`,
      dailyAverage,
      dailyCallCount,
      dailyLimit: MAX_DAILY_CALLS,
      projectedMonthEnd,
      safeUntil,
      pollingMode,
      cacheHitRate: `${cacheHitRate}%`,
    });
  } catch (error) {
    next(error);
  }
});

// User Management
adminRouter.get("/admin/users", authenticate, requireAdmin, getAllUsers);
adminRouter.post("/admin/users", authenticate, requireAdmin, createUser);
adminRouter.get(
  "/admin/users/:userId",
  authenticate,
  requireAdmin,
  getUserDetails,
);
adminRouter.put("/admin/users/:userId", authenticate, requireAdmin, updateUser);
adminRouter.patch(
  "/admin/users/:userId/password",
  authenticate,
  requireAdmin,
  updateUserPassword,
);
adminRouter.post(
  "/admin/users/:userId/ban",
  authenticate,
  requireAdmin,
  banUser,
);
adminRouter.post(
  "/admin/users/:userId/unban",
  authenticate,
  requireAdmin,
  unbanUser,
);
adminRouter.post(
  "/admin/users/:userId/suspend",
  authenticate,
  requireAdmin,
  suspendUser,
);
adminRouter.post(
  "/admin/users/:userId/unsuspend",
  authenticate,
  requireAdmin,
  unsuspendUser,
);

// Payments Management
adminRouter.get(
  "/admin/payments",
  authenticate,
  requireAdmin,
  getAdminPayments,
);
adminRouter.get(
  "/admin/payments/stats",
  authenticate,
  requireAdmin,
  getAdminPaymentsStats,
);

// Risk Management
adminRouter.get(
  "/admin/risk/alerts",
  authenticate,
  requireAdmin,
  getRiskAlerts,
);
adminRouter.get(
  "/admin/risk/alerts/:alertId",
  authenticate,
  requireAdmin,
  getRiskAlertDetail,
);
adminRouter.patch(
  "/admin/risk/alerts/:alertId",
  authenticate,
  requireAdmin,
  updateRiskAlert,
);
adminRouter.get(
  "/admin/risk/summary",
  authenticate,
  requireAdmin,
  getRiskSummary,
);

// Settings Management
adminRouter.get(
  "/admin/settings",
  authenticate,
  requireAdmin,
  getAdminSettings,
);
adminRouter.put(
  "/admin/settings",
  authenticate,
  requireAdmin,
  updateAdminSettings,
);

// Ban Appeals Management
adminRouter.get("/admin/appeals", authenticate, requireAdmin, getBanAppeals);
adminRouter.get(
  "/admin/appeals/:appealId",
  authenticate,
  requireAdmin,
  getBanAppealDetail,
);
adminRouter.post(
  "/admin/appeals/:appealId/respond",
  authenticate,
  requireAdmin,
  respondToBanAppeal,
);

export { adminRouter };
