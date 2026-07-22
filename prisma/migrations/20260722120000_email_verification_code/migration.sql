-- Email verification: 6-digit code + 10-minute expiry (link token still supported).
-- Apply: npm run db:migrate

ALTER TABLE "EmailVerificationToken"
  ADD COLUMN IF NOT EXISTS "codeHash" TEXT;

CREATE INDEX IF NOT EXISTS "EmailVerificationToken_codeHash_idx"
  ON "EmailVerificationToken"("codeHash");
