/**
 * Riftwilds game asset library catalog (generated).
 * Regenerate: npm run assets:generate:library
 * Do not hand-edit entries — update scripts/assets/game-library/defs.mjs
 */

export type GameLibraryLayer = "ground" | "prop" | "entity" | "structure" | "overhead" | "fx";

export type GameLibraryEntry = {
  id: string;
  category: string;
  path: string;
  tags: string[];
  biome: string;
  layer: GameLibraryLayer;
  anchors: { x: number; y: number };
  label: string;
  family: string;
  variant?: Record<string, string>;
  bootCritical?: boolean;
};

export type GameLibraryCatalog = {
  version: number;
  generatedAt: string;
  count: number;
  engine: string;
  enginesUsed: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  bootCritical: string[];
  entries: GameLibraryEntry[];
};

import catalogJson from "./game-library.json";

export const GAME_LIBRARY = catalogJson as unknown as GameLibraryCatalog;

export function getLibraryEntry(id: string): GameLibraryEntry | undefined {
  return GAME_LIBRARY.entries.find((e) => e.id === id);
}

export function libraryByTag(tag: string): GameLibraryEntry[] {
  return GAME_LIBRARY.entries.filter((e) => e.tags.includes(tag));
}

export function libraryByCategory(category: string): GameLibraryEntry[] {
  return GAME_LIBRARY.entries.filter((e) => e.category === category);
}

export function libraryBootCritical(): GameLibraryEntry[] {
  return GAME_LIBRARY.entries.filter((e) => e.bootCritical);
}
