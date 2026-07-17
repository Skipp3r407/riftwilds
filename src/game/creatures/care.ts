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
  | "RECOVERY_CENTER";

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

/** Decay based on elapsed hours — server-authoritative timestamps only. */
export function applyCareDecay(stats: Partial<CareStats>, elapsedHours: number): CareStats {
  const base = normalizeCareStats(stats);
  const hours = Math.max(0, elapsedHours);
  return {
    hunger: clamp(base.hunger - hours * 1.2),
    thirst: clamp(base.thirst - hours * 1.4),
    happiness: clamp(base.happiness - hours * 0.8),
    hygiene: clamp(base.hygiene - hours * 0.7),
    energy: clamp(base.energy - hours * 0.5),
    bond: clamp(base.bond - hours * 0.15),
    health: clamp(base.health - (hours > 48 ? (hours - 48) * 0.3 : 0)),
    stress: clamp(base.stress + hours * 0.35),
  };
}

export function applyCareAction(stats: Partial<CareStats>, action: CareAction): CareStats {
  const s = normalizeCareStats(stats);
  switch (action) {
    case "FEED":
      return {
        ...s,
        hunger: clamp(s.hunger + 28),
        happiness: clamp(s.happiness + 4),
        stress: clamp(s.stress - 4),
      };
    case "GIVE_WATER":
      return {
        ...s,
        thirst: clamp(s.thirst + 32),
        happiness: clamp(s.happiness + 2),
        stress: clamp(s.stress - 3),
      };
    case "PLAY":
      return {
        ...s,
        happiness: clamp(s.happiness + 22),
        energy: clamp(s.energy - 10),
        bond: clamp(s.bond + 6),
        stress: clamp(s.stress - 8),
      };
    case "CLEAN":
      return {
        ...s,
        hygiene: clamp(s.hygiene + 30),
        happiness: clamp(s.happiness + 3),
        stress: clamp(s.stress - 5),
      };
    case "REST":
      return {
        ...s,
        energy: clamp(s.energy + 35),
        health: clamp(s.health + 5),
        stress: clamp(s.stress - 10),
      };
    case "HEAL":
      return {
        ...s,
        health: clamp(s.health + 25),
        stress: clamp(s.stress - 6),
      };
    case "MEDICINE":
      return {
        ...s,
        health: clamp(s.health + 40),
        stress: clamp(s.stress - 12),
        happiness: clamp(s.happiness + 4),
      };
    case "TRAIN":
      return {
        ...s,
        energy: clamp(s.energy - 15),
        happiness: clamp(s.happiness + 8),
        bond: clamp(s.bond + 4),
        stress: clamp(s.stress + 5),
      };
    case "ENCOURAGE":
      return {
        ...s,
        happiness: clamp(s.happiness + 12),
        bond: clamp(s.bond + 10),
        stress: clamp(s.stress - 8),
      };
    case "GIVE_ITEM":
      return {
        ...s,
        happiness: clamp(s.happiness + 10),
        bond: clamp(s.bond + 5),
      };
    case "RECOVERY_CENTER":
      return {
        ...s,
        hunger: clamp(s.hunger + 20),
        thirst: clamp(s.thirst + 20),
        hygiene: clamp(s.hygiene + 20),
        energy: clamp(s.energy + 25),
        health: clamp(s.health + 30),
        stress: clamp(s.stress - 20),
      };
    default:
      return s;
  }
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
