/** Reusable Riftwilds NPC data model — content lives under src/content/npcs. */

export type NpcKind = "named" | "ambient" | "guard" | "ambient_riftling";

export type DayPhase = "dawn" | "day" | "dusk" | "night";

export type AmbientBehavior =
  | "idle"
  | "look_around"
  | "pace"
  | "forge"
  | "tend_eggs"
  | "organize_goods"
  | "read"
  | "mix_remedies"
  | "repair"
  | "patrol"
  | "fish"
  | "scout"
  | "train";

export type DialogueChoice = {
  id: string;
  label: string;
  /** Next node id, or special actions */
  next?: string;
  action?:
    | "accept_quest"
    | "turn_in_quest"
    | "open_shop"
    | "open_service"
    | "close";
  questId?: string;
  shopId?: string;
  serviceId?: string;
  requiresFlags?: string[];
  requiresQuestStatus?: { questId: string; status: "active" | "ready" | "completed" };
};

export type DialogueNode = {
  id: string;
  lines: string[];
  choices?: DialogueChoice[];
};

export type NpcSchedule = {
  presentDuring: DayPhase[];
  homeX: number;
  homeY: number;
  wanderRadius?: number;
};

export type NpcShopItem = {
  itemId: string;
  name: string;
  price: number;
  currency: "demo_credits";
  family: string;
  rarity: string;
  iconPath: string;
  stock?: number;
};

export type NpcShopDef = {
  id: string;
  title: string;
  buy: NpcShopItem[];
  sellHint?: string;
};

export type NpcDef = {
  id: string;
  slug: string;
  displayName: string;
  shortName: string;
  title: string;
  kind: NpcKind;
  regionId: string;
  locationId: string;
  coordinates: { x: number; y: number };
  spawnConditions: string[];
  schedule: NpcSchedule;
  occupation: string;
  faction: string;
  species: string;
  ageRange: string;
  pronouns: string;
  personalityTraits: string[];
  biography: string;
  visualDescription: string;
  clothing: string;
  accessories: string;
  colorPalette: string[];
  dialogueStyle: string;
  personalHistory: string;
  riftlingRelationship: string;
  questFunction: string;
  shopOrService: string;
  greetingDialogue: string[];
  repeatDialogue: string[];
  questDialogue: string[];
  shopDialogue: string[];
  relationshipDialogue: string[];
  dialogueNodes: DialogueNode[];
  storyFlags: string[];
  questIds: string[];
  shopId?: string;
  serviceIds: string[];
  reputationRequirements: Record<string, number>;
  animationSet: string;
  portraitAsset: string;
  fullBodyAsset: string;
  spriteAsset: string;
  thumbnailAsset: string;
  voiceStyle: string;
  ambientBehavior: AmbientBehavior;
  interactionRadius: number;
  facingBehavior: "face_player" | "fixed" | "look_around";
  active: boolean;
  artStatus: "generated" | "placeholder" | "missing";
  imagePrompts: {
    portrait: string;
    fullBody: string;
    thumbnail: string;
    sprite: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type NpcCatalogIndex = {
  named: NpcDef[];
  ambient: NpcDef[];
  byId: Record<string, NpcDef>;
  byRegion: Record<string, NpcDef[]>;
  bySlug: Record<string, NpcDef>;
};
