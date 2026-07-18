/**
 * Player-Owned Cities — production core types.
 * Extends land parcels + housing; never SOL for civic fees.
 */

export type CityDistrictKind =
  | "plaza"
  | "market"
  | "residential"
  | "workshop"
  | "garden"
  | "dock"
  | "billboard_row";

export type CivicRole = "founder" | "mayor" | "steward" | "merchant" | "resident";

export type CityBillboard = {
  id: string;
  cityId: string;
  authorUserId: string;
  message: string;
  placedAt: string;
  expiresAt: string;
  cosmeticSkin: string;
};

export type CityDistrict = {
  id: string;
  kind: CityDistrictKind;
  label: string;
  parcelIds: string[];
  amenityLevel: number;
};

export type PlayerCity = {
  id: string;
  name: string;
  regionSlug: string;
  founderUserId: string;
  charterBlurb: string;
  foundedAt: string;
  renown: number;
  districts: CityDistrict[];
  members: { userId: string; role: CivicRole; joinedAt: string }[];
  billboards: CityBillboard[];
  /** Soft tax rate stub — Credits sinks for upkeep, never SOL. */
  upkeepCreditsPerDay: number;
  populationCap: number;
};

export type CityCharterRequest = {
  name: string;
  regionSlug: string;
  founderUserId: string;
  seedParcelId: string;
  charterBlurb?: string;
};
