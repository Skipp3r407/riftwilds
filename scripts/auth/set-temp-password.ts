/**
 * Local admin helper: set a known temporary password for an email account.
 *
 * Usage:
 *   npx tsx scripts/auth/set-temp-password.ts --email user@example.com --password 'TempPass123!'
 *
 * Requires DATABASE_URL (from .env). Never commit passwords. Prefer rotating after first login.
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

loadEnv({ path: resolve(process.cwd(), ".env") });

import { prisma } from "../../src/lib/db/prisma";
import { hashPassword, normalizeEmail, passwordPolicyError } from "../../src/lib/auth/password";

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function main() {
  const emailRaw = argValue("--email");
  const password = argValue("--password");
  if (!emailRaw || !password) {
    console.error(
      "Usage: npx tsx scripts/auth/set-temp-password.ts --email <email> --password <temp>",
    );
    process.exit(1);
  }

  const policy = passwordPolicyError(password);
  if (policy) {
    console.error(policy);
    process.exit(1);
  }

  const email = normalizeEmail(emailRaw);
  const user = await prisma.user.findFirst({
    where: { OR: [{ email }, { emailNormalized: email }], deletedAt: null },
    include: { profile: true },
  });

  if (!user) {
    console.error(`No account found for ${email}`);
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        failedLoginCount: 0,
        lockedUntil: null,
      },
    }),
    prisma.authAccount.updateMany({
      where: { userId: user.id, provider: "email" },
      data: { passwordHash },
    }),
    prisma.session.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  console.log("Temp password set.");
  console.log(`  email:    ${email}`);
  console.log(`  username: ${user.profile?.username ?? "(none)"}`);
  console.log(`  status:   ${user.accountStatus}`);
  console.log("Sign in at /login, then change the password via forgot-password when Resend is configured.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
