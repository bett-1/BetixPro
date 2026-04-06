import { Router } from "express";
import { requireAuth } from "../middleware/authenticate";
import { requireOwnership } from "../middleware/requireOwnership";
import { profileUpdateRateLimiter } from "../middleware/rateLimiter";
import {
  deleteOwnAccount,
  getProfile,
  getProfileBalance,
  getProfileTransactions,
  getSingleProfileTransaction,
  getTransactionOwnerId,
  updateProfilePreferences,
} from "../controllers/profile.controller";

const profileRouter = Router();

profileRouter.use("/profile", requireAuth);

profileRouter.get("/profile", getProfile);
profileRouter.get("/profile/balance", getProfileBalance);
profileRouter.get("/profile/transactions", getProfileTransactions);
profileRouter.get(
  "/profile/transactions/:transactionReference",
  requireOwnership(getTransactionOwnerId),
  getSingleProfileTransaction,
);
profileRouter.post(
  "/profile/preferences",
  profileUpdateRateLimiter,
  updateProfilePreferences,
);
profileRouter.post(
  "/profile/delete-account",
  profileUpdateRateLimiter,
  deleteOwnAccount,
);

export { profileRouter };
