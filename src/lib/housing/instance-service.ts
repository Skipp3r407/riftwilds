/**
 * Private home instances — HomeID + PlayerID, persistent per owner.
 * Hot path: in-memory (Credits/land pattern). Prisma prepare-only behind flag.
 */

import { trackAnalytics } from "@/lib/analytics/events";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { settleDebit, settleEnsureStarter } from "@/lib/economy/core/settlement";
import { ensureHomesteadMirror } from "@/lib/economy/housing-service";
import { claimLandParcel } from "@/lib/economy/land";
import {
  EMPTY_LAND_CLAIM_CREDITS,
  EXPANSION_LEVEL_CREDITS,
  getPropertyDef,
  PROPERTY_CATALOG,
} from "@/lib/housing/property-catalog";
import { defaultPermissionGrants, hasPermission } from "@/lib/housing/permissions";
import { recordHomeVisit } from "@/lib/social-presence/home-visits";
import type {
  AcquisitionMode,
  HomeEventStub,
  HomeInstanceHandle,
  HomeRoomState,
  HomeVisitPolicy,
  PlayerHome,
  PropertyTier,
} from "@/lib/housing/types";

type Store = {
  homes: Map<string, PlayerHome>;
  byOwner: Map<string, string>;
  instances: Map<string, HomeInstanceHandle>;
};

function store(): Store {
  const g = globalThis as unknown as { __rwPlayerHousing?: Store };
  if (!g.__rwPlayerHousing) {
    g.__rwPlayerHousing = {
      homes: new Map(),
      byOwner: new Map(),
      instances: new Map(),
    };
  }
  return g.__rwPlayerHousing;
}

export function resetPlayerHousingForTests(): void {
  const g = globalThis as unknown as { __rwPlayerHousing?: Store };
  g.__rwPlayerHousing = {
    homes: new Map(),
    byOwner: new Map(),
    instances: new Map(),
  };
}

function starterRooms(tier: PropertyTier): HomeRoomState[] {
  const prop = getPropertyDef(tier)!;
  const rooms: HomeRoomState[] = [
    baseRoom("pet-house", "Riftling Room", true),
    baseRoom("storage", "Storage", true),
    baseRoom("guest-area", "Guest Area", prop.maxRooms >= 4),
    baseRoom("garden", "Garden", prop.supportsFarm),
    baseRoom("workshop", "Workshop", prop.supportsWorkshop),
    baseRoom("forge", "Forge", prop.supportsWorkshop),
    baseRoom("observatory-nook", "Observatory", prop.supportsObservatory),
    baseRoom("secret-cellar", "Secret Cellar", false, true),
    baseRoom("outdoor-yard", "Outdoor Yard", true),
  ];
  return rooms.slice(0, Math.max(3, Math.min(prop.maxRooms + 2, rooms.length)));
}

function baseRoom(
  roomKey: string,
  name: string,
  unlocked: boolean,
  isSecret = false,
): HomeRoomState {
  return {
    roomKey,
    name,
    unlocked,
    wallKey: "wall_timber",
    floorKey: "floor_plank",
    lightingPreset: "hearth_warm",
    musicTrack: null,
    weatherThroughWindows: true,
    isSecret,
    furniture: [],
  };
}

function persist(home: PlayerHome): void {
  store().homes.set(home.homeId, home);
  store().byOwner.set(home.ownerUserId, home.homeId);
  store().instances.set(home.homeId, {
    homeId: home.homeId,
    ownerUserId: home.ownerUserId,
    instanceKey: `inst_${home.homeId}`,
    entryKind: "door",
    worldAnchor: home.plotId
      ? { mapId: "riftwild-commons", x: 0, y: 0 }
      : { mapId: "riftwild-commons", x: 14 * 64, y: 14 * 64 },
  });
}

export function getHomeById(homeId: string): PlayerHome | null {
  return store().homes.get(homeId) ?? null;
}

export function getHomeForUser(userId: string): PlayerHome | null {
  const id = store().byOwner.get(userId);
  return id ? store().homes.get(id) ?? null : null;
}

/** Link an existing private home to a neighborhood plot (no second purchase). */
export function attachHomeToPlot(params: {
  userId: string;
  plotId: string;
  neighborhoodId: string;
}): { ok: true; home: PlayerHome } | { ok: false; error: string; message: string } {
  const home = getHomeForUser(params.userId);
  if (!home) return { ok: false, error: "no_home", message: "No home to attach." };
  home.plotId = params.plotId;
  home.neighborhoodId = params.neighborhoodId;
  home.revision += 1;
  home.updatedAt = new Date().toISOString();
  persist(home);
  return { ok: true, home };
}

