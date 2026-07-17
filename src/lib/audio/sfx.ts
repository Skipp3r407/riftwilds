/**
 * Riftwilds SFX engine — procedural Web Audio with optional file overrides.
 * Music (MusicPlayer) and SFX are independent: separate mute + volume prefs.
 */

export type SfxEventId =
  | "ui.click"
  | "ui.modal_open"
  | "ui.modal_close"
  | "ui.nav"
  | "ui.error"
  | "hatchery.claim"
  | "hatchery.incubate_tick"
  | "hatchery.hatch_reveal"
  | "pets.care"
  | "pets.equip"
  | "pets.evolve"
  | "quests.accept"
  | "quests.objective"
  | "quests.complete"
  | "combat.hit"
  | "combat.ability"
  | "combat.win"
  | "combat.lose"
  | "shop.purchase_ok"
  | "shop.purchase_fail"
  | "world.footstep"
  | "world.npc_talk"
  | "world.portal"
  | "world.gather"
  | "world.loot"
  | "rewards.claim"
  | "rewards.estimate_tick";

type ToneStep = {
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
};

type SfxRecipe = {
  cooldownMs: number;
  /** Multiplier on master SFX volume (0–1). */
  gain?: number;
  /** Skip when prefers-reduced-motion / prefer-reduced-sound. */
  ambient?: boolean;
  tones: ToneStep[];
  /** Optional file under /sounds/sfx/ — falls back to procedural if missing. */
  file?: string;
};

const STORAGE_KEY = "riftwilds-sfx-prefs";

export type SfxPrefs = {
  muted: boolean;
  volume: number;
};

const DEFAULT_PREFS: SfxPrefs = {
  muted: false,
  volume: 0.45,
};

