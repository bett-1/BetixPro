import { z } from "zod";
import type { AdminSettingsConfig } from "./adminSettingsConfig";

export type WalletTransactionStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REVERSED";
export type WalletTransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "BET_STAKE"
  | "BET_WIN"
  | "REFUND"
  | "BONUS";

export type MpesaAuthTokenResponse = {
  access_token: string;
  expires_in: string;
};

export type MpesaStkPushResponse = {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
  errorMessage?: string;
};

export type MpesaStkQueryResponse = {
  ResponseCode?: string;
  ResponseDescription?: string;
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResultCode?: string;
  ResultDesc?: string;
  errorMessage?: string;
};

export type MpesaB2CResponse = {
  ConversationID?: string;
  OriginatorConversationID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  errorMessage?: string;
};

export type MpesaCallbackItem = {
  Name: string;
  Value?: string | number;
};

export const stkPushBodySchema = z.object({
  phone: z.string().trim().min(10),
  amount: z.number().int().positive(),
  accountReference: z.string().trim().min(2).max(20).optional(),
  description: z.string().trim().min(2).max(40).optional(),
});

export const mpesaCallbackSchema = z.object({
  Body: z.object({
    stkCallback: z.object({
      MerchantRequestID: z.string().optional(),
      CheckoutRequestID: z.string().optional(),
      ResultCode: z.union([z.number(), z.string()]).optional(),
      ResultDesc: z.string().optional(),
      CallbackMetadata: z
        .object({
          Item: z
            .array(
              z.object({
                Name: z.string(),
                Value: z.union([z.string(), z.number()]).optional(),
              }),
            )
            .optional(),
        })
        .optional(),
    }),
  }),
});

export function toTransactionType(value: WalletTransactionType): string {
  switch (value) {
    case "DEPOSIT":
      return "deposit";
    case "WITHDRAWAL":
      return "withdrawal";
    case "BET_STAKE":
      return "bet-stake";
    case "BET_WIN":
      return "bet-win";
    case "REFUND":
      return "refund";
    case "BONUS":
      return "bonus";
  }
}

export function toTransactionStatus(value: WalletTransactionStatus): string {
  switch (value) {
    case "PENDING":
      return "pending";
    case "PROCESSING":
      return "processing";
    case "COMPLETED":
      return "completed";
    case "FAILED":
      return "failed";
    case "REVERSED":
      return "reversed";
  }
}

export function normalizePhoneNumber(phone: string): string | null {
  const digitsOnly = phone.replace(/\D/g, "");

  if (digitsOnly.startsWith("0") && digitsOnly.length === 10) {
    return `254${digitsOnly.slice(1)}`;
  }

  if (digitsOnly.startsWith("7") && digitsOnly.length === 9) {
    return `254${digitsOnly}`;
  }

  if (digitsOnly.startsWith("254") && digitsOnly.length === 12) {
    return digitsOnly;
  }

  return null;
}

export function getMpesaConfig(settings: AdminSettingsConfig):
  | {
      isConfigured: true;
      baseUrl: string;
      consumerKey: string;
      consumerSecret: string;
      shortcode: string;
      passkey: string;
      callbackUrl: string;
    }
  | {
      isConfigured: false;
      missingVars: string[];
    } {
  const env = settings.generalSystemConfig.environment;
  const mpesa = settings.paymentsConfig.mpesa;

  const consumerKey = mpesa.consumerKey;
  const consumerSecret = mpesa.consumerSecret;
  const shortcode = mpesa.shortcode;
  const passkey = mpesa.passkey;
  const callbackUrl = mpesa.callbackUrl;

  const missingVars: string[] = [];

  if (!consumerKey || consumerKey.includes("replace-with"))
    missingVars.push("M-Pesa Consumer Key");
  if (!consumerSecret || consumerSecret.includes("replace-with"))
    missingVars.push("M-Pesa Consumer Secret");
  if (!shortcode) missingVars.push("M-Pesa Shortcode");
  if (!passkey || passkey.includes("replace-with"))
    missingVars.push("M-Pesa Passkey");
  if (!callbackUrl) missingVars.push("M-Pesa Callback URL");

  if (missingVars.length > 0) {
    return {
      isConfigured: false,
      missingVars,
    };
  }

  const baseUrl =
    env === "live"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  return {
    isConfigured: true,
    baseUrl,
    consumerKey,
    consumerSecret,
    shortcode,
    passkey,
    callbackUrl,
  };
}

function deriveSiblingCallbackUrl(callbackUrl: string, pathname: string) {
  const url = new URL(callbackUrl);
  url.pathname = pathname;
  url.search = "";
  url.hash = "";
  return url.toString();
}

