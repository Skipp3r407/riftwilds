/**
 * Centralized Live World input manager.
 * Consumes KeyboardEvents once; scenes/UI read desire + edge pulses — no scattered keydown handlers.
 */

import type { VirtualInputState } from "@/game/live-world/types";
import {
  type ActionId,
  type KeybindMap,
  chordMatches,
  isProtectedBrowserChord,
  loadKeybinds,
  saveKeybinds,
} from "@/game/live-world/input/keybinds";

export type UiPanelId =
  | "map"
  | "inventory"
  | "pets"
  | "journal"
  | "skills"
  | "character"
  | "guild"
  | "housing"
  | "quests"
  | "bag"
  | "social"
  | "chat"
  | "help"
  | "settings"
  | "pause"
  | "interaction"
  | "equipment"
  | "emotePanel"
  | "emoteWheel"
  | null;

type Listener = () => void;

const ACTION_TO_PANEL: Partial<Record<ActionId, Exclude<UiPanelId, null>>> = {
  openMap: "map",
  openInventory: "inventory",
  openPets: "pets",
  openJournal: "journal",
  openSkills: "skills",
  openCharacter: "character",
  openGuild: "guild",
  openHousing: "housing",
  openQuests: "quests",
  openBag: "bag",
  openSocial: "social",
  openChat: "chat",
  help: "help",
  settings: "settings",
};