export function listHomes(filter?: {
  visitPolicy?: HomeVisitPolicy;
  featured?: boolean;
}): PlayerHome[] {
  let list = [...store().homes.values()];
  if (filter?.visitPolicy) list = list.filter((h) => h.visitPolicy === filter.visitPolicy);
  if (filter?.featured != null) list = list.filter((h) => h.featured === filter.featured);
  return list;
}

export function getHomeInstance(homeId: string): HomeInstanceHandle | null {
  return store().instances.get(homeId) ?? null;
}

export function purchaseOrBuildHome(params: {
  userId: string;
  name: string;
  propertyTier: PropertyTier;
  acquisition: AcquisitionMode;
  requestId: string;
  parcelId?: string;
  neighborhoodId?: string;
  plotId?: string;
}): { ok: true; home: PlayerHome } | { ok: false; error: string; message: string } {
  if (
    !isFeatureEnabled("PLAYER_HOUSING_ENABLED") &&
    !isFeatureEnabled("HOUSING_ECONOMY_ENABLED")
  ) {
    return { ok: false, error: "disabled", message: "Player housing disabled." };
  }
  if (store().byOwner.has(params.userId)) {
    return { ok: false, error: "exists", message: "You already own a private home instance." };
  }

  const prop = getPropertyDef(params.propertyTier);
  if (!prop) return { ok: false, error: "unknown_tier", message: "Unknown property type." };
  if (!prop.acquisition.includes(params.acquisition)) {
    return {
      ok: false,
      error: "acquisition",
      message: "This property type does not support that acquisition mode.",
    };
  }

  settleEnsureStarter(params.userId);
  // Neighborhood deed already paid for the shell — only charge a modest interior fee.
  const bundledWithNeighborhood = Boolean(params.plotId && params.neighborhoodId);
  let cost = prop.creditsCost;
  if (params.acquisition === "claim_land_build") {
    cost = bundledWithNeighborhood
      ? 25
      : EMPTY_LAND_CLAIM_CREDITS + Math.floor(prop.creditsCost * 0.35);
  }

  if (cost > 0) {
    const debit = settleDebit({
      userId: params.userId,
      amount: cost,
      reason: "HOUSING_FEE",
      requestId: params.requestId,
      metadata: {
        action: params.acquisition,
        tier: params.propertyTier,
        solNeverRequired: true,
        bundledWithNeighborhood,
      },
    });
    if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };
  }

  if (params.parcelId) {
    const claim = claimLandParcel({
      parcelId: params.parcelId,
      userId: params.userId,
      requestId: `${params.requestId}:parcel`,
    });
    if (!claim.ok && claim.error !== "disabled") {
      // Soft: parcel optional when neighborhood plot provided
      if (!params.plotId) {
        return { ok: false, error: claim.error, message: claim.message };
      }
    }
  }

  // Bridge legacy homestead economy record without a second debit
  ensureHomesteadMirror({ userId: params.userId, name: params.name });

  const now = new Date().toISOString();
  const homeId = `home_${params.userId.slice(0, 10)}_${Date.now().toString(36)}`;
  const rooms = starterRooms(params.propertyTier);
  if (params.acquisition === "claim_land_build") {
    // Empty shell — only pet-house + outdoor unlocked
    for (const r of rooms) {
      if (r.roomKey !== "pet-house" && r.roomKey !== "outdoor-yard" && r.roomKey !== "storage") {
        r.unlocked = false;
      }
    }
  }

  const home: PlayerHome = {
    homeId,
    ownerUserId: params.userId,
    publicId: `ph_${homeId.slice(-10)}`,
    name: params.name.trim().slice(0, 40) || prop.name,
    propertyTier: params.propertyTier,
    acquisition: params.acquisition,
    plotId: params.plotId ?? params.parcelId ?? null,
    neighborhoodId: params.neighborhoodId ?? null,
    visitPolicy: "FRIENDS",
    themeKey: prop.biomeHint,
    exteriorFacadeKey: prop.thumbKey,
    musicAmbient: null,
    lightingGlobal: "day_hearth",
    rooms,
    storage: [],
    permissions: defaultPermissionGrants(params.userId),
    visitors: [],
    events: [],
    npcs: [{ npcKey: "caretaker-elm", name: "Elm the Caretaker", role: "caretaker", roomKey: "pet-house" }],
    riftlings: [],
    garden: prop.supportsFarm
      ? [
          { plotKey: "plot_a", cropKey: null, plantedAt: null, readyAt: null },
          { plotKey: "plot_b", cropKey: null, plantedAt: null, readyAt: null },
        ]
      : [],
    workshopStations: prop.supportsWorkshop ? ["anvil_stub", "alchemy_stub"] : [],
    likes: 0,
    featured: false,
    expansionLevel: 0,
    createdAt: now,
    updatedAt: now,
    revision: 1,
  };

  persist(home);
  trackAnalytics("homestead_view", { homeId, tier: params.propertyTier });
  return { ok: true, home };
}

