/**
 * Player Neighborhoods — shared exterior world + private home interiors.
 */

import { trackAnalytics } from "@/lib/analytics/events";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { settleDebit, settleEnsureStarter } from "@/lib/economy/core/settlement";
import {
  attachHomeToPlot,
  getHomeForUser,
  purchaseOrBuildHome,
} from "@/lib/housing/instance-service";
import {
  assertExteriorPlacementAllowed,
  evaluateAbandonedPlots,
  flagOffensiveDecor,
  softMultiAccountPlotRisk,
} from "@/lib/neighborhoods/anti-grief";
import { buildingsForStage, resolveVillageStage, stageUnlockNotes } from "@/lib/neighborhoods/evolution";
import { getDeed, LAND_DEEDS } from "@/lib/neighborhoods/land-deeds";
import type { PropertyTier } from "@/lib/housing/types";
import type {
  CommunityProject,
  CommunityProjectKind,
  DeedSize,
  DistrictKind,
  NeighborhoodEvent,
  PlayerNeighborhood,
  PlayerPlot,
  PlayerStorefront,
} from "@/lib/neighborhoods/types";

type Store = {
  neighborhoods: Map<string, PlayerNeighborhood>;
  recentClaimKeys: string[];
};

function store(): Store {
  const g = globalThis as unknown as { __rwNeighborhoods?: Store };
  if (!g.__rwNeighborhoods) {
    g.__rwNeighborhoods = { neighborhoods: new Map(), recentClaimKeys: [] };
    seedDefaultNeighborhood(g.__rwNeighborhoods);
  }
  return g.__rwNeighborhoods;
}

export function resetNeighborhoodsForTests(): void {
  const g = globalThis as unknown as { __rwNeighborhoods?: Store };
  g.__rwNeighborhoods = { neighborhoods: new Map(), recentClaimKeys: [] };
  seedDefaultNeighborhood(g.__rwNeighborhoods);
}

const DISTRICT_SEED: { kind: DistrictKind; name: string; flavor: string }[] = [
  { kind: "residential", name: "Lantern Row", flavor: "Quiet cottages and mailboxes." },
  { kind: "merchant", name: "Market Bend", flavor: "Storefronts and display windows." },
  { kind: "crafting", name: "Ember Lane", flavor: "Workshops and anvil smoke." },
  { kind: "farming", name: "Greenfold", flavor: "Crop rows and scarecrows." },
  { kind: "fishing", name: "Reed Pier", flavor: "Ponds and dock stubs." },
  { kind: "magic", name: "Rift Circle", flavor: "Soft cyan garden rings." },
  { kind: "guild", name: "Banner Court", flavor: "Guild hall approaches." },
  { kind: "military", name: "Watch Rise", flavor: "Cosmetic drill yard — no wars." },
  { kind: "entertainment", name: "Song Plaza", flavor: "Musicians and campfires." },
  { kind: "temple", name: "Quiet Steeple", flavor: "Reflection gardens." },
  { kind: "luxury", name: "Goldleaf Terrace", flavor: "Estate overlooks." },
];

const PROJECT_KINDS: { kind: CommunityProjectKind; name: string; goal: number }[] = [
  { kind: "fountain", name: "Commons Fountain", goal: 40 },
  { kind: "bridge", name: "Creek Bridge", goal: 55 },
  { kind: "walls", name: "Decorative Ward Walls", goal: 80 },
  { kind: "docks", name: "Neighborhood Docks", goal: 60 },
  { kind: "arena", name: "District Arena Ring", goal: 100 },
  { kind: "town_hall", name: "Town Hall Foundation", goal: 120 },
  { kind: "park", name: "Central Park", goal: 45 },
  { kind: "riftling_park", name: "Riftling Park", goal: 50 },
  { kind: "weekend_market", name: "Weekend Market Stalls", goal: 35 },
];

