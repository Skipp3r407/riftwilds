import { describe, expect, it, beforeEach } from "vitest";
import {
  applyReputationDelta,
  createDefaultReputation,
  dominantReputationIdentity,
  syncReputationFromKiller,
  type PlayerReputation,
} from "@/game/npc-ai/reputation";
import { buildKillerReputation } from "@/game/npc-ai/killer-reputation";
import { resolveSocialReaction } from "@/game/npc-ai/social-reactions";
import { traitsForNpc, hasTrait } from "@/game/npc-ai/personality-traits";
import {
  createEmptyGossipStore,
  isInstantGlobal,
  knownReputationInRegion,
  regionAwareness,
  seedGossipRumor,
  tickGossipSpread,
  GOSSIP_HOP_MS,
} from "@/game/npc-ai/gossip";
import {
  resolveCrimeWitnesses,
  type CrimeEvent,
} from "@/game/npc-ai/witnesses";
import { processCrimeEvent } from "@/game/npc-ai/crime-pipeline";
import {
  applyForgiveness,
  forgivenessNeverRequiresSol,
  listForgivenessOffers,
} from "@/game/npc-ai/forgiveness";
import { createEmptyRelationships } from "@/game/npc-ai/relationships";
import {
  recordNpcMemoryEvent,
  personalGratitude,
  personalHostility,
} from "@/game/npc-ai/npc-memory-events";

function criminalAxes(overrides: Partial<PlayerReputation> = {}): PlayerReputation {
  return {
    ...createDefaultReputation(),
    notoriety: 60,
    criminal: 55,
    infamy: 50,
    cruelty: 45,
    hero: 5,
    town: 8,
    trust: 5,
    honor: 8,
    mercy: 5,
    ...overrides,
  };
}

function heroAxes(overrides: Partial<PlayerReputation> = {}): PlayerReputation {
  return {
    ...createDefaultReputation(),
    hero: 55,
    honor: 50,
    mercy: 45,
    town: 48,
    trust: 50,
    notoriety: 5,
    criminal: 0,
    cruelty: 0,
    infamy: 0,
    ...overrides,
  };
}

describe("Multi-axis reputation model", () => {
  it("exposes all required axes", () => {
    const axes = createDefaultReputation();
    expect(axes).toMatchObject({
      hero: expect.any(Number),
      town: expect.any(Number),
      guild: expect.any(Number),
      faction: expect.any(Number),
      merchant: expect.any(Number),
      criminal: expect.any(Number),
      notoriety: expect.any(Number),
      honor: expect.any(Number),
      mercy: expect.any(Number),
      cruelty: expect.any(Number),
      trust: expect.any(Number),
      infamy: expect.any(Number),
      monsterHunter: expect.any(Number),
      explorer: expect.any(Number),
    });
  });

  it("treats killer notoriety as one feed into broader axes", () => {
    const killer = buildKillerReputation({ pvpKills: 5, bountyTier: 1 });
    const axes = syncReputationFromKiller(createDefaultReputation(), killer);
    expect(axes.notoriety).toBeGreaterThan(30);
    expect(axes.criminal).toBeGreaterThan(20);
    expect(dominantReputationIdentity(axes).identity).toBe("criminal");
  });

  it("hero identity differs from criminal", () => {
    expect(dominantReputationIdentity(heroAxes()).identity).toBe("hero");
    expect(dominantReputationIdentity(criminalAxes()).identity).toBe("criminal");
  });
});

