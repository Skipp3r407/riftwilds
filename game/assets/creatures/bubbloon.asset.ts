import type { CreatureAssetConfig } from "@/lib/assets/types";
import { DEFAULT_BATTLE_ANIMATIONS } from "@/lib/assets/types";

const bubbloonAsset: CreatureAssetConfig = {
  species: "bubbloon",
  battle: {
    frameWidth: 512,
    frameHeight: 512,
    scale: 0.72,
    originX: 0.5,
    originY: 0.88,
    animations: { ...DEFAULT_BATTLE_ANIMATIONS },
  },
  overworld: {
    frameWidth: 128,
    frameHeight: 128,
    scale: 1,
    originX: 0.5,
    originY: 0.82,
  },
};

export default bubbloonAsset;
