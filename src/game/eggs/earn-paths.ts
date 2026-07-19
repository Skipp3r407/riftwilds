/**
 * Gameplay paths that can grant eggs — never wallet/SOL/$RIFT required.
 * Optional purchases are cosmetics only (see token-cosmetic-perks + NO_PAY_TO_WIN).
 */

import type { EggTypeKey } from "@/game/eggs/egg-types";
import type { HatcheryEgg } from "@/game/eggs/hatchery-store";

export type EggEarnPathKey =
  | "STARTER_CLAIM"
  | "QUEST"
  | "BOSS"
  | "LOGIN"
  | "GUILD"
  | "BATTLE_PASS"
  | "EXPLORATION"
  | "EVENT"
  | "ACHIEVEMENT"
  | "BREEDING"
  | "SHOP_CREDITS";

export type EggEarnPath = {
  key: EggEarnPathKey;
  label: string;
  description: string;
  /** Maps to hatchery creationSource where applicable. */
  creationSource: HatcheryEgg["creationSource"];
  defaultEggType: EggTypeKey;
  /** Soft daily/weekly guidance — not hard earnings promises. */
  cadenceHint: string;
  walletRequired: false;
  competitivePower: false;
};

export const EGG_EARN_PATHS: EggEarnPath[] = [
  {
    key: "STARTER_CLAIM",
    label: "Starter Egg",
    description: "Every new keeper gets one account-bound Common Rift Egg — free, no wallet.",
    creationSource: "STARTER_CLAIM",
    defaultEggType: "COMMON_RIFT",
    cadenceHint: "Once per account",
    walletRequired: false,
    competitivePower: false,
  },
  {
    key: "QUEST",
    label: "Quest rewards",
    description: "Story, daily, and weekly quests may grant eggs as soft rewards.",
    creationSource: "QUEST",
    defaultEggType: "COMMON_RIFT",
    cadenceHint: "When quests list an egg reward",
    walletRequired: false,
    competitivePower: false,
  },
  {
    key: "BOSS",
    label: "Boss clears",
    description: "World / community boss clears can drop affinity eggs (scaffolded live ops).",
    creationSource: "EVENT",
    defaultEggType: "STORM",
    cadenceHint: "Per published boss schedule",
    walletRequired: false,
    competitivePower: false,
  },
  {
    key: "LOGIN",
    label: "Login calendar",
    description: "Returning keepers may earn eggs from login streaks — never paid gacha.",
    creationSource: "LOGIN",
    defaultEggType: "COMMON_RIFT",
    cadenceHint: "Periodic calendar days",
    walletRequired: false,
    competitivePower: false,
  },
  {
    key: "GUILD",
    label: "Guild goals",
    description: "Guild community goals can unlock shared egg drops (guilds Phase 3+).",
    creationSource: "GUILD",
    defaultEggType: "GROVE",
    cadenceHint: "When guild goals complete",
    walletRequired: false,
    competitivePower: false,
  },
  {
    key: "BATTLE_PASS",
    label: "Battle pass (free track)",
    description: "Free track may grant eggs; premium track is cosmetics/convenience only.",
    creationSource: "BATTLE_PASS",
    defaultEggType: "EMBER",
    cadenceHint: "Season free milestones",
    walletRequired: false,
    competitivePower: false,
  },
  {
    key: "EXPLORATION",
    label: "Exploration",
    description: "Map goals and Live World exploration can award eggs.",
    creationSource: "EXPLORATION",
    defaultEggType: "TIDE",
    cadenceHint: "Exploration milestones",
    walletRequired: false,
    competitivePower: false,
  },
  {
    key: "EVENT",
    label: "Community events",
    description: "Timed events publish egg drops — entertainment rewards, not earnings.",
    creationSource: "EVENT",
    defaultEggType: "EVENT",
    cadenceHint: "Per event schedule",
    walletRequired: false,
    competitivePower: false,
  },
  {
    key: "ACHIEVEMENT",
    label: "Achievements",
    description: "Published achievements may grant story eggs.",
    creationSource: "ACHIEVEMENT",
    defaultEggType: "RADIANT",
    cadenceHint: "One-time achievements",
    walletRequired: false,
    competitivePower: false,
  },
  {
    key: "BREEDING",
    label: "Breeding",
    description: "Controlled breeding may mint eggs (Credits fee path; never SOL required).",
    creationSource: "BREEDING",
    defaultEggType: "COMMON_RIFT",
    cadenceHint: "Breeding cooldowns + weekly caps",
    walletRequired: false,
    competitivePower: false,
  },
  {
    key: "SHOP_CREDITS",
    label: "Credits shop (optional)",
    description: "Optional Common Rift Egg for Credits after free starter — soft sink, never SOL.",
    creationSource: "SHOP",
    defaultEggType: "COMMON_RIFT",
    cadenceHint: "Optional repurchase",
    walletRequired: false,
    competitivePower: false,
  },
];

export function getEggEarnPath(key: EggEarnPathKey): EggEarnPath | undefined {
  return EGG_EARN_PATHS.find((p) => p.key === key);
}

/** Quest catalog keys that grant an egg when claimed via /api/hatchery/earn. */
export const QUEST_EGG_REWARD_KEYS: Record<
  string,
  { path: EggEarnPathKey; eggType: EggTypeKey }
> = {
  "weekly-hatch": { path: "QUEST", eggType: "COMMON_RIFT" },
  "starter-q5-first-steps": { path: "QUEST", eggType: "EMBER" },
  "collect-hatch-three": { path: "ACHIEVEMENT", eggType: "STORM" },
};
