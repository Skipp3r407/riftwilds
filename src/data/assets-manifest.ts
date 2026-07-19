/**
 * Riftwilds TCG / battle-deck visual asset registry.
 * Paths are public URLs under `/public` or generated pipeline outputs.
 * Status: needed | pipeline | shipped
 */

export type AssetSurface =
  | "card-face"
  | "commander-portrait"
  | "faction-banner"
  | "battle-board"
  | "deck-builder"
  | "ui-icon"
  | "prompt-only";

export type AssetManifestEntry = {
  id: string;
  label: string;
  surface: AssetSurface;
  path?: string;
  promptDocRef?: string;
  status: "needed" | "pipeline" | "shipped";
  notes?: string;
};

export const TCG_ASSETS_MANIFEST: AssetManifestEntry[] = [
  {
    id: "card-faces-rotr",
    label: "ROTR card faces (735)",
    surface: "card-face",
    path: "/assets/tcg/cards/",
    status: "pipeline",
    notes: "Generated via npm run tcg:generate:card-images; mapped in cardImages.json",
  },
  {
    id: "showcase-20-faces",
    label: "Showcase Twenty faces",
    surface: "card-face",
    path: "/assets/tcg/cards/",
    status: "pipeline",
    notes: "Priority subset listed in docs/card-system.md",
  },
  {
    id: "faction-banner-ember",
    label: "Ember Forge League banner",
    surface: "faction-banner",
    path: "/assets/tcg/factions/ember-forge.webp",
    promptDocRef: "docs/art-generation-prompts.md#1-faction-banners-4",
    status: "needed",
  },
  {
    id: "faction-banner-tide",
    label: "Tideward Compact banner",
    surface: "faction-banner",
    path: "/assets/tcg/factions/tideward-coast.webp",
    promptDocRef: "docs/art-generation-prompts.md#1-faction-banners-4",
    status: "needed",
  },
  {
    id: "faction-banner-grove",
    label: "Grove Circle banner",
    surface: "faction-banner",
    path: "/assets/tcg/factions/grove-circle.webp",
    promptDocRef: "docs/art-generation-prompts.md#1-faction-banners-4",
    status: "needed",
  },
  {
    id: "faction-banner-storm",
    label: "Spirewind League banner",
    surface: "faction-banner",
    path: "/assets/tcg/factions/stormspire.webp",
    promptDocRef: "docs/art-generation-prompts.md#1-faction-banners-4",
    status: "needed",
  },
  {
    id: "commander-elara",
    label: "Commander — Elara Venn",
    surface: "commander-portrait",
    path: "/assets/tcg/commanders/hero-elara-venn.webp",
    promptDocRef: "docs/art-generation-prompts.md#2-commander-portraits-hero-key-art",
    status: "needed",
  },
  {
    id: "commander-brine",
    label: "Commander — Captain Brine",
    surface: "commander-portrait",
    path: "/assets/tcg/commanders/hero-brine.webp",
    promptDocRef: "docs/art-generation-prompts.md#2-commander-portraits-hero-key-art",
    status: "needed",
  },
  {
    id: "battle-desk-board",
    label: "Practice Board desk background",
    surface: "battle-board",
    path: "/assets/tcg/boards/practice-desk.webp",
    promptDocRef: "docs/art-generation-prompts.md#3-battle-desk-board-background",
    status: "needed",
  },
  {
    id: "deck-atelier-ambient",
    label: "Deck Atelier ambient",
    surface: "deck-builder",
    path: "/assets/tcg/ui/deck-atelier.webp",
    promptDocRef: "docs/art-generation-prompts.md#4-deck-builder-ambient",
    status: "needed",
  },
  {
    id: "icon-rift-energy",
    label: "Rift Energy gem icon",
    surface: "ui-icon",
    path: "/assets/tcg/ui/rift-energy.webp",
    promptDocRef: "docs/art-generation-prompts.md#5-energy-gem--core-icon",
    status: "needed",
  },
  {
    id: "icon-keeper-core",
    label: "Keeper Core icon",
    surface: "ui-icon",
    path: "/assets/tcg/ui/keeper-core.webp",
    promptDocRef: "docs/art-generation-prompts.md#5-energy-gem--core-icon",
    status: "needed",
  },
];

export function assetsByStatus(status: AssetManifestEntry["status"]) {
  return TCG_ASSETS_MANIFEST.filter((a) => a.status === status);
}

export function assetById(id: string) {
  return TCG_ASSETS_MANIFEST.find((a) => a.id === id);
}
