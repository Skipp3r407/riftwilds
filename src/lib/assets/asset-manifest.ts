/**
 * Canonical expected-asset registry for Riftwilds.
 * Status is honest: generated only when a real file exists on disk.
 */

import fs from "node:fs";
import path from "node:path";
import { REGION_IDENTITIES } from "@/game/world-maps/regions";
import { NPC_CATALOG } from "@/game/world-maps/defs/npcs";
import { ENEMY_DEFS } from "@/game/world-maps/defs/enemies";
import { STARTER_SPECIES, EGG_CLASSES, AFFINITIES } from "@/lib/assets/manifest";
import { WEAPON_CATALOG } from "@/lib/items/catalog/weapons";
import { ARMOR_CATALOG } from "@/lib/items/catalog/armor";
import { POTION_CATALOG } from "@/lib/items/catalog/potions";
import { MATERIAL_CATALOG } from "@/lib/items/catalog/materials";
import { ABILITY_CATALOG } from "@/lib/items/catalog/abilities";

export type AssetCategory =
  | "worlds"
  | "pets"
  | "eggs"
  | "items"
  | "npcs"
  | "enemies"
  | "bosses"
  | "buildings"
  | "ui"
  | "effects"
  | "animations"
  | "affinities"
  | "regions";

export type AssetFileStatus =
  | "pending"
  | "planned"
  | "generated"
  | "failed"
  | "legacy"
  | "not_applicable";

export type AssetRecord = {
  id: string;
  category: AssetCategory;
  /** Public URL path starting with /assets/ */
  publicPath: string;
  label: string;
  status: AssetFileStatus;
  priority: number;
  minWidth?: number;
  promptHint?: string;
  notes?: string;
};

export type AssetManifestDocument = {
  version: string;
  generatedAt: string;
  provider: string;
  counts: Record<string, number>;
  byStatus: Record<AssetFileStatus, number>;
  assets: AssetRecord[];
};

const COMMONS_BUILDINGS = [
  { slug: "hatchery", label: "Hatchery exterior" },
  { slug: "marketplace", label: "Rift Exchange exterior" },
  { slug: "arena", label: "Training Arena exterior" },
  { slug: "guild-hall", label: "Guild Hall exterior" },
  { slug: "portal-circle", label: "Portal Circle" },
] as const;

const MAP_UI_ICONS = [
  { slug: "marker", label: "Map marker" },
  { slug: "waypoint", label: "Waypoint" },
  { slug: "portal", label: "Portal icon" },
  { slug: "quest-available", label: "Quest available" },
  { slug: "quest-active", label: "Quest active" },
  { slug: "quest-complete", label: "Quest complete" },
  { slug: "danger", label: "Danger marker" },
  { slug: "safe-zone", label: "Safe zone" },
] as const;

