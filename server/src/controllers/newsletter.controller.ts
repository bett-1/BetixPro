import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

type SubscribePayload = {
  email: string;
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

export async function subscribeToNewsletter(req: Request, res: Response) {
  try {
    const { email } = req.body as SubscribePayload;

    // Validate email
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing && existing.isActive) {
      return res.status(409).json({
        message: "Email is already subscribed to the newsletter",
      });
    }

    // Create or reactivate subscription
    let subscription;

    if (existing && !existing.isActive) {
      // Reactivate unsubscribed email
      subscription = await prisma.newsletterSubscription.update({
        where: { email: trimmedEmail },
        data: {
          isActive: true,
          unsubscribedAt: null,
        },
      });
    } else {
      // Create new subscription
      subscription = await prisma.newsletterSubscription.create({
        data: {
          email: trimmedEmail,
          isActive: true,
        },
      });
    }

    return res.status(201).json({
      message: "Successfully subscribed to newsletter",
      data: {
        email: subscription.email,
        subscribedAt: subscription.subscribedAt,
      },
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return res.status(500).json({
      message: "Failed to process newsletter subscription. Please try again.",
    });
  }
}

export async function unsubscribeFromNewsletter(req: Request, res: Response) {
  try {
    const { email } = req.body as SubscribePayload;

    // Validate email
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { email: trimmedEmail },
    });

    if (!subscription) {
      return res.status(404).json({
        message: "Email not found in newsletter subscriptions",
      });
    }

    if (!subscription.isActive) {
      return res.status(400).json({
        message: "Email is already unsubscribed",
      });
    }

    // Unsubscribe
    const updated = await prisma.newsletterSubscription.update({
      where: { email: trimmedEmail },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: "Successfully unsubscribed from newsletter",
      data: {
        email: updated.email,
      },
    });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return res.status(500).json({
      message: "Failed to process unsubscribe. Please try again.",
    });
  }
}

export async function getNewsletterSubscribers(req: Request, res: Response) {
  try {
    const { page = 1, limit = 50, active = true } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const isActive = active === "true" || active === "";

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscription.findMany({
        where: {
          isActive: isActive,
        },
        orderBy: {
          subscribedAt: "desc",
        },
        skip,
        take: limitNum,
      }),
      prisma.newsletterSubscription.count({
        where: {
          isActive: isActive,
        },
      }),
    ]);

    return res.status(200).json({
      message: "Newsletter subscribers retrieved",
      data: {
        subscribers,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get subscribers error:", error);
    return res.status(500).json({
      message: "Failed to retrieve subscribers",
    });
  }
}
