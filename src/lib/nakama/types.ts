import type { Session } from "@heroiclabs/nakama-js";

/** Serialized session for sessionStorage / API round-trips. */
export type NakamaSessionSnapshot = {
  token: string;
  refreshToken: string;
  userId: string;
  username: string;
  expiresAt: number;
  created: boolean;
  vars?: Record<string, string>;
};

export type NakamaAuthMethod = "guest_device" | "email" | "custom";

export type NakamaConnectionState =
  | "disabled"
  | "idle"
  | "connecting"
  | "authenticated"
  | "error";

export type NakamaFeatureSlice =
  | "auth"
  | "matchmaking"
  | "chat"
  | "guilds"
  | "leaderboards"
  | "tournaments"
  | "storage";

export type NakamaBridgeResult<T> = {
  /** Existing Riftwilds path still owns gameplay truth when both run. */
  local: T;
  nakama?: {
    ok: boolean;
    detail?: string;
    payload?: unknown;
  };
  mode: "local_only" | "bridged" | "nakama_primary";
};

export type NakamaStatusPayload = {
  enabled: boolean;
  reachable: boolean | null;
  host: string;
  port: number;
  useSSL: boolean;
  consoleUrl: string;
  features: Record<NakamaFeatureSlice, boolean>;
  redisIncluded: boolean;
  note: string;
};

export type AuthenticatedNakama = {
  session: Session;
  snapshot: NakamaSessionSnapshot;
  method: NakamaAuthMethod;
};
