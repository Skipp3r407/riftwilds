/**
 * Discoverable treasures, POIs, habitats, enemy territories, bosses, and perks.
 * Secret names/coords stay internal until discovery progress unlocks them.
 */

import type {
  DiscoverableDef,
  ExplorationPerkDef,
} from "@/game/world-exploration/types";
import { REGION_IDENTITIES } from "@/game/world-maps/regions";
import { ENEMY_DEFS } from "@/game/world-maps/defs/enemies";
import { getBlueprint } from "@/game/world-maps/blueprints";

/** Hand-authored secrets + procedural fills from blueprints. */
const HAND_AUTHORED: DiscoverableDef[] = [
  {
    id: "treasure-commons-waterfall",
    kind: "treasure",
    regionSlug: "riftwild-commons",
    secretName: "Cascade Cache",
    clue: "Something glints near falling water in the Commons.",
    x: 0,
    y: 0,
    discoverRadius: 72,
    clueQuestKeys: ["explore-commons-plaza"],
    rewards: [{ kind: "credits", amount: 40, label: "+40 Credits" }],
  },
  {
    id: "habitat-commons-spirit-spark",
    kind: "habitat",
    regionSlug: "riftwild-commons",
    secretName: "Spirit Spark Hollow",
    clue: "Soft lights gather after dusk near the plaza edge.",
    x: 1180,
    y: 640,
    discoverRadius: 96,
    habitatSpeciesSlug: "spirit-spark",
    codexSlug: "spirit-spark",
  },
  {
    id: "poi-commons-archive-alcove",
    kind: "poi",
    regionSlug: "riftwild-commons",
    secretName: "Archive Alcove",
    clue: "Scholars whisper about a quiet alcove behind the Rift Archive.",
    x: 900,
    y: 700,
    discoverRadius: 64,
    codexSlug: "riftwild-commons",
  },
  {
    id: "perk-pathfinder-commons",
    kind: "perk",
    regionSlug: "riftwild-commons",
    secretName: "Commons Pathfinder",
    clue: "Walk every path until the map feels like home.",
    x: 1024,
    y: 768,
    discoverRadius: 48,
    perkId: "perk-commons-pathfinder",
  },
  {
    id: "treasure-ember-ash-vault",
    kind: "treasure",
    regionSlug: "ember-crater",
    secretName: "Ash Vault",
    clue: "Heat-warped metal sings under the crater rim.",
    x: 480,
    y: 520,
    discoverRadius: 80,
    clueQuestKeys: ["story-ember-call", "explore-basin-ridge"],
    rewards: [{ kind: "credits", amount: 55, label: "+55 Credits" }],
  },
  {
    id: "habitat-ember-cinder",
    kind: "habitat",
    regionSlug: "ember-crater",
    secretName: "Cinder Crawl Nest",
    clue: "Ember tracks circle a warm hollow.",
    x: 360,
    y: 440,
    discoverRadius: 100,
    habitatSpeciesSlug: "cinderling",
    codexSlug: "cinderling",
  },
  {
    id: "treasure-elderwood-root-cache",
    kind: "treasure",
    regionSlug: "elderwood-forest",
    secretName: "Root Cache",
    clue: "Moss grows thicker where keepers once rested.",
    x: 420,
    y: 380,
    discoverRadius: 80,
    clueQuestKeys: ["explore-grove-trail"],
  },
  {
    id: "habitat-elderwood-grove",
    kind: "habitat",
    regionSlug: "elderwood-forest",
    secretName: "Grove Sprite Glade",
    clue: "Leaves rearrange into a quiet ring after rain.",
    x: 500,
    y: 360,
    discoverRadius: 110,
    habitatSpeciesSlug: "grovetail",
    codexSlug: "grovetail",
  },
  {
    id: "treasure-moonwater-tide-chest",
    kind: "treasure",
    regionSlug: "moonwater-coast",
    secretName: "Tide Chest",
    clue: "Low tide reveals a seam in the wet sand.",
    x: 400,
    y: 500,
    discoverRadius: 90,
  },
  {
    id: "habitat-moonwater-tide",
    kind: "habitat",
    regionSlug: "moonwater-coast",
    secretName: "Tide Pool Nursery",
    clue: "Shells clack in rhythm when the moon is high.",
    x: 340,
    y: 460,
    discoverRadius: 100,
    habitatSpeciesSlug: "tideling",
    codexSlug: "tideling",
  },
];

