/**
 * Transactional email — Resend HTTP API (no SDK required).
 * When RESEND_API_KEY is missing, logs a local preview (never fails signup).
 */

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type EmailDelivery = "resend" | "console";

export type SendEmailResult =
  | { ok: true; provider: EmailDelivery; id?: string }
  | { ok: false; error: string };

function fromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "Riftwilds <onboarding@resend.dev>"
  );
}

export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** Safe to return codes/tokens in API JSON (never in production). */
export function canExposeAuthDevSecrets(): boolean {
  return process.env.NODE_ENV !== "production";
}

export async function sendTransactionalEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.info(
      "[auth/mail] RESEND_API_KEY unset — console preview:\n",
      `To: ${input.to}\nSubject: ${input.subject}\n\n${input.text}`,
    );
    return { ok: true, provider: "console" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html ?? undefined,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };
    if (!res.ok) {
      return {
        ok: false,
        error: json.message ?? `Resend HTTP ${res.status}`,
      };
    }
    return { ok: true, provider: "resend", id: json.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Email send failed",
    };
  }
}

export async function sendVerificationEmail(params: {
  to: string;
  code: string;
  linkToken: string;
  expiresMinutes: number;
}): Promise<SendEmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify-email?token=${encodeURIComponent(params.linkToken)}`;
  const subject = "Verify your Riftwilds email";
  const text = [
    "Welcome to Riftwilds.",
    "",
    `Your verification code: ${params.code}`,
    `This code expires in ${params.expiresMinutes} minutes.`,
    "",
    "Or open this link:",
    verifyUrl,
    "",
    "If you did not create an account, you can ignore this email.",
  ].join("\n");
  const html = `
    <p>Welcome to <strong>Riftwilds</strong>.</p>
    <p>Your verification code:</p>
    <p style="font-size:28px;letter-spacing:0.2em;font-weight:700">${params.code}</p>
    <p>This code expires in <strong>${params.expiresMinutes} minutes</strong>.</p>
    <p><a href="${verifyUrl}">Verify email with this link</a></p>
    <p style="color:#666;font-size:12px">If you did not create an account, ignore this email.</p>
  `.trim();
  return sendTransactionalEmail({ to: params.to, subject, text, html });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetToken: string;
  expiresMinutes: number;
}): Promise<SendEmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(params.resetToken)}`;
  const subject = "Reset your Riftwilds password";
  const text = [
    "Password reset for your Riftwilds account.",
    "",
    `This link expires in ${params.expiresMinutes} minutes:`,
    resetUrl,
    "",
    "If you did not request a reset, you can ignore this email.",
  ].join("\n");
  const html = `
    <p>Password reset for your <strong>Riftwilds</strong> account.</p>
    <p>This link expires in <strong>${params.expiresMinutes} minutes</strong>.</p>
    <p><a href="${resetUrl}">Choose a new password</a></p>
    <p style="color:#666;font-size:12px">If you did not request a reset, ignore this email.</p>
  `.trim();
  return sendTransactionalEmail({ to: params.to, subject, text, html });
}
