/**
 * Centralized Live World keybind defaults + persistence.
 * Browser shortcuts (Ctrl/Cmd + C/V/R/L/T/W, F5) are never stolen.
 */

export type ActionId =
  | "moveUp"
  | "moveDown"
  | "moveLeft"
  | "moveRight"
  | "sprint"
  | "interact"
  | "openMap"
  | "openInventory"
  | "openPets"
  | "openJournal"
  | "openSkills"
  | "openCharacter"
  | "openGuild"
  | "openHousing"
  | "openQuests"
  | "openBag"
  | "openSocial"
  | "targetNearest"
  | "openEmoteWheel"
  | "openEmotePanel"
  | "reply"
  | "openChat"
  | "escape"
  | "hotbar1"
  | "hotbar2"
  | "hotbar3"
  | "hotbar4"
  | "hotbar5"
  | "hotbar6"
  | "hotbar7"
  | "hotbar8"
  | "hotbar9"
  | "help"
  | "settings"
  | "debugCollision"
  | "zoomIn"
  | "zoomOut"
  | "toggleFullscreen"
  | "cycleHudMode"
  | "focusRiftling"
  | "togglePhotoMode";

export type KeyChord = {
  code: string;
  /** When true, require Ctrl/Cmd. Defaults false — we avoid binding browser chords. */
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
};

export type ActionDef = {
  id: ActionId;
  label: string;
  category: "movement" | "ui" | "chat" | "combat" | "social" | "debug";
  defaultKeys: KeyChord[];
  /** Second default (e.g. arrows alongside WASD). */
  allowSecondary?: boolean;
};

