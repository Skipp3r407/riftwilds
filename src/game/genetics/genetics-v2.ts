/**
 * Genetics 2.0 — extends hatchery geneticsSeed / traitSeed / cosmeticSeed
 * with structured alleles, dominance, and inheritance previews.
 * Backward compatible: v1 seeds still drive species pick + biographies.
 */

export const GENETICS_SCHEMA_VERSION = 2;

export type AlleleExpression = "dominant" | "recessive" | "codominant" | "latent";

export type TraitLocus =
  | "coat_pattern"
  | "eye_sheen"
  | "aura_tint"
  | "temperament_bias"
  | "affinity_lean"
  | "size_band"
  | "voice_timbre"
  | "mutation_slot";

export type Allele = {
  code: string;
  locus: TraitLocus;
  expression: AlleleExpression;
  label: string;
  rarityWeight: number;
};

export type GenotypeV2 = {
  schemaVersion: typeof GENETICS_SCHEMA_VERSION;
  /** Original hatchery seeds preserved for v1 consumers. */
  legacy: {
    geneticsSeed: string;
    traitSeed: string;
    cosmeticSeed: string;
  };
  alleles: Allele[];
  generation: number;
  inbreedingCoefficient: number;
  hiddenCarriers: string[];
  summary: string;
};

const LOCUS_POOLS: Record<TraitLocus, Omit<Allele, "locus">[]> = {
  coat_pattern: [
    { code: "P_solid", expression: "dominant", label: "Solid coat", rarityWeight: 40 },
    { code: "P_banded", expression: "codominant", label: "Banded coat", rarityWeight: 30 },
    { code: "P_riftvein", expression: "recessive", label: "Riftvein coat", rarityWeight: 15 },
    { code: "P_aurora", expression: "latent", label: "Aurora ghost marks", rarityWeight: 5 },
  ],
  eye_sheen: [
    { code: "E_clear", expression: "dominant", label: "Clear eyes", rarityWeight: 45 },
    { code: "E_glow", expression: "codominant", label: "Glow sheen", rarityWeight: 25 },
    { code: "E_void", expression: "recessive", label: "Void sheen", rarityWeight: 10 },
  ],
  aura_tint: [
    { code: "A_neutral", expression: "dominant", label: "Neutral aura", rarityWeight: 40 },
    { code: "A_seasonal", expression: "codominant", label: "Seasonal tint", rarityWeight: 25 },
    { code: "A_storm", expression: "recessive", label: "Storm tint", rarityWeight: 12 },
  ],
  temperament_bias: [
    { code: "T_steady", expression: "dominant", label: "Steady temperament", rarityWeight: 35 },
    { code: "T_curious", expression: "codominant", label: "Curious bias", rarityWeight: 30 },
    { code: "T_bold", expression: "recessive", label: "Bold bias", rarityWeight: 15 },
  ],
  affinity_lean: [
    { code: "F_balanced", expression: "dominant", label: "Balanced affinity lean", rarityWeight: 40 },
    { code: "F_primary", expression: "codominant", label: "Primary affinity lean", rarityWeight: 30 },
    { code: "F_rift", expression: "latent", label: "Rift affinity whisper", rarityWeight: 8 },
  ],
  size_band: [
    { code: "S_typical", expression: "dominant", label: "Typical size", rarityWeight: 50 },
    { code: "S_compact", expression: "recessive", label: "Compact frame", rarityWeight: 20 },
    { code: "S_tall", expression: "recessive", label: "Tall frame", rarityWeight: 15 },
  ],
  voice_timbre: [
    { code: "V_soft", expression: "dominant", label: "Soft voice", rarityWeight: 40 },
    { code: "V_chime", expression: "codominant", label: "Chime voice", rarityWeight: 25 },
    { code: "V_rumble", expression: "recessive", label: "Rumble voice", rarityWeight: 15 },
  ],
  mutation_slot: [
    { code: "M_none", expression: "dominant", label: "No active mutation", rarityWeight: 70 },
    { code: "M_spark", expression: "latent", label: "Spark mutation", rarityWeight: 10 },
    { code: "M_bloom", expression: "latent", label: "Bloom mutation", rarityWeight: 8 },
  ],
};

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickAllele(locus: TraitLocus, rng: () => number): Allele {
  const pool = LOCUS_POOLS[locus];
  const total = pool.reduce((s, a) => s + a.rarityWeight, 0);
  let cursor = rng() * total;
  for (const a of pool) {
    cursor -= a.rarityWeight;
    if (cursor <= 0) return { ...a, locus };
  }
  return { ...pool[0]!, locus };
}

export function buildGenotypeV2(input: {
  geneticsSeed: string;
  traitSeed: string;
  cosmeticSeed: string;
  generation?: number;
}): GenotypeV2 {
  const rng = mulberry32(
    hashStr(`${input.geneticsSeed}|${input.traitSeed}|${input.cosmeticSeed}|v2`),
  );
  const loci = Object.keys(LOCUS_POOLS) as TraitLocus[];
  const alleles = loci.map((locus) => pickAllele(locus, rng));
  const hiddenCarriers = alleles
    .filter((a) => a.expression === "recessive" || a.expression === "latent")
    .map((a) => a.code);
  const visible = alleles
    .filter((a) => a.expression === "dominant" || a.expression === "codominant")
    .map((a) => a.label);

  return {
    schemaVersion: GENETICS_SCHEMA_VERSION,
    legacy: {
      geneticsSeed: input.geneticsSeed,
      traitSeed: input.traitSeed,
      cosmeticSeed: input.cosmeticSeed,
    },
    alleles,
    generation: input.generation ?? 1,
    inbreedingCoefficient: Math.round(rng() * 15) / 100,
    hiddenCarriers,
    summary: visible.slice(0, 4).join(" · ") || "Unremarkable lineage",
  };
}

/** Breeding preview — blends parent alleles without minting offspring. */
export function previewInheritance(
  parentA: GenotypeV2,
  parentB: GenotypeV2,
  previewSeed: string,
): GenotypeV2 {
  const rng = mulberry32(hashStr(previewSeed));
  const alleles: Allele[] = [];
  for (const locus of Object.keys(LOCUS_POOLS) as TraitLocus[]) {
    const a = parentA.alleles.find((x) => x.locus === locus);
    const b = parentB.alleles.find((x) => x.locus === locus);
    const pick = rng() < 0.5 ? a : b;
    alleles.push(pick ?? pickAllele(locus, rng));
  }
  const generation = Math.max(parentA.generation, parentB.generation) + 1;
  return {
    schemaVersion: GENETICS_SCHEMA_VERSION,
    legacy: {
      geneticsSeed: previewSeed,
      traitSeed: `${previewSeed}:trait`,
      cosmeticSeed: `${previewSeed}:cosmetic`,
    },
    alleles,
    generation,
    inbreedingCoefficient: Math.min(
      0.5,
      (parentA.inbreedingCoefficient + parentB.inbreedingCoefficient) / 2 + 0.02,
    ),
    hiddenCarriers: alleles
      .filter((a) => a.expression === "recessive" || a.expression === "latent")
      .map((a) => a.code),
    summary: alleles
      .filter((a) => a.expression !== "latent")
      .slice(0, 4)
      .map((a) => a.label)
      .join(" · "),
  };
}
