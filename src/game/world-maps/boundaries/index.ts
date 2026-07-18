/**
 * World boundary / containment system — pure data helpers for Phaser Live World.
 */

export {
  isSolidCollider,
  isDeepWater,
  isShallowWater,
  isTransitionZone,
  isNaturalBarrier,
  isEdgeWall,
  blocksNavigation,
  pointInCollider,
  solidColliders,
  transitionColliders,
} from "@/game/world-maps/boundaries/collider-semantics";

export {
  playableBoundsFromCamera,
  playableBoundsFromBlueprint,
  clampToPlayableBounds,
  type PlayableBounds,
} from "@/game/world-maps/boundaries/playable-bounds";

export {
  clampSpawnPoint,
  resolveSafeSpawn,
  spawnOverlapsSolid,
  portalArrivalPoint,
  type SpawnClampResult,
} from "@/game/world-maps/boundaries/spawn-clamp";

export {
  barrierStyleForDestination,
  lockedBlockerMessage,
  sealColliderForPortal,
  lockedPortalSeals,
  lockedPathwayBlockers,
  resolveRuntimeSolids,
  type LockedBlockerMessage,
} from "@/game/world-maps/boundaries/locked-blockers";

export {
  transitionZonesFromPortals,
  collectTransitionZones,
  transitionAtPoint,
  transitionOverlapsEdgeWall,
  type TransitionHit,
} from "@/game/world-maps/boundaries/transition-zones";

export {
  clampEntityToNav,
  clampEnemyLeash,
  clampProjectileToWorld,
  defaultLeashRadius,
  type Point as NavPoint,
} from "@/game/world-maps/boundaries/entity-containment";

export {
  auditBlueprintBoundaries,
  auditAllBlueprints,
  type BoundaryAuditIssue,
  type BoundaryAuditResult,
} from "@/game/world-maps/boundaries/audit";
