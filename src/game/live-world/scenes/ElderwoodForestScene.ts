import {
  BlueprintRegionScene,
  type RegionSceneInit,
} from "@/game/live-world/scenes/BlueprintRegionScene";

export const ELDERWOOD_KEY = "ElderwoodForestScene";

export class ElderwoodForestScene extends BlueprintRegionScene {
  constructor() {
    super(ELDERWOOD_KEY);
  }

  init(data: RegionSceneInit): void {
    super.init({ ...data, regionSlug: "elderwood-forest" });
  }
}
