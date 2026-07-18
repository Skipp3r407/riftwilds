/** Cap discovery / bonus effects so bond farming cannot spam rewards. */
export const CARE_DISCOVERY_BONUS_CAP = 0.12; // +12% max
export const CARE_STRESS_PENALTY_CAP = 0.15; // -15% max

export type CareStats = {
  hunger: number;
  thirst: number;
  happiness: number;
  hygiene: number;
  energy: number;
  bond: number;
  health: number;
  stress: number;
};

export type CareAction =
  | "FEED"
  | "GIVE_WATER"
  | "PLAY"
  | "CLEAN"
  | "REST"
  | "HEAL"
  | "MEDICINE"
  | "TRAIN"
  | "ENCOURAGE"
  | "GIVE_ITEM"
  | "RECOVERY_CENTER"
  | "BRUSH"
  | "WALK"
  | "PET"
  | "GROOM"
  | "COOK_MEAL"
  | "TREAT"
  | "VET"
  | "ADVENTURE"
  | "SLEEP"
  | "EXERCISE"
  | "LEARN_TRICK"
  | "MEDITATE"
  | "SOCIALIZE"
  | "DECORATE";

export type PetCareCondition =
  | "HEALTHY"
  | "HUNGRY"
  | "THIRSTY"
  | "UNHAPPY"
  | "DIRTY"
  | "TIRED"
  | "SICK"
  | "DORMANT"
  | "CRITICAL"
  | "DECEASED";

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

export const DEFAULT_CARE_STATS: CareStats = {
  hunger: 80,
  thirst: 80,
  happiness: 75,
  hygiene: 70,
  energy: 70,
  bond: 20,
  health: 100,
  stress: 10,
};

/** Player-facing rounded percent (never show 79.957…). */
export function displayCarePercent(n: number): number {
  return Math.round(clamp(n));
}

export function displayCareStats(stats: Partial<CareStats>): CareStats {
  const s = normalizeCareStats(stats);
  return {
    hunger: displayCarePercent(s.hunger),
    thirst: displayCarePercent(s.thirst),
    happiness: displayCarePercent(s.happiness),
    hygiene: displayCarePercent(s.hygiene),
    energy: displayCarePercent(s.energy),
    bond: displayCarePercent(s.bond),
    health: displayCarePercent(s.health),
    stress: displayCarePercent(s.stress),
  };
}

/** Accept partial legacy care payloads (pre-thirst/stress). */
export function normalizeCareStats(stats: Partial<CareStats>): CareStats {
  return {
    hunger: stats.hunger ?? DEFAULT_CARE_STATS.hunger,
    thirst: stats.thirst ?? stats.hunger ?? DEFAULT_CARE_STATS.thirst,
    happiness: stats.happiness ?? DEFAULT_CARE_STATS.happiness,
    hygiene: stats.hygiene ?? DEFAULT_CARE_STATS.hygiene,
    energy: stats.energy ?? DEFAULT_CARE_STATS.energy,
    bond: stats.bond ?? DEFAULT_CARE_STATS.bond,
    health: stats.health ?? DEFAULT_CARE_STATS.health,
    stress: stats.stress ?? 10,
  };
}

/**
 * Decay based on elapsed hours — server-authoritative timestamps only.
 * First 8h at full rate; additional offline hours at 35% (no permanent death from decay alone).
 */
export function applyCareDecay(stats: Partial<CareStats>, elapsedHours: number): CareStats {
  const base = normalizeCareStats(stats);
  const hours = Math.max(0, elapsedHours);
  const online = Math.min(hours, 8);
  const offline = Math.max(0, hours - 8);
  const effective = online + offline * 0.35;
  return {
    hunger: clamp(base.hunger - effective * 1.2),
    thirst: clamp(base.thirst - effective * 1.4),
    happiness: clamp(base.happiness - effective * 0.8),
    hygiene: clamp(base.hygiene - effective * 0.7),
    energy: clamp(base.energy - effective * 0.5),
    bond: clamp(base.bond - effective * 0.15),
    health: clamp(base.health - (effective > 48 ? (effective - 48) * 0.25 : 0)),
    stress: clamp(base.stress + effective * 0.35),
  };
}

function withDeltas(s: CareStats, deltas: Partial<CareStats>): CareStats {
  return {
    hunger: clamp(s.hunger + (deltas.hunger ?? 0)),
    thirst: clamp(s.thirst + (deltas.thirst ?? 0)),
    happiness: clamp(s.happiness + (deltas.happiness ?? 0)),
    hygiene: clamp(s.hygiene + (deltas.hygiene ?? 0)),
    energy: clamp(s.energy + (deltas.energy ?? 0)),
    bond: clamp(s.bond + (deltas.bond ?? 0)),
    health: clamp(s.health + (deltas.health ?? 0)),
    stress: clamp(s.stress + (deltas.stress ?? 0)),
  };
}

