import type { StarterSpecies } from "@/lib/assets/manifest";

/** Painted Riftling portraits (AI-generated masters). */
export function creaturePortraitPath(slug: string): string {
  return `/assets/pets/${slug}.png`;
}

export function creatureProfilePath(slug: string, usePlaceholder = false): string {
  if (usePlaceholder) return `/assets/placeholders/creature-${slug}-profile.svg`;
  return creaturePortraitPath(slug);
}

export function creatureIconPath(slug: string, usePlaceholder = false): string {
  if (usePlaceholder) return `/assets/placeholders/creature-${slug}-icon.svg`;
  return creaturePortraitPath(slug);
}

export function eggFullPath(eggClass: string, usePlaceholder = false): string {
  if (usePlaceholder) return `/assets/placeholders/egg-${eggClass}.svg`;
  return `/assets/eggs/egg-${eggClass}.png`;
}

export function affinityIconPath(affinity: string, usePlaceholder = true): string {
  if (usePlaceholder) return `/assets/placeholders/affinity-${affinity}.svg`;
  return `/assets/affinities/affinity-${affinity}-icon.png`;
}

export function battleSheetPath(slug: StarterSpecies): string {
  return `/assets/creatures/sheets/creature-${slug}-battle-sheet.png`;
}

export function battleAtlasPath(slug: StarterSpecies): string {
  return `/assets/creatures/atlases/creature-${slug}-battle-atlas.json`;
}

export function itemIconPath(
  category: "weapons" | "armor" | "potions" | "materials" | "abilities",
  id: string,
): string {
  return `/assets/items/${category}/icons/${id}.png`;
}

export function itemIconFallback(
  category: "weapons" | "armor" | "potions" | "materials" | "abilities",
  id: string,
): string {
  return `/assets/items/${category}/icons/${id}.svg`;
}

/** Preferred world-selection card (new structure). */
export function worldCardPath(slug: string): string {
  return `/assets/worlds/${slug}/card.png`;
}

export function worldOverviewPath(slug: string): string {
  return `/assets/worlds/${slug}/overview.png`;
}

/** Legacy region banner under /assets/regions/. */
export function regionImagePath(slug: string): string {
  return `/assets/regions/${slug}.png`;
}

export function regionImageFallback(slug: string): string {
  return `/assets/regions/${slug}.svg`;
}

export function npcPortraitPath(id: string, regionId?: string): string {
  if (regionId) return `/assets/npcs/${regionId}/${id}/portrait.png`;
  return `/assets/npcs/${id}/portrait.png`;
}

export function npcAssetDir(regionId: string, slug: string): string {
  return `/assets/npcs/${regionId}/${slug}`;
}

export function bossKeyArtPath(id: string): string {
  return `/assets/bosses/${id}/key-art.png`;
}

export function buildingPath(area: string, slug: string): string {
  return `/assets/buildings/${area}/${slug}.png`;
}

export function mapUiIconPath(slug: string): string {
  return `/assets/ui/map/${slug}.png`;
}

export {
  BUTTON_SKIN_V,
  BUTTON_SKIN_CLASS,
  buttonSkinPath,
  buttonSkinPngPath,
} from "@/lib/assets/button-skins";
export type { ButtonSkinId, ButtonSkinVariant } from "@/lib/assets/button-skins";

export function isDevPlaceholderPath(path: string): boolean {
  return path.includes("/placeholders/");
}

/** Brand lockups - transparent PNGs for dark UI chrome. */
export const brandLogoPath = "/assets/brand/riftwilds-logo.png?v=theme2";
export const brandMarkPath = "/assets/brand/riftwilds-mark.png?v=theme2";
export const brandWordmarkPath = "/assets/brand/riftwilds-wordmark.png?v=theme2";

export { SECTION_TITLES, sectionTitlePath, sectionTitleFromLabel } from "@/lib/assets/section-titles";
export { titleAtmospherePath, resolveTitleSlug } from "@/lib/assets/title-banners";

/** Bump when section UI thumbs are remasked / regenerated. */
export const SECTION_UI_THUMB_V = "arena7";

/** Bump when quest panel art is regenerated. */
export const QUEST_ART_V = "quest1";

/** Quest board illustration under public/assets/quests/{questKey}.png */
export function questImagePath(questKey: string): string {
  return `/assets/quests/${questKey}.png?v=${QUEST_ART_V}`;
}

/** Category thumb under public/assets/ui/{folder}/{slug}.png */
export function sectionUiThumbPath(folder: string, slug: string): string {
  return `/assets/ui/${folder}/${slug}.png?v=${SECTION_UI_THUMB_V}`;
}

/** Bump when Keeper Dashboard panel art is regenerated. */
export const DASHBOARD_PANEL_ART_V = "dash1";

/** Panel illustration under public/assets/dashboard/{panelId}.png */
export function dashboardPanelArtPath(panelId: string): string {
  return `/assets/dashboard/${panelId}.png?v=${DASHBOARD_PANEL_ART_V}`;
}

/** Bump when Reward Center source thumbnails are regenerated. */
export const REWARD_SOURCE_ART_V = "rew1";

/** Source thumbnail under public/assets/rewards/{slug}.png */
export function rewardSourceArtPath(slug: string): string {
  return `/assets/rewards/${slug}.png?v=${REWARD_SOURCE_ART_V}`;
}

/**
 * Legacy StarCraft-style nav plate assets (not used by SiteHeader).
 * Kept for optional accent experiments — full-bleed stretch distorts end-caps.
 */
export const navBarBgPath = "/assets/ui/nav/navbar-bg.png";
export const navBarFramePath = "/assets/ui/nav/navbar-frame.png";
export const navBarMobilePath = "/assets/ui/nav/navbar-mobile.png";
