import type {
  LogoutZoneKind,
  SaveCategory,
  WorldPlaySessionStatus,
} from "@/lib/persistence/enums";

export type { LogoutZoneKind, SaveCategory, WorldPlaySessionStatus };

export type DirtyFlags = {
  categoryA: boolean;
  categoryB: boolean;
  categoryC: boolean;
  position: boolean;
  combat: boolean;
};

export type WorldPositionPayload = {
  mapId: string;
  x: number;
  y: number;
  facingRad?: number;
};

export type SafeZoneHit = {
  zoneId: string;
  zoneKind: LogoutZoneKind;
  mapId: string;
  name: string;
};

export type PlayStateBlob = {
  /** Mirrored quests/flags — authoritative copy synced from client play-state. */
  quests?: Record<string, unknown>;
  flags?: string[];
  regionsVisited?: string[];
  markersRepaired?: string[];
  toolsCrafted?: string[];
  enemiesDefeated?: number;
  pvpKills?: number;
  combatKills?: number;
  killerReputation?: number;
  bountyTier?: number;
  activeCompanionName?: string | null;
  hasHatched?: boolean;
  /** Never trust client demoCredits for Category A — ledger is authoritative. */
  demoCreditsDisplay?: number;
  updatedAt?: number;
  [key: string]: unknown;
};

export type WorldSaveRecord = {
  ownerKey: string;
  userId: string | null;
  version: number;
  mapId: string;
  posX: number;
  posY: number;
  lastSafeMapId: string | null;
  lastSafePosX: number | null;
  lastSafePosY: number | null;
  lastSafeZoneId: string | null;
  lastSafeZoneKind: LogoutZoneKind | null;
  playState: PlayStateBlob | null;
  dirty: DirtyFlags;
  lastCategoryAAt: number | null;
  lastCategoryBAt: number | null;
  lastCategoryCAt: number | null;
  lastRequestId: string | null;
  schemaVersion: number;
  updatedAt: number;
};

export type WorldSessionRecord = {
  id: string;
  ownerKey: string;
  userId: string | null;
  authSessionId: string | null;
  status: WorldPlaySessionStatus;
  mapId: string;
  posX: number;
  posY: number;
  facingRad: number;
  inCombat: boolean;
  combatStartedAt: number | null;
  lastHeartbeatAt: number;
  lastAutosaveAt: number | null;
  reconnectDeadline: number | null;
  disconnectAt: number | null;
  logoutZoneId: string | null;
  logoutZoneKind: LogoutZoneKind | null;
  clientInstanceId: string | null;
  version: number;
  dirty: DirtyFlags;
  createdAt: number;
  updatedAt: number;
};

export type RestoreResult = {
  ok: true;
  source: "active_session" | "save_state" | "safe_checkpoint" | "default_spawn";
  position: WorldPositionPayload;
  safeCheckpoint: {
    mapId: string;
    x: number;
    y: number;
    zoneId: string;
    zoneKind: LogoutZoneKind;
  } | null;
  playState: PlayStateBlob | null;
  version: number;
  inCombat: boolean;
  reconnectDeadline: number | null;
  warning: string | null;
};

export type LogoutMode = "safe" | "unsafe" | "cancel";

export type LogoutRequest = {
  ownerKey: string;
  userId?: string | null;
  mode: LogoutMode;
  position: WorldPositionPayload;
  playState?: PlayStateBlob | null;
  inCombat?: boolean;
  requestId: string;
  clientInstanceId?: string | null;
  /** When true and housing privacy allows — create sleep stub (default false). */
  leaveSleepingStub?: boolean;
};

export type LogoutResult =
  | {
      ok: true;
      mode: "safe" | "unsafe";
      checkpoint: {
        mapId: string;
        x: number;
        y: number;
        zoneId: string;
        zoneKind: LogoutZoneKind;
      };
      restBonusApplied: boolean;
      sleepingStubCreated: boolean;
      version: number;
      message: string;
    }
  | { ok: false; error: string; code: string };

export type HeartbeatRequest = {
  ownerKey: string;
  userId?: string | null;
  sessionId: string;
  position: WorldPositionPayload;
  inCombat?: boolean;
  clientInstanceId?: string | null;
  requestId?: string;
};

export type AutosaveRequest = {
  ownerKey: string;
  userId?: string | null;
  sessionId?: string | null;
  position: WorldPositionPayload;
  playState?: PlayStateBlob | null;
  categories: SaveCategory[];
  requestId: string;
  force?: boolean;
};
