import type { AffinityName } from "@prisma/client";
import { getArenaAffinityModifier } from "@/game/arena/affinity-matrix";

/**
 * Combo affinity scaffold — consecutive same-affinity hits build a small chain bonus.
 * Cap kept modest for fairness (not a snowball mechanic).
 */
export const COMBO_CONFIG = {
  MAX_CHAIN: 3,
  BONUS_PER_STACK_BPS: 300, // +3% per stack
} as const;

export type ComboState = {
  affinity: AffinityName | null;
  stacks: number;
};

export function emptyCombo(): ComboState {
  return { affinity: null, stacks: 0 };
}

export function advanceCombo(state: ComboState, affinity: AffinityName | null): ComboState {
  if (!affinity) return emptyCombo();
  if (state.affinity === affinity) {
    return {
      affinity,
      stacks: Math.min(COMBO_CONFIG.MAX_CHAIN, state.stacks + 1),
    };
  }
  return { affinity, stacks: 1 };
}

export function comboDamageMultiplier(state: ComboState): number {
  if (state.stacks <= 1) return 1;
  return 1 + ((state.stacks - 1) * COMBO_CONFIG.BONUS_PER_STACK_BPS) / 10000;
}

/** Scaffold helper for dual-affinity team synergetic scoring (2v2/3v3). */
export function teamAffinitySynergyScore(affinities: AffinityName[]): number {
  if (affinities.length < 2) return 1;
  let score = 0;
  for (let i = 0; i < affinities.length; i++) {
    for (let j = i + 1; j < affinities.length; j++) {
      const mod = getArenaAffinityModifier(affinities[i]!, affinities[j]!);
      // Favor complementary (modest ADV) over identical
      if (mod > 1) score += 0.02;
      else if (mod < 1) score += 0.01;
    }
  }
  return 1 + Math.min(0.08, score);
}
