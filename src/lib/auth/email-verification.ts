import { createHash, randomBytes, randomInt } from "crypto";

/** Verification link + one-time code TTL. */
export const EMAIL_VERIFICATION_TTL_MS = 10 * 60 * 1000;
export const EMAIL_VERIFICATION_TTL_MINUTES = 10;

export function hashVerificationSecret(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function mintLinkToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Six-digit numeric code for typed entry. */
export function mintVerificationCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function normalizeVerificationCode(raw: string): string {
  return raw.replace(/\s+/g, "").trim();
}
