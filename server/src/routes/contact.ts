import { Router } from "express";
import { authenticate, requireAuth } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  createContact,
  getUserContacts,
  getAllContacts,
  updateContactStatus,
  getContactDetail,
} from "../controllers/contact.controller";

const contactRouter = Router();

// User routes - require authentication
contactRouter.post("/contact", requireAuth, createContact);
contactRouter.get("/contact/my-messages", requireAuth, getUserContacts);

// Admin routes - require admin authentication
contactRouter.get(
  "/admin/contact",
  authenticate,
  requireAdmin,
  getAllContacts,
);
contactRouter.get(
  "/admin/contact/:contactId",
  authenticate,
  requireAdmin,
  getContactDetail,
);
contactRouter.patch(
  "/admin/contact/:contactId",
  authenticate,
  requireAdmin,
  updateContactStatus,
);

export { contactRouter };
