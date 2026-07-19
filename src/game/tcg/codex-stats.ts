/**
 * Rift Codex aggregate statistics + collection map (regions → species).
 */

import { getCardById, getFactionById, TCG_CARD_FAMILIES } from "@/content/tcg";
import type { FamilyProgress } from "@/game/tcg/card-families";

export type CodexAffinityBucket = {
  affinity: string;
  families: number;
  complete: number;
  percent: number;
  ownedStages: number;
  releasedStages: number;
};

export type CodexRarityBucket = {
  rarity: string;
  owned: number;
  total: number;
};

export type CodexRegionFamily = {
  familyId: string;
  name: string;
  title: string;
  speciesSlug: string;
  portraitArtPath: string;
  percent: number;
  /** Released stages owned / total. */
  ownedStages: number;
  releasedStages: number;
  /** True when every released stage is owned (cosmetic seal). */
  rewardReady: boolean;
  /** At least one released stage owned. */
  discovered: boolean;
};

export type CodexRegionNode = {
  regionId: string;
  regionLabel: string;
  affinity: string;
  factionId: string;
  blurb: string;
  habitatArtPath: string;
  elementIconPath: string;
  families: CodexRegionFamily[];
  percent: number;
  sealedCount: number;
  discoveredCount: number;
};

export type CodexStatsSummary = {
  familyCount: number;
  sealedLines: number;
  discoveredLines: number;
  averagePercent: number;
  releasedStagesOwned: number;
  releasedStagesTotal: number;
  loreChaptersUnlocked: number;
  loreChaptersTotal: number;
  finishesSeen: number;
  finishesTotal: number;
  byAffinity: CodexAffinityBucket[];
  byRarity: CodexRarityBucket[];
  missingMost: { familyId: string; title: string; missing: number }[];
  nearComplete: { familyId: string; title: string; percent: number }[];
};

const AFFINITY_ORDER = [
  "EMBER",
  "TIDE",
  "GROVE",
  "STORM",
  "STONE",
  "FROST",
  "RADIANT",
  "VOID",
  "ALLOY",
  "SPIRIT",
] as const;

const REGION_ART: Record<string, string> = {
  "ember-crags": "/assets/regions/ember-crater.svg",
  "forge-district": "/assets/battle/arenas/ember-crucible.svg",
  moonwater: "/assets/regions/moonwater-coast.svg",
  "brine-coast": "/assets/regions/moonwater-coast.svg",
  "riftwild-commons": "/assets/regions/riftwild-commons.svg",
  elderwood: "/assets/regions/elderwood-forest.svg",
  stormspire: "/assets/regions/stormspire-peaks.svg",
  aerie: "/assets/battle/arenas/storm-spire.svg",
  "frostveil-basin": "/assets/regions/frostveil-basin.svg",
  "stoneheart-canyon": "/assets/regions/stoneheart-canyon.svg",
  "void-hollow": "/assets/regions/void-hollow.svg",
  "alloy-ruins": "/assets/regions/alloy-ruins.svg",
  "spirit-marsh": "/assets/regions/spirit-marsh.svg",
  "radiant-citadel": "/assets/regions/radiant-citadel.svg",
  "celestial-rift": "/assets/regions/celestial-rift.svg",
};

const AFFINITY_HABITAT: Record<
  string,
  { regionId: string; regionLabel: string; art: string; icon: string; blurb: string }
> = {
  EMBER: {
    regionId: "ember-crags",
    regionLabel: "Ember Crags",
    art: "/assets/regions/ember-crater.svg",
    icon: "/assets/battle/elements/ember.svg",
    blurb: "Forge heat and ash ridges where fire bond-lines temper their shells.",
  },
  TIDE: {
    regionId: "moonwater",
    regionLabel: "Moonwater",
    art: "/assets/regions/moonwater-coast.svg",
    icon: "/assets/battle/elements/tide.svg",
    blurb: "Tidal wards and moonfoam coves that keep coastal keepers afloat.",
  },
  GROVE: {
    regionId: "riftwild-commons",
    regionLabel: "Riftwild Commons",
    art: "/assets/regions/riftwild-commons.svg",
    icon: "/assets/battle/elements/grove.svg",
    blurb: "Rooted commons and bloom roads where guardian lines keep their promise.",
  },
  STORM: {
    regionId: "stormspire",
    regionLabel: "Stormspire Peaks",
    art: "/assets/regions/stormspire-peaks.svg",
    icon: "/assets/battle/elements/storm.svg",
    blurb: "Thermal aerie and spire winds for charge-tempo bond-lines.",
  },
};

