import { describe, expect, it, beforeEach } from "vitest";
import {
  __resetExpansionRegistryForTests,
  listContentByKind,
  listExpansionPacks,
} from "@/game/expansion/registry";
import { ensureCoreDecadePackRegistered } from "@/game/expansion/packs/core-decade-pack";
import { buildEcosystemSnapshot } from "@/game/expansion/ecosystem";
import {
  dayPhaseFromProgress,
  resolveLivingWorldClock,
  seasonFromWorldDay,
  MS_PER_WORLD_DAY,
} from "@/game/living-world/clock";
import { generateExpedition } from "@/game/expeditions/generator";
import {
  applyChoice,
  availableChoices,
  startArc,
} from "@/game/story/engine";
import { FIRST_RIFT_LIGHT_ARC } from "@/game/story/arcs/sample-branching";
import {
  contributeToMilestone,
  getCivilizationProgress,
  resetCivilizationProgressForTests,
} from "@/game/civilization/progress-store";
import { evaluateAchievements } from "@/game/achievements/evaluator";
import { ACHIEVEMENT_CATALOG } from "@/game/achievements/catalog";
import { buildGenotypeV2, previewInheritance } from "@/game/genetics/genetics-v2";
import {
  createRiftlingAiState,
  resolveIdleEnvironmentInteraction,
} from "@/game/riftling-ai/state";
import { resolveFestivalOccurrences } from "@/game/festivals/calendar";
import { consultArchivist } from "@/game/archivist/companion";
import { generateEndlessFloor } from "@/game/endgame/catalog";
import { buildPetHistoryCard } from "@/lib/marketplace/pet-history-card";
import { evaluateActionSpam } from "@/lib/security/anti-cheat";
import { withApiGuard } from "@/lib/security/api-guard";
import { resetAuditLogForTests } from "@/lib/security/audit-log";

describe("expansion pack registry", () => {
  beforeEach(() => {
    __resetExpansionRegistryForTests();
  });

  it("registers core decade pack with substantial content", () => {
    ensureCoreDecadePackRegistered();
    const packs = listExpansionPacks();
    expect(packs.some((p) => p.id === "core-decade-foundations")).toBe(true);
    expect(listContentByKind("achievement").length).toBeGreaterThan(20);
    expect(listContentByKind("milestone").length).toBeGreaterThan(8);
    expect(listContentByKind("region").length).toBe(12);
  });

  it("builds ecosystem snapshot", () => {
    const snap = buildEcosystemSnapshot(1_700_000_000_000);
    expect(snap.packs.length).toBeGreaterThan(0);
    expect(snap.achievements.catalogSize).toBe(ACHIEVEMENT_CATALOG.length);
    expect(snap.livingWorld.season).toBeTruthy();
  });
});

describe("living world clock", () => {
  it("maps day progress to phases", () => {
    expect(dayPhaseFromProgress(0.05)).toBe("dawn");
    expect(dayPhaseFromProgress(0.4)).toBe("day");
    expect(dayPhaseFromProgress(0.65)).toBe("dusk");
    expect(dayPhaseFromProgress(0.9)).toBe("night");
  });

  it("cycles seasons deterministically", () => {
    const a = seasonFromWorldDay(0);
    const b = seasonFromWorldDay(28);
    expect(a.season).toBe("bloom");
    expect(b.season).toBe("ember");
  });

  it("is stable for a fixed timestamp", () => {
    const at = 100 * MS_PER_WORLD_DAY + 1_000;
    const c1 = resolveLivingWorldClock(at);
    const c2 = resolveLivingWorldClock(at);
    expect(c1.worldDay).toBe(c2.worldDay);
    expect(c1.weather).toBe(c2.weather);
  });
});

describe("story engine", () => {
  it("branches on choice and tracks reputation", () => {
    let state = startArc(FIRST_RIFT_LIGHT_ARC);
    const choices = availableChoices(FIRST_RIFT_LIGHT_ARC, state);
    expect(choices.length).toBeGreaterThan(0);
    state = applyChoice(FIRST_RIFT_LIGHT_ARC, state, "follow_pet");
    expect(state.currentNodeId).toBe("wild_edge");
    expect(state.reputation.wildfolk).toBe(2);
  });
});

describe("civilization restoration", () => {
  beforeEach(() => {
    resetCivilizationProgressForTests();
  });

  it("unlocks milestone when threshold crossed", () => {
    const before = getCivilizationProgress();
    expect(before.unlockedMilestoneKeys).toContain("commons_lanterns");
    const result = contributeToMilestone("ember_forge_reignited", 1200);
    expect(result.newlyUnlocked).toContain("ember_forge_reignited");
    expect(result.effects.length).toBeGreaterThan(0);
  });
});