function seedDefaultNeighborhood(s: Store): void {
  const id = "nbhd_commons_alpha";
  const now = new Date().toISOString();
  const districts = DISTRICT_SEED.map((d, i) => ({
    districtId: `dist_${d.kind}`,
    kind: d.kind,
    name: d.name,
    flavor: d.flavor,
    plotIds: [] as string[],
  }));

  const plots: PlayerPlot[] = [];
  const deedCycle = LAND_DEEDS;
  let n = 0;
  // ~36 plots (20–50 target)
  for (let row = 1; row <= 6; row++) {
    for (let col = 1; col <= 6; col++) {
      if (col % 4 === 0 || row % 4 === 0) continue; // leave road cells empty
      const deed = deedCycle[n % deedCycle.length]!;
      const district = districts[n % districts.length]!;
      const plotId = `plot_${id}_${col}_${row}`;
      plots.push({
        plotId,
        neighborhoodId: id,
        districtId: district.districtId,
        ownerUserId: null,
        deedSize: deed.size,
        coords: { col, row },
        biome: deed.terrain,
        elevation: deed.elevation,
        roadAccess: deed.roadAccess,
        waterAccess: deed.waterAccess,
        buildLimit: deed.buildLimit,
        decorLimit: deed.decorLimit,
        status: "vacant",
        homeId: null,
        exteriorFacadeKey: null,
        mailbox: true,
        abandonedWarnedAt: null,
        lastActivityAt: now,
      });
      district.plotIds.push(plotId);
      n++;
    }
  }

  const projects: CommunityProject[] = PROJECT_KINDS.map((p) => ({
    projectId: `proj_${p.kind}`,
    neighborhoodId: id,
    kind: p.kind,
    name: p.name,
    goalMaterials: p.goal,
    donatedMaterials: 0,
    completed: false,
    worldStateKey: `ws_${p.kind}`,
  }));

  const nbhd: PlayerNeighborhood = {
    neighborhoodId: id,
    name: "Commons Alpha",
    regionSlug: "riftwild-commons",
    mapId: "riftwild-commons",
    stage: "hamlet",
    occupiedHomes: 0,
    plotCap: plots.length,
    districts,
    plots,
    projects,
    contributions: [],
    publicBuildings: buildingsForStage("hamlet"),
    stores: [],
    government: {
      neighborhoodId: id,
      mayorUserId: null,
      councilUserIds: [],
      activeMotions: [],
    },
    events: [],
    landmarks: [
      {
        landmarkId: "lm_hearth_stone",
        neighborhoodId: id,
        name: "Founders Hearthstone",
        kind: "monument",
        coords: { col: 2, row: 2 },
        seasonalDecor: null,
      },
    ],
    npcLife: { musicians: 1, animals: 3, visitors: 2, campfiresLit: true },
    reputation: 1,
    seasonalDecorTheme: null,
    sharedRoads: true,
    lightingPreset: "lantern_dusk",
    createdAt: now,
    updatedAt: now,
  };
  s.neighborhoods.set(id, nbhd);
}

function persist(n: PlayerNeighborhood): void {
  n.updatedAt = new Date().toISOString();
  store().neighborhoods.set(n.neighborhoodId, n);
}

function recomputeStage(n: PlayerNeighborhood): void {
  n.occupiedHomes = n.plots.filter((p) => p.ownerUserId && p.homeId).length;
  n.stage = resolveVillageStage(n.occupiedHomes);
  n.publicBuildings = buildingsForStage(n.stage);
}

export function listNeighborhoods(): PlayerNeighborhood[] {
  return [...store().neighborhoods.values()];
}

export function getNeighborhood(id: string): PlayerNeighborhood | null {
  return store().neighborhoods.get(id) ?? null;
}

export function getPlot(plotId: string): { neighborhood: PlayerNeighborhood; plot: PlayerPlot } | null {
  for (const n of store().neighborhoods.values()) {
    const plot = n.plots.find((p) => p.plotId === plotId);
    if (plot) return { neighborhood: n, plot };
  }
  return null;
}

