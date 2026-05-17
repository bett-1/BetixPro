type SendGridErrorShape = {
  code?: number;
  message?: string;
  response?: {
    body?: {
      errors?: Array<{
        message?: string;
        field?: string;
        help?: string;
      }>;
    };
  };
};

let sendgridEnabled = true;

function normalizeEnvValue(value: string) {
  const trimmed = value.trim();
  return trimmed.replace(/^['\"]|['\"]$/g, "");
}

export function normalizeSendGridEnvValue(value: string) {
  return normalizeEnvValue(value);
}

export async function validateSendGridKey(): Promise<void> {
  const key = process.env.SENDGRID_API_KEY ? normalizeEnvValue(process.env.SENDGRID_API_KEY) : "";
  if (!key || !key.startsWith("SG.")) {
    console.error(
      "[SendGrid] Invalid or missing API key - email alerts disabled. Set SENDGRID_API_KEY in env vars.",
    );
    sendgridEnabled = false;
    return;
  }
  console.log("[SendGrid] API key format valid");
}

export function canUseSendGrid() {
  return sendgridEnabled;
}

export function handleSendGridError(error: unknown, context: string): boolean {
  const sendGridError = error as SendGridErrorShape;
  if (sendGridError?.code === 401) {
    console.error(
      "[SendGrid] 401 Unauthorized - disabling email alerts. Fix SENDGRID_API_KEY in Render.",
    );
    sendgridEnabled = false;
    return true;
  }

  console.error("[SendGrid] Send failed:", {
    context,
    message: sendGridError?.message ?? String(error),
    code: sendGridError?.code,
    providerMessage: sendGridError?.response?.body?.errors?.[0]?.message,
  });
  return false;
}
