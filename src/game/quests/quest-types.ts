/**
 * Shared quest board types (kept separate to avoid circular imports with the expansion catalog).
 */

export type QuestBoardTab = "all" | "story" | "daily" | "exploration";

export type QuestCategory =
  | "STORY"
  | "DAILY"
  | "WEEKLY"
  | "EXPLORATION"
  | "CARE"
  | "BATTLE"
  | "COLLECTION"
  | "COMMUNITY"
  | "EVENT";

export type QuestDifficulty = "easy" | "medium" | "hard";

export type QuestStatus = "available" | "active" | "completed" | "locked";

export type QuestReward =
  | { kind: "care_item"; itemKey: string; label: string; quantity: number }
  | { kind: "xp"; amount: number }
  | { kind: "arena_points"; amount: number }
  | { kind: "soft_currency"; amount: number; label?: string }
  /** Claim via POST /api/hatchery/earn — never wallet-gated. */
  | {
      kind: "egg";
      eggType?: string;
      label: string;
      /** Maps to QUEST_EGG_REWARD_KEYS / earn path. */
      earnPath?: "QUEST" | "ACHIEVEMENT" | "EVENT" | "LOGIN";
    };

export type QuestObjectiveDef = {
  key: string;
  description: string;
  metric: string;
  target: number;
};

export type QuestDef = {
  key: string;
  name: string;
  description: string;
  category: QuestCategory;
  /** Primary board tab grouping (Story / Daily / Exploration). */
  boardTab: Exclude<QuestBoardTab, "all">;
  difficulty: QuestDifficulty;
  regionKey?: string;
  regionName?: string;
  chainKey?: string;
  repeatable: boolean;
  /** Quest keys that must be completed before this one unlocks (demo). */
  requires?: string[];
  objectives: QuestObjectiveDef[];
  rewards: QuestReward[];
  sortOrder: number;
};