export function applyCareAction(stats: Partial<CareStats>, action: CareAction): CareStats {
  const s = normalizeCareStats(stats);
  switch (action) {
    case "FEED":
      return withDeltas(s, { hunger: 28, happiness: 4, stress: -4 });
    case "GIVE_WATER":
      return withDeltas(s, { thirst: 32, happiness: 2, stress: -3 });
    case "PLAY":
      return withDeltas(s, { happiness: 22, energy: -10, bond: 6, stress: -8 });
    case "CLEAN":
      return withDeltas(s, { hygiene: 30, happiness: 3, stress: -5 });
    case "REST":
      return withDeltas(s, { energy: 35, health: 5, stress: -10 });
    case "SLEEP":
      return withDeltas(s, { energy: 50, health: 8, stress: -18, happiness: 4 });
    case "HEAL":
      return withDeltas(s, { health: 25, stress: -6 });
    case "MEDICINE":
      return withDeltas(s, { health: 40, stress: -12, happiness: 4 });
    case "VET":
      return withDeltas(s, { health: 45, stress: -16, happiness: 6, energy: 10 });
    case "TRAIN":
      return withDeltas(s, { energy: -15, happiness: 8, bond: 4, stress: 5 });
    case "EXERCISE":
      return withDeltas(s, { energy: -20, happiness: 10, health: 6, stress: 4, hunger: -6 });
    case "LEARN_TRICK":
      return withDeltas(s, { energy: -12, happiness: 14, bond: 10, stress: 3 });
    case "ENCOURAGE":
      return withDeltas(s, { happiness: 12, bond: 10, stress: -8 });
    case "PET":
      return withDeltas(s, { happiness: 8, bond: 4, stress: -5 });
    case "BRUSH":
      return withDeltas(s, { hygiene: 18, happiness: 10, bond: 5, stress: -8 });
    case "GROOM":
      return withDeltas(s, { hygiene: 40, happiness: 12, bond: 6, stress: -10 });
    case "WALK":
      return withDeltas(s, {
        happiness: 14,
        energy: -8,
        bond: 8,
        stress: -10,
        hygiene: -4,
      });
    case "COOK_MEAL":
      return withDeltas(s, {
        hunger: 42,
        happiness: 14,
        bond: 6,
        stress: -8,
        thirst: -4,
      });
    case "TREAT":
      return withDeltas(s, { hunger: 12, happiness: 18, bond: 5, stress: -6 });
    case "MEDITATE":
      return withDeltas(s, { stress: -22, happiness: 8, bond: 4, energy: 6 });
    case "SOCIALIZE":
      return withDeltas(s, { happiness: 20, bond: 6, energy: -6, stress: -4 });
    case "DECORATE":
      return withDeltas(s, { happiness: 16, stress: -12, bond: 3 });
    case "ADVENTURE":
      return withDeltas(s, {
        energy: -18,
        happiness: 16,
        bond: 8,
        hunger: -8,
        thirst: -6,
        stress: -4,
        hygiene: -6,
      });
    case "GIVE_ITEM":
      return withDeltas(s, { happiness: 10, bond: 5 });
    case "RECOVERY_CENTER":
      return withDeltas(s, {
        hunger: 20,
        thirst: 20,
        hygiene: 20,
        energy: 25,
        health: 30,
        stress: -20,
      });
    default:
      return s;
  }
}

/** Bond / stress gameplay modifiers — capped so care spam cannot farm discovery. */
export type CareGameplayModifiers = {
  /** Additive discovery chance (0–CARE_DISCOVERY_BONUS_CAP). */
  discoveryBonus: number;
  /** Train / learn effectiveness multiplier. */
  trainMultiplier: number;
  /** Happiness action penalty when stressed (0–CARE_STRESS_PENALTY_CAP). */
  stressPenalty: number;
  /** Soft note for UI. */
  summary: string;
};

export function careGameplayModifiers(stats: Partial<CareStats>): CareGameplayModifiers {
  const s = normalizeCareStats(stats);
  const bondFactor = Math.max(0, (s.bond - 40) / 60); // 0 at bond 40, 1 at 100
  const discoveryBonus = Math.min(CARE_DISCOVERY_BONUS_CAP, bondFactor * CARE_DISCOVERY_BONUS_CAP);
  const trainMultiplier = 1 + Math.min(0.2, bondFactor * 0.2);
  const stressPenalty =
    s.stress > 60
      ? Math.min(CARE_STRESS_PENALTY_CAP, ((s.stress - 60) / 40) * CARE_STRESS_PENALTY_CAP)
      : 0;
  let summary = "Balanced companion mood.";
  if (discoveryBonus >= 0.08) summary = "Strong bond — slight discovery luck.";
  if (stressPenalty >= 0.08) summary = "High stress — care gains feel muted.";
  if (s.happiness >= 85 && s.bond >= 70) summary = "Thriving bond — training shines.";
  return { discoveryBonus, trainMultiplier, stressPenalty, summary };
}

