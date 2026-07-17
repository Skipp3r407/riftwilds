/**
 * Riftwilds Arena configuration.
 * REAL_VALUE_WAGERING_ENABLED must never be flipped on without a separate compliance product.
 */

export const arenaConfig = {
  TURN_TIMER_SECONDS: 20,
  TURN_WARNING_SECONDS: 5,
  MAX_ROUNDS: 30,
  RECONNECT_WINDOW_SECONDS: 45,
  EQUIP_POWER_CAP_BPS: 1800, // 18% max equip contribution when normalized
  RANDOM_DAMAGE_MIN_BPS: 9200, // 0.92
  RANDOM_DAMAGE_MAX_BPS: 10800, // 1.08
  AFFINITY_VERSION: 1,
  BALANCE_VERSION: 1,
  ARENA_POINTS_WIN: 25,
  ARENA_POINTS_LOSS: 8,
  ARENA_POINTS_TRAINING_WIN: 10,
  ARENA_POINTS_TRAINING_LOSS: 3,
  DISCLOSURES: {
    noWagering:
      "Riftwilds Arena does not permit wagering of SOL, project tokens, pets, eggs, NFTs, marketplace items, or anything of monetary value.",
    predictions:
      "Predictions are free, have no prize, and are provided only for community entertainment.",
    weapons:
      "Weapons are fictional game equipment. Battles are stylized, non-graphic competitions and cannot permanently injure or kill a Riftling.",
  },
} as const;

/** Hard-disabled. Not exposed on the normal admin dashboard. */
export const REAL_VALUE_WAGERING_ENABLED = false as const;

export function assertNoRealValueWagering(): void {
  if (REAL_VALUE_WAGERING_ENABLED) {
    throw new Error(
      "REAL_VALUE_WAGERING_ENABLED must remain false without a separate compliance product.",
    );
  }
}