describe("Personality-gated social reactions", () => {
  it("heroes get waves/discounts/salutes in Commons; bandits scorn them", () => {
    const axes = heroAxes();
    const child = resolveSocialReaction({
      npcSlug: "plaza-child-mim",
      displayName: "Mim",
      occupation: "Child",
      knownAxes: axes,
    });
    expect(child?.kind).toBe("wave");

    const guard = resolveSocialReaction({
      npcSlug: "captain-orren",
      displayName: "Orren",
      occupation: "Guard captain",
      personalityTraits: ["hardliner", "stern"],
      knownAxes: axes,
    });
    expect(guard?.kind).toBe("salute");

    const merchant = resolveSocialReaction({
      npcSlug: "tessa-windmere",
      displayName: "Tessa",
      occupation: "Merchant",
      personalityTraits: ["sharp", "fair"],
      knownAxes: axes,
    });
    expect(merchant?.kind).toBe("discount");
    expect(merchant!.priceModifier).toBeLessThan(1);

    const bandit = resolveSocialReaction({
      npcSlug: "ash-raider-kell",
      displayName: "Kell",
      occupation: "Bandit",
      personalityTraits: ["outlaw-sympathizer", "ruthless"],
      knownAxes: axes,
    });
    expect(bandit?.kind).toBe("condemn");
  });

  it("high notoriety: children hide, merchants lock, guards escalate, bandits respect", () => {
    const axes = criminalAxes({ notoriety: 70, criminal: 65 });

    const child = resolveSocialReaction({
      npcSlug: "plaza-child-mim",
      occupation: "Child",
      knownAxes: axes,
    });
    expect(child?.kind).toBe("hide");
    expect(child?.behaviorHint).toMatch(/cower|hide|flee/);

    const merchant = resolveSocialReaction({
      npcSlug: "tessa-windmere",
      occupation: "Merchant",
      personalityTraits: ["nervous"],
      knownAxes: axes,
    });
    expect(merchant?.kind).toMatch(/lock_shop|fear/);
    expect(merchant?.merchantWary || merchant?.shopLocked).toBe(true);

    const guard = resolveSocialReaction({
      npcSlug: "captain-orren",
      occupation: "Guard captain",
      personalityTraits: ["hardliner", "lawful"],
      knownAxes: axes,
    });
    expect(guard?.kind).toMatch(/arrest|challenge/);
    expect(guard!.guardSeverity).toBeGreaterThanOrEqual(2);

    const bandit = resolveSocialReaction({
      npcSlug: "ash-raider-kell",
      occupation: "Bandit",
      personalityTraits: ["outlaw-sympathizer"],
      knownAxes: axes,
    });
    expect(bandit?.kind).toMatch(/respect|offer_illegal/);
    expect(bandit!.relationshipDelta).toBeGreaterThan(0);
  });

  it("mercenaries admire strength; corrupt merchants offer illegal work", () => {
    const axes = criminalAxes({ notoriety: 50, monsterHunter: 40 });
    const merc = resolveSocialReaction({
      npcSlug: "rook-emberfall",
      occupation: "Arena trainer",
      personalityTraits: ["fierce", "battle-hungry"],
      knownAxes: axes,
    });
    expect(merc?.kind).toMatch(/admire_strength|recruit|respect/);

    const black = resolveSocialReaction({
      npcSlug: "shadow-broker-vex",
      occupation: "Merchant",
      personalityTraits: ["corrupt", "greedy"],
      knownAxes: axes,
    });
    expect(black?.kind).toBe("offer_illegal");
    expect(black?.offerIllegalWork).toBe(true);
  });

  it("personality variance: brave vs cowardly on same criminal axes", () => {
    const axes = criminalAxes({ notoriety: 42, criminal: 40 });
    const coward = resolveSocialReaction({
      npcSlug: "nervous-citizen",
      occupation: "Citizen",
      personalityTraits: ["timid", "peaceful"],
      knownAxes: axes,
    });
    expect(coward?.kind).toBe("fear");

    const brave = resolveSocialReaction({
      npcSlug: "brave-citizen",
      occupation: "Citizen",
      personalityTraits: ["brave", "fierce"],
      knownAxes: axes,
    });
    expect(brave?.kind).toBe("challenge");
  });

  it("maps trait aliases from authored personalities", () => {
    const traits = traitsForNpc({
      npcSlug: "plaza-child-mim",
      occupation: "Child",
    });
    expect(hasTrait(traits, "childish") || hasTrait(traits, "cowardly")).toBe(true);
  });
});

describe("Witness system", () => {
  const crime: CrimeEvent = {
    id: "c1",
    kind: "murder",
    regionId: "riftwild-commons",
    x: 100,
    y: 100,
    at: 1_000,
    severity: 5,
  };

  it("does not raise notoriety when unwitnessed", () => {
    const res = resolveCrimeWitnesses(crime, [
      { npcSlug: "far-away", x: 900, y: 900, occupation: "Citizen" },
    ]);
    expect(res.witnessed).toBe(false);
    expect(res.reputationDelta).toEqual({});
  });

  it("witnesses flee/warn/spread and apply reputation when nearby", () => {
    const res = resolveCrimeWitnesses(crime, [
      { npcSlug: "plaza-child-mim", x: 110, y: 100, occupation: "Child" },
      { npcSlug: "guard-east-ryn", x: 120, y: 105, occupation: "Guard" },
      { npcSlug: "tessa-windmere", x: 130, y: 100, occupation: "Merchant" },
    ]);
    expect(res.witnessed).toBe(true);
    expect(res.reputationDelta.notoriety).toBeGreaterThan(0);
    expect(res.witnesses.some((w) => w.action === "cower")).toBe(true);
    expect(res.witnesses.some((w) => w.action === "warn_guard")).toBe(true);
    expect(res.gossipSeed?.regionId).toBe("riftwild-commons");
  });

  it("bandit-only observers do not count as town witnesses", () => {
    const res = resolveCrimeWitnesses(crime, [
      { npcSlug: "ash-raider-kell", x: 105, y: 100, occupation: "Bandit" },
    ]);
    expect(res.witnessed).toBe(false);
  });

  it("crime pipeline seeds gossip only when witnessed", () => {
    let axes = createDefaultReputation();
    let gossip = createEmptyGossipStore();
    let rel = createEmptyRelationships();
    const out = processCrimeEvent({
      crime,
      nearby: [{ npcSlug: "tessa-windmere", x: 100, y: 100, occupation: "Merchant" }],
      axes,
      gossip,
      relationships: rel,
    });
    expect(out.resolution.witnessed).toBe(true);
    expect(out.axes.notoriety).toBeGreaterThan(axes.notoriety);
    expect(out.gossip.rumors.length).toBe(1);
    expect(personalHostility(out.relationships, "tessa-windmere")).toBe(true);
  });
});

