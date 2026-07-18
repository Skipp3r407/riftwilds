import { describe, expect, it, beforeEach } from "vitest";
import {
  createAttention,
  tickAttention,
  shouldWave,
  markWaved,
  clearAttention,
  ATTENTION_TIMEOUT_MS,
} from "@/game/npc-ai/attention";
import {
  resolveNpcSchedule,
  scheduleForNpc,
  activeScheduleBlock,
} from "@/game/npc-ai/schedules";
import {
  adjustRelationship,
  clampScore,
  createEmptyRelationships,
  relationshipBand,
  recordTalk,
} from "@/game/npc-ai/relationships";
import {
  buildKillerReputation,
  killerStanceForNpc,
  resolveKillerReaction,
  KILLER_NOTICE_THRESHOLD,
} from "@/game/npc-ai/killer-reputation";
import { rollNpcDiscovery } from "@/game/npc-ai/quest-discovery";
import { resetLivingAiForTests } from "@/game/npc-ai/living-runtime";

describe("NPC schedules", () => {
  it("gives Commons NPCs varied roles and phase activities", () => {
    const rowan = scheduleForNpc("rowan-vale");
    const orren = scheduleForNpc("captain-orren");
    const mim = scheduleForNpc("plaza-child-mim");
    expect(rowan.role).toBe("guide");
    expect(orren.role).toBe("guard");
    expect(mim.role).toBe("child");
    expect(rowan.blocks).not.toEqual(orren.blocks);
  });

  it("hides sleeping children at night but keeps guards present", () => {
    const childNight = resolveNpcSchedule("plaza-child-mim", "night");
    const guardNight = resolveNpcSchedule("guard-east-ryn", "night");
    expect(childNight.present).toBe(false);
    expect(childNight.activity).toBe("sleep");
    expect(guardNight.present).toBe(true);
    expect(guardNight.activity).toBe("patrol");
  });

  it("merchants open by day and stay present when closed at night", () => {
    const day = resolveNpcSchedule("tessa-windmere", "day");
    const night = resolveNpcSchedule("tessa-windmere", "night");
    expect(day.activity).toBe("shop_open");
    expect(night.activity).toBe("shop_closed");
    expect(night.present).toBe(true);
    const block = activeScheduleBlock(scheduleForNpc("tessa-windmere"), "dusk");
    expect(block.activity).toBe("eat");
  });
});

describe("Attention indicators", () => {
  it("times out when ignored", () => {
    const start = 1_000_000;
    let att = createAttention("chat", start);
    expect(att.active).toBe(true);
    att = tickAttention(att, start + ATTENTION_TIMEOUT_MS.chat + 1)!;
    expect(att.active).toBe(false);
    expect(att.kind).toBe("none");
  });

  it("waves once after brief delay", () => {
    const start = 5_000;
    let att = createAttention("quest", start);
    expect(shouldWave(att, start + 100)).toBe(false);
    expect(shouldWave(att, start + 500)).toBe(true);
    att = markWaved(att);
    expect(shouldWave(att, start + 900)).toBe(false);
    expect(clearAttention(att)?.active).toBe(false);
  });
});

describe("Relationships", () => {
  it("clamps scores and bands correctly", () => {
    expect(clampScore(200)).toBe(100);
    expect(clampScore(-200)).toBe(-100);
    expect(relationshipBand(-50)).toBe("hostile");
    expect(relationshipBand(0)).toBe("neutral");
    expect(relationshipBand(70)).toBe("trusted");
  });

  it("updates on talk and killer deltas", () => {
    let store = createEmptyRelationships();
    store = recordTalk(store, "rowan-vale", "hello");
    expect(store.byNpc["rowan-vale"]!.talkedCount).toBe(1);
    store = adjustRelationship(store, "rowan-vale", -8, "killer:scared");
    expect(store.byNpc["rowan-vale"]!.score).toBeLessThan(0);
    expect(store.byNpc["rowan-vale"]!.memories.at(-1)).toMatch(/killer/);
  });
});

