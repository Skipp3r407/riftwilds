/**
 * Phase 2 stub — WebSocket multiplayer client.
 * Phase 1 remains local-authoritative for movement.
 *
 * TODO: Connect to Live World service; never trust client for rewards/ownership/combat.
 */

import type { NearbyPlayerStub, Vec2 } from "@/game/live-world/types";

export type MultiplayerClientOptions = {
  /** Instance / shard id once server routing exists. */
  instanceId?: string;
  url?: string;
};

export type MultiplayerClient = {
  connect: () => Promise<"local" | "connected">;
  disconnect: () => void;
  sendMove: (pos: Vec2) => void;
  getNearbyPlayers: () => NearbyPlayerStub[];
  status: () => "idle" | "connecting" | "connected" | "local" | "error";
};

export function createMultiplayerClient(
  _options: MultiplayerClientOptions = {},
): MultiplayerClient {
  let state: ReturnType<MultiplayerClient["status"]> = "idle";

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
    },
    sendMove(_pos) {
      // TODO Phase 2: rate-limited position updates to server
    },
    getNearbyPlayers() {
      return [];
    },
    status() {
      return state;
    },
  };
}
