import { describe, expect, it } from "vitest";
import { QUEST_CATALOG, getQuestByKey, formatQuestReward } from "@/game/quests/quest-catalog";
import {
  retargetQuestForTcg,
  questUsesTcgMetric,
} from "@/game/quests/quest-tcg-retarget";
import { bumpQuestMetric, createDefaultDemoState } from "@/game/quests/quest-demo-store";
import type { QuestDef } from "@/game/quests/quest-types";

describe("TCG quest retarget", () => {
  it("uses TCG starter chain keys with battle metrics", () => {
    const q1 = getQuestByKey("starter-q1-awakening");
    expect(q1).toBeDefined();
    expect(q1!.objectives.some((o) => o.metric === "tcg_match_play")).toBe(true);
    expect(q1!.objectives.some((o) => o.metric === "player_move")).toBe(false);
  });

  it("maps spar_win / region_visit style objectives to TCG metrics", () => {
    const spar: QuestDef = {
      key: "test-spar",
      name: "Friendly Spar",
      description: "Win a practice spar.",
      category: "BATTLE",
      boardTab: "exploration",
      difficulty: "easy",
      repeatable: false,
      objectives: [
        { key: "spar-win", description: "Win 1 spar", metric: "spar_win", target: 1 },
      ],
      rewards: [{ kind: "arena_points", amount: 10 }],
      sortOrder: 1,
    };
    const next = retargetQuestForTcg(spar);
    expect(next.objectives[0]!.metric).toBe("tcg_match_win");
    expect(next.name).toMatch(/Practice Duel/i);
  });

  it("catalog battle-spar tracks tcg_match_win", () => {
    const q = getQuestByKey("battle-spar");
    expect(q).toBeDefined();
    expect(q!.objectives.every((o) => o.metric === "tcg_match_win")).toBe(true);
    expect(questUsesTcgMetric(q!)).toBe(true);
  });

  it("formatQuestReward labels Rift Points", () => {
    expect(formatQuestReward({ kind: "arena_points", amount: 40 })).toBe("40 Rift Points");
  });

  it("bumpQuestMetric advances active TCG objectives", () => {
    let state = createDefaultDemoState();
    state = {
      ...state,
      "battle-training": {
        status: "active",
        progress: { "train-once": 0 },
        tracked: true,
      },
    };
    state = bumpQuestMetric(state, "tcg_match_play", 1);
    expect(state["battle-training"]!.status).toBe("completed");
  });

  it("loads a non-empty TCG-oriented catalog", () => {
    expect(QUEST_CATALOG.length).toBeGreaterThan(20);
    const withTcg = QUEST_CATALOG.filter(questUsesTcgMetric);
    expect(withTcg.length).toBeGreaterThan(10);
  });
});