export function claimPlot(params: {
  userId: string;
  plotId: string;
  requestId: string;
  deedSize?: DeedSize;
  fingerprint?: string | null;
  autoBuildHome?: boolean;
  propertyTier?: PropertyTier;
  homeName?: string;
}):
  | { ok: true; neighborhood: PlayerNeighborhood; plot: PlayerPlot; homeId: string | null; risk: string }
  | { ok: false; error: string; message: string } {
  if (
    !isFeatureEnabled("PLAYER_NEIGHBORHOODS_ENABLED") &&
    !isFeatureEnabled("LAND_OWNERSHIP_ENABLED")
  ) {
    return { ok: false, error: "disabled", message: "Neighborhoods disabled." };
  }

  const found = getPlot(params.plotId);
  if (!found) return { ok: false, error: "missing", message: "Plot not found." };
  const { neighborhood, plot } = found;
  if (plot.status !== "vacant" && plot.status !== "for_sale" && plot.status !== "npc_maintained") {
    return { ok: false, error: "not_available", message: "Plot not available." };
  }
  if (neighborhood.plots.some((p) => p.ownerUserId === params.userId)) {
    return { ok: false, error: "already_owns", message: "You already hold a plot here." };
  }

  const roadCheck = assertExteriorPlacementAllowed({
    col: plot.coords.col,
    row: plot.coords.row,
    blocksRoad: false,
  });
  if (!roadCheck.ok) return roadCheck;

  const risk = softMultiAccountPlotRisk({
    ownerKey: params.userId,
    fingerprint: params.fingerprint,
    recentClaimOwnerKeys: store().recentClaimKeys,
  });

  const deed = getDeed(params.deedSize ?? plot.deedSize);
  if (!deed) return { ok: false, error: "bad_deed", message: "Unknown deed size." };

  settleEnsureStarter(params.userId);
  const debit = settleDebit({
    userId: params.userId,
    amount: deed.creditsCost,
    reason: "LAND_CLAIM",
    requestId: params.requestId,
    metadata: {
      plotId: plot.plotId,
      neighborhoodId: neighborhood.neighborhoodId,
      solNeverRequired: true,
    },
  });
  if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };

  plot.ownerUserId = params.userId;
  plot.deedSize = deed.size;
  plot.buildLimit = deed.buildLimit;
  plot.decorLimit = deed.decorLimit;
  plot.status = "owned";
  plot.lastActivityAt = new Date().toISOString();
  plot.abandonedWarnedAt = null;

  let homeId: string | null = null;
  if (params.autoBuildHome !== false) {
    const existing = getHomeForUser(params.userId);
    if (existing) {
      const linked = attachHomeToPlot({
        userId: params.userId,
        plotId: plot.plotId,
        neighborhoodId: neighborhood.neighborhoodId,
      });
      if (linked.ok) {
        homeId = linked.home.homeId;
        plot.homeId = homeId;
        plot.exteriorFacadeKey = linked.home.exteriorFacadeKey;
      }
    } else {
      const tier = params.propertyTier ?? deedToTier(deed.size);
      const home = purchaseOrBuildHome({
        userId: params.userId,
        name: params.homeName ?? `${deed.name} Home`,
        propertyTier: tier,
        acquisition: "claim_land_build",
        requestId: `${params.requestId}:home`,
        plotId: plot.plotId,
        neighborhoodId: neighborhood.neighborhoodId,
      });
      if (home.ok) {
        homeId = home.home.homeId;
        plot.homeId = homeId;
        plot.exteriorFacadeKey = home.home.exteriorFacadeKey;
      }
    }
  }

  store().recentClaimKeys = [...store().recentClaimKeys, params.userId].slice(-20);
  recomputeStage(neighborhood);
  persist(neighborhood);
  trackAnalytics("player_city_claim", {
    neighborhoodId: neighborhood.neighborhoodId,
    plotId: plot.plotId,
  });
  return { ok: true, neighborhood, plot, homeId, risk: risk.note };
}

function deedToTier(size: DeedSize): PropertyTier {
  switch (size) {
    case "tiny":
    case "small":
      return "starter_cabin";
    case "medium":
      return "cottage";
    case "large":
    case "grove":
      return "farmstead";
    case "lakefront":
      return "lakeside_lodge";
    case "cliffside":
      return "cliffside_villa";
    case "island":
      return "underground_hideout";
    case "estate":
      return "manor";
    case "castle":
      return "manor";
    default:
      return "cottage";
  }
}

