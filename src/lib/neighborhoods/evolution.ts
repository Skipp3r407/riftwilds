import type { PublicBuilding, PublicBuildingKey, VillageStage } from "@/lib/neighborhoods/types";

/** Occupied home thresholds for village evolution. */
export const STAGE_THRESHOLDS: { stage: VillageStage; minOccupied: number }[] = [
  { stage: "hamlet", minOccupied: 0 },
  { stage: "village", minOccupied: 8 },
  { stage: "town", minOccupied: 18 },
  { stage: "city", minOccupied: 32 },
  { stage: "capital", minOccupied: 45 },
];

const BUILDING_UNLOCKS: { key: PublicBuildingKey; label: string; unlockStage: VillageStage }[] = [
  { key: "inn", label: "Wayside Inn", unlockStage: "hamlet" },
  { key: "tavern", label: "Hearth Tavern", unlockStage: "village" },
  { key: "marketplace", label: "Market Square", unlockStage: "village" },
  { key: "blacksmith", label: "Commons Smithy", unlockStage: "village" },
  { key: "bank", label: "Keeper Bank", unlockStage: "town" },
  { key: "stable", label: "Travel Stable", unlockStage: "town" },
  { key: "library", label: "Archivist Library", unlockStage: "town" },
  { key: "guild_hall", label: "Guild Hall", unlockStage: "town" },
  { key: "auction_house", label: "Auction House", unlockStage: "city" },
  { key: "arena", label: "District Arena", unlockStage: "city" },
  { key: "museum", label: "Relic Museum", unlockStage: "city" },
  { key: "town_hall", label: "Town Hall", unlockStage: "capital" },
];

const STAGE_ORDER: VillageStage[] = ["hamlet", "village", "town", "city", "capital"];

export function stageIndex(stage: VillageStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export function resolveVillageStage(occupiedHomes: number): VillageStage {
  let stage: VillageStage = "hamlet";
  for (const row of STAGE_THRESHOLDS) {
    if (occupiedHomes >= row.minOccupied) stage = row.stage;
  }
  return stage;
}

export function buildingsForStage(stage: VillageStage): PublicBuilding[] {
  const idx = stageIndex(stage);
  return BUILDING_UNLOCKS.map((b) => ({
    key: b.key,
    label: b.label,
    unlockStage: b.unlockStage,
    unlocked: stageIndex(b.unlockStage) <= idx,
  }));
}

export function stageUnlockNotes(stage: VillageStage): string[] {
  const notes: string[] = [];
  if (stageIndex(stage) >= stageIndex("village")) {
    notes.push("NPC vendors + weekend market stub");
  }
  if (stageIndex(stage) >= stageIndex("town")) {
    notes.push("Bank, stable fast-travel stub, guild hall exterior");
  }
  if (stageIndex(stage) >= stageIndex("city")) {
    notes.push("Auction house + arena visual unlock");
  }
  if (stageIndex(stage) >= stageIndex("capital")) {
    notes.push("Town hall seat + capital banner cosmetics");
  }
  return notes;
}
