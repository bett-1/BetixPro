import { prisma } from "../lib/prisma";
import { emitNotificationUpdate } from "../lib/socket";

/**
 * Creates deposit notifications for both user and admin.
 * Handles success and failure scenarios with appropriate messaging.
 */
export async function createDepositNotifications(args: {
  userId: string;
  transactionId: string;
  amount: number;
  balance: number;
  mpesaCode?: string | null;
  status: "COMPLETED" | "FAILED";
  failureReason?: string;
}) {
  const [userProfile, adminUsers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: args.userId },
      select: { phone: true, email: true },
    }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    }),
  ]);

  const normalizedMpesaCode = args.mpesaCode ?? null;
  const codeSuffix = normalizedMpesaCode
    ? ` M-Pesa code: ${normalizedMpesaCode}.`
    : "";
  const userIdentifier =
    userProfile?.phone ?? userProfile?.email ?? args.userId;
  const isSuccess = args.status === "COMPLETED";

  const userTitle = isSuccess ? "Deposit Successful" : "Deposit Failed";
  const userMessage = isSuccess
    ? `You deposited KES ${args.amount.toLocaleString()}. Your new balance is KES ${args.balance.toLocaleString()}.${codeSuffix}`
    : `Your deposit request for KES ${args.amount.toLocaleString()} failed.${args.failureReason ? ` Reason: ${args.failureReason}.` : ""}`;

  const adminTitle = isSuccess
    ? "New Customer Deposit"
    : "Customer Deposit Failed";
  const adminMessage = isSuccess
    ? `${userIdentifier} deposited KES ${args.amount.toLocaleString()}. Updated wallet balance: KES ${args.balance.toLocaleString()}.${codeSuffix}`
    : `${userIdentifier} had a failed deposit request of KES ${args.amount.toLocaleString()}.${args.failureReason ? ` Reason: ${args.failureReason}.` : ""}`;

  const notificationType: "DEPOSIT_SUCCESS" | "DEPOSIT_FAILED" = isSuccess
    ? "DEPOSIT_SUCCESS"
    : "DEPOSIT_FAILED";
  const createdAtIso = new Date().toISOString();

  const createPayload = [
    {
      userId: args.userId,
      audience: "USER" as const,
      type: notificationType,
      title: userTitle,
      message: userMessage,
      transactionId: args.transactionId,
      amount: args.amount,
      balance: args.balance,
      mpesaCode: normalizedMpesaCode,
    },
    ...adminUsers.map((admin) => ({
      userId: admin.id,
      audience: "ADMIN" as const,
      type: notificationType,
      title: adminTitle,
      message: adminMessage,
      transactionId: args.transactionId,
      amount: args.amount,
      balance: args.balance,
      mpesaCode: normalizedMpesaCode,
    })),
  ];

  const created = await prisma.notification.createMany({
    data: createPayload,
    skipDuplicates: true,
  });

  if (created.count === 0) {
    return;
  }

  emitNotificationUpdate(args.userId, {
    audience: "USER",
    type: notificationType,
    title: userTitle,
    message: userMessage,
    transactionId: args.transactionId,
    amount: args.amount,
    balance: args.balance,
    mpesaCode: normalizedMpesaCode,
    createdAt: createdAtIso,
  });

  for (const admin of adminUsers) {
    emitNotificationUpdate(admin.id, {
      audience: "ADMIN",
      type: notificationType,
      title: adminTitle,
      message: adminMessage,
      transactionId: args.transactionId,
      amount: args.amount,
      balance: args.balance,
      mpesaCode: normalizedMpesaCode,
      createdAt: createdAtIso,
    });
  }
}

/**
 * Creates withdrawal notifications for user and admin.
 * Handles pending, completed, failed, and rejected statuses.
 */
