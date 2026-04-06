import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getRefreshTokenCookieOptions } from "../utils/tokenUtils";

const transactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

const preferencesSchema = z.object({
  theme: z.enum(["dark", "light"]).optional(),
  dataSaver: z.boolean().optional(),
});

const deleteAccountSchema = z.object({
  password: z
    .string()
    .trim()
    .min(8, "Password is required")
    .max(128, "Password is too long")
    .regex(/^[^<>]+$/, "Password contains unsupported characters"),
});

type PreferenceRecord = {
  theme: "dark" | "light";
  dataSaver: boolean;
};

const inMemoryPreferences = new Map<string, PreferenceRecord>();

function getDefaultPreferences(): PreferenceRecord {
  return {
    theme: "dark",
    dataSaver: false,
  };
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9) {
    return "***";
  }

  const local = digits.startsWith("254") ? `0${digits.slice(3)}` : digits;
  if (local.length < 7) {
    return `${local.slice(0, 2)}***`;
  }

  return `${local.slice(0, 4)}***${local.slice(-3)}`;
}

function toTransactionStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "pending";
    case "COMPLETED":
      return "completed";
    case "FAILED":
      return "failed";
    case "REVERSED":
      return "reversed";
    default:
      return "pending";
  }
}

function toTransactionType(type: string) {
  return type.toLowerCase().replace("_", "-");
}

export async function getProfile(req: Request, res: Response) {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.id;

  const [user, wallet, bonusAggregate] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        phone: true,
        accountStatus: true,
      },
    }),
    prisma.wallet.findUnique({
      where: { userId },
      select: {
        balance: true,
      },
    }),
    prisma.walletTransaction.aggregate({
      where: {
        userId,
        type: "BONUS",
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  if (!user) {
    return res.status(404).json({ message: "Profile not found" });
  }

  const preferences =
    inMemoryPreferences.get(userId) ?? getDefaultPreferences();

  return res.status(200).json({
    profile: {
      phoneMasked: maskPhone(user.phone),
      avatarLetter: user.phone.replace(/\D/g, "").slice(-1) || "U",
      status: user.accountStatus,
      balance: wallet?.balance ?? 0,
      bonus: bonusAggregate._sum.amount ?? 0,
      preferences,
      live: true,
    },
  });
}

export async function getProfileBalance(req: Request, res: Response) {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.id;

  const [wallet, bonusAggregate] = await Promise.all([
    prisma.wallet.findUnique({
      where: { userId },
      select: {
        balance: true,
      },
    }),
    prisma.walletTransaction.aggregate({
      where: {
        userId,
        type: "BONUS",
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  return res.status(200).json({
    balance: wallet?.balance ?? 0,
    bonus: bonusAggregate._sum.amount ?? 0,
    live: true,
    updatedAt: new Date().toISOString(),
  });
}

export async function getProfileTransactions(req: Request, res: Response) {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsedQuery = transactionsQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({ message: "Invalid query" });
  }

  const userId = req.user.id;
  const { page, limit } = parsedQuery.data;
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      select: {
        type: true,
        status: true,
        amount: true,
        currency: true,
        channel: true,
        reference: true,
        providerReceiptNumber: true,
        createdAt: true,
      },
    }),
    prisma.walletTransaction.count({
      where: {
        userId,
      },
    }),
  ]);

  return res.status(200).json({
    transactions: transactions.map((entry) => ({
      type: toTransactionType(entry.type),
      status: toTransactionStatus(entry.status),
      amount: entry.amount,
      currency: entry.currency,
      channel: entry.channel,
      reference: entry.reference,
      mpesaCode: entry.providerReceiptNumber,
      createdAt: entry.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      hasMore: page * limit < total,
    },
  });
}

export async function updateProfilePreferences(req: Request, res: Response) {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsedBody = preferencesSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ message: "Invalid preferences payload" });
  }

  const userId = req.user.id;
  const current = inMemoryPreferences.get(userId) ?? getDefaultPreferences();

  const nextPreferences: PreferenceRecord = {
    theme: parsedBody.data.theme ?? current.theme,
    dataSaver:
      typeof parsedBody.data.dataSaver === "boolean"
        ? parsedBody.data.dataSaver
        : current.dataSaver,
  };

  inMemoryPreferences.set(userId, nextPreferences);

  return res.status(200).json({
    message: "Preferences updated",
    preferences: nextPreferences,
  });
}

export async function getTransactionOwnerId(req: Request) {
  const transactionRefParam = req.params.transactionReference;
  const transactionRef = Array.isArray(transactionRefParam)
    ? transactionRefParam[0]
    : transactionRefParam;
  if (!transactionRef) {
    return null;
  }

  const transaction = await prisma.walletTransaction.findFirst({
    where: {
      reference: transactionRef,
    },
    select: {
      userId: true,
    },
  });

  return transaction?.userId;
}

export async function getSingleProfileTransaction(req: Request, res: Response) {
  const transactionRefParam = req.params.transactionReference;
  const transactionRef = Array.isArray(transactionRefParam)
    ? transactionRefParam[0]
    : transactionRefParam;
  if (!transactionRef) {
    return res.status(400).json({ message: "Invalid transaction reference" });
  }

  const transaction = await prisma.walletTransaction.findFirst({
    where: {
      reference: transactionRef,
    },
    select: {
      type: true,
      status: true,
      amount: true,
      currency: true,
      channel: true,
      reference: true,
      providerReceiptNumber: true,
      createdAt: true,
      processedAt: true,
      description: true,
    },
  });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  return res.status(200).json({
    transaction: {
      type: toTransactionType(transaction.type),
      status: toTransactionStatus(transaction.status),
      amount: transaction.amount,
      currency: transaction.currency,
      channel: transaction.channel,
      reference: transaction.reference,
      mpesaCode: transaction.providerReceiptNumber,
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
      processedAt: transaction.processedAt?.toISOString() ?? null,
    },
  });
}

export async function deleteOwnAccount(req: Request, res: Response) {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsedBody = deleteAccountSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ message: "Password confirmation is required" });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "Account not found" });
  }

  const validPassword = await bcrypt.compare(
    parsedBody.data.password,
    user.passwordHash,
  );

  if (!validPassword) {
    return res.status(401).json({ message: "Invalid password" });
  }

  await prisma.user.delete({
    where: {
      id: req.user.id,
    },
  });

  inMemoryPreferences.delete(req.user.id);
  res.clearCookie("refreshToken", getRefreshTokenCookieOptions());

  return res.status(200).json({
    message: "Account deleted successfully",
  });
}