function existsPublic(projectRoot: string, publicPath: string): boolean {
  return fs.existsSync(path.join(projectRoot, "public", publicPath.replace(/^\//, "")));
}

function statusFor(
  projectRoot: string,
  publicPath: string,
  preferred: AssetFileStatus = "pending",
  presentStatus: AssetFileStatus = "generated",
): AssetFileStatus {
  return existsPublic(projectRoot, publicPath) ? presentStatus : preferred;
}

/** Launch pet slugs used by /assets/pets/{slug}.png (50 species portraits). */
export function listPetPortraitSlugs(projectRoot: string): string[] {
  const dir = path.join(projectRoot, "public/assets/pets");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".png") && !f.includes("-"))
    .map((f) => f.replace(/\.png$/i, ""))
    .sort();
}

export function buildExpectedAssets(projectRoot: string): AssetRecord[] {
  const assets: AssetRecord[] = [];

  // World selection cards + overview/loading
  for (const region of REGION_IDENTITIES) {
    const card = `/assets/worlds/${region.slug}/card.png`;
    const overview = `/assets/worlds/${region.slug}/overview.png`;
    const legacy = `/assets/regions/${region.slug}.png`;
    assets.push({
      id: `world-card-${region.slug}`,
      category: "worlds",
      publicPath: card,
      label: `${region.name} world card`,
      status: statusFor(projectRoot, card),
      priority: 1,
      minWidth: 512,
      promptHint: `Scenic wide establishing shot of ${region.name}: ${region.blurb}. No text.`,
    });
    assets.push({
      id: `world-overview-${region.slug}`,
      category: "worlds",
      publicPath: overview,
      label: `${region.name} loading / overview`,
      status: statusFor(projectRoot, overview),
      priority: region.unlockTier === "start" ? 1 : 3,
      minWidth: 1024,
      promptHint: `Cinematic loading-screen vista of ${region.name}. No text.`,
    });
    assets.push({
      id: `region-legacy-${region.slug}`,
      category: "regions",
      publicPath: legacy,
      label: `${region.name} legacy region banner`,
      status: statusFor(projectRoot, legacy, "pending", "legacy"),
      priority: 5,
      notes: "Legacy World page banner; prefer worlds/*/card.png when present",
    });
  }

  // Pets — prefer existing /assets/pets/{slug}.png
  const petSlugs = listPetPortraitSlugs(projectRoot);
  for (const slug of petSlugs) {
    const p = `/assets/pets/${slug}.png`;
    assets.push({
      id: `pet-portrait-${slug}`,
      category: "pets",
      publicPath: p,
      label: `${slug} portrait`,
      status: "generated",
      priority: 2,
    });
  }
  // Also track starter species from art pipeline (may overlap naming)
  for (const slug of STARTER_SPECIES) {
    const p = `/assets/pets/${slug}.png`;
    if (!petSlugs.includes(slug)) {
      assets.push({
        id: `pet-portrait-${slug}`,
        category: "pets",
        publicPath: p,
        label: `${slug} portrait (starter pipeline)`,
        status: statusFor(projectRoot, p),
        priority: 4,
        notes: "Starter art-pipeline slug; launch roster may use different names",
      });
    }
  }

  // Eggs
  for (const egg of EGG_CLASSES) {
    const p = `/assets/eggs/egg-${egg}.png`;
    assets.push({
      id: `egg-${egg}`,
      category: "eggs",
      publicPath: p,
      label: `${egg} egg`,
      status: statusFor(projectRoot, p),
      priority: egg === "wild" || egg === "ancient" || egg === "event" ? 1 : 2,
      promptHint: `Single ornate fantasy creature egg, ${egg} affinity theme, centered on transparent/dark void, no text.`,
    });
  }

  // Affinities
  for (const a of AFFINITIES) {
    const p = `/assets/affinities/affinity-${a}-icon.png`;
    assets.push({
      id: `affinity-${a}`,
      category: "affinities",
      publicPath: p,
      label: `${a} affinity icon`,
      status: statusFor(projectRoot, p),
      priority: 4,
    });
  }

  // Items
  const itemCats: Array<{
    category: "items";
    items: { id: string; name: string; iconPath: string }[];
    folder: string;
  }> = [
    { category: "items", items: WEAPON_CATALOG, folder: "weapons" },
    { category: "items", items: ARMOR_CATALOG, folder: "armor" },
    { category: "items", items: POTION_CATALOG, folder: "potions" },
    { category: "items", items: MATERIAL_CATALOG, folder: "materials" },
    { category: "items", items: ABILITY_CATALOG, folder: "abilities" },
  ];
  for (const group of itemCats) {
    for (const item of group.items) {
      const publicPath = item.iconPath.startsWith("/")
        ? item.iconPath
        : `/assets/items/${group.folder}/icons/${item.id}.png`;
      assets.push({
        id: `item-${item.id}`,
        category: "items",
        publicPath,
        label: item.name,
        status: statusFor(projectRoot, publicPath),
        priority: 2,
      });
    }
  }

  // Key NPCs
  const keyNpc = ["mira", "hatchery-keeper", "market-registrar", "arena-master"];
  for (const npc of NPC_CATALOG) {
    const p = `/assets/npcs/${npc.id}/portrait.png`;
    assets.push({
      id: `npc-${npc.id}`,
      category: "npcs",
      publicPath: p,
      label: `${npc.name} portrait`,
      status: statusFor(projectRoot, p),
      priority: keyNpc.includes(npc.id) ? 1 : 4,
      promptHint: `Character portrait of ${npc.name}, role ${npc.role}, Riftwilds fantasy NPC, bust/shoulders, no text.`,
    });
  }

  // Enemies / bosses
  for (const enemy of ENEMY_DEFS) {
    const isBoss = enemy.tier === "boss";
    const p = isBoss
      ? `/assets/bosses/${enemy.id}/key-art.png`
      : `/assets/enemies/${enemy.id}/portrait.png`;
    assets.push({
      id: `${isBoss ? "boss" : "enemy"}-${enemy.id}`,
      category: isBoss ? "bosses" : "enemies",
      publicPath: p,
      label: enemy.name,
      status: statusFor(projectRoot, p),
      priority: isBoss ? 2 : 5,
      promptHint: `${isBoss ? "Boss key art" : "Enemy portrait"} of ${enemy.name}. No text.`,
    });
  }

  // Commons buildings
  for (const b of COMMONS_BUILDINGS) {
    const p = `/assets/buildings/commons/${b.slug}.png`;
    assets.push({
      id: `building-commons-${b.slug}`,
      category: "buildings",
      publicPath: p,
      label: b.label,
      status: statusFor(projectRoot, p),
      priority: 2,
      promptHint: `Exterior of ${b.label} in Riftwild Commons plaza, fantasy village architecture, no text.`,
    });
  }

  // Map UI icons
  for (const icon of MAP_UI_ICONS) {
    const p = `/assets/ui/map/${icon.slug}.png`;
    assets.push({
      id: `ui-map-${icon.slug}`,
      category: "ui",
      publicPath: p,
      label: icon.label,
      status: statusFor(projectRoot, p),
      priority: 1,
      promptHint: `Simple game UI icon: ${icon.label}, clean silhouette, centered, transparent background feel, no text.`,
    });
  }

  // Animation sheets — pending by design (not faked)
  for (const slug of STARTER_SPECIES.slice(0, 8)) {
    const p = `/assets/creatures/sheets/creature-${slug}-battle-sheet.png`;
    assets.push({
      id: `anim-battle-${slug}`,
      category: "animations",
      publicPath: p,
      label: `${slug} battle sheet`,
      status: statusFor(projectRoot, p),
      priority: 9,
      notes: "Full animation sheets deferred — masters first",
    });
  }

  return assets;
}

export function summarizeAssets(assets: AssetRecord[]): AssetManifestDocument["byStatus"] {
  const byStatus: Record<AssetFileStatus, number> = {
    pending: 0,
    planned: 0,
    generated: 0,
    failed: 0,
    legacy: 0,
    not_applicable: 0,
  };
  for (const a of assets) byStatus[a.status]++;
  return byStatus;
}

export function buildManifestDocument(
  projectRoot: string,
  provider = process.env.IMAGE_PROVIDER ?? "cursor-local",
): AssetManifestDocument {
  const assets = buildExpectedAssets(projectRoot);
  const byStatus = summarizeAssets(assets);
  const counts: Record<string, number> = {};
  for (const a of assets) {
    counts[a.category] = (counts[a.category] ?? 0) + 1;
  }
  return {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    provider,
    counts,
    byStatus,
    assets,
  };
}

export function writeManifestFiles(projectRoot: string): AssetManifestDocument {
  const doc = buildManifestDocument(projectRoot);
  const publicPath = path.join(projectRoot, "public/assets/asset-manifest.json");
  const reportDir = path.join(projectRoot, "artifacts/assets/reports");
  fs.mkdirSync(reportDir, { recursive: true });
  fs.mkdirSync(path.dirname(publicPath), { recursive: true });
  fs.writeFileSync(publicPath, JSON.stringify(doc, null, 2), "utf8");
  const stamp = doc.generatedAt.replace(/[:.]/g, "-");
  fs.writeFileSync(
    path.join(reportDir, `manifest-${stamp}.json`),
    JSON.stringify(doc, null, 2),
    "utf8",
  );
  fs.writeFileSync(path.join(reportDir, "latest-manifest.json"), JSON.stringify(doc, null, 2), "utf8");
  return doc;
}

export function filterByCategory(assets: AssetRecord[], category: AssetCategory | "all"): AssetRecord[] {
  if (category === "all") return assets;
  return assets.filter((a) => a.category === category);
}

export function missingAssets(assets: AssetRecord[]): AssetRecord[] {
  return assets.filter((a) => a.status === "pending" || a.status === "planned" || a.status === "failed");
}
