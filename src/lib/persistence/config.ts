/**
 * Live World persistence timings and policy knobs.
 * Category A (credits/ownership) uses immediate ledger paths — not these intervals.
 */

export const PERSISTENCE_SCHEMA_VERSION = 1;

/** Client local position cadence (existing Live World). */
export const CLIENT_POSITION_SAVE_MS = 2500;

/** Category B progression autosave cadence (server). */
export const CATEGORY_B_AUTOSAVE_MS = 15_000;

/** Category C cosmetic / prefs autosave cadence. */
export const CATEGORY_C_AUTOSAVE_MS = 60_000;

/** Heartbeat interval expected from clients. */
export const HEARTBEAT_INTERVAL_MS = 5_000;

/** Missed heartbeats before reconnect grace starts. */
export const HEARTBEAT_MISS_TTL_MS = 20_000;

/** Reconnect grace after disconnect (Phase 1 REST; WS lease later). */
export const RECONNECT_GRACE_MS = 60_000;

/** Combat disconnect: no invulnerability; encounter remains hostile. */
export const COMBAT_DISCONNECT_PENALTY = {
  /** Character stays vulnerable / encounter can resolve against them. */
  grantsInvulnerability: false,
  /** After grace, combat resolves as disconnect-loss (stub). */
  resolveAsLossAfterGrace: true,
  graceMs: RECONNECT_GRACE_MS,
} as const;

/** Safe logout countdown before world exit completes. */
export const SAFE_LOGOUT_COUNTDOWN_MS = 5_000;

/** Unsafe logout warning — restore to last safe checkpoint. */
export const UNSAFE_LOGOUT_WARNING =
  "You are not in a safe rest zone. Logging out here restores you to your last safe checkpoint (inn, home, or camp). No items are deleted and no SOL is charged.";

/** Max position delta per heartbeat (anti-teleport). World units (px). */
export const MAX_POSITION_DELTA_PER_HEARTBEAT = 640;

/** Snapshot retention per owner (admin rollback stubs). */
export const MAX_SNAPSHOTS_PER_OWNER = 20;

/** Idempotency key TTL. */
export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

/** Default sleeping characters OFF — remove from world. */
export const SLEEPING_CHARACTERS_DEFAULT_ENABLED = false;

/** Sleep stub TTL when housing privacy explicitly allows. */
export const SLEEP_STUB_TTL_MS = 8 * 60 * 60 * 1000;

export const DEFAULT_SPAWN = {
  mapId: "riftwild-commons",
  x: 1024,
  y: 768,
} as const;

/** Rest bonus stub (inn/home/camp) — no economy grant yet. */
export const REST_BONUS_STUB = {
  enabled: false,
  label: "Well rested",
  note: "Rest bonus hooks reserved; never charges SOL.",
} as const;