export function unlockHomeRoom(params: {
  userId: string;
  roomKey: string;
  requestId: string;
}): { ok: true; home: PlayerHome } | { ok: false; error: string; message: string } {
  const home = getHomeForUser(params.userId);
  if (!home) return { ok: false, error: "no_home", message: "Create a home first." };
  const room = home.rooms.find((r) => r.roomKey === params.roomKey);
  if (!room) return { ok: false, error: "unknown_room", message: "Unknown room." };
  if (room.unlocked) return { ok: true, home };

  const debit = settleDebit({
    userId: params.userId,
    amount: 75,
    reason: "HOUSING_FEE",
    requestId: params.requestId,
    metadata: { action: "unlock_room", roomKey: params.roomKey },
  });
  if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };
  room.unlocked = true;
  if (room.isSecret) {
    room.lightingPreset = "secret_amber";
  }
  home.revision += 1;
  home.updatedAt = new Date().toISOString();
  persist(home);
  return { ok: true, home };
}

export function expandProperty(params: {
  userId: string;
  requestId: string;
}): { ok: true; home: PlayerHome } | { ok: false; error: string; message: string } {
  const home = getHomeForUser(params.userId);
  if (!home) return { ok: false, error: "no_home", message: "Create a home first." };
  const next = home.expansionLevel + 1;
  const cost = EXPANSION_LEVEL_CREDITS[next];
  if (cost == null) {
    return { ok: false, error: "max", message: "Max expansion reached for Phase 1." };
  }
  const debit = settleDebit({
    userId: params.userId,
    amount: cost,
    reason: "HOUSING_FEE",
    requestId: params.requestId,
    metadata: { action: "expand", level: next },
  });
  if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };
  home.expansionLevel = next;
  home.garden.push({
    plotKey: `plot_x${next}`,
    cropKey: null,
    plantedAt: null,
    readyAt: null,
  });
  home.revision += 1;
  persist(home);
  return { ok: true, home };
}

export function setVisitPolicy(params: {
  userId: string;
  policy: HomeVisitPolicy;
}): { ok: true; home: PlayerHome } | { ok: false; error: string; message: string } {
  const home = getHomeForUser(params.userId);
  if (!home) return { ok: false, error: "no_home", message: "Create a home first." };
  home.visitPolicy = params.policy;
  home.revision += 1;
  persist(home);
  return { ok: true, home };
}

export function enterHomeInstance(params: {
  homeId: string;
  visitorId: string;
  isFriend?: boolean;
  isGuildMate?: boolean;
}):
  | { ok: true; instance: HomeInstanceHandle; home: PlayerHome }
  | { ok: false; error: string; message: string } {
  const home = getHomeById(params.homeId);
  if (!home) return { ok: false, error: "missing", message: "Home not found." };
  if (
    !hasPermission(home, params.visitorId, "enter", {
      isFriend: params.isFriend,
      isGuildMate: params.isGuildMate,
    })
  ) {
    return { ok: false, error: "forbidden", message: "You cannot enter this home." };
  }
  const instance = getHomeInstance(params.homeId);
  if (!instance) return { ok: false, error: "no_instance", message: "Instance missing." };
  return { ok: true, instance, home };
}

export function visitHomeSocial(params: {
  homeId: string;
  visitorId: string;
  liked?: boolean;
  rating?: number | null;
  guestbookNote?: string | null;
  emoteUsed?: string | null;
}): { ok: true; home: PlayerHome } | { ok: false; error: string; message: string } {
  const entered = enterHomeInstance({
    homeId: params.homeId,
    visitorId: params.visitorId,
  });
  if (!entered.ok) return entered;
  const home = entered.home;
  recordHomeVisit({
    homeId: params.homeId,
    visitorId: params.visitorId,
    liked: params.liked,
    rating: params.rating,
    guestbookNote: params.guestbookNote,
  });
  home.visitors.push({
    visitorId: params.visitorId,
    at: new Date().toISOString(),
    liked: Boolean(params.liked),
    rating: params.rating ?? null,
    guestbookNote: params.guestbookNote?.slice(0, 200) ?? null,
    emoteUsed: params.emoteUsed ?? null,
  });
  if (home.visitors.length > 200) home.visitors.splice(0, home.visitors.length - 200);
  if (params.liked) home.likes += 1;
  home.revision += 1;
  persist(home);
  return { ok: true, home };
}

