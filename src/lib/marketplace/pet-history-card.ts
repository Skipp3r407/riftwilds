/**
 * Marketplace Evolution — rich pet history card model for listings.
 * Extends disclosure-friendly fields without changing purchase settlement.
 */

import type { GenotypeV2 } from "@/game/genetics/genetics-v2";
import type { RiftlingAiState } from "@/game/riftling-ai/types";
import type { TimelineEvent } from "@/game/timeline/types";

export type PetHistoryCard = {
  publicPetId: string;
  displayName: string;
  speciesSlug: string;
  speciesName: string;
  rarity: string;
  generation: number;
  geneticsSummary: string;
  geneticsV2?: Pick<GenotypeV2, "summary" | "generation" | "hiddenCarriers" | "schemaVersion">;
  personalityHighlights: string[];
  mood?: string;
  memories: { label: string; kind: string }[];
  achievements: string[];
  timelinePreview: { title: string; at: string }[];
  careScoreHint?: string;
  friendshipCount: number;
  disclaimer: string;
};

export function buildPetHistoryCard(input: {
  publicPetId: string;
  displayName: string;
  speciesSlug: string;
  speciesName: string;
  rarity: string;
  genotype?: GenotypeV2;
  ai?: RiftlingAiState;
  achievementLabels?: string[];
  timeline?: TimelineEvent[];
  careScoreHint?: string;
}): PetHistoryCard {
  const personalityHighlights = input.ai
    ? Object.entries(input.ai.personality)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k, v]) => `${k} ${v}`)
    : [];

  return {
    publicPetId: input.publicPetId,
    displayName: input.displayName,
    speciesSlug: input.speciesSlug,
    speciesName: input.speciesName,
    rarity: input.rarity,
    generation: input.genotype?.generation ?? 1,
    geneticsSummary: input.genotype?.summary ?? "Lineage summary unavailable",
    geneticsV2: input.genotype
      ? {
          summary: input.genotype.summary,
          generation: input.genotype.generation,
          hiddenCarriers: input.genotype.hiddenCarriers,
          schemaVersion: input.genotype.schemaVersion,
        }
      : undefined,
    personalityHighlights,
    mood: input.ai?.mood,
    memories: (input.ai?.memories ?? []).slice(0, 5).map((m) => ({
      label: m.label,
      kind: m.kind,
    })),
    achievements: input.achievementLabels ?? [],
    timelinePreview: (input.timeline ?? [])
      .filter((t) => t.scope === "pet" || t.entityId === input.publicPetId)
      .slice(0, 5)
      .map((t) => ({ title: t.title, at: t.at })),
    careScoreHint: input.careScoreHint,
    friendshipCount: input.ai?.friendships.length ?? 0,
    disclaimer:
      "Pet history is for entertainment and transparency. Listings do not guarantee future value, breeding outcomes, or rewards.",
  };
}
