/**
 * Emote runtime — cooldowns, anti-spam, animation priority, cancellation.
 * Cosmetic only; never grants combat/economy advantages.
 */

import { getEmoteDef, STARTER_EMOTE_KEYS } from "@/game/live-world/systems/emotes/catalog";
import type { EmoteEventBus } from "@/game/live-world/systems/emotes/event-bus";
import type {
  AnimLayer,
  EmotePlaybackRequest,
  EmotePlaybackState,
  EmoteUnlockState,
} from "@/game/live-world/systems/emotes/types";

const LAYER_RANK: Record<AnimLayer, number> = {
  idle: 0,
  walk: 1,
  run: 2,
  emote: 3,
  combat: 4,
  portal: 5,
  stun: 6,
};

/** Cancel emote when these layers take over. */
export const EMOTE_CANCEL_LAYERS: AnimLayer[] = ["walk", "run", "combat", "portal", "stun"];

const GLOBAL_SPAM_WINDOW_MS = 4000;
const GLOBAL_SPAM_MAX = 5;

export type EmoteRuntimeOptions = {
  bus: EmoteEventBus;
  actorId?: string;
  unlocks?: EmoteUnlockState;
  isUnlocked?: (key: string) => boolean;
  prefersReducedMotion?: () => boolean;
};

export type PlayEmoteResult =
  | { ok: true; request: EmotePlaybackRequest; state: EmotePlaybackState }
  | { ok: false; reason: string };

export type EmoteRuntime = {
  getState: () => EmotePlaybackState;
  play: (
    emoteKey: string,
    opts?: {
      source?: EmotePlaybackRequest["source"];
      targetId?: string;
      actorKind?: EmotePlaybackRequest["actorKind"];
      actorId?: string;
      now?: number;
      /** Skip unlock check (admin / network mirror) */
      force?: boolean;
    },
  ) => PlayEmoteResult;
  cancel: (reason: string, now?: number) => void;
  /** Call each frame / when movement starts — cancels active emote if needed. */
  setLayer: (layer: AnimLayer, now?: number) => void;
  tick: (now?: number) => void;
  canPlay: (emoteKey: string, now?: number) => { ok: true } | { ok: false; reason: string };
};

export function createEmoteRuntime(options: EmoteRuntimeOptions): EmoteRuntime {
  const actorId = options.actorId ?? "local-player";
  let state: EmotePlaybackState = {
    active: null,
    layer: "idle",
    endsAt: 0,
    lastEmoteAt: 0,
    lastEmoteKey: null,
  };
  const recentPlays: number[] = [];

  function unlocked(key: string): boolean {
    if (options.isUnlocked) return options.isUnlocked(key);
    if (STARTER_EMOTE_KEYS.includes(key as (typeof STARTER_EMOTE_KEYS)[number])) return true;
    return options.unlocks?.unlockedKeys.includes(key) ?? false;
  }

  function spamLimited(now: number): boolean {
    while (recentPlays.length && now - recentPlays[0]! > GLOBAL_SPAM_WINDOW_MS) {
      recentPlays.shift();
    }
    return recentPlays.length >= GLOBAL_SPAM_MAX;
  }

  function canPlay(
    emoteKey: string,
    now = Date.now(),
  ): { ok: true } | { ok: false; reason: string } {
    const def = getEmoteDef(emoteKey);
    if (!def) return { ok: false, reason: "Unknown emote" };
    if (!unlocked(def.key)) return { ok: false, reason: "Emote not unlocked" };
    if (spamLimited(now)) return { ok: false, reason: "Slow down — emote rate limited" };
    if (state.lastEmoteKey === def.key && now - state.lastEmoteAt < def.cooldownMs) {
      return { ok: false, reason: "Emote on cooldown" };
    }
    if (state.lastEmoteAt && now - state.lastEmoteAt < 400) {
      return { ok: false, reason: "Emote anti-spam" };
    }
    if (LAYER_RANK[state.layer] > LAYER_RANK.emote) {
      return { ok: false, reason: `Blocked by ${state.layer}` };
    }
    return { ok: true };
  }

  const runtime: EmoteRuntime = {
    getState: () => ({ ...state, active: state.active ? { ...state.active } : null }),
    canPlay,
    play(emoteKey, opts) {
      const now = opts?.now ?? Date.now();
      const def = getEmoteDef(emoteKey);
      if (!def) return { ok: false, reason: "Unknown emote" };

      if (!opts?.force) {
        const gate = canPlay(def.key, now);
        if (!gate.ok) return gate;
        // Social requires consent flow — runtime alone will not play without force/consent source
        if (def.requiresConsent && opts?.source !== "consent" && opts?.source !== "network") {
          return {
            ok: false,
            reason: "Social emote requires consent — use requestSocialEmote",
          };
        }
      }

      if (EMOTE_CANCEL_LAYERS.includes(state.layer) && !opts?.force) {
        return { ok: false, reason: `Cannot emote during ${state.layer}` };
      }

      const reduced =
        opts?.force === true
          ? false
          : (options.prefersReducedMotion?.() ?? false);

      const request: EmotePlaybackRequest = {
        emoteKey: def.key,
        actorId: opts?.actorId ?? actorId,
        actorKind: opts?.actorKind ?? "player",
        targetId: opts?.targetId,
        at: now,
        reducedMotion: reduced,
        source: opts?.source ?? "wheel",
      };

      const duration = reduced ? Math.min(def.durationMs, 600) : def.durationMs;
      state = {
        active: request,
        layer: "emote",
        endsAt: now + duration,
        lastEmoteAt: now,
        lastEmoteKey: def.key,
      };
      recentPlays.push(now);
      options.bus.publish({ type: "play", payload: request });
      return { ok: true, request, state: runtime.getState() };
    },
    cancel(reason, now = Date.now()) {
      if (!state.active) return;
      const id = state.active.actorId;
      state = {
        ...state,
        active: null,
        layer: state.layer === "emote" ? "idle" : state.layer,
        endsAt: now,
      };
      options.bus.publish({ type: "cancel", payload: { actorId: id, reason } });
    },
    setLayer(layer, now = Date.now()) {
      state = { ...state, layer };
      // Movement / combat / portal always interrupt cosmetic emotes.
      if (state.active && EMOTE_CANCEL_LAYERS.includes(layer)) {
        runtime.cancel(`interrupted_by_${layer}`, now);
      }
    },
    tick(now = Date.now()) {
      if (state.active && now >= state.endsAt) {
        const id = state.active.actorId;
        state = {
          ...state,
          active: null,
          layer: state.layer === "emote" ? "idle" : state.layer,
          endsAt: now,
        };
        options.bus.publish({
          type: "cancel",
          payload: { actorId: id, reason: "completed" },
        });
      }
    },
  };

  return runtime;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
