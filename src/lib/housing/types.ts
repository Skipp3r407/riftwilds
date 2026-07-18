/**
 * Player Housing — private home instances, build mode, permissions.
 * Extends Homestead economy + land parcels; never requires SOL for basics.
 */

export type PropertyTier =
  | "starter_cabin"
  | "cottage"
  | "townhouse"
  | "farmstead"
  | "manor"
  | "treehouse"
  | "lakeside_lodge"
  | "cliffside_villa"
  | "underground_hideout"
  | "observatory";

export type AcquisitionMode = "buy_prebuilt" | "claim_land_build";

export type HousingRole =
  | "owner"
  | "co_owner"
  | "family"
  | "guild"
  | "friends"
  | "visitors"
  | "public";

export type PermissionFlag =
  | "enter"
  | "build"
  | "decorate"
  | "storage_take"
  | "storage_deposit"
  | "craft"
  | "farm"
  | "invite"
  | "manage_permissions"
  | "host_events"
  | "edit_music"
  | "edit_lighting";

export type FurnitureCategory =
  | "walls"
  | "floors"
  | "roofs"
  | "doors"
  | "windows"
  | "stairs"
  | "fences"
  | "seating"
  | "tables"
  | "beds"
  | "storage"
  | "lighting"
  | "decor"
  | "display"
  | "plants"
  | "music"
  | "care"
  | "farming"
  | "workshop"
  | "riftling"
  | "secret"
  | "exterior";

export type PlacementMode = "grid" | "free";

export type HomeVisitPolicy = "PRIVATE" | "FRIENDS" | "GUILD" | "FEATURED" | "PUBLIC";

export type PropertyDef = {
  tier: PropertyTier;
  name: string;
  blurb: string;
  creditsCost: number;
  /** Optional SOL vanity path — never required. */
  solOptionalLamports: number | null;
  maxRooms: number;
  maxFurniture: number;
  plotSlots: number;
  buildLimit: number;
  decorLimit: number;
  biomeHint: string;
  thumbKey: string;
  supportsFarm: boolean;
  supportsWorkshop: boolean;
  supportsObservatory: boolean;
  acquisition: AcquisitionMode[];
};

export type FurnitureSku = {
  key: string;
  name: string;
  category: FurnitureCategory;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  creditsCost: number;
  footprint: { w: number; h: number };
  rotatable: boolean;
  scalable: boolean;
  collides: boolean;
  roomTags: string[];
  description: string;
  thumbKey: string;
  /** Crafting / life-skill station stub id when applicable. */
  stationTrack?: "crafting" | "farming" | "care" | null;
  displaySlot?: boolean;
  exteriorOk?: boolean;
};

export type PlacedFurniture = {
  instanceId: string;
  skuKey: string;
  roomKey: string;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  scale: number;
  layer: number;
  locked: boolean;
};

export type HomeRoomState = {
  roomKey: string;
  name: string;
  unlocked: boolean;
  wallKey: string;
  floorKey: string;
  lightingPreset: string;
  musicTrack: string | null;
  weatherThroughWindows: boolean;
  isSecret: boolean;
  furniture: PlacedFurniture[];
};

export type HomeStorageSlot = {
  slotId: string;
  category: string;
  itemKey: string;
  qty: number;
  /** Anti-dupe ledger token — unique per deposit batch. */
  depositToken: string;
};

export type HomePermissionGrant = {
  role: HousingRole;
  subjectId: string | null;
  flags: PermissionFlag[];
};

export type HomeVisitorRecord = {
  visitorId: string;
  at: string;
  liked: boolean;
  rating: number | null;
  guestbookNote: string | null;
  emoteUsed: string | null;
};

export type HomeEventStub = {
  id: string;
  title: string;
  kind: "party" | "tour" | "competition" | "quiet_hours";
  startsAt: string;
  endsAt: string;
  invitePolicy: HomeVisitPolicy;
};

export type HomeNpcStub = {
  npcKey: string;
  name: string;
  role: "caretaker" | "gardener" | "musician" | "merchant";
  roomKey: string;
};

export type HomeRiftlingCare = {
  petId: string;
  roomKey: string;
  comfort: number;
  lastFedAt: string | null;
};

export type HomeGardenPlot = {
  plotKey: string;
  cropKey: string | null;
  plantedAt: string | null;
  readyAt: string | null;
};

export type HomeBlueprint = {
  blueprintId: string;
  ownerUserId: string;
  name: string;
  homeId: string;
  roomSnapshotJson: string;
  creditsPrice: number | null;
  listed: boolean;
  hash: string;
  createdAt: string;
};

export type PlayerHome = {
  homeId: string;
  ownerUserId: string;
  publicId: string;
  name: string;
  propertyTier: PropertyTier;
  acquisition: AcquisitionMode;
  /** Linked land parcel / neighborhood plot when claimed. */
  plotId: string | null;
  neighborhoodId: string | null;
  visitPolicy: HomeVisitPolicy;
  themeKey: string;
  exteriorFacadeKey: string;
  musicAmbient: string | null;
  lightingGlobal: string;
  rooms: HomeRoomState[];
  storage: HomeStorageSlot[];
  permissions: HomePermissionGrant[];
  visitors: HomeVisitorRecord[];
  events: HomeEventStub[];
  npcs: HomeNpcStub[];
  riftlings: HomeRiftlingCare[];
  garden: HomeGardenPlot[];
  workshopStations: string[];
  likes: number;
  featured: boolean;
  expansionLevel: number;
  createdAt: string;
  updatedAt: string;
  /** Version for optimistic concurrency / anti-dupe. */
  revision: number;
};

export type HomeInstanceHandle = {
  homeId: string;
  ownerUserId: string;
  /** Private instance key — unique per owner home. */
  instanceKey: string;
  entryKind: "door" | "portal" | "gate";
  worldAnchor: { mapId: string; x: number; y: number } | null;
};

export type BuildOp =
  | { kind: "place"; furniture: PlacedFurniture }
  | { kind: "move"; instanceId: string; x: number; y: number; rotation: PlacedFurniture["rotation"] }
  | { kind: "scale"; instanceId: string; scale: number }
  | { kind: "delete"; instanceId: string }
  | { kind: "copy"; sourceInstanceId: string; furniture: PlacedFurniture }
  | { kind: "set_surface"; roomKey: string; wallKey?: string; floorKey?: string }
  | { kind: "multi_select_stub"; instanceIds: string[] };

export type BuildSession = {
  homeId: string;
  userId: string;
  mode: PlacementMode;
  blueprintMode: boolean;
  undo: BuildOp[];
  redo: BuildOp[];
  selectedIds: string[];
};