const RECIPES: Record<SfxEventId, SfxRecipe> = {
  "ui.click": {
    cooldownMs: 45,
    gain: 0.35,
    tones: [{ freq: 880, dur: 0.035, type: "sine", gain: 0.4 }],
    file: "/sounds/sfx/ui-click.wav",
  },
  "ui.modal_open": {
    cooldownMs: 120,
    gain: 0.45,
    tones: [
      { freq: 420, dur: 0.05, type: "triangle", gain: 0.35 },
      { freq: 640, dur: 0.07, type: "triangle", gain: 0.3, delay: 0.04 },
    ],
    file: "/sounds/sfx/ui-modal-open.wav",
  },
  "ui.modal_close": {
    cooldownMs: 120,
    gain: 0.4,
    tones: [
      { freq: 560, dur: 0.05, type: "triangle", gain: 0.3 },
      { freq: 360, dur: 0.06, type: "triangle", gain: 0.25, delay: 0.04 },
    ],
    file: "/sounds/sfx/ui-modal-close.wav",
  },
  "ui.nav": {
    cooldownMs: 80,
    gain: 0.28,
    tones: [{ freq: 720, dur: 0.028, type: "sine", gain: 0.3 }],
    file: "/sounds/sfx/ui-nav.wav",
  },
  "ui.error": {
    cooldownMs: 200,
    gain: 0.5,
    tones: [
      { freq: 220, dur: 0.09, type: "square", gain: 0.22 },
      { freq: 160, dur: 0.12, type: "square", gain: 0.18, delay: 0.08 },
    ],
    file: "/sounds/sfx/ui-error.wav",
  },
  "hatchery.claim": {
    cooldownMs: 250,
    gain: 0.55,
    tones: [
      { freq: 392, dur: 0.07, type: "triangle", gain: 0.35 },
      { freq: 523, dur: 0.08, type: "triangle", gain: 0.32, delay: 0.06 },
      { freq: 659, dur: 0.1, type: "sine", gain: 0.28, delay: 0.13 },
    ],
    file: "/sounds/sfx/hatchery-claim.wav",
  },
  "hatchery.incubate_tick": {
    cooldownMs: 2800,
    gain: 0.2,
    ambient: true,
    tones: [{ freq: 520, dur: 0.04, type: "sine", gain: 0.2 }],
  },
  "hatchery.hatch_reveal": {
    cooldownMs: 400,
    gain: 0.65,
    tones: [
      { freq: 523, dur: 0.08, type: "sine", gain: 0.35 },
      { freq: 659, dur: 0.09, type: "sine", gain: 0.32, delay: 0.07 },
      { freq: 784, dur: 0.1, type: "triangle", gain: 0.3, delay: 0.15 },
      { freq: 1046, dur: 0.16, type: "sine", gain: 0.28, delay: 0.24 },
    ],
    file: "/sounds/sfx/hatchery-reveal.wav",
  },
  "pets.care": {
    cooldownMs: 160,
    gain: 0.45,
    tones: [
      { freq: 600, dur: 0.05, type: "sine", gain: 0.3 },
      { freq: 900, dur: 0.07, type: "sine", gain: 0.25, delay: 0.04 },
    ],
    file: "/sounds/sfx/pets-care.wav",
  },
  "pets.equip": {
    cooldownMs: 180,
    gain: 0.45,
    tones: [
      { freq: 340, dur: 0.04, type: "square", gain: 0.18 },
      { freq: 510, dur: 0.06, type: "triangle", gain: 0.28, delay: 0.03 },
    ],
    file: "/sounds/sfx/pets-equip.wav",
  },
  "pets.evolve": {
    cooldownMs: 500,
    gain: 0.6,
    tones: [
      { freq: 440, dur: 0.1, type: "sawtooth", gain: 0.15 },
      { freq: 660, dur: 0.12, type: "triangle", gain: 0.28, delay: 0.1 },
      { freq: 880, dur: 0.18, type: "sine", gain: 0.3, delay: 0.22 },
    ],
  },
  "quests.accept": {
    cooldownMs: 200,
    gain: 0.5,
    tones: [
      { freq: 494, dur: 0.06, type: "triangle", gain: 0.3 },
      { freq: 740, dur: 0.1, type: "sine", gain: 0.28, delay: 0.05 },
    ],
    file: "/sounds/sfx/quests-accept.wav",
  },
  "quests.objective": {
    cooldownMs: 150,
    gain: 0.4,
    tones: [{ freq: 820, dur: 0.05, type: "sine", gain: 0.32 }],
    file: "/sounds/sfx/quests-objective.wav",
  },
  "quests.complete": {
    cooldownMs: 350,
    gain: 0.6,
    tones: [
      { freq: 523, dur: 0.07, type: "triangle", gain: 0.3 },
      { freq: 659, dur: 0.08, type: "triangle", gain: 0.28, delay: 0.07 },
      { freq: 784, dur: 0.14, type: "sine", gain: 0.3, delay: 0.15 },
    ],
    file: "/sounds/sfx/quests-complete.wav",
  },
  "combat.hit": {
    cooldownMs: 70,
    gain: 0.5,
    tones: [
      { freq: 180, dur: 0.05, type: "square", gain: 0.2 },
      { freq: 90, dur: 0.08, type: "sawtooth", gain: 0.12, delay: 0.02 },
    ],
    file: "/sounds/sfx/combat-hit.wav",
  },
  "combat.ability": {
    cooldownMs: 100,
    gain: 0.5,
    tones: [
      { freq: 300, dur: 0.04, type: "sawtooth", gain: 0.14 },
      { freq: 700, dur: 0.08, type: "triangle", gain: 0.28, delay: 0.03 },
    ],
    file: "/sounds/sfx/combat-ability.wav",
  },
  "combat.win": {
    cooldownMs: 500,
    gain: 0.65,
    tones: [
      { freq: 523, dur: 0.08, type: "triangle", gain: 0.32 },
      { freq: 659, dur: 0.08, type: "triangle", gain: 0.3, delay: 0.08 },
      { freq: 784, dur: 0.1, type: "sine", gain: 0.28, delay: 0.16 },
      { freq: 1046, dur: 0.2, type: "sine", gain: 0.26, delay: 0.26 },
    ],
    file: "/sounds/sfx/combat-win.wav",
  },
  "combat.lose": {
    cooldownMs: 500,
    gain: 0.5,
    tones: [
      { freq: 300, dur: 0.12, type: "triangle", gain: 0.28 },
      { freq: 220, dur: 0.16, type: "triangle", gain: 0.24, delay: 0.1 },
      { freq: 160, dur: 0.2, type: "sine", gain: 0.2, delay: 0.22 },
    ],
    file: "/sounds/sfx/combat-lose.wav",
  },
  "shop.purchase_ok": {
    cooldownMs: 250,
    gain: 0.55,
    tones: [
      { freq: 660, dur: 0.05, type: "sine", gain: 0.3 },
      { freq: 880, dur: 0.08, type: "sine", gain: 0.28, delay: 0.05 },
      { freq: 1320, dur: 0.06, type: "triangle", gain: 0.2, delay: 0.12 },
    ],
    file: "/sounds/sfx/shop-ok.wav",
  },
  "shop.purchase_fail": {
    cooldownMs: 250,
    gain: 0.45,
    tones: [
      { freq: 240, dur: 0.08, type: "square", gain: 0.18 },
      { freq: 180, dur: 0.1, type: "square", gain: 0.14, delay: 0.07 },
    ],
    file: "/sounds/sfx/shop-fail.wav",
  },
  "world.footstep": {
    cooldownMs: 220,
    gain: 0.12,
    ambient: true,
    tones: [{ freq: 110, dur: 0.035, type: "triangle", gain: 0.15 }],
  },
  "world.npc_talk": {
    cooldownMs: 200,
    gain: 0.4,
    tones: [
      { freq: 480, dur: 0.04, type: "sine", gain: 0.25 },
      { freq: 560, dur: 0.05, type: "sine", gain: 0.22, delay: 0.04 },
    ],
    file: "/sounds/sfx/world-npc.wav",
  },
  "world.portal": {
    cooldownMs: 400,
    gain: 0.55,
    tones: [
      { freq: 200, dur: 0.12, type: "sawtooth", gain: 0.1 },
      { freq: 400, dur: 0.14, type: "triangle", gain: 0.22, delay: 0.08 },
      { freq: 800, dur: 0.18, type: "sine", gain: 0.25, delay: 0.18 },
    ],
    file: "/sounds/sfx/world-portal.wav",
  },
  "world.gather": {
    cooldownMs: 200,
    gain: 0.4,
    tones: [
      { freq: 360, dur: 0.05, type: "triangle", gain: 0.25 },
      { freq: 540, dur: 0.07, type: "sine", gain: 0.22, delay: 0.04 },
    ],
    file: "/sounds/sfx/world-gather.wav",
  },
  "world.loot": {
    cooldownMs: 180,
    gain: 0.45,
    tones: [
      { freq: 880, dur: 0.04, type: "sine", gain: 0.28 },
      { freq: 1320, dur: 0.08, type: "triangle", gain: 0.22, delay: 0.04 },
    ],
    file: "/sounds/sfx/world-loot.wav",
  },
  "rewards.claim": {
    cooldownMs: 350,
    gain: 0.6,
    tones: [
      { freq: 587, dur: 0.07, type: "sine", gain: 0.3 },
      { freq: 740, dur: 0.08, type: "sine", gain: 0.28, delay: 0.06 },
      { freq: 987, dur: 0.14, type: "triangle", gain: 0.26, delay: 0.14 },
    ],
    file: "/sounds/sfx/rewards-claim.wav",
  },
  "rewards.estimate_tick": {
    cooldownMs: 900,
    gain: 0.22,
    ambient: true,
    tones: [{ freq: 980, dur: 0.045, type: "sine", gain: 0.18 }],
    file: "/sounds/sfx/rewards-chime.wav",
  },
};

