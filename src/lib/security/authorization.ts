import type { TokenTier } from "@prisma/client";

export type AuthContext = {
  userId: string;
  /** Null when account exists via email/social without a linked wallet. */
  walletAddress: string | null;
  role: string;
  tokenTier: TokenTier;
  /** How the session was established — wallet SIWS today; modular later. */
  authMethod?: "wallet_siws" | "email" | "social" | "bridge";
};

const tierRank: Record<TokenTier, number> = {
  VISITOR: 0,
  KEEPER: 1,
  RANGER: 2,
  WARDEN: 3,
  FOUNDER: 4,
};

export function requireAuth(ctx: AuthContext | null): asserts ctx is AuthContext {
  if (!ctx) {
    throw new Error("UNAUTHORIZED");
  }
}

export function requireAdmin(ctx: AuthContext | null): asserts ctx is AuthContext {
  requireAuth(ctx);
  if (ctx.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
}

export function requireMinTier(ctx: AuthContext, min: TokenTier): boolean {
  return tierRank[ctx.tokenTier] >= tierRank[min];
}

export function assertOwnership(ownerId: string, userId: string): void {
  if (ownerId !== userId) {
    throw new Error("FORBIDDEN");
  }
}
