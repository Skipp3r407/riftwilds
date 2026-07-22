/**
 * Card / Riftling / Weapon mastery tracks.
 */

import { getXPForLevel } from "@/lib/progression/formula";
import type {
  CardMasteryState,
  MasteryRank,
  PetMasteryState,
  WeaponMasteryState,
} from "@/lib/progression/types";

export const MASTERY_RANKS: MasteryRank[] = [
  "Bronze",
  "Silver",
  "Gold",
  "Diamond",
  "Mythic",
];

/** Lifetime card XP thresholds for rank. */
export const CARD_RANK_THRESHOLDS: Record<MasteryRank, number> = {
  Bronze: 0,
  Silver: 250,
  Gold: 750,
  Diamond: 2000,
  Mythic: 5000,
};

export const CARD_MASTERY_UNLOCKS: Record<MasteryRank, string[]> = {
  Bronze: [],
  Silver: ["border:silver"],
  Gold: ["border:gold", "particles:ember"],
  Diamond: ["animated:card", "lore:extended"],
  Mythic: ["alt-art:mythic", "particles:mythic"],
};

export const WEAPON_MASTERY_UNLOCKS: Record<number, string[]> = {
  5: ["anim:flourish"],
  10: ["vfx:trail"],
  15: ["counter:kills"],
  25: ["trail:custom"],
};

export function masteryRankFromXp(lifetimeXp: number): MasteryRank {
  let rank: MasteryRank = "Bronze";
  for (const r of MASTERY_RANKS) {
    if (lifetimeXp >= CARD_RANK_THRESHOLDS[r]) rank = r;
  }
  return rank;
}

export function emptyCardMastery(cardId: string): CardMasteryState {
  return { cardId, level: 1, xp: 0, rank: "Bronze", unlocks: [] };
}

export function emptyPetMastery(petId: string): PetMasteryState {
  return { petId, xp: 0, level: 1, evolutionXp: 0, affinity: 0, unlocks: [] };
}

export function emptyWeaponMastery(weaponId: string): WeaponMasteryState {
  return { weaponId, xp: 0, level: 1, unlocks: [], killCount: 0 };
}

function levelFromTrackXp(xp: number): { level: number; currentXp: number } {
  let level = 1;
  let remaining = Math.max(0, Math.floor(xp));
  while (level < 100) {
    const need = getXPForLevel(level);
    if (remaining < need) break;
    remaining -= need;
    level += 1;
  }
  return { level, currentXp: remaining };
}

export function grantCardMasteryXp(
  state: CardMasteryState,
  amount: number,
): { state: CardMasteryState; rankUp: boolean; newUnlocks: string[] } {
  const gain = Math.max(0, Math.floor(amount));
  const lifetime = state.xp + gain;
  const leveled = levelFromTrackXp(lifetime);
  const rank = masteryRankFromXp(lifetime);
  const rankUp = MASTERY_RANKS.indexOf(rank) > MASTERY_RANKS.indexOf(state.rank);
  const unlocks = new Set(state.unlocks);
  const newUnlocks: string[] = [];
  for (const r of MASTERY_RANKS) {
    if (lifetime >= CARD_RANK_THRESHOLDS[r]) {
      for (const u of CARD_MASTERY_UNLOCKS[r]) {
        if (!unlocks.has(u)) {
          unlocks.add(u);
          newUnlocks.push(u);
        }
      }
    }
  }
  return {
    state: {
      ...state,
      xp: lifetime,
      level: leveled.level,
      rank,
      unlocks: [...unlocks],
    },
    rankUp,
    newUnlocks,
  };
}

export function grantPetMasteryXp(
  state: PetMasteryState,
  amount: number,
  opts?: { evolutionXp?: number; affinity?: number },
): PetMasteryState {
  const gain = Math.max(0, Math.floor(amount));
  const xp = state.xp + gain;
  const leveled = levelFromTrackXp(xp);
  const unlocks = [...state.unlocks];
  if (leveled.level >= 5 && !unlocks.includes("accessory:collar")) {
    unlocks.push("accessory:collar");
  }
  if (leveled.level >= 10 && !unlocks.includes("accessory:aura-pet")) {
    unlocks.push("accessory:aura-pet");
  }
  return {
    ...state,
    xp,
    level: leveled.level,
    evolutionXp: state.evolutionXp + Math.max(0, opts?.evolutionXp ?? 0),
    affinity: Math.min(100, state.affinity + Math.max(0, opts?.affinity ?? 0)),
    unlocks,
  };
}

export function grantWeaponMasteryXp(
  state: WeaponMasteryState,
  amount: number,
  kills = 0,
): WeaponMasteryState {
  const gain = Math.max(0, Math.floor(amount));
  const xp = state.xp + gain;
  const leveled = levelFromTrackXp(xp);
  const unlocks = new Set(state.unlocks);
  for (const [lv, ids] of Object.entries(WEAPON_MASTERY_UNLOCKS)) {
    if (leveled.level >= Number(lv)) {
      for (const id of ids) unlocks.add(id);
    }
  }
  return {
    ...state,
    xp,
    level: leveled.level,
    killCount: state.killCount + Math.max(0, kills),
    unlocks: [...unlocks],
  };
}