export function scheduleHomeEvent(params: {
  userId: string;
  title: string;
  kind: HomeEventStub["kind"];
  hours: number;
  invitePolicy?: HomeVisitPolicy;
}): { ok: true; home: PlayerHome; event: HomeEventStub } | { ok: false; error: string; message: string } {
  const home = getHomeForUser(params.userId);
  if (!home) return { ok: false, error: "no_home", message: "Create a home first." };
  if (!hasPermission(home, params.userId, "host_events")) {
    return { ok: false, error: "forbidden", message: "Cannot host events." };
  }
  const start = Date.now();
  const event: HomeEventStub = {
    id: `he_${start.toString(36)}`,
    title: params.title.slice(0, 60),
    kind: params.kind,
    startsAt: new Date(start).toISOString(),
    endsAt: new Date(start + Math.min(12, Math.max(1, params.hours)) * 3600_000).toISOString(),
    invitePolicy: params.invitePolicy ?? home.visitPolicy,
  };
  home.events = [...home.events, event].slice(-8);
  home.revision += 1;
  persist(home);
  return { ok: true, home, event };
}

export function setHomeAmbience(params: {
  userId: string;
  musicAmbient?: string | null;
  lightingGlobal?: string;
  roomKey?: string;
  lightingPreset?: string;
  musicTrack?: string | null;
  weatherThroughWindows?: boolean;
}): { ok: true; home: PlayerHome } | { ok: false; error: string; message: string } {
  const home = getHomeForUser(params.userId);
  if (!home) return { ok: false, error: "no_home", message: "Create a home first." };
  if (params.musicAmbient !== undefined) {
    if (!hasPermission(home, params.userId, "edit_music")) {
      return { ok: false, error: "forbidden", message: "Cannot edit music." };
    }
    home.musicAmbient = params.musicAmbient;
  }
  if (params.lightingGlobal) {
    if (!hasPermission(home, params.userId, "edit_lighting")) {
      return { ok: false, error: "forbidden", message: "Cannot edit lighting." };
    }
    home.lightingGlobal = params.lightingGlobal;
  }
  if (params.roomKey) {
    const room = home.rooms.find((r) => r.roomKey === params.roomKey);
    if (room) {
      if (params.lightingPreset) room.lightingPreset = params.lightingPreset;
      if (params.musicTrack !== undefined) room.musicTrack = params.musicTrack;
      if (params.weatherThroughWindows != null) {
        room.weatherThroughWindows = params.weatherThroughWindows;
      }
    }
  }
  home.revision += 1;
  persist(home);
  return { ok: true, home };
}

export function plantGardenCrop(params: {
  userId: string;
  plotKey: string;
  cropKey: string;
}): { ok: true; home: PlayerHome } | { ok: false; error: string; message: string } {
  const home = getHomeForUser(params.userId);
  if (!home) return { ok: false, error: "no_home", message: "Create a home first." };
  if (!hasPermission(home, params.userId, "farm")) {
    return { ok: false, error: "forbidden", message: "Cannot farm here." };
  }
  const plot = home.garden.find((p) => p.plotKey === params.plotKey);
  if (!plot) return { ok: false, error: "missing_plot", message: "Plot not found." };
  const now = Date.now();
  plot.cropKey = params.cropKey.slice(0, 40);
  plot.plantedAt = new Date(now).toISOString();
  plot.readyAt = new Date(now + 2 * 24 * 3600_000).toISOString();
  home.revision += 1;
  persist(home);
  return { ok: true, home };
}

export function assignRiftlingCare(params: {
  userId: string;
  petId: string;
  roomKey?: string;
}): { ok: true; home: PlayerHome } | { ok: false; error: string; message: string } {
  const home = getHomeForUser(params.userId);
  if (!home) return { ok: false, error: "no_home", message: "Create a home first." };
  const roomKey = params.roomKey ?? "pet-house";
  const room = home.rooms.find((r) => r.roomKey === roomKey);
  if (!room?.unlocked) {
    return { ok: false, error: "room_locked", message: "Riftling room locked." };
  }
  home.riftlings = home.riftlings.filter((r) => r.petId !== params.petId);
  home.riftlings.push({
    petId: params.petId,
    roomKey,
    comfort: 70,
    lastFedAt: null,
  });
  home.revision += 1;
  persist(home);
  return { ok: true, home };
}

export function housingCatalogSnapshot() {
  return {
    properties: PROPERTY_CATALOG,
    flags: {
      PLAYER_HOUSING_ENABLED: isFeatureEnabled("PLAYER_HOUSING_ENABLED"),
      PLAYER_HOUSING_PRISMA_ENABLED: isFeatureEnabled("PLAYER_HOUSING_PRISMA_ENABLED"),
      HOUSING_ECONOMY_ENABLED: isFeatureEnabled("HOUSING_ECONOMY_ENABLED"),
    },
    note: "SOL never required for basic housing. Prisma prepare-only until approved.",
  };
}

export function housingAdminSnapshot() {
  const homes = listHomes();
  return {
    homeCount: homes.length,
    featured: homes.filter((h) => h.featured).length,
    tiers: PROPERTY_CATALOG.map((p) => p.tier),
  };
}
