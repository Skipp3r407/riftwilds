import {
  BlueprintRegionScene,
  type RegionSceneInit,
} from "@/game/live-world/scenes/BlueprintRegionScene";

export const COAST_KEY = "MoonwaterCoastScene";

export class MoonwaterCoastScene extends BlueprintRegionScene {
  constructor() {
    super(COAST_KEY);
  }

  init(data: RegionSceneInit): void {
    super.init({ ...data, regionSlug: "moonwater-coast" });
  }
}
