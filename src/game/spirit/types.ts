/**
 * Riftling Life & Spirit — authoritative state types.
 * Normal play: Downed → recovery. Permadeath is Hardcore opt-in only.
 */

export const RIFTLING_LIFE_STATES = [
  "HEALTHY",
  "INJURED",
  "WEAK",
  "CRITICAL",
  "DOWNED",
  "SPIRIT_FORM",
  "RECOVERED",
  "RETIRED",
  "MEMORIALIZED",
  "LEGENDARY_ANCESTOR",
  "PERMADEAD",
] as const;

export type RiftlingLifeState = (typeof RIFTLING_LIFE_STATES)[number];

export const RECOVERY_METHODS = [
  "CREDITS_HEALER",
  "RECOVERY_ITEM",
  "SPIRIT_QUEST",
  "LOYALTY_TOKEN",
  "GUILD_ASSIST",
  "FRIEND_ASSIST",
  "SOL_INSTANT_RECALL",
] as const;

export type RecoveryMethod = (typeof RECOVERY_METHODS)[number];

export const COUNTDOWN_PRESETS_MS = {
  H6: 6 * 60 * 60 * 1000,
  H24: 24 * 60 * 60 * 1000,
  H48: 48 * 60 * 60 * 1000,
  H72: 72 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  UNLIMITED: Number.POSITIVE_INFINITY,
} as const;

export type CountdownPresetKey = keyof typeof COUNTDOWN_PRESETS_MS;

/** Incapacitated states that block combat / explore / gather / marketplace. */
export const INCAPACITATED_STATES: ReadonlySet<RiftlingLifeState> = new Set([
  "DOWNED",
  "SPIRIT_FORM",
  "MEMORIALIZED",
  "PERMADEAD",
  "LEGENDARY_ANCESTOR",
  "RETIRED",
]);

/** Marketplace may only list healthy (non-incapacitated, non-quest-locked) pets. */
export const MARKETPLACE_BLOCKED_STATES: ReadonlySet<RiftlingLifeState> = new Set([
  "DOWNED",
  "SPIRIT_FORM",
  "CRITICAL",
  "WEAK",
  "MEMORIALIZED",
  "PERMADEAD",
  "LEGENDARY_ANCESTOR",
  "RETIRED",
]);

export type HardcoreOptIn = {
  enabled: boolean;
  warnedAt: string | null;
  confirmedAt: string | null;
  checkboxAccepted: boolean;
  warningAcknowledged: boolean;
};

export type SpiritRecord = {
  petPublicId: string;
  ownerKey: string;
  lifeState: RiftlingLifeState;
  /** ISO — when Downed / Spirit Form started. */
  downedAt: string | null;
  /** ISO — countdown deadline (null = unlimited). */
  countdownEndsAt: string | null;
  /** Accumulated maintenance pause ms (timer freeze). */
  pausedMs: number;
  maintenancePaused: boolean;
  hardcore: HardcoreOptIn;
  /** Active spirit rescue quest id, if any. */
  activeQuestId: string | null;
  questLocked: boolean;
  /** Level used for SOL tier pricing only — never rarity. */
  level: number;
  bondAtDown: number;
  insurancePolicyId: string | null;
  memorialId: string | null;
  ancestorId: string | null;
  equipmentSnapshotIds: string[];
  updatedAt: string;
  version: number;
};

export type RecoveryHistoryEntry = {
  id: string;
  petPublicId: string;
  ownerKey: string;
  method: RecoveryMethod;
  at: string;
  creditsSpent: number;
  loyaltyTokensSpent: number;
  solLamports: number;
  itemId: string | null;
  requestId: string;
  fromState: RiftlingLifeState;
  toState: RiftlingLifeState;
  assistantKey: string | null;
  metadata?: Record<string, unknown>;
};

export type MemorialRecord = {
  id: string;
  petPublicId: string;
  ownerKey: string;
  name: string;
  speciesSlug: string;
  speciesName: string;
  level: number;
  bond: number;
  favoriteFood: string | null;
  achievements: string[];
  battlesWon: number;
  obtainedAt: string;
  lostAt: string;
  cause: string;
  favoriteEquipment: string[];
  messages: { fromKey: string; text: string; at: string }[];
  photoPaths: string[];
  hardcore: boolean;
};

export type MemorialGarden = {
  ownerKey: string;
  unlocked: boolean;
  statues: string[];
  flowers: number;
  candles: number;
  lanterns: number;
  benches: number;
  musicKey: string;
  visitorNotes: { fromKey: string; text: string; at: string }[];
  updatedAt: string;
};

export type AncestorBonus = {
  id: string;
  kind: "LORE" | "TITLE" | "MUSEUM" | "FAMILY_HISTORY" | "ACCOUNT_COSMETIC";
  label: string;
  /** Account lore / museum / titles only — never combat power. */
  combatPower: false;
};

export type LegendaryAncestor = {
  id: string;
  petPublicId: string;
  ownerKey: string;
  name: string;
  speciesSlug: string;
  ascendedAt: string;
  loreEntry: string;
  titles: string[];
  bonuses: AncestorBonus[];
};

export type InsurancePolicy = {
  id: string;
  ownerKey: string;
  petPublicId: string | null;
  source: "CREDITS" | "GUILD" | "SEASON";
  freeRecoveriesRemaining: number;
  costReductionBps: number;
  extraTimerMs: number;
  expiresAt: string | null;
  purchasedAt: string;
};

export type SpiritQuestDef = {
  id: string;
  name: string;
  blurb: string;
  kind:
    | "RESTORE_MEMORIES"
    | "ESCORT_SPIRIT"
    | "CLEANSE_CORRUPTION"
    | "DEFEAT_NIGHTMARE"
    | "PUZZLE_SHRINE"
    | "SOUL_BRIDGE"
    | "SPEAK_ANCESTORS"
    | "FIND_FRAGMENTS";
  npcId: string;
  creditReward: number;
  steps: { id: string; label: string }[];
};

export type SpiritNpcDef = {
  id: string;
  name: string;
  role: string;
  dialogueIdle: string[];
  regionId: "spirit-realm";
};

export type SolRecallQuote = {
  lamports: bigint;
  solDisplay: string;
  tier: "L1_20" | "L21_50" | "L51_PLUS" | "FLAT";
  capped: boolean;
  rarityIgnored: true;
  marketValueIgnored: true;
  emotionIgnored: true;
};

export type VisualFxStub = {
  breathing: boolean;
  dimGlow: boolean;
  spiritParticles: boolean;
  heartbeatAudioKey: string | null;
};

export type ActivityGates = {
  canFight: boolean;
  canExplore: boolean;
  canGather: boolean;
  canUseAbilities: boolean;
  canView: boolean;
  canHeal: boolean;
  canListMarketplace: boolean;
};
