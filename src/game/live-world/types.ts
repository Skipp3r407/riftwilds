/** Shared Live World client types (Phase 1 local-authoritative). */

export type Vec2 = { x: number; y: number };

export type SavedWorldPosition = {
  mapId: string;
  x: number;
  y: number;
  savedAt: number;
};

export type VirtualInputState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
};

export type ConnectionStatus =
  | "loading"
  | "connecting"
  | "local"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

export type WorldHudStatus = {
  connection: ConnectionStatus;
  mapName: string;
  instanceLabel: string;
  playerLabel: string;
  petLabel: string;
  hint: string;
};

export type DialogueChoicePayload = {
  id: string;
  label: string;
};

export type DialoguePayload = {
  speaker: string;
  lines: string[];
  lineIndex: number;
  /** Branching dialogue (NPC system). */
  npcSlug?: string;
  portraitAsset?: string;
  choices?: DialogueChoicePayload[];
  /** When set, React shell should open this shop overlay. */
  openShopId?: string | null;
};

export type InteractPrompt = {
  label: string;
  visible: boolean;
};

export type PlayerPose = {
  x: number;
  y: number;
  facingRad: number;
  regionSlug: string;
  running: boolean;
};

export type WorldMapFilter =
  | "all"
  | "quests"
  | "services"
  | "portals"
  | "waypoints"
  | "gateways"
  | "treasures"
  | "enemies"
  | "bosses"
  | "pois"
  | "habitats"
  | "events"
  | "custom";

export type WorldMapUiState = {
  open: boolean;
  mode: "world" | "region";
  regionSlug: string | null;
  filter: WorldMapFilter;
  /** Free-text marker search (region map). */
  search: string;
  activeWaypointId: string | null;
  /** Selected Gateway for fast-travel preview. */
  selectedGatewayId: string | null;
  /** Pending fast-travel destination region slug. */
  travelPreviewTo: string | null;
  /** Selected exploration marker id. */
  selectedMarkerId: string | null;
  /** Click map to drop a custom pin. */
  placingCustomPin: boolean;
};

export type InteractionMenuOption = {
  id: string;
  label: string;
  action:
    | "talk"
    | "trade"
    | "inspect"
    | "travel"
    | "fast_travel"
    | "activate_gateway"
    | "gather"
    | "open_academy"
    | "equipment"
    | "dismiss";
};

export type InteractionMenuPayload = {
  targetKind: "npc" | "player" | "object" | "pet";
  targetId: string;
  title: string;
  x: number;
  y: number;
  options: InteractionMenuOption[];
};

/** React overlay request to open the Riftling equipment panel. */
export type EquipmentPanelPayload = {
  publicPetId: string;
  petLabel: string;
  inspectOnly: boolean;
  open: boolean;
};

export type LiveWorldUiEvents = {
  status: WorldHudStatus;
  dialogue: DialoguePayload | null;
  interactPrompt: InteractPrompt;
  loadingProgress: number;
  ready: boolean;
  playerPose: PlayerPose;
  mapUi: WorldMapUiState;
  interactionMenu: InteractionMenuPayload | null;
  collisionDebug: boolean;
};

/** TODO Phase 2: replace with server-authoritative snapshots. */
export type NearbyPlayerStub = {
  id: string;
  displayName: string;
  x: number;
  y: number;
  /** Phase-1 appearance broadcast stub — cosmetic layers only. */
  petAppearance?: {
    publicPetId: string;
    revision: number;
    layers: Array<{
      itemId: string;
      slot: string;
      attachment: string;
      iconPath: string;
    }>;
  } | null;
};
