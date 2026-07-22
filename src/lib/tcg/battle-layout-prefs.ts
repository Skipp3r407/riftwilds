/**
 * Battle Mode layout preferences (localStorage).
 * Used by Focus Mode, shell sidebar collapse, and console grid presets.
 */

export type BattleLayoutPreset =
  | "classic"
  | "expanded"
  | "immersive"
  | "ultra-wide";

export type BattleSidebarMode =
  | "always-open"
  | "auto-collapse"
  | "hidden-during-battle";

export const BATTLE_LAYOUT_PRESET_KEY = "riftwilds.battle.layout-preset";
export const BATTLE_SIDEBAR_MODE_KEY = "riftwilds.battle.sidebar-mode";
export const BATTLE_FEED_WIDTH_KEY = "riftwilds.battle.feed-width";
export const BATTLE_FEED_COLLAPSED_KEY = "riftwilds.battle.feed-collapsed";
export const BATTLE_INTEL_COLLAPSED_KEY = "riftwilds.battle.intel-collapsed";
/** Existing field card size key — kept for compatibility. */
export const BATTLE_BOARD_CARD_SIZE_KEY = "riftwilds.battle.board-card-size";

export const DEFAULT_BATTLE_LAYOUT_PRESET: BattleLayoutPreset = "immersive";
export const DEFAULT_BATTLE_SIDEBAR_MODE: BattleSidebarMode = "auto-collapse";

export const BATTLE_LAYOUT_PRESETS: {
  id: BattleLayoutPreset;
  label: string;
  description: string;
}[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Familiar console proportions with a compact header.",
  },
  {
    id: "expanded",
    label: "Expanded",
    description: "15/70/15 grid with Focus Mode and more lane room.",
  },
  {
    id: "immersive",
    label: "Immersive",
    description: "Default Battle Mode — darker stage, compact chrome, large board.",
  },
  {
    id: "ultra-wide",
    label: "Ultra Wide",
    description: "Widens the battlefield on 1440p+ / ultrawide displays.",
  },
];

export const BATTLE_SIDEBAR_MODES: {
  id: BattleSidebarMode;
  label: string;
  description: string;
}[] = [
  {
    id: "always-open",
    label: "Always Open",
    description: "Keep the game sidebar fully expanded during battle.",
  },
  {
    id: "auto-collapse",
    label: "Auto Collapse",
    description: "Collapse to icons in battle; pin, hover, or Tab to open.",
  },
  {
    id: "hidden-during-battle",
    label: "Hidden During Battle",
    description: "Hide the game sidebar while an active match is open.",
  },
];

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota / private mode */
  }
}

export function readBattleLayoutPreset(): BattleLayoutPreset {
  const raw = safeGet(BATTLE_LAYOUT_PRESET_KEY);
  if (BATTLE_LAYOUT_PRESETS.some((p) => p.id === raw)) {
    return raw as BattleLayoutPreset;
  }
  return DEFAULT_BATTLE_LAYOUT_PRESET;
}

export function writeBattleLayoutPreset(preset: BattleLayoutPreset) {
  safeSet(BATTLE_LAYOUT_PRESET_KEY, preset);
}

export function readBattleSidebarMode(): BattleSidebarMode {
  const raw = safeGet(BATTLE_SIDEBAR_MODE_KEY);
  if (BATTLE_SIDEBAR_MODES.some((m) => m.id === raw)) {
    return raw as BattleSidebarMode;
  }
  return DEFAULT_BATTLE_SIDEBAR_MODE;
}

export function writeBattleSidebarMode(mode: BattleSidebarMode) {
  safeSet(BATTLE_SIDEBAR_MODE_KEY, mode);
}

export function readBattleFeedWidth(): number {
  const raw = safeGet(BATTLE_FEED_WIDTH_KEY);
  const n = raw ? Number(raw) : NaN;
  if (Number.isFinite(n) && n >= 140 && n <= 420) return n;
  return 200;
}

export function writeBattleFeedWidth(px: number) {
  safeSet(BATTLE_FEED_WIDTH_KEY, String(Math.round(px)));
}

export function readBattleFeedCollapsed(): boolean {
  return safeGet(BATTLE_FEED_COLLAPSED_KEY) === "1";
}

export function writeBattleFeedCollapsed(collapsed: boolean) {
  safeSet(BATTLE_FEED_COLLAPSED_KEY, collapsed ? "1" : "0");
}

export function readBattleIntelCollapsed(): boolean {
  return safeGet(BATTLE_INTEL_COLLAPSED_KEY) === "1";
}

export function writeBattleIntelCollapsed(collapsed: boolean) {
  safeSet(BATTLE_INTEL_COLLAPSED_KEY, collapsed ? "1" : "0");
}

/** Query/path heuristics for an active Practice Board / match desk. */
export function isActiveBattleSearch(
  pathname: string | null | undefined,
  search: URLSearchParams | { get(name: string): string | null } | null | undefined,
): boolean {
  if (!pathname) return false;
  if (pathname !== "/tcg/battle" && !pathname.startsWith("/tcg/battle/")) {
    return false;
  }
  if (!search) return false;
  const board = search.get("board");
  const play = search.get("play");
  if (board === "1" || board === "true") return true;
  if (play === "1" || play === "true") return true;
  if (search.get("invite")) return true;
  if (search.get("encounter")) return true;
  return false;
}
