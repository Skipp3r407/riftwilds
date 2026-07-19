/**
 * Phase 3–5 light scaffolds — guild eggs, habitat display, optional chain mirrors.
 * Not live production systems. Flags governing these stay off / deferred.
 * See docs/economy/HATCHERY_PHASES_3_5.md
 */

import { isFeatureEnabled } from "@/lib/config/feature-flags";

/** Phase 3 — guild shared egg goal stub. */
export type GuildEggGoalScaffold = {
  guildId: string;
  goalKey: string;
  progress: number;
  target: number;
  eggRewardType: string;
  /** Always false until guild economy ships. */
  live: false;
};

export function scaffoldGuildEggGoal(guildId: string): GuildEggGoalScaffold {
  return {
    guildId,
    goalKey: "community-hatch-wave",
    progress: 0,
    target: 50,
    eggRewardType: "GROVE",
    live: false,
  };
}

export function guildEggGoalsEnabled(): boolean {
  return isFeatureEnabled("GUILDS_ENABLED") && isFeatureEnabled("GUILD_ECONOMY_ENABLED");
}

/** Phase 4 — habitat companion display stub. */
export type HabitatCompanionDisplayScaffold = {
  homesteadHref: string;
  showHatchedCompanions: boolean;
  competitivePower: false;
  live: false;
};

export function scaffoldHabitatCompanionDisplay(): HabitatCompanionDisplayScaffold {
  return {
    homesteadHref: "/homestead",
    showHatchedCompanions: isFeatureEnabled("HOMESTEADS_ENABLED"),
    competitivePower: false,
    live: false,
  };
}

/** Phase 5 — optional collectible mirror intent (never required for play). */
export type OptionalChainMirrorScaffold = {
  kind: "cosmetic_edition_mirror";
  requiredForPlay: false;
  mintingEnabled: boolean;
  guaranteedEarnings: false;
};

export function scaffoldOptionalChainMirror(): OptionalChainMirrorScaffold {
  return {
    kind: "cosmetic_edition_mirror",
    requiredForPlay: false,
    mintingEnabled:
      isFeatureEnabled("NFT_MINTING_ENABLED") && isFeatureEnabled("SOL_MINTING_ENABLED"),
    guaranteedEarnings: false,
  };
}
