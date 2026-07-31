/**
 * SMS provider abstraction — single integration point for all outbound SMS.
 *
 * Sends via MSG91 when MSG91_AUTH_KEY + MSG91_TEMPLATE_ID are configured.
 * Otherwise logs the message to the console (dev/staging mock) so every
 * calling flow keeps working without a live provider. Going live in
 * production requires only setting the env vars below — no code changes.
 *
 *   MSG91_AUTH_KEY     — from MSG91 dashboard → API Keys
 *   MSG91_TEMPLATE_ID  — the approved OTP template's ID
 *   MSG91_SENDER       — 6-char DLT-approved sender ID (defaults to "LOKUL")
 */

export function isSmsProviderConfigured(): boolean {
  return !!(process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID);
}

/**
 * Sends a plain transactional SMS (non-OTP).
 * Uses MSG91_TRANSACTIONAL_TEMPLATE_ID if set; falls back to console mock.
 * MSG91_AUTH_KEY must be set for live delivery.
 */
export async function sendSms(phone: string, text: string): Promise<void> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TRANSACTIONAL_TEMPLATE_ID;
  const sender = process.env.MSG91_SENDER ?? "LOKUL";

  if (!authKey || !templateId) {
    console.log(`[SMS mock] ${phone} → ${text}`);
    return;
  }

  const mobile = phone.replace("+", "");
  const res = await fetch("https://api.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: { "Content-Type": "application/json", authkey: authKey },
    body: JSON.stringify({
      template_id: templateId,
      sender,
      mobiles: mobile,
      VAR1: text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[SMS] MSG91 error ${res.status}: ${body}`);
    // Non-fatal — don't rethrow for transactional SMS
  }
}

/** Sends a one-time-password SMS. Falls back to a console mock when no provider is configured. */
export async function sendOtpSms(phone: string, code: string): Promise<void> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const sender = process.env.MSG91_SENDER ?? "LOKUL";

  if (!authKey || !templateId) {
    console.log(`[SMS mock] ${phone} → OTP ${code}`);
    return;
  }

  // MSG91 Send OTP v5 API — mobile must be E.164 without leading +
  const mobile = phone.replace("+", "");
  const res = await fetch("https://api.msg91.com/api/v5/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json", authkey: authKey },
    body: JSON.stringify({ template_id: templateId, mobile, sender, otp: code }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MSG91 error ${res.status}: ${text}`);
  }
}
