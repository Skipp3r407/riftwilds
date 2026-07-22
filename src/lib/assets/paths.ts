import type { StarterSpecies } from "@/lib/assets/manifest";

/** Bump when pet list thumbs are regenerated. */
export const PET_THUMB_V = "petthumb4";

/** Painted Riftling portraits (AI-generated masters, 1024px). */
export function creaturePortraitPath(slug: string): string {
  return `/assets/pets/${slug}.png`;
}

/**
 * Lightweight list/codex thumbs (384px webp).
 * Prefer seam-trimmed plate variants when present (Staticat/Stormmoth edge fix).
 */
export function creatureThumbPath(slug: string): string {
  return `/assets/pets/thumbs/${slug}.plate.webp?v=${PET_THUMB_V}`;
}

export function creatureProfilePath(slug: string, usePlaceholder = false): string {
  if (usePlaceholder) return `/assets/placeholders/creature-${slug}-profile.svg`;
  return creatureThumbPath(slug);
}

export function creatureIconPath(slug: string, usePlaceholder = false): string {
  if (usePlaceholder) return `/assets/placeholders/creature-${slug}-icon.svg`;
  return creatureThumbPath(slug);
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

/** Bump when Codex habitat environment plates are regenerated. */
export const HABITAT_ART_V = "hab1";

/**
 * Painted habitat / region plate for Codex creature cards.
 * Prefer dedicated card plates; fall back via GameImage to scenic map art.
 */
export function habitatBackgroundPath(regionSlug: string): string {
  return `/assets/habitats/${regionSlug}.webp?v=${HABITAT_ART_V}`;
}

/** Scenic map plate used when a dedicated habitat card asset is missing. */
export function habitatBackgroundFallback(regionSlug: string): string {
  return `/assets/maps/regions/${regionSlug}.png`;
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

/** Brand lockups - transparent PNGs/SVGs for dark UI chrome. Bump ?v= after regenerating. */
export const BRAND_ASSET_V = "theme4b";
export const brandLogoPath = `/assets/brand/riftwilds-logo.png?v=${BRAND_ASSET_V}`;
export const brandMarkPath = `/assets/brand/riftwilds-mark.png?v=${BRAND_ASSET_V}`;
export const brandWordmarkPath = `/assets/brand/riftwilds-wordmark.png?v=${BRAND_ASSET_V}`;
export const brandLogoSvgPath = `/assets/brand/riftwilds-logo.svg?v=${BRAND_ASSET_V}`;
export const brandMarkSvgPath = `/assets/brand/riftwilds-mark.svg?v=${BRAND_ASSET_V}`;
export const brandWordmarkSvgPath = `/assets/brand/riftwilds-wordmark.svg?v=${BRAND_ASSET_V}`;
export const brandCoinIconPath = "/assets/brand/rift-coin-icon.svg";

export { SECTION_TITLES, sectionTitlePath, sectionTitleFromLabel } from "@/lib/assets/section-titles";
export { titleAtmospherePath, resolveTitleSlug } from "@/lib/assets/title-banners";

/** Bump when section UI thumbs are remasked / regenerated. */
export const SECTION_UI_THUMB_V = "arena8";

/** Bump when login / auth provider + section thumbs are regenerated. */
export const AUTH_ART_V = "auth1";

/** Social provider thumb under public/assets/auth/providers/{id}.png */
export function authProviderThumbPath(id: string): string {
  return `/assets/auth/providers/${id}.png?v=${AUTH_ART_V}`;
}

/** Login section thumb under public/assets/auth/sections/{slug}.png */
export function authSectionThumbPath(slug: string): string {
  return `/assets/auth/sections/${slug}.png?v=${AUTH_ART_V}`;
}

/** Square mystery egg for /login header (crisp in narrow frame). */
export function authLoginHeaderEggPath(): string {
  return `/assets/auth/login-header-egg.png?v=${AUTH_ART_V}`;
}

/** Bump when quest panel art is regenerated. */
export const QUEST_ART_V = "quest2";

/** Quest board illustration under public/assets/quests/{questKey}.png */
export function questImagePath(questKey: string): string {
  return `/assets/quests/${questKey}.png?v=${QUEST_ART_V}`;
}

/** Category thumb under public/assets/ui/{folder}/{slug}.png */
export function sectionUiThumbPath(folder: string, slug: string): string {
  return `/assets/ui/${folder}/${slug}.png?v=${SECTION_UI_THUMB_V}`;
}

/** Bump when Rift Exchange method card backgrounds are regenerated. */
export const EXCHANGE_METHOD_ART_V = "ex1";

/** Atmospheric cover thumb under public/assets/ui/exchange/{methodId}.png */
export function exchangeMethodThumbPath(methodId: string): string {
  return `/assets/ui/exchange/${methodId}.png?v=${EXCHANGE_METHOD_ART_V}`;
}

/** Bump when Fan Kit roadmap milestone card backgrounds are regenerated. */
export const ROADMAP_MILESTONE_ART_V = "rm1";

/** Atmospheric cover thumb under public/assets/ui/roadmap/{milestoneId}.png */
export function roadmapMilestoneThumbPath(milestoneId: string): string {
  return `/assets/ui/roadmap/${milestoneId}.png?v=${ROADMAP_MILESTONE_ART_V}`;
}

/** Bump when Keeper Dashboard panel art is regenerated. */
export const DASHBOARD_PANEL_ART_V = "dash1";

/** Bump when Keeper Dashboard action icons are regenerated. */
export const DASHBOARD_ACTION_ART_V = "act4";

/** Panel illustration under public/assets/dashboard/{panelId}.png */
export function dashboardPanelArtPath(panelId: string): string {
  return `/assets/dashboard/${panelId}.png?v=${DASHBOARD_PANEL_ART_V}`;
}

/** Quick-action icon under public/assets/dashboard/actions/{slug}.png */
export function dashboardActionIconPath(slug: string): string {
  return `/assets/dashboard/actions/${slug}.png?v=${DASHBOARD_ACTION_ART_V}`;
}

/** Bump when Reward Center source thumbnails are regenerated. */
export const REWARD_SOURCE_ART_V = "rew1";

/** Source thumbnail under public/assets/rewards/{slug}.png */
export function rewardSourceArtPath(slug: string): string {
  return `/assets/rewards/${slug}.png?v=${REWARD_SOURCE_ART_V}`;
}

/** Bump when Hatchery premium art is regenerated. */
export const HATCHERY_ART_V = "hatch6";

/** Bump when home / marketing hero egg art changes. */
export const HERO_EGG_V = "heroegg2";

/** Claim-card hero egg under public/assets/hatchery/claim-starter-egg.png */
export function hatcheryClaimEggPath(): string {
  return `/assets/hatchery/claim-starter-egg.png?v=${HATCHERY_ART_V}`;
}

/** Featured starter section plate (pedestal / altar) under claim-section-plate.png */
export function hatcheryClaimPlatePath(): string {
  return `/assets/hatchery/claim-section-plate.png?v=${HATCHERY_ART_V}`;
}

/**
 * Premium Mystery Rift Egg for marketing hero + claim blocks.
 * Prefers the portrait hatchery master (fills square frames); mystery PNG is landscape-padded.
 */
export function mysteryRiftEggPath(): string {
  return `/assets/hatchery/claim-starter-egg.png?v=${HERO_EGG_V}`;
}

/** Empty eggs panel art under public/assets/hatchery/empty-eggs.png */
export function hatcheryEmptyEggsPath(): string {
  return `/assets/hatchery/empty-eggs.png?v=${HATCHERY_ART_V}`;
}

/** Empty Riftlings panel art under public/assets/hatchery/empty-riftlings.png */
export function hatcheryEmptyRiftlingsPath(): string {
  return `/assets/hatchery/empty-riftlings.png?v=${HATCHERY_ART_V}`;
}

/** Rarity tier icon under public/assets/hatchery/rarity/{tier}.png */
export function hatcheryRarityIconPath(rarity: string): string {
  return `/assets/hatchery/rarity/${rarity.toLowerCase()}.png?v=${HATCHERY_ART_V}`;
}

/** Map hatchery eggType keys to egg-* PNG asset class slugs. */
export function eggTypeAssetClass(eggType: string): string {
  const map: Record<string, string> = {
    COMMON_RIFT: "common-rift",
    EMBER: "ember",
    TIDE: "tide",
    GROVE: "grove",
    STORM: "storm",
    STONE: "stone",
    FROST: "frost",
    RADIANT: "radiant",
    VOID: "void",
    ALLOY: "alloy",
    SPIRIT: "spirit",
    CELESTIAL: "celestial",
    SEASONAL: "event",
    EVENT: "event",
    FOUNDER: "ancient",
  };
  return map[eggType] ?? "common-rift";
}

/**
 * Legacy StarCraft-style nav plate assets (not used by SiteHeader).
 * Kept for optional accent experiments — full-bleed stretch distorts end-caps.
 */
export const navBarBgPath = "/assets/ui/nav/navbar-bg.png";
export const navBarFramePath = "/assets/ui/nav/navbar-frame.png";
export const navBarMobilePath = "/assets/ui/nav/navbar-mobile.png";