type Listener = (prefs: SfxPrefs) => void;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function readPrefs(): SfxPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<SfxPrefs>;
    return {
      muted: Boolean(parsed.muted),
      volume:
        typeof parsed.volume === "number" ? clamp01(parsed.volume) : DEFAULT_PREFS.volume,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function writePrefs(prefs: SfxPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

function prefersReducedSound(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    // Draft / vendor queries — harmless if unsupported.
    if (window.matchMedia("(prefers-reduced-data: reduce)").matches) return true;
  } catch {
    /* ignore */
  }
  return false;
}

class SfxEngine {
  private ctx: AudioContext | null = null;
  private unlocked = false;
  private prefs: SfxPrefs = DEFAULT_PREFS;
  private lastPlayed = new Map<SfxEventId, number>();
  private listeners = new Set<Listener>();
  private gestureBound = false;
  private fileCache = new Map<string, HTMLAudioElement>();
  private fileFailed = new Set<string>();

  init() {
    if (typeof window === "undefined") return;
    this.prefs = readPrefs();
    this.bindGestureUnlock();
  }

  getPrefs(): SfxPrefs {
    return this.prefs;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.prefs);
    return () => this.listeners.delete(listener);
  }

  setMuted(muted: boolean) {
    this.prefs = { ...this.prefs, muted };
    writePrefs(this.prefs);
    this.emit();
  }

  setVolume(volume: number) {
    const v = clamp01(volume);
    this.prefs = {
      volume: v,
      muted: v === 0 ? true : v > 0 ? false : this.prefs.muted,
    };
    writePrefs(this.prefs);
    this.emit();
  }

  toggleMute() {
    this.setMuted(!this.prefs.muted);
  }

  /** Call from any user gesture path to unlock AudioContext. */
  unlock() {
    if (typeof window === "undefined") return;
    void this.ensureContext();
  }

  play(id: SfxEventId, opts?: { force?: boolean }) {
    if (typeof window === "undefined") return;
    const recipe = RECIPES[id];
    if (!recipe) return;
    if (this.prefs.muted || this.prefs.volume <= 0) return;
    if (!opts?.force && recipe.ambient && prefersReducedSound()) return;

    const now = performance.now();
    const last = this.lastPlayed.get(id) ?? 0;
    if (!opts?.force && now - last < recipe.cooldownMs) return;
    this.lastPlayed.set(id, now);

    void this.ensureContext().then((ctx) => {
      if (!ctx || this.prefs.muted) return;
      const master = this.prefs.volume * (recipe.gain ?? 1);

      if (recipe.file && !this.fileFailed.has(recipe.file)) {
        this.tryPlayFile(recipe.file, master, () => {
          if (!this.prefs.muted) this.playProcedural(ctx, recipe.tones, master);
        });
        return;
      }

      this.playProcedural(ctx, recipe.tones, master);
    });
  }

  private emit() {
    for (const l of this.listeners) l(this.prefs);
  }

  private bindGestureUnlock() {
    if (this.gestureBound || typeof window === "undefined") return;
    this.gestureBound = true;
    const unlock = () => {
      this.unlock();
    };
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
  }

  private async ensureContext(): Promise<AudioContext | null> {
    if (typeof window === "undefined") return null;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!this.ctx) this.ctx = new AC();
    if (this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        return this.ctx;
      }
    }
    this.unlocked = this.ctx.state === "running";
    return this.ctx;
  }

  private tryPlayFile(src: string, volume: number, onFail: () => void) {
    let failed = false;
    const failOnce = () => {
      if (failed) return;
      failed = true;
      this.fileFailed.add(src);
      onFail();
    };
    try {
      let proto = this.fileCache.get(src);
      if (!proto) {
        proto = new Audio(src);
        proto.preload = "auto";
        this.fileCache.set(src, proto);
      }
      const node = proto.cloneNode(true) as HTMLAudioElement;
      node.volume = clamp01(volume);
      node.addEventListener("error", failOnce, { once: true });
      void node.play().catch(failOnce);
    } catch {
      failOnce();
    }
  }

  private playProcedural(ctx: AudioContext, tones: ToneStep[], master: number) {
    const t0 = ctx.currentTime;
    for (const step of tones) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = step.type ?? "sine";
      osc.frequency.value = step.freq;
      const peak = clamp01(master * (step.gain ?? 0.3));
      const start = t0 + (step.delay ?? 0);
      const end = start + step.dur;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(end + 0.02);
    }
  }
}

export const sfx = new SfxEngine();

if (typeof window !== "undefined") {
  sfx.init();
}

export function playSfx(id: SfxEventId, opts?: { force?: boolean }) {
  sfx.play(id, opts);
}

export function unlockSfx() {
  sfx.unlock();
}

export const SFX_EVENTS = Object.keys(RECIPES) as SfxEventId[];