export function getMpesaB2CConfig(settings: AdminSettingsConfig):
  | {
      isConfigured: true;
      baseUrl: string;
      consumerKey: string;
      consumerSecret: string;
      shortcode: string;
      initiatorName: string;
      securityCredential: string;
      commandId: string;
      resultUrl: string;
      timeoutUrl: string;
    }
  | {
      isConfigured: false;
      missingVars: string[];
    } {
  const baseConfig = getMpesaConfig(settings);
  if (!baseConfig.isConfigured) {
    return baseConfig;
  }

  const mpesa = settings.paymentsConfig.mpesa;
  const initiatorName = mpesa.initiatorName;
  const securityCredential = mpesa.securityCredential;
  const commandId = mpesa.commandId || "BusinessPayment";
  const resultUrl =
    mpesa.resultUrl ||
    deriveSiblingCallbackUrl(
      baseConfig.callbackUrl,
      "/api/payments/mpesa/withdrawals/result",
    );
  const timeoutUrl =
    mpesa.timeoutUrl ||
    deriveSiblingCallbackUrl(
      baseConfig.callbackUrl,
      "/api/payments/mpesa/withdrawals/timeout",
    );

  const missingVars: string[] = [];
  if (!initiatorName || initiatorName.includes("replace-with"))
    missingVars.push("M-Pesa Initiator Name");
  if (!securityCredential || securityCredential.includes("replace-with"))
    missingVars.push("M-Pesa Security Credential");

  if (missingVars.length > 0) {
    return {
      isConfigured: false,
      missingVars,
    };
  }

  return {
    isConfigured: true,
    baseUrl: baseConfig.baseUrl,
    consumerKey: baseConfig.consumerKey,
    consumerSecret: baseConfig.consumerSecret,
    shortcode: mpesa.b2cShortcode || baseConfig.shortcode,
    initiatorName: initiatorName as string,
    securityCredential: securityCredential as string,
    commandId,
    resultUrl,
    timeoutUrl,
  };
}

export function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hour}${minute}${second}`;
}

export async function getMpesaAccessToken(config: {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
}): Promise<MpesaAuthTokenResponse> {
  const authHeader = Buffer.from(
    `${config.consumerKey.trim()}:${config.consumerSecret.trim()}`,
  ).toString("base64");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    console.log("[M-Pesa Auth] Requesting token from:", config.baseUrl);

    const tokenResponse = await fetch(
      `${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      },
    );

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text().catch(() => "(no body)");
      console.error("[M-Pesa Auth] Authentication failed:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: errorBody,
      });
      throw new Error(
        `M-Pesa API authentication failed: ${tokenResponse.status} ${tokenResponse.statusText}. Response: ${errorBody}`,
      );
    }

    const data = await tokenResponse.json();

    if (!data.access_token) {
      console.error(
        "[M-Pesa Auth] Invalid response - missing access_token:",
        data,
      );
      throw new Error(
        "M-Pesa API returned invalid token response: missing access_token field.",
      );
    }

    console.log("[M-Pesa Auth] Token acquired successfully.");
    return data as MpesaAuthTokenResponse;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error(
          "[M-Pesa Auth] Request timeout (10s) connecting to M-Pesa API",
        );
        throw new Error(
          "M-Pesa API connection timeout. Please check network connectivity and firewall rules.",
        );
      }
      throw error;
    }
    throw new Error("M-Pesa API authentication failed: Unknown error");
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getValue(
  items: MpesaCallbackItem[],
  name: string,
): undefined | string | number {
  return items.find((item) => item.Name === name)?.Value;
}

export async function initiateMpesaB2C(
  args: {
    phoneNumber: string;
    amount: number;
    remarks?: string;
    occasion?: string;
  },
  settings: AdminSettingsConfig,
): Promise<MpesaB2CResponse> {
  const config = getMpesaB2CConfig(settings);
  if (!config.isConfigured) {
    throw new Error(
      `M-Pesa B2C not configured: ${config.missingVars.join(", ")}`,
    );
  }

  const tokenResponse = await getMpesaAccessToken(config);

  const payload = {
    InitiatorName: config.initiatorName,
    SecurityCredential: config.securityCredential,
    CommandID: config.commandId,
    Amount: args.amount,
    PartyA: config.shortcode,
    PartyB: args.phoneNumber,
    Remarks: args.remarks || "Withdrawal",
    QueueTimeOutURL: config.timeoutUrl,
    ResultURL: config.resultUrl,
    Occassion: args.occasion || "",
  };

  const response = await fetch(
    `${config.baseUrl}/mpesa/b2c/v1/paymentrequest`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`M-Pesa B2C request failed: ${errorBody}`);
  }

  return (await response.json()) as MpesaB2CResponse;
}

export function normalizeCallbackValue(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

export function toClientTransaction(transaction: {
  id: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  amount: number;
  currency: string;
  channel: string;
  reference: string;
  providerReceiptNumber: string | null;
  createdAt: Date;
}) {
  return {
    id: transaction.id,
    type: toTransactionType(transaction.type),
    status: toTransactionStatus(transaction.status),
    amount: transaction.amount,
    currency: transaction.currency,
    channel: transaction.channel,
    reference: transaction.reference,
    mpesaCode: transaction.providerReceiptNumber,
    createdAt: transaction.createdAt.toISOString(),
  };
}
