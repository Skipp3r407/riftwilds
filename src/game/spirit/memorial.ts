/**
 * Memorial + Memorial Garden — Hardcore losses and voluntary remembrance.
 */

import type { MemorialGarden, MemorialRecord } from "@/game/spirit/types";

export function createMemorial(input: {
  petPublicId: string;
  ownerKey: string;
  name: string;
  speciesSlug: string;
  speciesName: string;
  level: number;
  bond: number;
  favoriteFood?: string | null;
  achievements?: string[];
  battlesWon?: number;
  obtainedAt: string;
  cause: string;
  favoriteEquipment?: string[];
  hardcore: boolean;
  photoPaths?: string[];
}): MemorialRecord {
  return {
    id: `mem_${input.petPublicId}`,
    petPublicId: input.petPublicId,
    ownerKey: input.ownerKey,
    name: input.name,
    speciesSlug: input.speciesSlug,
    speciesName: input.speciesName,
    level: input.level,
    bond: input.bond,
    favoriteFood: input.favoriteFood ?? null,
    achievements: input.achievements ?? [],
    battlesWon: input.battlesWon ?? 0,
    obtainedAt: input.obtainedAt,
    lostAt: new Date().toISOString(),
    cause: input.cause,
    favoriteEquipment: input.favoriteEquipment ?? [],
    messages: [],
    photoPaths: input.photoPaths ?? ["/assets/spirit/memorial-statue.svg"],
    hardcore: input.hardcore,
  };
}

export function defaultMemorialGarden(ownerKey: string): MemorialGarden {
  return {
    ownerKey,
    unlocked: false,
    statues: [],
    flowers: 0,
    candles: 0,
    lanterns: 0,
    benches: 0,
    musicKey: "music-memorial-garden",
    visitorNotes: [],
    updatedAt: new Date().toISOString(),
  };
}

export function unlockMemorialGarden(garden: MemorialGarden): MemorialGarden {
  return {
    ...garden,
    unlocked: true,
    benches: Math.max(1, garden.benches),
    lanterns: Math.max(1, garden.lanterns),
    updatedAt: new Date().toISOString(),
  };
}

export function leaveMemorialTribute(
  memorial: MemorialRecord,
  fromKey: string,
  text: string,
): MemorialRecord {
  const clean = text.trim().slice(0, 280);
  if (!clean) return memorial;
  return {
    ...memorial,
    messages: [
      ...memorial.messages,
      { fromKey, text: clean, at: new Date().toISOString() },
    ],
  };
}

export function decorateGarden(
  garden: MemorialGarden,
  kind: "flowers" | "candles" | "lanterns" | "statues",
  value: string | number = 1,
): MemorialGarden {
  const next = { ...garden, updatedAt: new Date().toISOString() };
  if (kind === "statues" && typeof value === "string") {
    next.statues = [...new Set([...garden.statues, value])];
  } else if (kind === "flowers") {
    next.flowers = garden.flowers + Number(value);
  } else if (kind === "candles") {
    next.candles = garden.candles + Number(value);
  } else if (kind === "lanterns") {
    next.lanterns = garden.lanterns + Number(value);
  }
  if (!next.unlocked) next.unlocked = true;
  return next;
}
