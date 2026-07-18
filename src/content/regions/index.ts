import { COMMONS_CONTENT_PACK } from "@/content/regions/packs/commons";
import { EMBER_CRATER_CONTENT_PACK } from "@/content/regions/packs/ember-crater";
import { MOONWATER_COAST_CONTENT_PACK } from "@/content/regions/packs/moonwater-coast";
import { ELDERWOOD_FOREST_CONTENT_PACK } from "@/content/regions/packs/elderwood-forest";
import { STORMSPIRE_PEAKS_CONTENT_PACK } from "@/content/regions/packs/stormspire-peaks";
import { STONEHEART_CANYON_CONTENT_PACK } from "@/content/regions/packs/stoneheart-canyon";
import { FROSTVEIL_BASIN_CONTENT_PACK } from "@/content/regions/packs/frostveil-basin";
import { RADIANT_CITADEL_CONTENT_PACK } from "@/content/regions/packs/radiant-citadel";
import { VOID_HOLLOW_CONTENT_PACK } from "@/content/regions/packs/void-hollow";
import { ALLOY_RUINS_CONTENT_PACK } from "@/content/regions/packs/alloy-ruins";
import { SPIRIT_MARSH_CONTENT_PACK } from "@/content/regions/packs/spirit-marsh";
import { CELESTIAL_RIFT_CONTENT_PACK } from "@/content/regions/packs/celestial-rift";
import { SPIRIT_REALM_CONTENT_PACK } from "@/content/regions/packs/spirit-realm";
import { buildScaffoldPacks } from "@/content/regions/packs/scaffold";
import {
  packHasDistinctContent,
  type RegionContentPack,
} from "@/content/regions/types";

export * from "@/content/regions/types";
export { COMMONS_CONTENT_PACK } from "@/content/regions/packs/commons";
export { EMBER_CRATER_CONTENT_PACK } from "@/content/regions/packs/ember-crater";
export { MOONWATER_COAST_CONTENT_PACK } from "@/content/regions/packs/moonwater-coast";
export { ELDERWOOD_FOREST_CONTENT_PACK } from "@/content/regions/packs/elderwood-forest";
export { STORMSPIRE_PEAKS_CONTENT_PACK } from "@/content/regions/packs/stormspire-peaks";
export { STONEHEART_CANYON_CONTENT_PACK } from "@/content/regions/packs/stoneheart-canyon";
export { FROSTVEIL_BASIN_CONTENT_PACK } from "@/content/regions/packs/frostveil-basin";
export { RADIANT_CITADEL_CONTENT_PACK } from "@/content/regions/packs/radiant-citadel";
export { VOID_HOLLOW_CONTENT_PACK } from "@/content/regions/packs/void-hollow";
export { ALLOY_RUINS_CONTENT_PACK } from "@/content/regions/packs/alloy-ruins";
export { SPIRIT_MARSH_CONTENT_PACK } from "@/content/regions/packs/spirit-marsh";
export { CELESTIAL_RIFT_CONTENT_PACK } from "@/content/regions/packs/celestial-rift";
export { SPIRIT_REALM_CONTENT_PACK } from "@/content/regions/packs/spirit-realm";

/** Overworld launch regions (matches REGION_IDENTITIES). */
const FULL_PACKS: RegionContentPack[] = [
  COMMONS_CONTENT_PACK,
  EMBER_CRATER_CONTENT_PACK,
  MOONWATER_COAST_CONTENT_PACK,
  ELDERWOOD_FOREST_CONTENT_PACK,
  STORMSPIRE_PEAKS_CONTENT_PACK,
  STONEHEART_CANYON_CONTENT_PACK,
  FROSTVEIL_BASIN_CONTENT_PACK,
  RADIANT_CITADEL_CONTENT_PACK,
  VOID_HOLLOW_CONTENT_PACK,
  ALLOY_RUINS_CONTENT_PACK,
  SPIRIT_MARSH_CONTENT_PACK,
  CELESTIAL_RIFT_CONTENT_PACK,
];

/** Rescue instance — not part of overworld travel graph. */
export const INSTANCE_CONTENT_PACKS: RegionContentPack[] = [SPIRIT_REALM_CONTENT_PACK];

const FULL_IDS = new Set(FULL_PACKS.map((p) => p.regionId));

export const REGION_CONTENT_PACKS: RegionContentPack[] = [
  ...FULL_PACKS,
  ...buildScaffoldPacks().filter((p) => !FULL_IDS.has(p.regionId)),
];

export function contentPackForRegion(regionId: string): RegionContentPack | undefined {
  return REGION_CONTENT_PACKS.find((p) => p.regionId === regionId);
}

export function assertRegionPackCoverage(regionIds: string[]): {
  ok: boolean;
  missing: string[];
  incomplete: string[];
} {
  const missing: string[] = [];
  const incomplete: string[] = [];
  for (const id of regionIds) {
    const pack = contentPackForRegion(id);
    if (!pack) {
      missing.push(id);
      continue;
    }
    if (pack.completeness !== "full" || !packHasDistinctContent(pack)) {
      incomplete.push(id);
    }
  }
  return { ok: missing.length === 0 && incomplete.length === 0, missing, incomplete };
}
