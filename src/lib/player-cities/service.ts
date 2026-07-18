/**
 * Player-Owned Cities — charter, districts, members, billboards.
 * Extends land ownership + housing Credits economy.
 */

import { trackAnalytics } from "@/lib/analytics/events";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { settleDebit, settleEnsureStarter } from "@/lib/economy/core/settlement";
import { claimLandParcel, listLandParcels } from "@/lib/economy/land";
import type {
  CityBillboard,
  CityCharterRequest,
  CivicRole,
  PlayerCity,
} from "@/lib/player-cities/types";

/** Civic filing fee on top of parcel claim — keep starter-affordable. */
const CHARTER_FEE_CREDITS = 40;
const BILLBOARD_FEE_CREDITS = 25;
const BILLBOARD_TTL_MS = 3 * 24 * 60 * 60_000;

type Store = { cities: Map<string, PlayerCity> };

function store(): Store {
  const g = globalThis as unknown as { __rwPlayerCities?: Store };
  if (!g.__rwPlayerCities) g.__rwPlayerCities = { cities: new Map() };
  return g.__rwPlayerCities;
}

export function resetPlayerCitiesForTests(): void {
  store().cities.clear();
}

export function listPlayerCities(): PlayerCity[] {
  return [...store().cities.values()];
}

export function getPlayerCity(cityId: string): PlayerCity | null {
  return store().cities.get(cityId) ?? null;
}

export function getCityForUser(userId: string): PlayerCity | null {
  return (
    listPlayerCities().find((c) => c.members.some((m) => m.userId === userId)) ?? null
  );
}

function defaultDistricts(parcelId: string) {
  return [
    {
      id: "dist-plaza",
      kind: "plaza" as const,
      label: "Founders Plaza",
      parcelIds: [parcelId],
      amenityLevel: 1,
    },
    {
      id: "dist-market",
      kind: "market" as const,
      label: "Market Row",
      parcelIds: [],
      amenityLevel: 0,
    },
    {
      id: "dist-billboards",
      kind: "billboard_row" as const,
      label: "Billboard Lane",
      parcelIds: [],
      amenityLevel: 0,
    },
  ];
}

export function charterPlayerCity(
  req: CityCharterRequest,
  requestId: string,
): { ok: true; city: PlayerCity } | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("LAND_OWNERSHIP_ENABLED") && !isFeatureEnabled("HOUSING_ECONOMY_ENABLED")) {
    return { ok: false, error: "disabled", message: "City systems require land/housing flags." };
  }

  const name = req.name.trim().slice(0, 40);
  if (name.length < 3) {
    return { ok: false, error: "bad_name", message: "City name too short." };
  }
  if (listPlayerCities().some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    return { ok: false, error: "name_taken", message: "City name already chartered." };
  }

  settleEnsureStarter(req.founderUserId);
  const fee = settleDebit({
    userId: req.founderUserId,
    amount: CHARTER_FEE_CREDITS,
    reason: "HOUSING_FEE",
    requestId: `${requestId}:charter`,
    metadata: { action: "city_charter", name },
  });
  if (!fee.ok) {
    return { ok: false, error: fee.error, message: fee.message };
  }

  const claim = claimLandParcel({
    parcelId: req.seedParcelId,
    userId: req.founderUserId,
    requestId: `${requestId}:parcel`,
  });
  if (!claim.ok) {
    // Fee already taken — leave as upkeep toward next attempt; Phase 1 honest.
    return { ok: false, error: claim.error, message: claim.message };
  }

  const now = new Date().toISOString();
  const city: PlayerCity = {
    id: `city_${Date.now().toString(36)}`,
    name,
    regionSlug: req.regionSlug,
    founderUserId: req.founderUserId,
    charterBlurb:
      req.charterBlurb?.slice(0, 240) ||
      `A keeper-founded city on ${req.regionSlug.replace(/-/g, " ")}.`,
    foundedAt: now,
    renown: 1,
    districts: defaultDistricts(req.seedParcelId),
    members: [
      { userId: req.founderUserId, role: "founder", joinedAt: now },
      { userId: req.founderUserId, role: "mayor", joinedAt: now },
    ],
    billboards: [],
    upkeepCreditsPerDay: 15,
    populationCap: 24,
  };

  // Deduplicate founder roles
  city.members = [
    { userId: req.founderUserId, role: "founder", joinedAt: now },
  ];
  store().cities.set(city.id, city);
  trackAnalytics("player_city_claim", { cityId: city.id, region: city.regionSlug });
  return { ok: true, city };
}

export function joinPlayerCity(params: {
  cityId: string;
  userId: string;
  role?: CivicRole;
}): { ok: true; city: PlayerCity } | { ok: false; error: string; message: string } {
  const city = getPlayerCity(params.cityId);
  if (!city) return { ok: false, error: "missing", message: "City not found." };
  if (city.members.some((m) => m.userId === params.userId)) {
    return { ok: true, city };
  }
  if (city.members.length >= city.populationCap) {
    return { ok: false, error: "full", message: "City population cap reached." };
  }
  city.members.push({
    userId: params.userId,
    role: params.role ?? "resident",
    joinedAt: new Date().toISOString(),
  });
  city.renown += 1;
  store().cities.set(city.id, city);
  return { ok: true, city };
}

export function postCityBillboard(params: {
  cityId: string;
  userId: string;
  message: string;
  requestId: string;
  cosmeticSkin?: string;
}): { ok: true; billboard: CityBillboard; city: PlayerCity } | { ok: false; error: string; message: string } {
  const city = getPlayerCity(params.cityId);
  if (!city) return { ok: false, error: "missing", message: "City not found." };
  if (!city.members.some((m) => m.userId === params.userId)) {
    return { ok: false, error: "not_member", message: "Join the city before posting." };
  }

  const fee = settleDebit({
    userId: params.userId,
    amount: BILLBOARD_FEE_CREDITS,
    reason: "HOUSING_FEE",
    requestId: params.requestId,
    metadata: { action: "city_billboard", cityId: city.id },
  });
  if (!fee.ok) return { ok: false, error: fee.error, message: fee.message };

  const now = Date.now();
  const billboard: CityBillboard = {
    id: `bb_${now.toString(36)}`,
    cityId: city.id,
    authorUserId: params.userId,
    message: params.message.trim().slice(0, 120),
    placedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + BILLBOARD_TTL_MS).toISOString(),
    cosmeticSkin: params.cosmeticSkin ?? "plain_wood",
  };
  city.billboards = [...city.billboards, billboard].slice(-12);
  store().cities.set(city.id, city);
  return { ok: true, billboard, city };
}

export function listAvailableCitySeedParcels() {
  return listLandParcels().filter((p) => p.status === "AVAILABLE");
}

export function playerCitiesAdminSnapshot() {
  return {
    cities: listPlayerCities(),
    availableParcels: listAvailableCitySeedParcels(),
    note: "City instances / nav-mesh ownership zones remain multiplayer backlog.",
  };
}
