/**
 * Enterable region scene classes — thin BlueprintRegionScene wrappers.
 */

import {
  BlueprintRegionScene,
  type RegionSceneInit,
} from "@/game/live-world/scenes/BlueprintRegionScene";

function makeRegionScene(key: string, slug: string) {
  return class extends BlueprintRegionScene {
    constructor() {
      super(key);
    }
    init(data: RegionSceneInit): void {
      super.init({ ...data, regionSlug: slug });
    }
  };
}

export const StormspirePeaksScene = makeRegionScene(
  "StormspirePeaksScene",
  "stormspire-peaks",
);
export const STORM_KEY = "StormspirePeaksScene";

export const StoneheartCanyonScene = makeRegionScene(
  "StoneheartCanyonScene",
  "stoneheart-canyon",
);
export const STONE_KEY = "StoneheartCanyonScene";

export const FrostveilBasinScene = makeRegionScene(
  "FrostveilBasinScene",
  "frostveil-basin",
);
export const FROST_KEY = "FrostveilBasinScene";

export const RadiantCitadelScene = makeRegionScene(
  "RadiantCitadelScene",
  "radiant-citadel",
);
export const RADIANT_KEY = "RadiantCitadelScene";

export const AlloyRuinsScene = makeRegionScene("AlloyRuinsScene", "alloy-ruins");
export const ALLOY_KEY = "AlloyRuinsScene";

export const SpiritMarshScene = makeRegionScene("SpiritMarshScene", "spirit-marsh");
export const SPIRIT_KEY = "SpiritMarshScene";

export const VoidHollowScene = makeRegionScene("VoidHollowScene", "void-hollow");
export const VOID_KEY = "VoidHollowScene";

export const CelestialRiftScene = makeRegionScene(
  "CelestialRiftScene",
  "celestial-rift",
);
export const CELESTIAL_KEY = "CelestialRiftScene";