export class LiveWorldInputManager {
  private binds: KeybindMap;
  private held = new Set<string>();
  private edges = new Set<ActionId>();
  private typingFocused = false;
  private modalOpen = false;
  private activePanel: UiPanelId = null;
  private collisionDebug = false;
  private listeners = new Set<Listener>();
  private attached = false;
  private onKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);
  private onKeyUp = (e: KeyboardEvent) => this.handleKeyUp(e);

  constructor(binds?: KeybindMap) {
    this.binds = binds ?? loadKeybinds();
  }

  attach(): void {
    if (this.attached || typeof window === "undefined") return;
    window.addEventListener("keydown", this.onKeyDown, true);
    window.addEventListener("keyup", this.onKeyUp, true);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached || typeof window === "undefined") return;
    window.removeEventListener("keydown", this.onKeyDown, true);
    window.removeEventListener("keyup", this.onKeyUp, true);
    this.attached = false;
    this.held.clear();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    this.listeners.forEach((fn) => fn());
  }

  setKeybinds(map: KeybindMap): void {
    this.binds = map;
    saveKeybinds(map);
    this.emit();
  }

  getKeybinds(): KeybindMap {
    return this.binds;
  }

  setTypingFocused(focused: boolean): void {
    this.typingFocused = focused;
    if (focused) this.held.clear();
    this.emit();
  }

  isTypingFocused(): boolean {
    return this.typingFocused;
  }

  setModalOpen(open: boolean): void {
    this.modalOpen = open;
    if (open) this.held.clear();
    this.emit();
  }

  isModalOpen(): boolean {
    return this.modalOpen;
  }

  getActivePanel(): UiPanelId {
    return this.activePanel;
  }

  setActivePanel(panel: UiPanelId): void {
    this.activePanel = panel;
    this.modalOpen = panel !== null && panel !== "chat";
    this.emit();
  }

  togglePanel(panel: Exclude<UiPanelId, null>): void {
    this.setActivePanel(this.activePanel === panel ? null : panel);
  }

  closePanel(): void {
    this.setActivePanel(null);
  }

  isCollisionDebug(): boolean {
    return this.collisionDebug;
  }

  setCollisionDebug(on: boolean): void {
    this.collisionDebug = on;
    this.emit();
  }

  /** Held movement desire for Phaser — zeroed while typing or modal blocks movement. */
  getMovementDesire(): VirtualInputState {
    if (this.typingFocused || this.blocksMovement()) {
      return { up: false, down: false, left: false, right: false, run: false };
    }
    return {
      up: this.isActionHeld("moveUp"),
      down: this.isActionHeld("moveDown"),
      left: this.isActionHeld("moveLeft"),
      right: this.isActionHeld("moveRight"),
      run: this.isActionHeld("sprint"),
    };
  }

  private blocksMovement(): boolean {
    if (!this.modalOpen) return false;
    return this.activePanel !== "chat" && this.activePanel !== null;
  }

  isActionHeld(action: ActionId): boolean {
    for (const chord of this.binds[action] ?? []) {
      if (this.held.has(this.chordKey(chord))) return true;
    }
    return false;
  }

  /** Edge-triggered; cleared after read in consumeEdges / wasJustPressed. */
  wasJustPressed(action: ActionId): boolean {
    if (!this.edges.has(action)) return false;
    this.edges.delete(action);
    return true;
  }

  peekJustPressed(action: ActionId): boolean {
    return this.edges.has(action);
  }

  consumeEdges(): ActionId[] {
    const list = [...this.edges];
    this.edges.clear();
    return list;
  }

  private chordKey(chord: { code: string; ctrl?: boolean; shift?: boolean; alt?: boolean }): string {
    return `${chord.code}|${!!chord.ctrl}|${!!chord.shift}|${!!chord.alt}`;
  }

  private resolveActions(e: KeyboardEvent): ActionId[] {
    const matched: ActionId[] = [];
    for (const [action, chords] of Object.entries(this.binds) as [ActionId, typeof this.binds.moveUp][]) {
      for (const chord of chords) {
        if (chordMatches(chord, e)) {
          matched.push(action);
          break;
        }
      }
    }
    return matched;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.repeat) return;
    if (isProtectedBrowserChord(e)) return;

    // Slash opens chat command mode even when not focused
    if (e.code === "Slash" && !this.typingFocused && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      this.edges.add("openChat");
      this.setActivePanel("chat");
      this.emit();
      return;
    }

    const actions = this.resolveActions(e);
    if (actions.length === 0) return;

    // While typing, only Escape leaves focus; movement keys type letters
    if (this.typingFocused) {
      if (actions.includes("escape")) {
        e.preventDefault();
        this.edges.add("escape");
        this.emit();
      }
      return;
    }

    for (const action of actions) {
      const chord = (this.binds[action] ?? []).find((c) => chordMatches(c, e));
      if (chord) this.held.add(this.chordKey(chord));
      this.edges.add(action);

      if (action === "escape") {
        e.preventDefault();
        if (this.activePanel) this.closePanel();
      } else if (action === "debugCollision") {
        e.preventDefault();
        // Production: only allow for non-normal players (dev / flag)
        const allow =
          process.env.NODE_ENV !== "production" ||
          (typeof window !== "undefined" &&
            localStorage.getItem("riftwilds-debug-allowed") === "1");
        if (allow) this.collisionDebug = !this.collisionDebug;
      } else if (ACTION_TO_PANEL[action]) {
        e.preventDefault();
        const panel = ACTION_TO_PANEL[action]!;
        this.togglePanel(panel);
      } else if (action === "openEmoteWheel" || action === "openEmotePanel") {
        e.preventDefault();
      } else if (action === "zoomIn" || action === "zoomOut") {
        e.preventDefault();
      } else if (
        action === "toggleFullscreen" ||
        action === "cycleHudMode" ||
        action === "focusRiftling" ||
        action === "togglePhotoMode"
      ) {
        e.preventDefault();
      } else if (
        action === "interact" ||
        action.startsWith("hotbar") ||
        action === "targetNearest" ||
        action === "reply" ||
        action === "sprint" ||
        action.startsWith("move")
      ) {
        // Prevent page scroll on arrows / space when in world
        if (action === "interact" || action.startsWith("move")) e.preventDefault();
      }
    }
    this.emit();
  }

  private handleKeyUp(e: KeyboardEvent): void {
    for (const chords of Object.values(this.binds)) {
      for (const chord of chords) {
        if (chord.code === e.code) {
          this.held.delete(this.chordKey(chord));
        }
      }
    }
  }
}

let singleton: LiveWorldInputManager | null = null;

export function getInputManager(): LiveWorldInputManager {
  if (!singleton) singleton = new LiveWorldInputManager();
  return singleton;
}

export function resetInputManagerForTests(): void {
  singleton?.detach();
  singleton = null;
}
