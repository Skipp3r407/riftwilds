export { createLiveWorldGame, destroyLiveWorldGame } from "@/game/live-world/create-game";
export {
  createLiveWorldBridge,
  destroyLiveWorldBridge,
  getLiveWorldBridge,
  LiveWorldBridge,
} from "@/game/live-world/bridge";
export type {
  ConnectionStatus,
  DialoguePayload,
  VirtualInputState,
  WorldHudStatus,
} from "@/game/live-world/types";
export {
  REGION_IDENTITIES,
  getBlueprint,
  loadMap,
  canEnterLiveWorldRegion,
} from "@/game/world-maps";
