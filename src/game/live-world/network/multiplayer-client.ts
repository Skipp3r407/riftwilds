/**
 * Phase 2 stub — WebSocket multiplayer client.
 * Phase 1 remains local-authoritative for movement.
 *
 * TODO: Connect to Live World service; never trust client for rewards/ownership/combat.
 */

import type { NearbyPlayerStub, Vec2 } from "@/game/live-world/types";
import type { AppearanceNetStub } from "@/lib/equipment/appearance";

export type MultiplayerClientOptions = {
  /** Instance / shard id once server routing exists. */
  instanceId?: string;
  url?: string;
};

export type EmoteNetPayload = {
  emoteKey: string;
  actorId: string;
  targetId?: string;
  at: number;
  /** Server must validate unlock + rate limit + consent before broadcast. */
  requiresConsent?: boolean;
};

export type AppearanceNetPayload = AppearanceNetStub & {
  actorId: string;
  at: number;
};

export type MultiplayerClient = {
  connect: () => Promise<"local" | "connected">;
  disconnect: () => void;
  sendMove: (pos: Vec2) => void;
  /** Phase 2: rate-limited emote broadcast — local stub only. */
  sendEmote: (payload: EmoteNetPayload) => void;
  /**
   * Phase-1 stub: queues local appearance for future WS broadcast.
   * Does not grant ownership or mutate remote inventories.
   */
  sendAppearance: (payload: AppearanceNetPayload) => void;
  getNearbyPlayers: () => NearbyPlayerStub[];
  /** Last locally broadcast appearance stub (debug / UI). */
  getLocalAppearanceStub: () => AppearanceNetPayload | null;
  status: () => "idle" | "connecting" | "connected" | "local" | "error";
};

export function createMultiplayerClient(
  _options: MultiplayerClientOptions = {},
): MultiplayerClient {
  let state: ReturnType<MultiplayerClient["status"]> = "idle";
  let lastAppearance: AppearanceNetPayload | null = null;

  return {
    async connect() {
      state = "connecting";
      // TODO Phase 2: real WS handshake + auth token
      await new Promise((r) => setTimeout(r, 200));
      state = "local";
      return "local";
    },
    disconnect() {
      state = "idle";
      lastAppearance = null;
    },
    sendMove(_pos) {
      // TODO Phase 2: rate-limited position updates to server
    },
    sendEmote(_payload) {
      // TODO Phase 2: server-authoritative validation + broadcast
      // Client must never grant unlocks, rewards, or skip consent locally in MP.
    },
    sendAppearance(payload) {
      // Phase 1: stash stub only. Full net sync is backlog.
      lastAppearance = payload;
    },
    getNearbyPlayers() {
      return [];
    },
    getLocalAppearanceStub() {
      return lastAppearance;
    },
    status() {
      return state;
    },
  };
}
