export type * from "@/game/world-travel/types";
export {
  WORLD_TRAVEL_PROGRESS_KEY,
  createDefaultTravelProgress,
  loadTravelProgress,
  saveTravelProgress,
  resetTravelProgressForTests,
  markStoryChapter,
  markBossDefeated,
  markGatewayRestored,
  setPlayerLevel,
  setReputation,
  markQuestComplete,
  syncRegionsFromPlayState,
} from "@/game/world-travel/progress";
export {
  CONTINENT_SPINE,
  CONTINENT_EDGES,
  edgesFrom,
  edgesTo,
  areConnected,
  spineIndex,
  nextSpineRegion,
  neighborsOf,
} from "@/game/world-travel/continent-graph";
export {
  GATEWAY_STONES,
  GATEWAY_BY_ID,
  GATEWAY_BY_REGION,
  gatewayIdForRegion,
  isGatewayActivated,
  isRegionGatewayActivated,
  activateGatewayOnVisit,
  ensureCommonsGateway,
  listActivatedGateways,
  listVisibleGateways,
  fastTravelFeeCredits,
} from "@/game/world-travel/gateways";
export {
  travelProgressToUnlockInput,
  evaluateUnlockRequirements,
  isRegionUnlocked,
  getRegionUnlockView,
  listRegionUnlockViews,
  isPortalUnlockSatisfied,
} from "@/game/world-travel/unlocks";
export {
  canTravelNow,
  getTravelBlockReason,
  travelBlockMessage,
  type TravelGuardContext,
} from "@/game/world-travel/travel-guards";
export {
  grantRegionDiscoveryRewards,
  grantGatewayActivationRewards,
} from "@/game/world-travel/discovery-rewards";
export {
  TRAVEL_LOADING_ART,
  GATEWAY_STONE_ART,
  buildTransitionPlan,
  applyRegionAudioTransition,
  playTravelSfx,
  runTravelTransition,
} from "@/game/world-travel/transitions";
export {
  previewFastTravel,
  attemptFastTravel,
  destinationsFrom,
} from "@/game/world-travel/fast-travel";
export {
  createPartyTravelInvite,
  respondPartyTravelInvite,
  listPendingPartyInvites,
  NPC_CARAVAN_STUBS,
  listCaravanStubsFrom,
} from "@/game/world-travel/party-travel";
export {
  planRegionStream,
  getStreamState,
  completeUnload,
  resetStreamStateForTests,
} from "@/game/world-travel/region-streaming";
export { getWorldCompletionSnapshot } from "@/game/world-travel/world-completion";
export {
  clearPartyInvitesForTests,
} from "@/game/world-travel/party-travel";
