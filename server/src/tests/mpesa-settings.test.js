const assert = require("node:assert/strict");
const test = require("node:test");
const { defaultAdminSettings } = require("../lib/adminSettingsConfig");
const {
  normalizeAdminSettingsConfig,
} = require("../lib/adminSettingsNormalizer");
const { getMpesaConfig } = require("../lib/mpesa");

function cloneDefaults() {
  return structuredClone(defaultAdminSettings);
}

test("normalizeAdminSettingsConfig preserves valid mpesa settings when paystack is invalid", () => {
  const candidate = cloneDefaults();

  candidate.paymentsConfig.mpesa.shortcode = "174379";
  candidate.paymentsConfig.mpesa.consumerKey = "liveConsumerKey123";
  candidate.paymentsConfig.mpesa.consumerSecret = "liveConsumerSecret456";
  candidate.paymentsConfig.mpesa.passkey = "livePasskey789";
  candidate.paymentsConfig.mpesa.baseUrl = "https://api.safaricom.co.ke";
  candidate.paymentsConfig.mpesa.callbackUrl =
    "https://betixpro.example.com/api/payments/mpesa/callback";
  candidate.paymentsConfig.paystack.secretKey = "";

  const normalized = normalizeAdminSettingsConfig(candidate);

  assert.equal(normalized.paymentsConfig.mpesa.consumerKey, "liveConsumerKey123");
  assert.equal(
    normalized.paymentsConfig.mpesa.consumerSecret,
    "liveConsumerSecret456",
  );
  assert.equal(
    normalized.paymentsConfig.mpesa.callbackUrl,
    "https://betixpro.example.com/api/payments/mpesa/callback",
  );
  assert.equal(
    normalized.paymentsConfig.paystack.secretKey,
    defaultAdminSettings.paymentsConfig.paystack.secretKey,
  );
});

test("getMpesaConfig strips whitespace from copied credentials and urls", () => {
  const settings = cloneDefaults();

  settings.paymentsConfig.mpesa.shortcode = " 174379 ";
  settings.paymentsConfig.mpesa.consumerKey = " liveKey \n 123 ";
  settings.paymentsConfig.mpesa.consumerSecret = "\n liveSecret \t 456 ";
  settings.paymentsConfig.mpesa.passkey = " pass \n key \t 789 ";
  settings.paymentsConfig.mpesa.baseUrl = " https://api.safaricom.co.ke/ ";
  settings.paymentsConfig.mpesa.callbackUrl =
    " https://betixpro.example.com/api/payments/mpesa/callback ";

  const config = getMpesaConfig(settings);

  assert.equal(config.isConfigured, true);
  if (!config.isConfigured) {
    assert.fail("Expected M-Pesa config to be valid");
  }

  assert.equal(config.shortcode, "174379");
  assert.equal(config.consumerKey, "liveKey123");
  assert.equal(config.consumerSecret, "liveSecret456");
  assert.equal(config.passkey, "passkey789");
  assert.equal(config.baseUrl, "https://api.safaricom.co.ke");
  assert.equal(
    config.callbackUrl,
    "https://betixpro.example.com/api/payments/mpesa/callback",
  );
});
