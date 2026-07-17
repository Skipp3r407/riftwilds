import { cookies } from "next/headers";
import { createHash } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { authDefaults } from "@/lib/config/project";
import { secureCookieOptions } from "@/lib/auth/cookie-options";
import {
  createSessionToken,
  getSessionExpiry,
  hashToken,
  normalizeWalletAddress,
} from "@/lib/auth/siws";
import type { AuthContext } from "@/lib/security/authorization";

export async function createUserSession(params: {
  userId: string;
  walletAddress?: string | null;
}): Promise<string> {
  const token = createSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = getSessionExpiry();

  await prisma.session.create({
    data: {
      userId: params.userId,
      // Empty string = soft session without wallet (AuthIdentity path).
      // Schema allows null once Prisma client is regenerated after migrate.
      walletAddress: params.walletAddress
        ? normalizeWalletAddress(params.walletAddress)
        : "",
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(authDefaults.COOKIE_NAME, token, {
    ...secureCookieOptions(),
    expires: expiresAt,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authDefaults.COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  cookieStore.set(authDefaults.COOKIE_NAME, "", {
    ...secureCookieOptions(),
    expires: new Date(0),
  });
}

export async function getSessionContext(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authDefaults.COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: { include: { profile: true } },
    },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }

  const wallet =
    session.walletAddress && session.walletAddress.length > 0
      ? session.walletAddress
      : null;

  return {
    userId: session.userId,
    walletAddress: wallet,
    role: session.user.role,
    tokenTier: session.user.profile?.tokenTier ?? "VISITOR",
    authMethod: wallet ? "wallet_siws" : "email",
  };
}

export function hashIp(ip: string | null): string | undefined {
  if (!ip) return undefined;
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}
