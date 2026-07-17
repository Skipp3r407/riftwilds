import { describe, expect, it } from "vitest";
import {
  acceptQuest,
  applyService,
  bumpObjective,
  completeQuest,
  createDefaultLivePlayState,
  purchaseFromShop,
  recordNpcTalk,
  recordPlayerMoved,
  saveLivePlayState,
} from "@/game/npcs/play-state";
import { startNpcDialogue, selectDialogueChoice } from "@/game/npcs/dialogue";
import { STARTER_QUEST_KEYS } from "@/game/npcs/starter-quests";

describe("starter quest playthrough (logic)", () => {
  it("completes quests 1–8 through NPC talk, hatch, combat, craft, travel", () => {
    let state = createDefaultLivePlayState();

    // Q1
    state = recordPlayerMoved(state);
    state = acceptQuest(state, "starter-q1-awakening");
    bumpObjective(state, "starter-q1-awakening", "move");
    state = recordNpcTalk(state, "rowan-vale");
    state = recordNpcTalk(state, "elara-venn");
    if (state.quests["starter-q1-awakening"].status === "ready") {
      state = completeQuest(state, "starter-q1-awakening");
    }
    expect(state.quests["starter-q1-awakening"].status).toBe("completed");

    // Q2
    state = acceptQuest(state, "starter-q2-fragments");
    bumpObjective(state, "starter-q2-fragments", "hear-fracture");
    state = recordNpcTalk(state, "archivist-solen");
    if (state.quests["starter-q2-fragments"].status === "ready") {
      state = completeQuest(state, "starter-q2-fragments");
    }
    expect(state.quests["starter-q2-fragments"].status).toBe("completed");

    // Q3–Q4 via Mira hatch service
    state = acceptQuest(state, "starter-q3-waiting-heart");
    const hatch = applyService(state, "hatch_eggs");
    state = hatch.state;
    expect(state.hasHatched).toBe(true);
    expect(state.activeCompanionName).toBeTruthy();

    // Ensure q3/q4 completed
    if (state.quests["starter-q3-waiting-heart"].status === "ready") {
      state = completeQuest(state, "starter-q3-waiting-heart");
    }
    if (state.quests["starter-q4-new-bond"]?.status === "available") {
      state = acceptQuest(state, "starter-q4-new-bond");
    }
    if (state.quests["starter-q4-new-bond"]?.status === "active") {
      bumpObjective(state, "starter-q4-new-bond", "name");
      bumpObjective(state, "starter-q4-new-bond", "profile");
      bumpObjective(state, "starter-q4-new-bond", "care");
      bumpObjective(state, "starter-q4-new-bond", "equip");
    }
    if (state.quests["starter-q4-new-bond"]?.status === "ready") {
      state = completeQuest(state, "starter-q4-new-bond");
    }

    // Q5 combat
    state = acceptQuest(state, "starter-q5-first-steps");
    bumpObjective(state, "starter-q5-first-steps", "leave-safe");
    bumpObjective(state, "starter-q5-first-steps", "defeat");
    bumpObjective(state, "starter-q5-first-steps", "loot");
    state = recordNpcTalk(state, "captain-orren");
    if (state.quests["starter-q5-first-steps"].status === "ready") {
      state = completeQuest(state, "starter-q5-first-steps");
    }
    expect(state.quests["starter-q5-first-steps"].status).toBe("completed");

    // Q6 craft
    state = acceptQuest(state, "starter-q6-tools");
    bumpObjective(state, "starter-q6-tools", "gather");
    const craft = applyService(state, "craft_basic");
    state = craft.state;
    if (state.quests["starter-q6-tools"].status === "ready") {
      state = completeQuest(state, "starter-q6-tools");
    }
    expect(state.toolsCrafted).toContain("starter-pick");

    // Shop spend
    const buy = purchaseFromShop(state, "shop-tessa-goods", "travel-ration");
    expect(buy.ok).toBe(true);
    state = buy.state;

    // Q7 marker
    state = acceptQuest(state, "starter-q7-broken-marker");
    bumpObjective(state, "starter-q7-broken-marker", "components");
    bumpObjective(state, "starter-q7-broken-marker", "place-marker");
    bumpObjective(state, "starter-q7-broken-marker", "confirm-portal");
    if (state.quests["starter-q7-broken-marker"].status === "ready") {
      state = completeQuest(state, "starter-q7-broken-marker");
    }

    // Q8 portal
    state = acceptQuest(state, "starter-q8-world-beyond");
    state = recordNpcTalk(state, "elara-venn");
    bumpObjective(state, "starter-q8-world-beyond", "portal");
    bumpObjective(state, "starter-q8-world-beyond", "travel");
    state.regionsVisited.push("ember-crater");
    state = recordNpcTalk(state, "kael-ashwalker");
    if (state.quests["starter-q8-world-beyond"].status === "ready") {
      state = completeQuest(state, "starter-q8-world-beyond");
    }

    saveLivePlayState(state);

    for (const key of STARTER_QUEST_KEYS) {
      expect(state.quests[key].status, key).toBe("completed");
    }
  });

  it("Rowan dialogue opens with choices", () => {
    const d = startNpcDialogue("rowan-vale");
    expect(d?.choices.some((c) => c.label.length > 0)).toBe(true);
    const next = selectDialogueChoice(d!, d!.choices[0].id);
    expect(next.dialogue === null || next.dialogue.lines.length > 0).toBe(true);
  });
});