export async function createWithdrawalNotifications(args: {
  userId: string;
  transactionId: string;
  amount: number;
  fee: number;
  balance: number;
  phone: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REJECTED";
  failureReason?: string;
}) {
  const [userProfile, adminUsers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: args.userId },
      select: { phone: true, email: true },
    }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    }),
  ]);

  const userIdentifier =
    userProfile?.phone ?? userProfile?.email ?? args.userId;
  const netAmount = args.amount - args.fee;

  let userTitle = "";
  let userMessage = "";
  let adminTitle = "";
  let adminMessage = "";
  let notificationType: "WITHDRAWAL_SUCCESS" | "WITHDRAWAL_FAILED" | "SYSTEM" =
    "SYSTEM";

  if (args.status === "PENDING") {
    userTitle = "Withdrawal Request Submitted";
    userMessage = `Your withdrawal request for KES ${args.amount.toLocaleString()} (KES ${args.fee.toLocaleString()} fee) is pending admin approval. You'll receive KES ${netAmount.toLocaleString()}.`;
    adminTitle = "New Withdrawal Request";
    adminMessage = `${userIdentifier} requested a withdrawal of KES ${args.amount.toLocaleString()} to ${args.phone} (Fee: KES ${args.fee.toLocaleString()}).`;
    notificationType = "SYSTEM";
  } else if (args.status === "COMPLETED") {
    userTitle = "Withdrawal Successful";
    userMessage = `Your withdrawal of KES ${args.amount.toLocaleString()} has been processed to ${args.phone}. Fee charged: KES ${args.fee.toLocaleString()}. New balance: KES ${args.balance.toLocaleString()}.`;
    adminTitle = "Withdrawal Completed";
    adminMessage = `Withdrawal of KES ${args.amount.toLocaleString()} to ${userIdentifier} (${args.phone}) completed successfully.`;
    notificationType = "WITHDRAWAL_SUCCESS";
  } else if (args.status === "FAILED") {
    userTitle = "Withdrawal Failed";
    userMessage = `Your withdrawal request for KES ${args.amount.toLocaleString()} failed.${args.failureReason ? ` Reason: ${args.failureReason}.` : ""} Your balance remains unchanged at KES ${args.balance.toLocaleString()}.`;
    adminTitle = "Withdrawal Failed";
    adminMessage = `Withdrawal of KES ${args.amount.toLocaleString()} for ${userIdentifier} to ${args.phone} failed.${args.failureReason ? ` Reason: ${args.failureReason}.` : ""}`;
    notificationType = "WITHDRAWAL_FAILED";
  } else if (args.status === "REJECTED") {
    userTitle = "Withdrawal Request Rejected";
    userMessage = `Your withdrawal request for KES ${args.amount.toLocaleString()} has been rejected.${args.failureReason ? ` Reason: ${args.failureReason}.` : ""} Your balance remains KES ${args.balance.toLocaleString()}.`;
    adminTitle = "Withdrawal Rejected";
    adminMessage = `Withdrawal request of KES ${args.amount.toLocaleString()} for ${userIdentifier} to ${args.phone} was rejected.${args.failureReason ? ` Reason: ${args.failureReason}.` : ""}`;
    notificationType = "WITHDRAWAL_FAILED";
  }

  const createdAtIso = new Date().toISOString();

  const createPayload = [
    {
      userId: args.userId,
      audience: "USER" as const,
      type: notificationType,
      title: userTitle,
      message: userMessage,
      transactionId: args.transactionId,
      amount: args.amount,
      balance: args.balance,
    },
    ...adminUsers.map((admin) => ({
      userId: admin.id,
      audience: "ADMIN" as const,
      type: notificationType,
      title: adminTitle,
      message: adminMessage,
      transactionId: args.transactionId,
      amount: args.amount,
      balance: args.balance,
    })),
  ];

  const created = await prisma.notification.createMany({
    data: createPayload,
    skipDuplicates: true,
  });

  if (created.count === 0) {
    return;
  }

  emitNotificationUpdate(args.userId, {
    audience: "USER",
    type: notificationType,
    title: userTitle,
    message: userMessage,
    transactionId: args.transactionId,
    amount: args.amount,
    balance: args.balance,
    createdAt: createdAtIso,
  });

  for (const admin of adminUsers) {
    emitNotificationUpdate(admin.id, {
      audience: "ADMIN",
      type: notificationType,
      title: adminTitle,
      message: adminMessage,
      transactionId: args.transactionId,
      amount: args.amount,
      balance: args.balance,
      createdAt: createdAtIso,
    });
  }
}