function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function affinityRank(a: string): number {
  const i = AFFINITY_ORDER.indexOf(a as (typeof AFFINITY_ORDER)[number]);
  return i === -1 ? 99 : i;
}

export function computeCodexStats(families: FamilyProgress[]): CodexStatsSummary {
  const familyCount = families.length;
  const sealedLines = families.filter((f) => f.rewardReady).length;
  const discoveredLines = families.filter((f) =>
    f.stages.some((s) => s.unlocked),
  ).length;
  const averagePercent =
    familyCount === 0
      ? 0
      : Math.round(
          families.reduce((sum, f) => sum + f.percent, 0) / familyCount,
        );

  let releasedStagesOwned = 0;
  let releasedStagesTotal = 0;
  let loreChaptersUnlocked = 0;
  let loreChaptersTotal = 0;
  let finishesSeen = 0;
  let finishesTotal = 0;

  const rarityOwned = new Map<string, number>();
  const rarityTotal = new Map<string, number>();

  for (const fp of families) {
    releasedStagesOwned += fp.releasedOwned;
    releasedStagesTotal += fp.releasedTotal;
    loreChaptersUnlocked += fp.loreUnlocked.length;
    loreChaptersTotal += fp.family.loreChapters.length;
    finishesSeen += fp.finishes.filter((f) => f.ownedAny).length;
    finishesTotal += fp.finishes.length;

    for (const sp of fp.stages) {
      if (sp.stage.status !== "released" || !sp.stage.cardId) continue;
      const card = getCardById(sp.stage.cardId);
      const rarity = (card?.rarity ?? sp.stage.rarityHint ?? "COMMON").toUpperCase();
      rarityTotal.set(rarity, (rarityTotal.get(rarity) ?? 0) + 1);
      if (sp.unlocked) {
        rarityOwned.set(rarity, (rarityOwned.get(rarity) ?? 0) + 1);
      }
    }
  }

  const presentAffinities = [
    ...new Set(families.map((f) => f.family.affinity)),
  ].sort((a, b) => affinityRank(a) - affinityRank(b));

  const byAffinity: CodexAffinityBucket[] = presentAffinities.map((affinity) => {
    const group = families.filter((f) => f.family.affinity === affinity);
    const complete = group.filter((f) => f.rewardReady).length;
    const ownedStages = group.reduce((s, f) => s + f.releasedOwned, 0);
    const releasedStages = group.reduce((s, f) => s + f.releasedTotal, 0);
    const percent =
      group.length === 0
        ? 0
        : Math.round(group.reduce((s, f) => s + f.percent, 0) / group.length);
    return {
      affinity,
      families: group.length,
      complete,
      percent,
      ownedStages,
      releasedStages,
    };
  });

  const rarityOrder = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"];
  const byRarity: CodexRarityBucket[] = [...rarityTotal.keys()]
    .sort((a, b) => {
      const ia = rarityOrder.indexOf(a);
      const ib = rarityOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map((rarity) => ({
      rarity,
      owned: rarityOwned.get(rarity) ?? 0,
      total: rarityTotal.get(rarity) ?? 0,
    }));

  const missingMost = [...families]
    .filter((f) => f.missingCardIds.length > 0)
    .sort((a, b) => b.missingCardIds.length - a.missingCardIds.length)
    .slice(0, 5)
    .map((f) => ({
      familyId: f.family.id,
      title: f.family.title,
      missing: f.missingCardIds.length,
    }));

  const nearComplete = [...families]
    .filter((f) => f.percent > 0 && f.percent < 100)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5)
    .map((f) => ({
      familyId: f.family.id,
      title: f.family.title,
      percent: f.percent,
    }));

  return {
    familyCount,
    sealedLines,
    discoveredLines,
    averagePercent,
    releasedStagesOwned,
    releasedStagesTotal,
    loreChaptersUnlocked,
    loreChaptersTotal,
    finishesSeen,
    finishesTotal,
    byAffinity,
    byRarity,
    missingMost,
    nearComplete,
  };
}

function regionFamilyEntry(fp: FamilyProgress): CodexRegionFamily {
  return {
    familyId: fp.family.id,
    name: fp.family.name,
    title: fp.family.title,
    speciesSlug: fp.family.speciesSlug,
    portraitArtPath: fp.family.portraitArtPath,
    percent: fp.percent,
    ownedStages: fp.releasedOwned,
    releasedStages: fp.releasedTotal,
    rewardReady: fp.rewardReady,
    discovered: fp.stages.some((s) => s.unlocked),
  };
}

/** Map faction region hints → species lines for Collection Map. */
export function buildCollectionMap(
  families: FamilyProgress[],
): CodexRegionNode[] {
  const nodes = new Map<string, CodexRegionNode>();

  const ensureNode = (
    regionId: string,
    affinity: string,
    factionId: string,
    blurb?: string,
  ): CodexRegionNode => {
    const existing = nodes.get(regionId);
    if (existing) return existing;
    const habitat = AFFINITY_HABITAT[affinity];
    const faction = getFactionById(factionId);
    const node: CodexRegionNode = {
      regionId,
      regionLabel: habitat?.regionLabel ?? titleCaseSlug(regionId),
      affinity,
      factionId,
      blurb:
        blurb ??
        habitat?.blurb ??
        faction?.lore ??
        "A Riftwilds habitat where bond-lines gather.",
      habitatArtPath:
        REGION_ART[regionId] ??
        habitat?.art ??
        "/assets/regions/riftwild-commons.svg",
      elementIconPath:
        habitat?.icon ??
        `/assets/battle/elements/${affinity.toLowerCase()}.svg`,
      families: [],
      percent: 0,
      sealedCount: 0,
      discoveredCount: 0,
    };
    nodes.set(regionId, node);
    return node;
  };

  // Ensure every affinity present in catalog has a region plate.
  for (const affinity of [
    ...new Set([
      ...families.map((f) => f.family.affinity),
      ...TCG_CARD_FAMILIES.map((f) => f.affinity),
    ]),
  ]) {
    const habitat = AFFINITY_HABITAT[affinity];
    if (!habitat) continue;
    const sample =
      families.find((f) => f.family.affinity === affinity) ??
      null;
    ensureNode(
      habitat.regionId,
      affinity,
      sample?.family.factionId ??
        TCG_CARD_FAMILIES.find((f) => f.affinity === affinity)?.factionId ??
        "grove-circle",
      habitat.blurb,
    );
  }

  for (const fp of families) {
    const faction = getFactionById(fp.family.factionId);
    const habitat = AFFINITY_HABITAT[fp.family.affinity];
    const hints =
      faction?.regionHints?.length ?
        faction.regionHints
      : habitat
        ? [habitat.regionId]
        : ["riftwild-commons"];
    const regionId = hints[0]!;
    const node = ensureNode(
      regionId,
      fp.family.affinity,
      fp.family.factionId,
      habitat?.blurb ?? faction?.lore,
    );
    node.families.push(regionFamilyEntry(fp));
  }

  return [...nodes.values()]
    .map((n) => {
      const sealedCount = n.families.filter((f) => f.rewardReady).length;
      const discoveredCount = n.families.filter((f) => f.discovered).length;
      return {
        ...n,
        sealedCount,
        discoveredCount,
        percent:
          n.families.length === 0
            ? 0
            : Math.round(
                n.families.reduce((s, f) => s + f.percent, 0) /
                  n.families.length,
              ),
        families: [...n.families].sort(
          (a, b) =>
            Number(b.rewardReady) - Number(a.rewardReady) ||
            b.percent - a.percent ||
            a.name.localeCompare(b.name),
        ),
      };
    })
    .sort((a, b) => affinityRank(a.affinity) - affinityRank(b.affinity));
}

export function habitatArtForAffinity(affinity: string): string {
  return (
    AFFINITY_HABITAT[affinity]?.art ?? "/assets/regions/riftwild-commons.svg"
  );
}

export function elementIconForAffinity(affinity: string): string {
  return (
    AFFINITY_HABITAT[affinity]?.icon ??
    `/assets/battle/elements/${affinity.toLowerCase()}.svg`
  );
}