export function donateToProject(params: {
  userId: string;
  neighborhoodId: string;
  projectId: string;
  materials: number;
  requestId: string;
}):
  | { ok: true; neighborhood: PlayerNeighborhood; project: CommunityProject }
  | { ok: false; error: string; message: string } {
  const n = getNeighborhood(params.neighborhoodId);
  if (!n) return { ok: false, error: "missing", message: "Neighborhood not found." };
  const project = n.projects.find((p) => p.projectId === params.projectId);
  if (!project) return { ok: false, error: "missing_project", message: "Project not found." };
  if (project.completed) return { ok: true, neighborhood: n, project };
  const mats = Math.min(50, Math.max(1, Math.floor(params.materials)));
  // Soft Credits sink — HOUSING_FEE minAmount is 25
  const debit = settleDebit({
    userId: params.userId,
    amount: Math.max(25, mats * 2),
    reason: "HOUSING_FEE",
    requestId: params.requestId,
    metadata: { action: "community_project", projectId: project.projectId, materials: mats },
  });
  if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };

  project.donatedMaterials += mats;
  n.contributions.push({
    id: `contrib_${Date.now().toString(36)}`,
    neighborhoodId: n.neighborhoodId,
    userId: params.userId,
    materials: mats,
    at: new Date().toISOString(),
    projectId: project.projectId,
  });
  if (n.contributions.length > 200) n.contributions.splice(0, n.contributions.length - 200);
  if (project.donatedMaterials >= project.goalMaterials) {
    project.completed = true;
    n.reputation += 5;
    n.landmarks.push({
      landmarkId: `lm_${project.kind}_${Date.now().toString(36)}`,
      neighborhoodId: n.neighborhoodId,
      name: project.name,
      kind: project.kind,
      coords: { col: 3, row: 3 },
      seasonalDecor: n.seasonalDecorTheme,
    });
  }
  persist(n);
  return { ok: true, neighborhood: n, project };
}

export function electMayor(params: {
  neighborhoodId: string;
  userId: string;
}): { ok: true; neighborhood: PlayerNeighborhood } | { ok: false; error: string; message: string } {
  const n = getNeighborhood(params.neighborhoodId);
  if (!n) return { ok: false, error: "missing", message: "Neighborhood not found." };
  if (!n.plots.some((p) => p.ownerUserId === params.userId)) {
    return { ok: false, error: "not_resident", message: "Only plot holders may serve." };
  }
  n.government.mayorUserId = params.userId;
  if (!n.government.councilUserIds.includes(params.userId)) {
    n.government.councilUserIds = [params.userId, ...n.government.councilUserIds].slice(0, 5);
  }
  persist(n);
  return { ok: true, neighborhood: n };
}

export function proposeCosmeticMotion(params: {
  neighborhoodId: string;
  userId: string;
  title: string;
  kind: "decor_theme" | "event_schedule" | "park_name" | "festival_banner";
}): { ok: true; neighborhood: PlayerNeighborhood } | { ok: false; error: string; message: string } {
  const n = getNeighborhood(params.neighborhoodId);
  if (!n) return { ok: false, error: "missing", message: "Neighborhood not found." };
  if (
    n.government.mayorUserId !== params.userId &&
    !n.government.councilUserIds.includes(params.userId)
  ) {
    return { ok: false, error: "forbidden", message: "Council/mayor only." };
  }
  if (flagOffensiveDecor(params.title)) {
    return { ok: false, error: "offensive", message: "Motion rejected by moderation stub." };
  }
  n.government.activeMotions.push({
    id: `mot_${Date.now().toString(36)}`,
    title: params.title.slice(0, 80),
    kind: params.kind,
    votesYes: 1,
    votesNo: 0,
  });
  n.government.activeMotions = n.government.activeMotions.slice(-12);
  persist(n);
  return { ok: true, neighborhood: n };
}

