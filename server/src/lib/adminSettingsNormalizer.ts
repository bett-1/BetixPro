import { z } from "zod";
import {
  adminSettingsSchema,
  defaultAdminSettings,
  type AdminSettingsConfig,
} from "./adminSettingsConfig";

function asObject(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function trimString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function compactCredential(value: unknown): string {
  return trimString(value).replace(/\s+/g, "");
}

function logSectionFallback(label: string, error: z.ZodError) {
  const issues = error.issues
    .map((issue: z.core.$ZodIssue) => {
      const path = issue.path.length > 0 ? `${label}.${issue.path.join(".")}` : label;
      return `${path}: ${issue.message}`;
    })
    .join("; ");

  console.warn(
    `[Settings] Invalid ${label}; using defaults for that section. ${issues}`,
  );
}

function parseWithFallback<T>(
  label: string,
  schema: z.ZodType<T>,
  value: unknown,
  fallback: T,
): T {
  const parsed = schema.safeParse(value);

  if (parsed.success) {
    return parsed.data;
  }

  logSectionFallback(label, parsed.error);
  return fallback;
}

export function normalizeAdminSettingsConfig(
  candidate: unknown,
): AdminSettingsConfig {
  const defaults = defaultAdminSettings;
  const config = asObject(candidate);

  const paymentsConfig = asObject(config.paymentsConfig);
  const paymentsMethods = asObject(paymentsConfig.methods);
  const mpesa = asObject(paymentsConfig.mpesa);
  const paystack = asObject(paymentsConfig.paystack);

  const normalizedMpesa = {
    ...defaults.paymentsConfig.mpesa,
    ...mpesa,
    shortcode: compactCredential(mpesa.shortcode),
    consumerKey: compactCredential(mpesa.consumerKey),
    consumerSecret: compactCredential(mpesa.consumerSecret),
    passkey: compactCredential(mpesa.passkey),
    baseUrl:
      trimString(mpesa.baseUrl).replace(/\/+$/, "") ||
      defaults.paymentsConfig.mpesa.baseUrl,
    callbackUrl: trimString(mpesa.callbackUrl),
    b2cShortcode: compactCredential(mpesa.b2cShortcode),
    initiatorName: trimString(mpesa.initiatorName),
    securityCredential: compactCredential(mpesa.securityCredential),
    commandId: trimString(mpesa.commandId),
    resultUrl: trimString(mpesa.resultUrl),
    timeoutUrl: trimString(mpesa.timeoutUrl),
  };

  const normalizedPaystack = {
    ...defaults.paymentsConfig.paystack,
    ...paystack,
    secretKey: trimString(paystack.secretKey),
    publicKey: trimString(paystack.publicKey),
    webhookSecret: trimString(paystack.webhookSecret),
    callbackUrl: trimString(paystack.callbackUrl),
    webhookUrl: trimString(paystack.webhookUrl),
  };

  const paymentsSchema = adminSettingsSchema.shape.paymentsConfig;

  return {
    generalSystemConfig: parseWithFallback(
      "generalSystemConfig",
      adminSettingsSchema.shape.generalSystemConfig,
      {
        ...defaults.generalSystemConfig,
        ...asObject(config.generalSystemConfig),
      },
      defaults.generalSystemConfig,
    ),
    userDefaultsAndRestrictions: parseWithFallback(
      "userDefaultsAndRestrictions",
      adminSettingsSchema.shape.userDefaultsAndRestrictions,
      {
        ...defaults.userDefaultsAndRestrictions,
        ...asObject(config.userDefaultsAndRestrictions),
      },
      defaults.userDefaultsAndRestrictions,
    ),
    kycAndComplianceConfig: parseWithFallback(
      "kycAndComplianceConfig",
      adminSettingsSchema.shape.kycAndComplianceConfig,
      {
        ...defaults.kycAndComplianceConfig,
        ...asObject(config.kycAndComplianceConfig),
      },
      defaults.kycAndComplianceConfig,
    ),
    paymentsConfig: {
      methods: parseWithFallback(
        "paymentsConfig.methods",
        paymentsSchema.shape.methods,
        {
          ...defaults.paymentsConfig.methods,
          ...paymentsMethods,
        },
        defaults.paymentsConfig.methods,
      ),
      mpesa: parseWithFallback(
        "paymentsConfig.mpesa",
        paymentsSchema.shape.mpesa,
        normalizedMpesa,
        defaults.paymentsConfig.mpesa,
      ),
      paystack: parseWithFallback(
        "paymentsConfig.paystack",
        paymentsSchema.shape.paystack,
        normalizedPaystack,
        defaults.paymentsConfig.paystack,
      ),
    },
    bettingEngineConfig: parseWithFallback(
      "bettingEngineConfig",
      adminSettingsSchema.shape.bettingEngineConfig,
      {
        ...defaults.bettingEngineConfig,
        ...asObject(config.bettingEngineConfig),
      },
      defaults.bettingEngineConfig,
    ),
    riskManagementConfig: parseWithFallback(
      "riskManagementConfig",
      adminSettingsSchema.shape.riskManagementConfig,
      {
        ...defaults.riskManagementConfig,
        ...asObject(config.riskManagementConfig),
      },
      defaults.riskManagementConfig,
    ),
    bonusesAndPromotionsConfig: parseWithFallback(
      "bonusesAndPromotionsConfig",
      adminSettingsSchema.shape.bonusesAndPromotionsConfig,
      {
        ...defaults.bonusesAndPromotionsConfig,
        ...asObject(config.bonusesAndPromotionsConfig),
      },
      defaults.bonusesAndPromotionsConfig,
    ),
    notificationsConfig: parseWithFallback(
      "notificationsConfig",
      adminSettingsSchema.shape.notificationsConfig,
      {
        ...defaults.notificationsConfig,
        ...asObject(config.notificationsConfig),
      },
      defaults.notificationsConfig,
    ),
    adminQuickSettings: parseWithFallback(
      "adminQuickSettings",
      adminSettingsSchema.shape.adminQuickSettings,
      {
        ...defaults.adminQuickSettings,
        ...asObject(config.adminQuickSettings),
      },
      defaults.adminQuickSettings,
    ),
    apiAndIntegrationsConfig: parseWithFallback(
      "apiAndIntegrationsConfig",
      adminSettingsSchema.shape.apiAndIntegrationsConfig,
      {
        ...defaults.apiAndIntegrationsConfig,
        ...asObject(config.apiAndIntegrationsConfig),
      },
      defaults.apiAndIntegrationsConfig,
    ),
    securityConfig: parseWithFallback(
      "securityConfig",
      adminSettingsSchema.shape.securityConfig,
      {
        ...defaults.securityConfig,
        ...asObject(config.securityConfig),
      },
      defaults.securityConfig,
    ),
    affiliateAndAgentConfig: parseWithFallback(
      "affiliateAndAgentConfig",
      adminSettingsSchema.shape.affiliateAndAgentConfig,
      {
        ...defaults.affiliateAndAgentConfig,
        ...asObject(config.affiliateAndAgentConfig),
      },
      defaults.affiliateAndAgentConfig,
    ),
    contentAndLegal: parseWithFallback(
      "contentAndLegal",
      adminSettingsSchema.shape.contentAndLegal,
      {
        ...defaults.contentAndLegal,
        ...asObject(config.contentAndLegal),
      },
      defaults.contentAndLegal,
    ),
  };
}
