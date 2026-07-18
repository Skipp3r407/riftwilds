/**
 * Admin-tunable Spirit & Recovery policy.
 * SOL Instant Spirit Recall is optional convenience — flat / level-tiered, never rarity.
 */

import { COUNTDOWN_PRESETS_MS, type CountdownPresetKey } from "@/game/spirit/types";
import { solToLamports } from "@/lib/items/lamports";

export const SPIRIT_RECOVERY_CONFIG = {
  /** Default Downed countdown. */
  defaultCountdownPreset: "H72" as CountdownPresetKey,
  countdownPresetsMs: COUNTDOWN_PRESETS_MS,

  /** Base Credits healer cost before bond / insurance modifiers. */
  creditsHealerBase: 120,
  creditsHealerMin: 40,
  creditsHealerMax: 400,

  /** Loyalty token recovery cost. */
  loyaltyTokenCost: 25,

  /** Guild / friend assist contribution targets (Credits equivalent). */
  guildAssistCreditsTarget: 80,
  friendAssistCreditsTarget: 60,

  /**
   * Optional SOL Instant Spirit Recall — NEVER priced by rarity / emotion / market value.
   * Level-tiered with hard max cap. Flat mode available via admin toggle.
   */
  solRecall: {
    enabledByDefault: false,
    mode: "LEVEL_TIERED" as "FLAT" | "LEVEL_TIERED",
    flatLamports: solToLamports("0.02"),
    tiers: [
      { maxLevel: 20, lamports: solToLamports("0.01") },
      { maxLevel: 50, lamports: solToLamports("0.03") },
      { maxLevel: Number.POSITIVE_INFINITY, lamports: solToLamports("0.05") },
    ],
    /** Absolute ceiling — never exceed. */
    maxLamports: solToLamports("0.05"),
    /** Credits substitute when SOL pool empty / flags off. */
    substituteCredits: 200,
    substituteLabel: "Spirit Recall Credits (SOL pool unavailable)",
  },

  /** Bond: higher bond → longer timer (+%) and lower Credits cost (−%). */
  bond: {
    timerBonusMaxBps: 3500, // +35% at bond 100
    costReductionMaxBps: 4000, // −40% at bond 100
    specialDialogueMinBond: 60,
    uniqueQuestMinBond: 75,
  },

  /** Insurance purchase (Credits). */
  insurance: {
    creditsPrice: 350,
    freeRecoveries: 1,
    costReductionBps: 2500,
    extraTimerMs: 24 * 60 * 60 * 1000,
  },

  /** Age (ms) before a thriving pet may ascend as Legendary Ancestor (lore only). */
  ancestorMinAgeMs: 90 * 24 * 60 * 60 * 1000,
  ancestorMinBond: 85,
  ancestorMinLevel: 40,

  hardcoreWarning:
    "This Riftling may be permanently lost. Hardcore is optional. Normal play never permanently kills Riftlings.",

  recoveryItems: [
    "spirit-crystal",
    "phoenix-feather",
    "ancient-heart",
    "revival-herb",
    "healing-stone",
    "soul-bloom",
    "moon-tear",
    "heart-flame",
    "sacred-feather",
    "ancestor-stone",
    "ancient-bell",
    "revival-water",
    "healing-rune",
    "spirit-lantern-charm",
    "dormancy-revival-bloom",
  ] as const,

  fx: {
    heartbeatAudioKey: "sfx-heartbeat-soft",
    spiritRealmMusicKey: "music-spirit-realm",
  },
} as const;

export type SpiritRecoveryConfig = typeof SPIRIT_RECOVERY_CONFIG;

export function countdownMsForPreset(preset: CountdownPresetKey = SPIRIT_RECOVERY_CONFIG.defaultCountdownPreset): number {
  return SPIRIT_RECOVERY_CONFIG.countdownPresetsMs[preset];
}
