/**
 * Nakama client/server config.
 * Browser values must use NEXT_PUBLIC_* (see Next.js env docs).
 * Server keys for console / HTTP key stay server-only.
 */

import { featureFlagDefaults, isFeatureEnabled } from "@/lib/config/feature-flags";

export type NakamaPublicConfig = {
  enabled: boolean;
  host: string;
  port: number;
  useSSL: boolean;
  serverKey: string;
  trace: boolean;
};

function envBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return value === "1" || value.toLowerCase() === "true" || value === "yes";
}

function envInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Public (browser-safe) Nakama connection settings. */
export function getNakamaPublicConfig(
  overrides?: Parameters<typeof isFeatureEnabled>[1],
): NakamaPublicConfig {
  const flagOn = isFeatureEnabled("NAKAMA_ENABLED", overrides);
  // Env wins when set; otherwise feature-flag default (OFF until Docker is up).
  const enabled = envBool(process.env.NEXT_PUBLIC_NAKAMA_ENABLED, flagOn);

  return {
    enabled,
    host: process.env.NEXT_PUBLIC_NAKAMA_HOST ?? "127.0.0.1",
    port: envInt(process.env.NEXT_PUBLIC_NAKAMA_PORT, 7350),
    useSSL: envBool(process.env.NEXT_PUBLIC_NAKAMA_USE_SSL, false),
    // Nakama "server key" is a client identifier (defaultkey), not a treasury secret.
    serverKey: process.env.NEXT_PUBLIC_NAKAMA_SERVER_KEY ?? "defaultkey",
    trace: envBool(process.env.NEXT_PUBLIC_NAKAMA_TRACE, false),
  };
}

/** Server-only helpers (console / HTTP key). Never expose to the browser. */
export function getNakamaServerSecrets() {
  return {
    httpKey: process.env.NAKAMA_HTTP_KEY ?? "defaulthttpkey",
    consoleUsername: process.env.NAKAMA_CONSOLE_USERNAME ?? "admin",
    consolePassword: process.env.NAKAMA_CONSOLE_PASSWORD ?? "localdev",
  };
}

export function isNakamaSliceEnabled(
  slice:
    | "NAKAMA_AUTH_BRIDGE_ENABLED"
    | "NAKAMA_MATCHMAKING_BRIDGE_ENABLED"
    | "NAKAMA_CHAT_BRIDGE_ENABLED"
    | "NAKAMA_GUILDS_BRIDGE_ENABLED"
    | "NAKAMA_LEADERBOARDS_BRIDGE_ENABLED"
    | "NAKAMA_TOURNAMENTS_BRIDGE_ENABLED"
    | "NAKAMA_STORAGE_BRIDGE_ENABLED",
  overrides?: Parameters<typeof isFeatureEnabled>[1],
): boolean {
  return (
    getNakamaPublicConfig(overrides).enabled && isFeatureEnabled(slice, overrides)
  );
}

export function nakamaFeatureMatrix(
  overrides?: Parameters<typeof isFeatureEnabled>[1],
) {
  const base = getNakamaPublicConfig(overrides).enabled;
  return {
    auth: base && isFeatureEnabled("NAKAMA_AUTH_BRIDGE_ENABLED", overrides),
    matchmaking:
      base && isFeatureEnabled("NAKAMA_MATCHMAKING_BRIDGE_ENABLED", overrides),
    chat: base && isFeatureEnabled("NAKAMA_CHAT_BRIDGE_ENABLED", overrides),
    guilds: base && isFeatureEnabled("NAKAMA_GUILDS_BRIDGE_ENABLED", overrides),
    leaderboards:
      base && isFeatureEnabled("NAKAMA_LEADERBOARDS_BRIDGE_ENABLED", overrides),
    tournaments:
      base && isFeatureEnabled("NAKAMA_TOURNAMENTS_BRIDGE_ENABLED", overrides),
    storage: base && isFeatureEnabled("NAKAMA_STORAGE_BRIDGE_ENABLED", overrides),
  } as const;
}

export function nakamaConsoleUrl(cfg = getNakamaPublicConfig()): string {
  const scheme = cfg.useSSL ? "https" : "http";
  const consolePort = envInt(process.env.NEXT_PUBLIC_NAKAMA_CONSOLE_PORT, 7351);
  return `${scheme}://${cfg.host}:${consolePort}`;
}

/** Defaults mirrored for docs / status panels without reading env. */
export const nakamaDevDefaults = {
  host: "127.0.0.1",
  httpPort: 7350,
  grpcPort: 7349,
  consolePort: 7351,
  postgresHostPort: 5433,
  redisHostPort: 6379,
  serverKey: "defaultkey",
  flags: {
    NAKAMA_ENABLED: featureFlagDefaults.NAKAMA_ENABLED,
  },
} as const;