export function openStorefront(params: {
  userId: string;
  plotId: string;
  name: string;
  hours?: string;
  displayItemKeys?: string[];
}):
  | { ok: true; store: PlayerStorefront; neighborhood: PlayerNeighborhood }
  | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("PLAYER_SHOPS_ENABLED") && !isFeatureEnabled("PLAYER_NEIGHBORHOODS_ENABLED")) {
    return { ok: false, error: "disabled", message: "Player shops disabled." };
  }
  const found = getPlot(params.plotId);
  if (!found || found.plot.ownerUserId !== params.userId) {
    return { ok: false, error: "not_owner", message: "You do not own this plot." };
  }
  const storefront: PlayerStorefront = {
    storeId: `store_${params.plotId}`,
    plotId: params.plotId,
    ownerUserId: params.userId,
    name: params.name.slice(0, 40),
    hours: params.hours ?? "dawn–dusk",
    displayItemKeys: (params.displayItemKeys ?? []).slice(0, 6),
    open: true,
  };
  const n = found.neighborhood;
  n.stores = [...n.stores.filter((s) => s.plotId !== params.plotId), storefront];
  found.plot.lastActivityAt = new Date().toISOString();
  persist(n);
  return { ok: true, store: storefront, neighborhood: n };
}

export function scheduleNeighborhoodEvent(params: {
  neighborhoodId: string;
  userId: string;
  title: string;
  kind: NeighborhoodEvent["kind"];
  hours?: number;
}):
  | { ok: true; event: NeighborhoodEvent; neighborhood: PlayerNeighborhood }
  | { ok: false; error: string; message: string } {
  const n = getNeighborhood(params.neighborhoodId);
  if (!n) return { ok: false, error: "missing", message: "Neighborhood not found." };
  const start = Date.now();
  const event: NeighborhoodEvent = {
    id: `ne_${start.toString(36)}`,
    neighborhoodId: n.neighborhoodId,
    title: params.title.slice(0, 60),
    kind: params.kind,
    startsAt: new Date(start).toISOString(),
    endsAt: new Date(start + (params.hours ?? 4) * 3600_000).toISOString(),
  };
  n.events = [...n.events, event].slice(-10);
  n.npcLife.visitors += 2;
  n.npcLife.musicians = Math.min(6, n.npcLife.musicians + (params.kind === "concert" ? 1 : 0));
  persist(n);
  return { ok: true, event, neighborhood: n };
}

export function setSeasonalDecor(params: {
  neighborhoodId: string;
  theme: string;
  userId: string;
}): { ok: true; neighborhood: PlayerNeighborhood } | { ok: false; error: string; message: string } {
  const n = getNeighborhood(params.neighborhoodId);
  if (!n) return { ok: false, error: "missing", message: "Neighborhood not found." };
  if (n.government.mayorUserId && n.government.mayorUserId !== params.userId) {
    if (!n.government.councilUserIds.includes(params.userId)) {
      return { ok: false, error: "forbidden", message: "Cosmetic theme requires council." };
    }
  }
  if (flagOffensiveDecor(params.theme)) {
    return { ok: false, error: "offensive", message: "Theme blocked." };
  }
  n.seasonalDecorTheme = params.theme.slice(0, 40);
  for (const lm of n.landmarks) lm.seasonalDecor = n.seasonalDecorTheme;
  persist(n);
  return { ok: true, neighborhood: n };
}

export function tickNeighborhoodMaintenance(neighborhoodId: string): PlayerNeighborhood | null {
  const n = getNeighborhood(neighborhoodId);
  if (!n) return null;
  const { updated } = evaluateAbandonedPlots(n);
  n.plots = updated;
  recomputeStage(n);
  persist(n);
  return n;
}

export function neighborhoodSnapshot(neighborhoodId?: string) {
  const list = neighborhoodId
    ? [getNeighborhood(neighborhoodId)].filter(Boolean)
    : listNeighborhoods();
  return {
    neighborhoods: list,
    deeds: LAND_DEEDS,
    stageNotes: list[0] ? stageUnlockNotes(list[0]!.stage) : [],
    flags: {
      PLAYER_NEIGHBORHOODS_ENABLED: isFeatureEnabled("PLAYER_NEIGHBORHOODS_ENABLED"),
      PLAYER_NEIGHBORHOODS_PRISMA_ENABLED: isFeatureEnabled("PLAYER_NEIGHBORHOODS_PRISMA_ENABLED"),
    },
    architecture: {
      exterior: "shared Live World neighborhood layer",
      interior: "private HomeInstance per owner",
      kingdoms: "future — not implemented",
    },
  };
}
