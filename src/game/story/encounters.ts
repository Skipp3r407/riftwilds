import type { EncounterDef } from "@/game/story/types";

export const ENCOUNTER_CATALOG: EncounterDef[] = [
  {
    key: "wandering_archivist",
    name: "Wandering Archivist",
    regionKey: "riftwild-commons",
    weight: 30,
    storyArcKey: "first_rift_light",
    description: "Echo appears near the plaza lanterns with a lore prompt.",
  },
  {
    key: "ember_scout",
    name: "Ember Scout",
    regionKey: "ember-crater",
    weight: 20,
    minReputation: { wardens: 1 },
    description: "A scout offers a short expedition tip during ash storms.",
  },
  {
    key: "tide_message",
    name: "Bottle Message",
    regionKey: "moonwater-coast",
    weight: 15,
    description: "A sealed note hints at a coastal discovery node.",
  },
  {
    key: "community_shrine",
    name: "Community Shrine Call",
    regionKey: "elderwood-forest",
    weight: 10,
    storyArcKey: "bloomtide_gathering",
    description: "Seasonal call to restore the grove shrine.",
  },
];

export function weightedEncounterPick(
  regionKey: string,
  reputation: Record<string, number>,
  roll: number,
): EncounterDef | null {
  const eligible = ENCOUNTER_CATALOG.filter((e) => {
    if (e.regionKey && e.regionKey !== regionKey) return false;
    if (e.minReputation) {
      for (const [k, need] of Object.entries(e.minReputation)) {
        if ((reputation[k] ?? 0) < need) return false;
      }
    }
    return true;
  });
  if (eligible.length === 0) return null;
  const total = eligible.reduce((s, e) => s + e.weight, 0);
  let cursor = roll % total;
  for (const e of eligible) {
    cursor -= e.weight;
    if (cursor < 0) return e;
  }
  return eligible[eligible.length - 1] ?? null;
}
