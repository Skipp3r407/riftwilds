/**
 * Dynamic world map / quest discovery / exploration public API.
 */

export type * from "@/game/world-exploration/types";
export {
  DEFAULT_LEGEND_TOGGLES,
} from "@/game/world-exploration/types";

export {
  resolveLiveRegionSlug,
  isLiveWorldRegion,
} from "@/game/world-exploration/region-aliases";

export {
  MAP_ICON_PATHS,
  iconKeyForMarker,
  resolveMapIconPath,
  minimapIconForKind,
  markerFallbackColor,
} from "@/game/world-exploration/map-icons";

export {
  getDiscoverableCatalog,
  getDiscoverableById,
  listDiscoverablesForRegion,
  EXPLORATION_PERKS,
  getPerkDef,
  resetDiscoverableCatalogCache,
} from "@/game/world-exploration/discovery-catalog";

export {
  EXPLORATION_PROGRESS_KEY,
  createDefaultExplorationProgress,
  loadExplorationProgress,
  saveExplorationProgress,
  resetExplorationProgressForTests,
  isDiscovered,
  hasEarnedPerk,
  isBossDefeated,
  discoverById,
  tryDiscoverNearby,
  markBossDefeatedExploration,
  claimTreasure,
  addCustomWaypoint,
  removeCustomWaypoint,
  setLegendToggles,
  getExplorationLog,
  logQuestMapEvent,
} from "@/game/world-exploration/progress";

export {
  buildQuestMapMarkers,
  getTrackedQuestMarkers,
  questKeysOnMap,
} from "@/game/world-exploration/quest-map-bridge";

export {
  explorationClueFromNpc,
  type ExplorationRumorClue,
} from "@/game/world-exploration/npc-rumor-bridge";

export { buildDiscoveryMarkers } from "@/game/world-exploration/discovery-markers";
export { buildBlueprintMarkers } from "@/game/world-exploration/blueprint-markers";
export { buildWorldEventMarkers } from "@/game/world-exploration/world-events-markers";
export {
  queryMapMarkers,
  queryNearbyMinimapMarkers,
} from "@/game/world-exploration/map-markers";
export {
  getRegionCompletion,
  listRegionCompletions,
} from "@/game/world-exploration/region-completion";
export {
  codexHrefForDiscoverable,
  safeCodexHref,
  regionCodexHref,
} from "@/game/world-exploration/codex-links";
