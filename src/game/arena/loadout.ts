import type { AffinityName } from "@prisma/client";
import type { ArenaAbilityCategory, ArenaAbilityDef } from "@/game/arena/types";
import { RIFT_BURST_CONFIG } from "@/game/arena/rift-burst";

/**
 * Ability loadout slots — aligns with species kits.
 * 4 active · 2 passives · 1 ultimate · 1 signature
 */
export const LOADOUT_SLOTS = {
  ACTIVE: 4,
  PASSIVE: 2,
  ULTIMATE: 1,
  SIGNATURE: 1,
} as const;

export type AbilityLoadout = {
  actives: ArenaAbilityDef[];
  passives: ArenaAbilityDef[];
  ultimate: ArenaAbilityDef | null;
  signature: ArenaAbilityDef | null;
};

const PASSIVE_CATS: ArenaAbilityCategory[] = ["SUPPORT", "DEFENSIVE"];
const ULTIMATE_CAT: ArenaAbilityCategory = "ULTIMATE";

export function partitionLoadout(abilities: ArenaAbilityDef[]): AbilityLoadout {
  const basic = abilities.find((a) => a.id === "basic-strike");
  const rest = abilities.filter((a) => a.id !== "basic-strike");
  const ultimates = rest.filter((a) => a.category === ULTIMATE_CAT);
  const passives = rest.filter(
    (a) => PASSIVE_CATS.includes(a.category) && a.power === 0 && a.target === "SELF",
  );
  const signatures = rest.filter(
    (a) => a.id.includes("signature") || a.id.endsWith("-sig") || a.priority >= 3,
  );
  const actives = rest.filter(
    (a) =>
      !ultimates.includes(a) &&
      !passives.includes(a) &&
      !signatures.includes(a),
  );

  const activeSlots: ArenaAbilityDef[] = [];
  if (basic) activeSlots.push(basic);
  for (const a of actives) {
    if (activeSlots.length >= LOADOUT_SLOTS.ACTIVE) break;
    activeSlots.push(a);
  }
  while (activeSlots.length < LOADOUT_SLOTS.ACTIVE && actives[activeSlots.length]) {
    activeSlots.push(actives[activeSlots.length]!);
  }

  return {
    actives: activeSlots.slice(0, LOADOUT_SLOTS.ACTIVE),
    passives: passives.slice(0, LOADOUT_SLOTS.PASSIVE),
    ultimate: ultimates[0] ?? null,
    signature: signatures[0] ?? actives.find((a) => a.power >= 55) ?? null,
  };
}

/** Flatten loadout into the combatant ability list used by the engine. */
export function flattenLoadout(loadout: AbilityLoadout): ArenaAbilityDef[] {
  const out = [...loadout.actives];
  if (loadout.signature && !out.some((a) => a.id === loadout.signature!.id)) {
    out.push(loadout.signature);
  }
  if (loadout.ultimate) out.push(loadout.ultimate);
  for (const p of loadout.passives) {
    if (!out.some((a) => a.id === p.id)) out.push(p);
  }
  return out;
}

export function createStarterUltimate(affinity: AffinityName | string): ArenaAbilityDef {
  return {
    id: `rift-burst-${String(affinity).toLowerCase()}`,
    name: "Rift Burst",
    description: "Channel the Rift Burst meter into a finishing surge.",
    affinity: affinity as AffinityName,
    category: "ULTIMATE",
    power: 72,
    accuracy: 90,
    energyCost: 0,
    priority: 0,
    cooldown: 0,
    target: "OPPONENT",
    riftBurstCost: RIFT_BURST_CONFIG.ULTIMATE_COST,
  };
}
