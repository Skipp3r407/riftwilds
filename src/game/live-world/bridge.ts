import type {
  DialoguePayload,
  InteractPrompt,
  VirtualInputState,
  WorldHudStatus,
} from "@/game/live-world/types";
import {
  advanceDialogueLine,
  dialogueHasMoreLines,
} from "@/game/npcs/dialogue";

type Listener<T> = (value: T) => void;

function createChannel<T>(initial: T) {
  let value = initial;
  const listeners = new Set<Listener<T>>();
  return {
    get: () => value,
    set: (next: T) => {
      value = next;
      listeners.forEach((fn) => fn(value));
    },
    subscribe: (fn: Listener<T>) => {
      listeners.add(fn);
      fn(value);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}

const emptyInput: VirtualInputState = {
  up: false,
  down: false,
  left: false,
  right: false,
  run: false,
};

/**
 * React ↔ Phaser bridge for overlays / mobile controls.
 * One active instance while the game is mounted.
 */
export class LiveWorldBridge {
  readonly virtualInput = createChannel<VirtualInputState>({ ...emptyInput });
  readonly status = createChannel<WorldHudStatus>({
    connection: "loading",
    mapName: "Riftwild Commons",
    instanceLabel: "Local solo",
    playerLabel: "Keeper",
    petLabel: "Companion",
    hint: "Loading…",
  });
  readonly dialogue = createChannel<DialoguePayload | null>(null);
  readonly interactPrompt = createChannel<InteractPrompt>({
    label: "Press E / Space",
    visible: false,
  });
  readonly loadingProgress = createChannel(0);
  readonly ready = createChannel(false);

  private interactQueued = false;

  setVirtualInput(partial: Partial<VirtualInputState>): void {
    this.virtualInput.set({ ...this.virtualInput.get(), ...partial });
  }

  resetVirtualInput(): void {
    this.virtualInput.set({ ...emptyInput });
  }

  queueInteract(): void {
    this.interactQueued = true;
  }

  consumeInteract(): boolean {
    if (!this.interactQueued) return false;
    this.interactQueued = false;
    return true;
  }

  setNpcDialogue(payload: DialoguePayload | null): void {
    this.dialogue.set(payload);
  }

  advanceDialogue(): void {
    const current = this.dialogue.get();
    if (!current) return;

    // Branching NPC dialogue: wait for choice UI once lines are done
    if (current.npcSlug && current.choices && current.choices.length > 0) {
      if (dialogueHasMoreLines(current)) {
        const advanced = advanceDialogueLine({
          npcSlug: current.npcSlug,
          speaker: current.speaker,
          portraitAsset: current.portraitAsset ?? "",
          nodeId: "active",
          lines: current.lines,
          lineIndex: current.lineIndex,
          choices: current.choices.map((c) => ({ id: c.id, label: c.label })),
        });
        this.dialogue.set({
          ...current,
          lineIndex: advanced.lineIndex,
        });
      }
      return;
    }

    const next = current.lineIndex + 1;
    if (next >= current.lines.length) {
      this.dialogue.set(null);
      return;
    }
    this.dialogue.set({ ...current, lineIndex: next });
  }
}

let activeBridge: LiveWorldBridge | null = null;

export function getLiveWorldBridge(): LiveWorldBridge | null {
  return activeBridge;
}

export function createLiveWorldBridge(): LiveWorldBridge {
  activeBridge = new LiveWorldBridge();
  return activeBridge;
}

export function destroyLiveWorldBridge(bridge: LiveWorldBridge): void {
  if (activeBridge === bridge) activeBridge = null;
}
