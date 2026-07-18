/**
 * Riftling genetics pedigree / lineage stories — extends genetics-v2.
 * Cosmetic & narrative only; no combat power from rare alleles.
 */

import {
  buildGenotypeV2,
  previewInheritance,
  type GenotypeV2,
} from "@/game/genetics/genetics-v2";

export type PedigreeNode = {
  petId: string;
  displayName: string;
  generation: number;
  genotypeSummary: string;
  parentIds: string[];
  storyTrait?: string;
};

export type LineageBook = {
  rootPetId: string;
  nodes: PedigreeNode[];
  depth: number;
  legendaryHint: string | null;
  note: string;
};

const STORY_TRAITS = [
  "Remembers plaza lanterns",
  "Hums during Rift Storms",
  "Prefers ember ash naps",
  "Collects smooth riftglass",
  "Bows to town criers",
  "Chases aurora dust",
] as const;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function storyTraitForSeed(seed: string): string {
  return STORY_TRAITS[hash(seed) % STORY_TRAITS.length]!;
}

export function buildPedigreeNode(input: {
  petId: string;
  displayName: string;
  geneticsSeed: string;
  traitSeed: string;
  cosmeticSeed: string;
  generation?: number;
  parentIds?: string[];
}): PedigreeNode {
  const genotype = buildGenotypeV2({
    geneticsSeed: input.geneticsSeed,
    traitSeed: input.traitSeed,
    cosmeticSeed: input.cosmeticSeed,
    generation: input.generation,
  });
  return {
    petId: input.petId,
    displayName: input.displayName,
    generation: genotype.generation,
    genotypeSummary: genotype.summary,
    parentIds: input.parentIds ?? [],
    storyTrait: storyTraitForSeed(input.geneticsSeed),
  };
}

export function buildLineageBook(params: {
  root: PedigreeNode;
  parents?: PedigreeNode[];
  grandparents?: PedigreeNode[];
}): LineageBook {
  const nodes = [
    params.root,
    ...(params.parents ?? []),
    ...(params.grandparents ?? []),
  ];
  const hasLatentStory = nodes.some((n) =>
    n.genotypeSummary.toLowerCase().includes("aurora"),
  );
  return {
    rootPetId: params.root.petId,
    nodes,
    depth: Math.max(...nodes.map((n) => n.generation), 1),
    legendaryHint: hasLatentStory
      ? "Aurora marks whisper across this bloodline — cosmetic legend only."
      : null,
    note: "Genetics tell stories. Alleles never grant combat power or SOL value.",
  };
}

export function previewLitterStory(
  parentA: GenotypeV2,
  parentB: GenotypeV2,
  litterSeed: string,
): { preview: GenotypeV2; storyTrait: string; blurb: string } {
  const preview = previewInheritance(parentA, parentB, litterSeed);
  const storyTrait = storyTraitForSeed(litterSeed);
  return {
    preview,
    storyTrait,
    blurb: `Preview litter · Gen ${preview.generation} · ${preview.summary} · “${storyTrait}”`,
  };
}
