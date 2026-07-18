import { beforeEach, describe, expect, it } from "vitest";
import { buildPedigreeNode, previewLitterStory } from "@/game/genetics/pedigree";
import { buildGenotypeV2 } from "@/game/genetics/genetics-v2";
import { joinFestivalActivity, listActiveFestivals } from "@/game/festivals/participation";
import { resetCreditLedgerForTests } from "@/lib/credits/ledger";
import { settleEnsureStarter as ensureCredits } from "@/lib/economy/core/settlement";
import { resetLandStoreForTests } from "@/lib/economy/land";
import { discoverSecret, resetHiddenLoreForTests } from "@/lib/hidden-lore";
import {
  enterHousingCompetition,
  resetHousingCompetitionsForTests,
} from "@/lib/housing-competitions";
import { practiceLifeSkill, resetLifeSkillsForTests } from "@/lib/life-skills";
import { generateDailyNewspaper } from "@/lib/newspaper";
import { recordNpcDeed, resetNpcBondsForTests } from "@/lib/npc-relationships";
import {
  charterPlayerCity,
  listAvailableCitySeedParcels,
  resetPlayerCitiesForTests,
} from "@/lib/player-cities";
import {
  engageWorldBoss,
  resetWorldBossForTests,
  spawnWorldBoss,
} from "@/lib/world-bosses";
import { resetWorldEventsStoreForTests } from "@/lib/world-events";

describe("living world retention cores", () => {
  beforeEach(() => {
    resetWorldEventsStoreForTests();
    resetWorldBossForTests();
    resetPlayerCitiesForTests();
    resetLandStoreForTests();
    resetCreditLedgerForTests();
    resetNpcBondsForTests();
    resetHousingCompetitionsForTests();
    resetHiddenLoreForTests();
    resetLifeSkillsForTests();
  });

  it("charters a player city from an available parcel", () => {
    ensureCredits("founder-1");
    const parcel = listAvailableCitySeedParcels()[0];
    expect(parcel).toBeTruthy();
    const city = charterPlayerCity(
      {
        name: "Lanternhold",
        regionSlug: "riftwild-commons",
        founderUserId: "founder-1",
        seedParcelId: parcel!.parcelId,
      },
      "req-city-1",
    );
    expect(city.ok).toBe(true);
    if (city.ok) {
      expect(city.city.districts.length).toBeGreaterThan(0);
      expect(city.city.members[0]?.role).toBe("founder");
    }
  });

  it("builds genetics pedigree story traits", () => {
    const node = buildPedigreeNode({
      petId: "p1",
      displayName: "Ashkip",
      geneticsSeed: "gen_abc",
      traitSeed: "trait_abc",
      cosmeticSeed: "cos_abc",
    });
    expect(node.storyTrait).toBeTruthy();
    const a = buildGenotypeV2({
      geneticsSeed: "a",
      traitSeed: "a2",
      cosmeticSeed: "a3",
    });
    const b = buildGenotypeV2({
      geneticsSeed: "b",
      traitSeed: "b2",
      cosmeticSeed: "b3",
    });
    const litter = previewLitterStory(a, b, "litter_1");
    expect(litter.preview.generation).toBeGreaterThanOrEqual(2);
  });

  it("records living NPC relationship deeds", () => {
    const bond = recordNpcDeed({
      userId: "k1",
      npcId: "mira-eggwarden",
      kind: "quest_help",
    });
    expect(bond.score).toBeGreaterThan(0);
    expect(bond.band).toMatch(/neutral|friendly|trusted/);
  });

  it("accepts housing competition entries", () => {
    const entry = enterHousingCompetition({
      userId: "decorator",
      blurb: "Lanterns and pet beds",
      decorScore: 70,
      visitLikes: 12,
    });
    expect(entry.ok).toBe(true);
  });

  it("unlocks hidden lore only when engaged", () => {
    const blocked = discoverSecret({
      userId: "explorer",
      discoveryId: "lore-plaza-understone",
      engaged: false,
      requestId: "lore-1",
    });
    expect(blocked.ok).toBe(false);
    const ok = discoverSecret({
      userId: "explorer",
      discoveryId: "lore-plaza-understone",
      engaged: true,
      requestId: "lore-2",
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.title).toContain("Understone");
  });

  it("prints a daily newspaper with masthead", () => {
    const issue = generateDailyNewspaper(Date.parse("2026-07-18T15:00:00Z"));
    expect(issue.masthead).toBe("The Riftwild Herald");
    expect(issue.articles.length).toBeGreaterThan(2);
  });

  it("spawns and hits an open-world boss with anti-AFK participation", () => {
    spawnWorldBoss({ now: Date.parse("2026-07-18T16:00:00Z") });
    const hit = engageWorldBoss({
      userId: "slayer",
      damage: 100,
      signals: ["MOVE", "COMBAT"],
      now: Date.parse("2026-07-18T16:00:05Z"),
    });
    expect(hit.ok).toBe(true);
    expect(hit.boss?.hp).toBeLessThan(10_000);
  });

  it("practices life skills when engaged", () => {
    const r = practiceLifeSkill({
      userId: "crafter",
      skillId: "crafting",
      engaged: true,
      requestId: "skill-1",
    });
    expect(r.ok).toBe(true);
  });

  it("festival join respects active calendar (or reports inactive honestly)", () => {
    const active = listActiveFestivals(Date.now());
    if (active[0]) {
      const join = joinFestivalActivity({
        userId: "festive",
        festivalKey: active[0].festival.key,
        activity: active[0].festival.activities[0]!,
        engaged: true,
        requestId: "fest-1",
      });
      expect(join.ok).toBe(true);
    } else {
      const join = joinFestivalActivity({
        userId: "festive",
        festivalKey: "bloomtide_festival",
        activity: "herb_contest",
        engaged: true,
        requestId: "fest-1",
      });
      expect(join.ok).toBe(false);
    }
  });
});