describe("Gossip lag", () => {
  beforeEach(() => {
    // pure functions — no reset needed beyond fresh stores
  });

  it("does not grant instant global knowledge", () => {
    const t0 = 1_000_000;
    let store = createEmptyGossipStore();
    store = seedGossipRumor(store, {
      originRegionId: "riftwild-commons",
      text: "A killer walked the plaza.",
      heat: 80,
      axesHint: { notoriety: 70, criminal: 60 },
      at: t0,
    });
    expect(isInstantGlobal(store)).toBe(false);
    expect(regionAwareness(store, "moonwater-coast")).toBe(0);

    // Mid-hop: neighbor may start learning; far coast still lagging
    store = tickGossipSpread(store, t0 + GOSSIP_HOP_MS * 0.5);
    const coastEarly = regionAwareness(store, "moonwater-coast");
    expect(coastEarly).toBeLessThan(50);

    const trueAxes = criminalAxes();
    const knownCoast = knownReputationInRegion(trueAxes, store, "moonwater-coast", t0);
    const knownCommons = knownReputationInRegion(
      trueAxes,
      store,
      "riftwild-commons",
      t0,
    );
    expect(knownCoast.notoriety).toBeLessThan(knownCommons.notoriety);
  });

  it("spreads gradually after hop delay", () => {
    const t0 = 2_000_000;
    let store = createEmptyGossipStore();
    store = seedGossipRumor(store, {
      originRegionId: "riftwild-commons",
      text: "Hero saved the stalls.",
      heat: 70,
      axesHint: { hero: 60 },
      at: t0,
    });
    store = tickGossipSpread(store, t0 + GOSSIP_HOP_MS + 1_000);
    expect(regionAwareness(store, "elderwood-forest")).toBeGreaterThan(0);
    expect(isInstantGlobal(store)).toBe(false);
  });
});

describe("Forgiveness", () => {
  it("offers Credits fines and never requires SOL", () => {
    expect(forgivenessNeverRequiresSol()).toBe(true);
    const offers = listForgivenessOffers(criminalAxes());
    expect(offers.some((o) => o.path === "fine" && o.creditCost > 0)).toBe(true);
    expect(offers.every((o) => o.requiresSol === false)).toBe(true);
  });

  it("applies fine / heroic deed deltas", () => {
    const axes = criminalAxes();
    const fine = applyForgiveness({ axes, path: "fine", credits: 500 });
    expect(fine.ok).toBe(true);
    expect(fine.axes.notoriety).toBeLessThan(axes.notoriety);

    const hero = applyForgiveness({
      axes: fine.axes,
      path: "heroic_deed",
      credits: 0,
    });
    expect(hero.ok).toBe(true);
    expect(hero.axes.hero).toBeGreaterThan(fine.axes.hero);
  });

  it("jail stub sets a timer without SOL", () => {
    const res = applyForgiveness({
      axes: criminalAxes(),
      path: "jail",
      credits: 0,
      now: 10_000,
      regionId: "riftwild-commons",
    });
    expect(res.ok).toBe(true);
    expect(res.jail?.active).toBe(true);
    expect(res.jail!.until).toBeGreaterThan(10_000);
  });
});

describe("Structured memory", () => {
  it("tracks helped / attacked / promises", () => {
    let store = createEmptyRelationships();
    store = recordNpcMemoryEvent(store, "rowan-vale", {
      kind: "helped",
      detail: "escorted child",
    });
    store = recordNpcMemoryEvent(store, "rowan-vale", {
      kind: "promise",
      detail: "return with markers",
    });
    expect(personalGratitude(store, "rowan-vale")).toBe(true);

    store = recordNpcMemoryEvent(store, "tessa-windmere", {
      kind: "attacked",
      detail: "assault",
    });
    expect(personalHostility(store, "tessa-windmere")).toBe(true);
  });
});

describe("Reputation deltas compose", () => {
  it("mercy and cruelty move independently", () => {
    let axes = createDefaultReputation();
    axes = applyReputationDelta(axes, { mercy: 20, cruelty: -5 });
    axes = applyReputationDelta(axes, { cruelty: 40, mercy: -10 });
    expect(axes.cruelty).toBeGreaterThan(axes.mercy);
  });
});
