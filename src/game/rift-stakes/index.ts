/**
 * Rift Stakes public API surface for the game module.
 */

export * from "@/game/rift-stakes/types";
export * from "@/game/rift-stakes/config";
export * from "@/game/rift-stakes/fees";
export * from "@/game/rift-stakes/fee-resolver";
export * from "@/game/rift-stakes/escrow";
export * from "@/game/rift-stakes/contract-interface";
export * from "@/game/rift-stakes/matchmaking";
export * from "@/game/rift-stakes/treasury";
export * from "@/game/rift-stakes/admin";
export * from "@/game/rift-stakes/match-service";
export {
  getRiftStakesStore,
  getMatch,
  getEscrow,
  upsertMatch,
  upsertEscrow,
  updateLeaderboard,
  resetRiftStakesStoreForTests,
} from "@/game/rift-stakes/store";
