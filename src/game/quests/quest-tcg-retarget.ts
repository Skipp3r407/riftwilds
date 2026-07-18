/**
 * Retarget Live World / Arena-flavored quest copy & metrics toward Rift Battles (TCG).
 * Applied when building the quest board catalog. LW Phaser starter hooks stay on starter-quests.ts.
 */

import type { QuestDef, QuestObjectiveDef } from "@/game/quests/quest-types";

/** Metrics the quest board / demo store can advance from TCG + hatchery loops. */
export const TCG_QUEST_METRICS = [
  "tcg_match_play",
  "tcg_match_win",
  "tcg_card_play",
  "tcg_card_collect",
  "tcg_deck_set",
  "tcg_energy_spend",
  "binder_open",
  "hatchery_visit",
  "academy_visit",
  "leaderboard_visit",
] as const;

export type TcgQuestMetric = (typeof TCG_QUEST_METRICS)[number];

type MetricMap = { metric: string; description?: (prev: string) => string };

const METRIC_RETARGET: Record<string, MetricMap> = {
  player_move: {
    metric: "tcg_match_play",
    description: () => "Start a practice Rift Battle",
  },
  region_visit: {
    metric: "tcg_match_play",
    description: (prev) =>
      prev.toLowerCase().includes("enter") || prev.toLowerCase().includes("reach")
        ? "Complete a themed Rift Battle"
        : "Play a Rift Battle",
  },
  region_travel: {
    metric: "tcg_match_win",
    description: () => "Win a Rift Battle outside practice warm-up",
  },
  region_zone: {
    metric: "tcg_match_play",
    description: () => "Open the Rift Battle board",
  },
  enemy_defeat: {
    metric: "tcg_match_win",
    description: () => "Win a practice Rift Battle",
  },
  loot_collect: {
    metric: "tcg_card_play",
    description: () => "Play a card in battle",
  },
  portal_use: {
    metric: "tcg_match_play",
    description: () => "Complete a Rift Battle",
  },
  spar_win: {
    metric: "tcg_match_win",
    description: (prev) => prev.replace(/spar/gi, "Rift Battle").replace(/spars/gi, "Rift Battles"),
  },
  training_complete: {
    metric: "tcg_match_play",
    description: () => "Finish a practice Rift Battle",
  },
  landmark_discover: {
    metric: "binder_open",
    description: () => "Browse a Card Binder page",
  },
  path_complete: {
    metric: "tcg_match_play",
    description: () => "Complete a Rift Battle",
  },
  patrol_complete: {
    metric: "tcg_match_play",
    description: () => "Complete a daily practice battle",
  },
  map_mark: {
    metric: "tcg_deck_set",
    description: () => "Set or confirm your active deck",
  },
  gather_heat: {
    metric: "tcg_energy_spend",
    description: () => "Spend Rift Energy in battle",
  },
  gather_count: {
    metric: "tcg_card_collect",
    description: () => "Add a card to your binder",
  },
  gather_ore: {
    metric: "tcg_card_collect",
    description: () => "Collect a binder card",
  },
  gather_crystal: {
    metric: "tcg_card_collect",
    description: () => "Collect an affinity card",
  },
  gather_fragment: {
    metric: "tcg_card_collect",
    description: () => "Collect a schema card fragment",
  },
  craft_item: {
    metric: "tcg_deck_set",
    description: () => "Lock a practice deck",
  },
  craft_part: {
    metric: "tcg_deck_set",
    description: () => "Build a deck list",
  },
  craft_schema: {
    metric: "tcg_deck_set",
    description: () => "Assemble a themed deck",
  },
  building_visit: {
    metric: "hatchery_visit",
    description: () => "Visit the Hatchery",
  },
  boss_damage: {
    metric: "tcg_match_win",
    description: () => "Win a hard practice battle",
  },
  event_participate: {
    metric: "tcg_match_play",
    description: () => "Play in a seasonal practice board",
  },
  demo_session: {
    metric: "tcg_match_play",
    description: () => "Complete a demo Rift Battle",
  },
  compass_calibrate: {
    metric: "tcg_deck_set",
    description: () => "Calibrate your active deck once",
  },
  track_print: {
    metric: "tcg_card_play",
    description: () => "Play Ember-affinity cards",
  },
  tide_search: {
    metric: "tcg_card_play",
    description: () => "Play Tide-affinity cards",
  },
  wind_trial: {
    metric: "tcg_match_win",
    description: () => "Win Storm-themed practice battles",
  },
  excavate: {
    metric: "tcg_card_collect",
    description: () => "Collect Stone-affinity cards",
  },
  seal_break: {
    metric: "tcg_match_win",
    description: () => "Win Frost-themed practice battles",
  },
  brazier_light: {
    metric: "tcg_card_play",
    description: () => "Play Radiant-affinity cards",
  },
  portal_puzzle: {
    metric: "tcg_match_play",
    description: () => "Solve the board with Void plays",
  },
  lantern_light: {
    metric: "tcg_card_play",
    description: () => "Play Spirit-affinity cards",
  },
  rift_chart: {
    metric: "tcg_match_win",
    description: () => "Win a Celestial-themed battle",
  },
  dive_complete: {
    metric: "tcg_match_play",
    description: () => "Complete a coastal-themed battle",
  },
  watch_shift: {
    metric: "tcg_match_play",
    description: () => "Complete a watch-duty practice battle",
  },
  npc_talk: {
    metric: "academy_visit",
    description: (prev) =>
      prev.toLowerCase().includes("herald") || prev.toLowerCase().includes("oath")
        ? "Confirm the Keeper duel oath in Academy"
        : "Open an Academy tip",
  },
};

