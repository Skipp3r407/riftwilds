/**
 * Crime → witnesses → reputation → gossip pipeline.
 */

import {
  applyReputationDelta,
  type PlayerReputation,
  type ReputationStore,
} from "@/game/npc-ai/reputation";
import {
  seedGossipRumor,
  type GossipStore,
} from "@/game/npc-ai/gossip";
import {
  resolveCrimeWitnesses,
  type CrimeEvent,
  type CrimeResolution,
  type WitnessActor,
} from "@/game/npc-ai/witnesses";
import { recordNpcMemoryEvent } from "@/game/npc-ai/npc-memory-events";
import type { NpcRelationshipStore } from "@/game/npc-ai/relationships";

export type CrimePipelineResult = {
  resolution: CrimeResolution;
  axes: PlayerReputation;
  gossip: GossipStore;
  relationships: NpcRelationshipStore;
};

export function processCrimeEvent(input: {
  crime: CrimeEvent;
  nearby: WitnessActor[];
  axes: PlayerReputation;
  gossip: GossipStore;
  relationships: NpcRelationshipStore;
}): CrimePipelineResult {
  const resolution = resolveCrimeWitnesses(input.crime, input.nearby);
  let axes = input.axes;
  let gossip = input.gossip;
  let relationships = input.relationships;

  if (resolution.witnessed) {
    axes = applyReputationDelta(axes, resolution.reputationDelta);
    if (resolution.gossipSeed) {
      gossip = seedGossipRumor(gossip, {
        originRegionId: resolution.gossipSeed.regionId,
        text: resolution.gossipSeed.text,
        heat: resolution.gossipSeed.heat,
        axesHint: {
          notoriety: axes.notoriety,
          criminal: axes.criminal,
          infamy: axes.infamy,
          cruelty: axes.cruelty,
        },
        at: input.crime.at,
      });
    }
    for (const w of resolution.witnesses) {
      if (w.action === "ignore" || w.action === "join_crime") continue;
      relationships = recordNpcMemoryEvent(relationships, w.npcSlug, {
        kind: "witnessed_crime",
        detail: input.crime.kind,
        regionId: input.crime.regionId,
        at: input.crime.at,
      });
    }
  }

  return { resolution, axes, gossip, relationships };
}

export function persistReputationAxes(
  store: ReputationStore,
  axes: PlayerReputation,
  regionId?: string,
): ReputationStore {
  return {
    ...store,
    axes,
    lastDeedRegionId: regionId ?? store.lastDeedRegionId,
    updatedAt: Date.now(),
  };
}