/** Apply stress dampening / bond train boost after a care action. */
export function applyCareGameplayTuning(
  before: CareStats,
  after: CareStats,
  action: CareAction,
): CareStats {
  const mods = careGameplayModifiers(before);
  let next = { ...after };
  if (mods.stressPenalty > 0) {
    const dampen = (key: keyof CareStats, gained: number) => {
      if (gained <= 0) return;
      const cut = gained * mods.stressPenalty;
      next = { ...next, [key]: clamp(before[key] + gained - cut) };
    };
    dampen("happiness", after.happiness - before.happiness);
    dampen("bond", after.bond - before.bond);
  }
  if (
    (action === "TRAIN" || action === "LEARN_TRICK" || action === "EXERCISE") &&
    mods.trainMultiplier > 1
  ) {
    const bondGain = after.bond - before.bond;
    if (bondGain > 0) {
      next.bond = clamp(before.bond + bondGain * mods.trainMultiplier);
    }
  }
  return next;
}

export function derivePetCondition(
  stats: Partial<CareStats>,
  permanentDeathEnabled: boolean,
): PetCareCondition {
  const s = normalizeCareStats(stats);
  if (permanentDeathEnabled && s.health <= 0) return "DECEASED";
  const needsAvg = (s.hunger + s.thirst + s.happiness + s.hygiene + s.energy) / 5;
  if (s.health < 20 || needsAvg < 12 || s.stress > 90) return "CRITICAL";
  if (needsAvg < 25 || s.stress > 80) return "DORMANT";
  if (s.health < 40 || s.stress > 70) return "SICK";
  if (s.hunger < 30) return "HUNGRY";
  if (s.thirst < 30) return "THIRSTY";
  if (s.hygiene < 30) return "DIRTY";
  if (s.energy < 30) return "TIRED";
  if (s.happiness < 35) return "UNHAPPY";
  return "HEALTHY";
}

/** Legacy lifecycle labels used by older UI. */
export function deriveLifecycle(
  stats: Partial<CareStats>,
  permanentDeathEnabled: boolean,
):
  | "THRIVING"
  | "HAPPY"
  | "STABLE"
  | "TIRED"
  | "NEGLECTED"
  | "DORMANT"
  | "CRITICAL"
  | "MEMORIALIZED" {
  const s = normalizeCareStats(stats);
  const avg = (s.hunger + s.happiness + s.hygiene + s.energy) / 4;
  if (permanentDeathEnabled && s.health <= 0) return "MEMORIALIZED";
  if (s.health < 20 || avg < 15) return "CRITICAL";
  if (avg < 25) return "DORMANT";
  if (avg < 40) return "NEGLECTED";
  if (s.energy < 30) return "TIRED";
  if (avg >= 85 && s.bond >= 60) return "THRIVING";
  if (avg >= 70) return "HAPPY";
  return "STABLE";
}

export function isPublicDisplayAllowed(condition: PetCareCondition): boolean {
  return condition !== "CRITICAL" && condition !== "DECEASED" && condition !== "DORMANT";
}

export function careScore(stats: Partial<CareStats>): number {
  const s = normalizeCareStats(stats);
  return Math.round(
    (s.hunger + s.thirst + s.happiness + s.hygiene + s.energy + s.health + (100 - s.stress)) / 7,
  );
}

/** Color threshold for visual bars (stress inverted: high = bad). */
export type CareBarTone = "critical" | "low" | "mid" | "good" | "great";

export function careBarTone(statKey: keyof CareStats, value: number): CareBarTone {
  const v = displayCarePercent(value);
  if (statKey === "stress") {
    if (v >= 80) return "critical";
    if (v >= 60) return "low";
    if (v >= 35) return "mid";
    if (v >= 15) return "good";
    return "great";
  }
  if (v <= 15) return "critical";
  if (v <= 35) return "low";
  if (v <= 55) return "mid";
  if (v <= 80) return "good";
  return "great";
}

export const CARE_BAR_COLORS: Record<CareBarTone, string> = {
  critical: "#f07178",
  low: "#e6a15c",
  mid: "#e6d06a",
  good: "#6bcB8a",
  great: "#3de7ff",
};
