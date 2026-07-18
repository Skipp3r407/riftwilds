/**
 * Player Neighborhoods — shared exteriors + private interiors.
 * Extends housing, land, player-cities; kingdoms/nations deferred.
 */

export type DeedSize =
  | "tiny"
  | "small"
  | "medium"
  | "large"
  | "estate"
  | "castle"
  | "island"
  | "lakefront"
  | "cliffside"
  | "grove";

export type DistrictKind =
  | "residential"
  | "merchant"
  | "crafting"
  | "farming"
  | "fishing"
  | "magic"
  | "guild"
  | "military"
  | "entertainment"
  | "temple"
  | "luxury";

export type VillageStage = "hamlet" | "village" | "town" | "city" | "capital";

export type PlotStatus =
  | "vacant"
  | "owned"
  | "for_sale"
  | "npc_maintained"
  | "auctioned"
  | "abandoned_warned";

export type PublicBuildingKey =
  | "bank"
  | "inn"
  | "guild_hall"
  | "library"
  | "tavern"
  | "marketplace"
  | "arena"
  | "museum"
  | "town_hall"
  | "stable"
  | "blacksmith"
  | "auction_house";

export type CommunityProjectKind =
  | "fountain"
  | "bridge"
  | "walls"
  | "docks"
  | "arena"
  | "town_hall"
  | "park"
  | "riftling_park"
  | "weekend_market";

export type GovRole = "mayor" | "council" | "steward" | "none";

export type LandDeedDef = {
  size: DeedSize;
  name: string;
  creditsCost: number;
  buildLimit: number;
  decorLimit: number;
  terrain: string;
  elevation: "low" | "mid" | "high";
  roadAccess: boolean;
  waterAccess: boolean;
  blurb: string;
};

export type PlayerPlot = {
  plotId: string;
  neighborhoodId: string;
  districtId: string;
  ownerUserId: string | null;
  deedSize: DeedSize;
  coords: { col: number; row: number };
  biome: string;
  elevation: "low" | "mid" | "high";
  roadAccess: boolean;
  waterAccess: boolean;
  buildLimit: number;
  decorLimit: number;
  status: PlotStatus;
  homeId: string | null;
  exteriorFacadeKey: string | null;
  mailbox: boolean;
  abandonedWarnedAt: string | null;
  lastActivityAt: string;
};

export type NeighborhoodDistrict = {
  districtId: string;
  kind: DistrictKind;
  name: string;
  flavor: string;
  plotIds: string[];
};

export type CommunityProject = {
  projectId: string;
  neighborhoodId: string;
  kind: CommunityProjectKind;
  name: string;
  goalMaterials: number;
  donatedMaterials: number;
  completed: boolean;
  worldStateKey: string;
};

export type PlayerContribution = {
  id: string;
  neighborhoodId: string;
  userId: string;
  materials: number;
  at: string;
  projectId: string | null;
};

export type PublicBuilding = {
  key: PublicBuildingKey;
  unlocked: boolean;
  label: string;
  unlockStage: VillageStage;
};

export type PlayerStorefront = {
  storeId: string;
  plotId: string;
  ownerUserId: string;
  name: string;
  hours: string;
  displayItemKeys: string[];
  open: boolean;
};

export type PlayerGovernment = {
  neighborhoodId: string;
  mayorUserId: string | null;
  councilUserIds: string[];
  /** Cosmetic / community decisions only — no grief powers. */
  activeMotions: {
    id: string;
    title: string;
    kind: "decor_theme" | "event_schedule" | "park_name" | "festival_banner";
    votesYes: number;
    votesNo: number;
  }[];
};

export type NeighborhoodEvent = {
  id: string;
  neighborhoodId: string;
  title: string;
  kind: "weekend_market" | "concert" | "festival" | "gathering";
  startsAt: string;
  endsAt: string;
};

export type Landmark = {
  landmarkId: string;
  neighborhoodId: string;
  name: string;
  kind: string;
  coords: { col: number; row: number };
  seasonalDecor: string | null;
};

export type NeighborhoodNpcLife = {
  musicians: number;
  animals: number;
  visitors: number;
  campfiresLit: boolean;
};

export type PlayerNeighborhood = {
  neighborhoodId: string;
  name: string;
  regionSlug: string;
  mapId: string;
  stage: VillageStage;
  occupiedHomes: number;
  plotCap: number;
  districts: NeighborhoodDistrict[];
  plots: PlayerPlot[];
  projects: CommunityProject[];
  contributions: PlayerContribution[];
  publicBuildings: PublicBuilding[];
  stores: PlayerStorefront[];
  government: PlayerGovernment;
  events: NeighborhoodEvent[];
  landmarks: Landmark[];
  npcLife: NeighborhoodNpcLife;
  reputation: number;
  seasonalDecorTheme: string | null;
  sharedRoads: boolean;
  lightingPreset: string;
  createdAt: string;
  updatedAt: string;
};
