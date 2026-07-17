import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SOLANA_NETWORK: z
    .enum(["devnet", "mainnet-beta", "testnet", "localnet"])
    .default("devnet"),
  NEXT_PUBLIC_SOLANA_RPC_URL: z.string().url().optional(),
  SOLANA_RPC_URL: z.string().url().optional(),
  SOLANA_RPC_FALLBACK_URL: z.string().url().optional(),
  HELIUS_API_KEY: z.string().optional(),
  HELIUS_WEBHOOK_SECRET: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  ADMIN_WALLETS: z.string().optional(),
  TOKEN_MINT_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_PUMPFUN_MINT: z.string().optional(),
  NEXT_PUBLIC_PUMPFUN_URL: z.string().optional(),
  NEXT_PUBLIC_TOKEN_MINT: z.string().optional(),
  TREASURY_WALLET: z.string().optional(),
  PET_REWARD_VAULT_VERIFY_TOKEN: z.string().optional(),
  MAINTENANCE_MODE: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cachedEnv: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment configuration", parsed.error.flatten());
    throw new Error("Invalid environment configuration");
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}

export function getPublicEnv() {
  const env = getEnv();
  return {
    appUrl: env.NEXT_PUBLIC_APP_URL,
    solanaNetwork: env.NEXT_PUBLIC_SOLANA_NETWORK,
    solanaRpcUrl: env.NEXT_PUBLIC_SOLANA_RPC_URL,
    sentryDsn: env.NEXT_PUBLIC_SENTRY_DSN,
  };
}

function isBuildPhase() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build"
  );
}

/** Fail-closed secret checks for production runtime (skipped during `next build`). */
export function assertRuntimeSecrets() {
  if (process.env.NODE_ENV !== "production") return;
  if (isBuildPhase()) return;

  const env = getEnv();
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required in production");
  }
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET (min 32 chars) is required in production");
  }
  if (!env.NEXT_PUBLIC_APP_URL || env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
    console.warn(
      "[env] NEXT_PUBLIC_APP_URL still points at localhost in production — set your public URL.",
    );
  }
}

export function isPlaceholderAddress(value: string | undefined | null): boolean {
  if (!value) return true;
  const v = value.trim().toUpperCase();
  return v.length === 0 || v === "COMING_SOON" || v === "TBD" || v === "TODO";
}