describe("Killer reputation reactions", () => {
  beforeEach(() => {
    resetLivingAiForTests();
  });

  it("does not mark training-only players as killers", () => {
    const rep = buildKillerReputation({ enemiesDefeated: 20, pvpKills: 0 });
    expect(rep.knownAsKiller).toBe(false);
  });

  it("marks PvP / bounty / murder flags as known killers", () => {
    expect(buildKillerReputation({ pvpKills: KILLER_NOTICE_THRESHOLD }).knownAsKiller).toBe(
      true,
    );
    expect(buildKillerReputation({ bountyTier: 1 }).knownAsKiller).toBe(true);
    expect(buildKillerReputation({ flags: ["murderer"] }).knownAsKiller).toBe(true);
  });

  it("children and merchants scare; arena and bandits praise; guards challenge", () => {
    expect(
      killerStanceForNpc({
        npcSlug: "plaza-child-mim",
        occupation: "Child",
        kind: "ambient",
      }),
    ).toBe("scared");
    expect(
      killerStanceForNpc({
        npcSlug: "tessa-windmere",
        occupation: "Merchant",
        personalityTraits: ["nervous"],
      }),
    ).toBe("scared");
    expect(
      killerStanceForNpc({
        npcSlug: "rook-emberfall",
        occupation: "Arena",
        personalityTraits: ["fierce", "battle-hungry"],
      }),
    ).toBe("praise");
    expect(
      killerStanceForNpc({
        npcSlug: "captain-orren",
        occupation: "Guard captain",
        kind: "named",
        personalityTraits: ["hardliner"],
      }),
    ).toBe("challenge");
  });

  it("resolveKillerReaction returns fear/praise attention and relationship deltas", () => {
    const rep = buildKillerReputation({ pvpKills: 5 });
    const scared = resolveKillerReaction({
      npcSlug: "plaza-child-mim",
      displayName: "Mim",
      occupation: "Child",
      kind: "ambient",
      reputation: rep,
    });
    expect(scared?.kind).toBe("scared");
    expect(scared?.attention).toBe("fear");
    expect(scared?.relationshipDelta).toBeLessThan(0);
    expect(scared?.behaviorHint).toMatch(/cower|flee/);

    const praise = resolveKillerReaction({
      npcSlug: "rook-emberfall",
      displayName: "Rook",
      occupation: "Arena trainer",
      personalityTraits: ["fierce", "battle-hungry"],
      reputation: rep,
    });
    expect(praise?.kind).toBe("praise");
    expect(praise?.attention).toBe("praise");
    expect(praise?.relationshipDelta).toBeGreaterThan(0);

    const merchant = resolveKillerReaction({
      npcSlug: "tessa-windmere",
      displayName: "Tessa",
      occupation: "Merchant",
      personalityTraits: ["nervous"],
      reputation: rep,
    });
    expect(merchant?.merchantWary).toBe(true);
  });

  it("returns null when player is not a known killer", () => {
    const rep = buildKillerReputation({ pvpKills: 0 });
    expect(
      resolveKillerReaction({
        npcSlug: "rowan-vale",
        reputation: rep,
      }),
    ).toBeNull();
  });
});

describe("Quest discovery mix", () => {
  it("often yields non-quest interactions", () => {
    const results = Array.from({ length: 40 }, (_, i) =>
      rollNpcDiscovery({
        npcSlug: "plaza-musician-reo",
        role: "musician",
        dayPhase: "day",
        weather: "clear",
        roll: (i + 1) / 41,
      }),
    );
    const quests = results.filter((r) => r.interaction === "quest_offer");
    expect(quests.length).toBeLessThan(results.length / 2);
    expect(results.some((r) => r.interaction === "greeting" || r.interaction === "tip")).toBe(
      true,
    );
  });

  it("can offer gated quests for Rowan during day", () => {
    const hit = rollNpcDiscovery({
      npcSlug: "rowan-vale",
      role: "guide",
      dayPhase: "day",
      weather: "clear",
      roll: 0.05,
      questStatus: { "starter-awakening": "available" },
    });
    expect(hit.interaction).toBe("quest_offer");
    expect(hit.questId).toBe("starter-awakening");
    expect(hit.attention).toBe("quest");
  });
});
