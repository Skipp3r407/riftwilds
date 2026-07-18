import type { ArenaAction, ArenaCombatant } from "@/game/arena/types";
import { createSeededRng } from "@/game/arena/rng";
import { canSpendRiftBurst } from "@/game/arena/rift-burst";

export type AiDifficulty = "NOVICE" | "ADEPT" | "VETERAN" | "ELITE" | "RIFTMASTER";

export const AI_DIFFICULTY_META: Record<
  AiDifficulty,
  { label: string; mistakeChanceBps: number; preferDefenseHpPct: number }
> = {
  NOVICE: { label: "Novice", mistakeChanceBps: 3500, preferDefenseHpPct: 0.25 },
  ADEPT: { label: "Adept", mistakeChanceBps: 2000, preferDefenseHpPct: 0.3 },
  VETERAN: { label: "Veteran", mistakeChanceBps: 1000, preferDefenseHpPct: 0.35 },
  ELITE: { label: "Elite", mistakeChanceBps: 400, preferDefenseHpPct: 0.4 },
  RIFTMASTER: { label: "Riftmaster", mistakeChanceBps: 100, preferDefenseHpPct: 0.45 },
};

function affordableOffensive(c: ArenaCombatant) {
  return c.abilities
    .filter(
      (a) =>
        a.target === "OPPONENT" &&
        c.energy >= a.energyCost &&
        a.category !== "ULTIMATE" &&
        (!a.riftBurstCost || canSpendRiftBurst(c.riftBurst, a.riftBurstCost)),
    )
    .sort((a, b) => b.power - a.power);
}

/** Difficulty-aware AI for Practice / NPC battles. */
export function chooseAiAction(
  combatant: ArenaCombatant,
  opts?: { difficulty?: AiDifficulty; seed?: string; foeHpPct?: number },
): ArenaAction {
  const difficulty = opts?.difficulty ?? "ADEPT";
  const meta = AI_DIFFICULTY_META[difficulty];
  const rng = createSeededRng(opts?.seed ?? `ai:${combatant.id}:${combatant.hp}:${combatant.energy}`);

  if (rng.nextBps() < meta.mistakeChanceBps) {
    const mistakes: ArenaAction[] = [
      { kind: "BASIC_ATTACK" },
      { kind: "DEFEND" },
      { kind: "FOCUS" },
    ];
    return mistakes[rng.nextRangeBps(0, mistakes.length * 1000 - 1) % mistakes.length]!;
  }

  const hpPct = combatant.hp / Math.max(combatant.maxHp, 1);

  if (hpPct < meta.preferDefenseHpPct) {
    const heal = combatant.abilities.find(
      (a) => a.category === "HEALING" && combatant.energy >= a.energyCost,
    );
    if (heal) return { kind: "ABILITY", abilityId: heal.id };
    if (difficulty !== "NOVICE") return { kind: "GUARD" };
    return { kind: "DEFEND" };
  }

  const ult = combatant.abilities.find((a) => a.category === "ULTIMATE");
  if (
    ult &&
    canSpendRiftBurst(combatant.riftBurst, ult.riftBurstCost ?? 100) &&
    (opts?.foeHpPct ?? 1) < 0.55 &&
    difficulty !== "NOVICE"
  ) {
    return { kind: "ULTIMATE", abilityId: ult.id };
  }

  if (combatant.energy < 10) {
    if (difficulty === "ELITE" || difficulty === "RIFTMASTER") {
      return rng.nextBps() < 5000 ? { kind: "CHARGE" } : { kind: "MEDITATE" };
    }
    return { kind: "FOCUS" };
  }

  if (
    (difficulty === "VETERAN" || difficulty === "ELITE" || difficulty === "RIFTMASTER") &&
    (opts?.foeHpPct ?? 1) > 0.7 &&
    rng.nextBps() < 2500
  ) {
    return { kind: "ANALYZE" };
  }

  const options = affordableOffensive(combatant);
  if (options[0]) return { kind: "ABILITY", abilityId: options[0].id };
  return { kind: "BASIC_ATTACK" };
}

/** Back-compat alias used by older call sites. */
export function chooseAiActionSimple(combatant: ArenaCombatant): ArenaAction {
  return chooseAiAction(combatant, { difficulty: "ADEPT" });
}