export const EXPLORATION_PERKS: ExplorationPerkDef[] = [
  {
    id: "perk-commons-pathfinder",
    name: "Commons Pathfinder",
    description: "Slightly wider fog reveal while walking in Riftwild Commons.",
    regionSlug: "riftwild-commons",
    hiddenUntilEarned: true,
    grantFrom: "perk-pathfinder-commons",
  },
  {
    id: "perk-ash-scout",
    name: "Ash Scout",
    description: "Enemy territories in Ember Crater mark earlier after first contact.",
    regionSlug: "ember-crater",
    hiddenUntilEarned: true,
    grantFrom: "treasure-ember-ash-vault",
  },
  {
    id: "perk-cartographer",
    name: "Rift Cartographer",
    description: "World map search remembers recent discoveries across regions.",
    hiddenUntilEarned: true,
    grantFrom: "milestone:regions_6",
  },
  {
    id: "perk-treasure-sense",
    name: "Treasure Sense",
    description: "Vague region clues appear for nearby undiscovered caches.",
    hiddenUntilEarned: true,
    grantFrom: "milestone:treasures_3",
  },
];

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function fromBlueprints(): DiscoverableDef[] {
  const out: DiscoverableDef[] = [];

  for (const region of REGION_IDENTITIES) {
    let bp;
    try {
      bp = getBlueprint(region.slug);
    } catch {
      continue;
    }

    for (const o of bp.objects) {
      if (o.type === "chest") {
        out.push({
          id: `treasure-${region.slug}-${o.id}`,
          kind: "treasure",
          regionSlug: region.slug,
          secretName: o.label ?? "Hidden Cache",
          clue: `A sealed cache rests somewhere in ${region.name}.`,
          x: o.x,
          y: o.y,
          discoverRadius: 72,
        });
      }
      if (o.type === "hidden_area") {
        out.push({
          id: `hidden-${region.slug}-${o.id}`,
          kind: "hidden_area",
          regionSlug: region.slug,
          secretName: o.label ?? "Hidden Hollow",
          clue: `An unmarked hollow waits in ${region.name}.`,
          x: o.x,
          y: o.y,
          discoverRadius: 88,
        });
      }
      if (o.type === "boss_arena") {
        const bossId = String(o.metadata?.bossId ?? "");
        const boss = ENEMY_DEFS.find((e) => e.id === bossId);
        out.push({
          id: `boss-${region.slug}-${o.id}`,
          kind: "world_boss",
          regionSlug: region.slug,
          secretName: boss?.name ?? o.label ?? "World Boss",
          clue: `A powerful presence stirs in ${region.name}.`,
          x: o.x + (o.width ?? 0) / 2,
          y: o.y + (o.height ?? 0) / 2,
          discoverRadius: 120,
          bossId: bossId || undefined,
          codexSlug: region.slug,
        });
      }
      if (o.type === "enemy_spawn") {
        const enemyId = String(o.metadata?.enemyId ?? o.id);
        const enemy = ENEMY_DEFS.find((e) => e.id === enemyId);
        out.push({
          id: `territory-${region.slug}-${o.id}`,
          kind: "enemy_territory",
          regionSlug: region.slug,
          secretName: enemy ? `${enemy.name} Territory` : "Hostile Ground",
          clue: `Wildlife grows restless in ${region.name}.`,
          x: o.x + (o.width ?? 0) / 2,
          y: o.y + (o.height ?? 0) / 2,
          discoverRadius: 140,
          enemyId: enemy?.id,
        });
      }
      if (
        o.type === "decoration" &&
        o.id.startsWith("lm-") &&
        o.label
      ) {
        out.push({
          id: `landmark-${region.slug}-${o.id}`,
          kind: "landmark",
          regionSlug: region.slug,
          secretName: o.label,
          clue: `A notable landmark stands in ${region.name}.`,
          x: o.x,
          y: o.y,
          discoverRadius: 96,
          codexSlug: region.slug,
        });
      }
    }

    // One rare habitat per mid/late region if not hand-authored
    if (
      !HAND_AUTHORED.some(
        (d) => d.regionSlug === region.slug && d.kind === "habitat",
      ) &&
      region.unlockTier !== "start"
    ) {
      const seed = hashSeed(region.slug);
      out.push({
        id: `habitat-${region.slug}-rare`,
        kind: "habitat",
        regionSlug: region.slug,
        secretName: `${region.name} Rare Nest`,
        clue: `Rare Riftlings favor a quiet corner of ${region.name}.`,
        x: bp.spawn.x + ((seed % 7) - 3) * 48,
        y: bp.spawn.y + (((seed >> 3) % 7) - 3) * 48,
        discoverRadius: 110,
        habitatSpeciesSlug: region.slug,
        codexSlug: region.slug,
      });
    }
  }

  return out;
}

let cached: DiscoverableDef[] | null = null;

/** Full discoverable catalog (hand-authored + blueprint-derived). */
export function getDiscoverableCatalog(): DiscoverableDef[] {
  if (cached) return cached;
  const fromBp = fromBlueprints();
  const ids = new Set(HAND_AUTHORED.map((d) => d.id));

  // Resolve commons waterfall coords from blueprint chest if present
  const authored = HAND_AUTHORED.map((d) => {
    if (d.id !== "treasure-commons-waterfall") return d;
    const chest = fromBp.find((x) => x.id.includes("chest-waterfall"));
    if (!chest) return d;
    return { ...d, x: chest.x, y: chest.y };
  });

  const merged = [
    ...authored,
    ...fromBp.filter((d) => {
      if (ids.has(d.id)) return false;
      // Prefer hand-authored waterfall over duplicate chest entry
      if (d.id.includes("chest-waterfall") && ids.has("treasure-commons-waterfall")) {
        return false;
      }
      return true;
    }),
  ];
  cached = merged;
  return merged;
}

/** Test helper. */
export function resetDiscoverableCatalogCache(): void {
  cached = null;
}

export function getDiscoverableById(id: string): DiscoverableDef | undefined {
  return getDiscoverableCatalog().find((d) => d.id === id);
}

export function listDiscoverablesForRegion(regionSlug: string): DiscoverableDef[] {
  return getDiscoverableCatalog().filter((d) => d.regionSlug === regionSlug);
}

export function getPerkDef(perkId: string): ExplorationPerkDef | undefined {
  return EXPLORATION_PERKS.find((p) => p.id === perkId);
}