describe("achievements", () => {
  it("seeds a substantial catalog", () => {
    expect(ACHIEVEMENT_CATALOG.length).toBeGreaterThanOrEqual(30);
  });

  it("evaluates metric thresholds", () => {
    const { newlyUnlocked } = evaluateAchievements(
      { hatch_count: 1, egg_claim_count: 1 },
      [],
    );
    expect(newlyUnlocked.map((a) => a.key)).toEqual(
      expect.arrayContaining(["first_hatch", "first_claim"]),
    );
  });
});

describe("expeditions", () => {
  it("generates deterministic expeditions from seed", () => {
    const a = generateExpedition({
      seed: "test-seed",
      regionSlug: "ember-crater",
      difficulty: "ranger",
    });
    const b = generateExpedition({
      seed: "test-seed",
      regionSlug: "ember-crater",
      difficulty: "ranger",
    });
    expect(a.id).toBe(b.id);
    expect(a.nodes.length).toBe(6);
    expect(a.disclaimer).toMatch(/entertainment/i);
  });
});

describe("genetics v2", () => {
  it("builds genotype from legacy seeds and previews inheritance", () => {
    const a = buildGenotypeV2({
      geneticsSeed: "g1",
      traitSeed: "t1",
      cosmeticSeed: "c1",
    });
    const b = buildGenotypeV2({
      geneticsSeed: "g2",
      traitSeed: "t2",
      cosmeticSeed: "c2",
      generation: 2,
    });
    expect(a.schemaVersion).toBe(2);
    expect(a.legacy.geneticsSeed).toBe("g1");
    const preview = previewInheritance(a, b, "mix");
    expect(preview.generation).toBe(3);
  });
});

describe("riftling AI", () => {
  it("creates personality and idle interactions", () => {
    const ai = createRiftlingAiState({
      publicPetId: "pet_1",
      geneticsSeed: "seed-ai",
    });
    expect(ai.personality.curiosity).toBeGreaterThan(0);
    const idle = resolveIdleEnvironmentInteraction(ai, {
      dayPhase: "night",
      weather: "clear",
      regionSlug: "riftwild-commons",
    });
    expect(idle.action).toBeTruthy();
  });
});

describe("festivals & endgame & marketplace card", () => {
  it("resolves festival occurrences", () => {
    const clock = resolveLivingWorldClock(0);
    const occ = resolveFestivalOccurrences(clock);
    expect(occ.length).toBeGreaterThan(3);
  });

  it("generates endless rift floors", () => {
    const floor = generateEndlessFloor(10);
    expect(floor.floor).toBe(10);
    expect(floor.modifiers.length).toBe(2);
  });

  it("builds pet history cards with disclaimer", () => {
    const genotype = buildGenotypeV2({
      geneticsSeed: "g",
      traitSeed: "t",
      cosmeticSeed: "c",
    });
    const card = buildPetHistoryCard({
      publicPetId: "p1",
      displayName: "Ash",
      speciesSlug: "cindercub",
      speciesName: "Cindercub",
      rarity: "COMMON",
      genotype,
    });
    expect(card.disclaimer).toMatch(/entertainment/i);
    expect(card.geneticsV2?.schemaVersion).toBe(2);
  });
});

describe("archivist", () => {
  it("returns lore-grounded hints", () => {
    const reply = consultArchivist({ speciesSlug: "cindercub" });
    expect(reply.hints.length).toBeGreaterThan(0);
    expect(reply.disclaimer).toMatch(/entertainment/i);
  });
});

describe("security foundations", () => {
  beforeEach(() => {
    resetAuditLogForTests();
  });

  it("flags action spam", () => {
    const finding = evaluateActionSpam({
      actionCount: 50,
      windowMs: 1000,
      limit: 10,
    });
    expect(finding?.signal).toBe("action_spam");
  });

  it("rate limits via api guard", async () => {
    const key = `test-${Date.now()}`;
    let blocked = false;
    for (let i = 0; i < 5; i++) {
      const result = await withApiGuard({
        bucket: "unit-test-guard",
        limit: 3,
        windowMs: 60_000,
        clientKey: key,
      });
      if (!result.ok) {
        blocked = true;
        break;
      }
    }
    expect(blocked).toBe(true);
  });
});
