/**
 * Admin hooks — entry soft-caps + pause Arena matchmaking.
 * In-memory for Phase 1; Neon persistence proposed separately.
 */

export type RiftArenaAdminConfig = {
  matchmakingPaused: boolean;
  rankedPaused: boolean;
  solArenaPaused: boolean;
  dailyEntrySoftCap: number;
  pauseReason: string | null;
  updatedAt: string | null;
};

type AdminMaps = {
  config: RiftArenaAdminConfig;
};

const defaults: RiftArenaAdminConfig = {
  matchmakingPaused: false,
  rankedPaused: false,
  solArenaPaused: true,
  dailyEntrySoftCap: 80,
  pauseReason: null,
  updatedAt: null,
};

const globalForAdmin = globalThis as unknown as {
  __riftwildsRiftArenaAdmin?: AdminMaps;
};

function maps(): AdminMaps {
  if (!globalForAdmin.__riftwildsRiftArenaAdmin) {
    globalForAdmin.__riftwildsRiftArenaAdmin = {
      config: { ...defaults },
    };
  }
  return globalForAdmin.__riftwildsRiftArenaAdmin;
}

export function getRiftArenaAdminConfig(): RiftArenaAdminConfig {
  return { ...maps().config };
}

export function updateRiftArenaAdminConfig(
  patch: Partial<
    Pick<
      RiftArenaAdminConfig,
      | "matchmakingPaused"
      | "rankedPaused"
      | "solArenaPaused"
      | "dailyEntrySoftCap"
      | "pauseReason"
    >
  >,
): RiftArenaAdminConfig {
  const cfg = maps().config;
  if (typeof patch.matchmakingPaused === "boolean") {
    cfg.matchmakingPaused = patch.matchmakingPaused;
  }
  if (typeof patch.rankedPaused === "boolean") {
    cfg.rankedPaused = patch.rankedPaused;
  }
  if (typeof patch.solArenaPaused === "boolean") {
    cfg.solArenaPaused = patch.solArenaPaused;
  }
  if (typeof patch.dailyEntrySoftCap === "number") {
    cfg.dailyEntrySoftCap = Math.max(1, Math.min(500, Math.floor(patch.dailyEntrySoftCap)));
  }
  if (patch.pauseReason !== undefined) {
    cfg.pauseReason = patch.pauseReason;
  }
  cfg.updatedAt = new Date().toISOString();
  return getRiftArenaAdminConfig();
}

export function assertMatchmakingOpen(): { ok: true } | { ok: false; error: string } {
  const cfg = maps().config;
  if (cfg.matchmakingPaused) {
    return {
      ok: false,
      error: cfg.pauseReason || "RIFT_ARENA_MATCHMAKING_PAUSED",
    };
  }
  return { ok: true };
}
