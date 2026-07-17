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

export type LiveWorldUiEvents = {
  status: WorldHudStatus;
  dialogue: DialoguePayload | null;
  interactPrompt: InteractPrompt;
  loadingProgress: number;
  ready: boolean;
};

/** TODO Phase 2: replace with server-authoritative snapshots. */
export type NearbyPlayerStub = {
  id: string;
  displayName: string;
  x: number;
  y: number;
};