export const ACTION_DEFS: ActionDef[] = [
  {
    id: "moveUp",
    label: "Move Up",
    category: "movement",
    defaultKeys: [{ code: "KeyW" }, { code: "ArrowUp" }],
    allowSecondary: true,
  },
  {
    id: "moveDown",
    label: "Move Down",
    category: "movement",
    defaultKeys: [{ code: "KeyS" }, { code: "ArrowDown" }],
    allowSecondary: true,
  },
  {
    id: "moveLeft",
    label: "Move Left",
    category: "movement",
    defaultKeys: [{ code: "KeyA" }, { code: "ArrowLeft" }],
    allowSecondary: true,
  },
  {
    id: "moveRight",
    label: "Move Right",
    category: "movement",
    defaultKeys: [{ code: "KeyD" }, { code: "ArrowRight" }],
    allowSecondary: true,
  },
  {
    id: "sprint",
    label: "Sprint",
    category: "movement",
    defaultKeys: [{ code: "ShiftLeft" }, { code: "ShiftRight" }],
    allowSecondary: true,
  },
  {
    id: "interact",
    label: "Interact",
    category: "movement",
    defaultKeys: [{ code: "KeyE" }, { code: "Space" }],
    allowSecondary: true,
  },
  {
    id: "zoomIn",
    label: "Zoom In",
    category: "movement",
    defaultKeys: [
      { code: "Equal" },
      { code: "Equal", shift: true },
      { code: "NumpadAdd" },
    ],
    allowSecondary: true,
  },
  {
    id: "zoomOut",
    label: "Zoom Out",
    category: "movement",
    defaultKeys: [{ code: "Minus" }, { code: "NumpadSubtract" }],
    allowSecondary: true,
  },
  { id: "openMap", label: "World Map", category: "ui", defaultKeys: [{ code: "KeyM" }] },
  {
    id: "openInventory",
    label: "Inventory",
    category: "ui",
    defaultKeys: [{ code: "KeyI" }],
  },
  { id: "openPets", label: "Pets", category: "ui", defaultKeys: [{ code: "KeyP" }] },
  { id: "openJournal", label: "Journal", category: "ui", defaultKeys: [{ code: "KeyJ" }] },
  { id: "openSkills", label: "Skills", category: "ui", defaultKeys: [{ code: "KeyK" }] },
  {
    id: "openCharacter",
    label: "Character",
    category: "ui",
    defaultKeys: [{ code: "KeyC" }],
  },
  { id: "openGuild", label: "Guild", category: "ui", defaultKeys: [{ code: "KeyG" }] },
  { id: "openHousing", label: "Housing", category: "ui", defaultKeys: [{ code: "KeyH" }] },
  { id: "openQuests", label: "Quests", category: "ui", defaultKeys: [{ code: "KeyL" }] },
  { id: "openBag", label: "Bag", category: "ui", defaultKeys: [{ code: "KeyB" }] },
  { id: "openSocial", label: "Social", category: "ui", defaultKeys: [{ code: "KeyO" }] },
  {
    id: "targetNearest",
    label: "Target Nearest",
    category: "combat",
    /** Unbound by default — T is reserved for the emote wheel. */
    defaultKeys: [],
  },
  {
    id: "openEmoteWheel",
    label: "Emote Wheel (hold)",
    category: "social",
    defaultKeys: [{ code: "KeyT" }],
  },
  {
    id: "openEmotePanel",
    label: "Emote Panel",
    category: "social",
    defaultKeys: [{ code: "KeyT", shift: true }],
  },
  { id: "reply", label: "Reply", category: "chat", defaultKeys: [{ code: "KeyR" }] },
  {
    id: "openChat",
    label: "Open Chat",
    category: "chat",
    defaultKeys: [{ code: "Enter" }],
  },
  { id: "escape", label: "Close / Cancel", category: "ui", defaultKeys: [{ code: "Escape" }] },
  { id: "hotbar1", label: "Hotbar 1", category: "combat", defaultKeys: [{ code: "Digit1" }] },
  { id: "hotbar2", label: "Hotbar 2", category: "combat", defaultKeys: [{ code: "Digit2" }] },
  { id: "hotbar3", label: "Hotbar 3", category: "combat", defaultKeys: [{ code: "Digit3" }] },
  { id: "hotbar4", label: "Hotbar 4", category: "combat", defaultKeys: [{ code: "Digit4" }] },
  { id: "hotbar5", label: "Hotbar 5", category: "combat", defaultKeys: [{ code: "Digit5" }] },
  { id: "hotbar6", label: "Hotbar 6", category: "combat", defaultKeys: [{ code: "Digit6" }] },
  { id: "hotbar7", label: "Hotbar 7", category: "combat", defaultKeys: [{ code: "Digit7" }] },
  { id: "hotbar8", label: "Hotbar 8", category: "combat", defaultKeys: [{ code: "Digit8" }] },
  { id: "hotbar9", label: "Hotbar 9", category: "combat", defaultKeys: [{ code: "Digit9" }] },
  { id: "help", label: "Help", category: "ui", defaultKeys: [{ code: "F1" }] },
  { id: "settings", label: "Settings", category: "ui", defaultKeys: [{ code: "F2" }] },
  {
    id: "toggleFullscreen",
    label: "Toggle Fullscreen",
    category: "ui",
    defaultKeys: [{ code: "KeyF" }, { code: "Enter", alt: true }],
    allowSecondary: true,
  },
  {
    id: "cycleHudMode",
    label: "Cycle HUD Mode",
    category: "ui",
    defaultKeys: [{ code: "KeyU" }],
  },
  {
    id: "focusRiftling",
    label: "Focus Riftling Camera",
    category: "ui",
    defaultKeys: [{ code: "KeyY" }],
  },
  {
    id: "togglePhotoMode",
    label: "Photo Mode",
    category: "ui",
    defaultKeys: [{ code: "KeyN" }],
  },
  {
    id: "debugCollision",
    label: "Collision Debug",
    category: "debug",
    defaultKeys: [{ code: "F3" }],
  },
];

export type KeybindMap = Record<ActionId, KeyChord[]>;

export const KEYBINDS_STORAGE_KEY = "riftwilds-live-world-keybinds-v1";

export function defaultKeybinds(): KeybindMap {
  const map = {} as KeybindMap;
  for (const def of ACTION_DEFS) {
    map[def.id] = def.defaultKeys.map((k) => ({ ...k }));
  }
  return map;
}