const NAME_REPLACEMENTS: [RegExp, string][] = [
  [/Friendly Spar/gi, "Practice Duel"],
  [/Training Grounds/gi, "Practice Board"],
  [/Plaza Sweep/gi, "Binder Sweep"],
  [/plaza patrol/gi, "daily practice circuit"],
  [/Region Hopper/gi, "Board Hopper"],
  [/Arena Prep/gi, "Rift Battle Prep"],
  [/ridge walk/gi, "ember board run"],
  [/habitat plaza/gi, "duel desk"],
];

const DESC_REPLACEMENTS: [RegExp, string][] = [
  [/practice spar/gi, "practice Rift Battle"],
  [/spar session/gi, "Rift Battle"],
  [/Live World/gi, "Living World (future habitat)"],
  [/living world/gi, "Living World (future habitat)"],
  [/habitat walk/gi, "practice board session"],
  [/plaza job/gi, "binder contract"],
  [/walk the /gi, "duel through the "],
  [/Visit 3 regions/gi, "Win battles on 3 board themes"],
  [/Venture into /gi, "Challenge the "],
  [/Enter /gi, "Duel the "],
  [/Reach /gi, "Challenge "],
];

function rewriteText(text: string, pairs: [RegExp, string][]): string {
  let out = text;
  for (const [re, to] of pairs) out = out.replace(re, to);
  return out;
}

function retargetObjective(obj: QuestObjectiveDef): QuestObjectiveDef {
  const map = METRIC_RETARGET[obj.metric];
  if (!map) {
    return {
      ...obj,
      description: rewriteText(obj.description, DESC_REPLACEMENTS),
    };
  }
  return {
    ...obj,
    metric: map.metric,
    description: map.description
      ? map.description(obj.description)
      : rewriteText(obj.description, DESC_REPLACEMENTS),
  };
}

/** Soft-flag pure exploration LW quests that couldn't be meaningfully remapped. */
export function isHabitatDeferredQuest(quest: QuestDef): boolean {
  if (quest.category !== "EXPLORATION") return false;
  const metrics = quest.objectives.map((o) => o.metric);
  return metrics.every(
    (m) =>
      m === "region_visit" ||
      m === "path_complete" ||
      m === "landmark_discover" ||
      m === "patrol_complete",
  );
}

export function retargetQuestForTcg(quest: QuestDef): QuestDef {
  const deferred = isHabitatDeferredQuest(quest);
  const name = rewriteText(quest.name, NAME_REPLACEMENTS);
  let description = rewriteText(quest.description, DESC_REPLACEMENTS);
  if (deferred) {
    description = `${description} (Living World habitat step — soft-deferred; progress via practice battles for now.)`;
  }

  const objectives = quest.objectives.map(retargetObjective);
  const rewards = quest.rewards.map((r) => {
    if (r.kind === "arena_points") {
      return { ...r };
    }
    return r;
  });

  return {
    ...quest,
    name,
    description,
    objectives,
    rewards,
  };
}

export function retargetQuestCatalog(quests: QuestDef[]): QuestDef[] {
  return quests.map(retargetQuestForTcg);
}

/** True if any objective uses a TCG-trackable metric. */
export function questUsesTcgMetric(quest: QuestDef): boolean {
  const set = new Set<string>(TCG_QUEST_METRICS);
  return quest.objectives.some((o) => set.has(o.metric));
}
