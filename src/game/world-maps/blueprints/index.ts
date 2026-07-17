import { buildRiftwildCommonsBlueprint } from "@/game/world-maps/blueprints/riftwild-commons";
import { buildRegionBlueprint, FACTORY_SLUGS } from "@/game/world-maps/blueprints/region-factory";
import { WORLD_PAGE_SLUGS } from "@/game/world-maps/regions";
import type { MapBlueprint } from "@/game/world-maps/types";

export { buildRiftwildCommonsBlueprint } from "@/game/world-maps/blueprints/riftwild-commons";
export { buildRegionBlueprint } from "@/game/world-maps/blueprints/region-factory";

const cache = new Map<string, MapBlueprint>();

export function getBlueprint(slug: string): MapBlueprint {
  const hit = cache.get(slug);
  if (hit) return hit;
  const bp =
    slug === "riftwild-commons"
      ? buildRiftwildCommonsBlueprint()
      : buildRegionBlueprint(slug);
  cache.set(slug, bp);
  return bp;
}

export function allBlueprints(): MapBlueprint[] {
  return WORLD_PAGE_SLUGS.map((slug) => getBlueprint(slug));
}

export function assertAllBlueprintsPresent(): string[] {
  const missing: string[] = [];
  for (const slug of WORLD_PAGE_SLUGS) {
    try {
      getBlueprint(slug);
    } catch {
      missing.push(slug);
    }
  }
  // Ensure factory covers non-commons
  for (const slug of FACTORY_SLUGS) {
    if (!WORLD_PAGE_SLUGS.includes(slug as (typeof WORLD_PAGE_SLUGS)[number])) {
      missing.push(`orphan-factory:${slug}`);
    }
  }
  return missing;
}