export function loadKeybinds(): KeybindMap {
  const defaults = defaultKeybinds();
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(KEYBINDS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<KeybindMap>;
    for (const def of ACTION_DEFS) {
      const custom = parsed[def.id];
      if (Array.isArray(custom) && custom.length > 0) {
        defaults[def.id] = custom.map((k) => ({
          code: String(k.code),
          ctrl: !!k.ctrl,
          shift: !!k.shift,
          alt: !!k.alt,
        }));
      }
    }
    return defaults;
  } catch {
    return defaults;
  }
}

export function saveKeybinds(map: KeybindMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYBINDS_STORAGE_KEY, JSON.stringify(map));
}

export function resetKeybinds(): KeybindMap {
  const defaults = defaultKeybinds();
  saveKeybinds(defaults);
  return defaults;
}

/** Browser chords we never claim even if remapped. */
export function isProtectedBrowserChord(e: {
  code: string;
  ctrlKey: boolean;
  metaKey: boolean;
}): boolean {
  if (!(e.ctrlKey || e.metaKey)) return false;
  return ["KeyC", "KeyV", "KeyR", "KeyL", "KeyT", "KeyW"].includes(e.code);
}

export function chordMatches(
  chord: KeyChord,
  e: { code: string; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; altKey: boolean },
): boolean {
  if (chord.code !== e.code) return false;
  const wantCtrl = !!chord.ctrl;
  const haveCtrl = e.ctrlKey || e.metaKey;
  if (wantCtrl !== haveCtrl) return false;
  if (!!chord.shift !== e.shiftKey) return false;
  if (!!chord.alt !== e.altKey) return false;
  return true;
}

export function formatChord(chord: KeyChord): string {
  const parts: string[] = [];
  if (chord.ctrl) parts.push("Ctrl");
  if (chord.shift) parts.push("Shift");
  if (chord.alt) parts.push("Alt");
  const pretty =
    {
      KeyW: "W",
      KeyA: "A",
      KeyS: "S",
      KeyD: "D",
      KeyE: "E",
      KeyM: "M",
      KeyI: "I",
      KeyP: "P",
      KeyJ: "J",
      KeyK: "K",
      KeyC: "C",
      KeyG: "G",
      KeyH: "H",
      KeyL: "L",
      KeyB: "B",
      KeyO: "O",
      KeyT: "T",
      KeyR: "R",
      Space: "Space",
      Enter: "Enter",
      Escape: "Esc",
      ShiftLeft: "Shift",
      ShiftRight: "Shift",
      ArrowUp: "↑",
      ArrowDown: "↓",
      ArrowLeft: "←",
      ArrowRight: "→",
      Digit1: "1",
      Digit2: "2",
      Digit3: "3",
      Digit4: "4",
      Digit5: "5",
      Digit6: "6",
      Digit7: "7",
      Digit8: "8",
      Digit9: "9",
      Equal: "+",
      Minus: "−",
      NumpadAdd: "Num+",
      NumpadSubtract: "Num−",
      F1: "F1",
      F2: "F2",
      F3: "F3",
      F11: "F11",
      KeyF: "F",
      KeyU: "U",
      KeyY: "Y",
      KeyN: "N",
    }[chord.code] ?? chord.code.replace(/^Key/, "").replace(/^Digit/, "");
  parts.push(pretty);
  return parts.join("+");
}

export type KeyConflict = {
  actionA: ActionId;
  actionB: ActionId;
  chord: KeyChord;
};

export function findKeyConflicts(map: KeybindMap): KeyConflict[] {
  const conflicts: KeyConflict[] = [];
  const seen = new Map<string, ActionId>();
  for (const def of ACTION_DEFS) {
    for (const chord of map[def.id] ?? []) {
      const key = `${chord.code}|${!!chord.ctrl}|${!!chord.shift}|${!!chord.alt}`;
      const other = seen.get(key);
      if (other && other !== def.id) {
        conflicts.push({ actionA: other, actionB: def.id, chord });
      } else {
        seen.set(key, def.id);
      }
    }
  }
  return conflicts;
}
