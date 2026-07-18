/**
 * Orchestrates catalog, runtime, consent, pings, pet/NPC reactions, privacy, unlocks.
 * Local-authoritative with event bus ready for WS sync.
 */

import { DEFAULT_CARE_STATS, type CareStats } from "@/game/creatures/care";
import { getEmoteDef, resolveEmoteKey } from "@/game/live-world/systems/emotes/catalog";
import { createConsentStore, type ConsentStore } from "@/game/live-world/systems/emotes/consent";
import { createEmoteEventBus, type EmoteEventBus } from "@/game/live-world/systems/emotes/event-bus";
import {
  createNpcReactionController,
  type NpcReactionController,
} from "@/game/live-world/systems/emotes/npc-reactions";
import {
  createPingController,
  parsePingCommand,
  PING_LABEL,
  type PingController,
} from "@/game/live-world/systems/emotes/pings";
import {
  loadPrivacySettings,
  savePrivacySettings,
} from "@/game/live-world/systems/emotes/privacy";
import {
  createRiftlingReactionController,
  type RiftlingReactionController,
} from "@/game/live-world/systems/emotes/riftling-reactions";
import {
  createEmoteRuntime,
  prefersReducedMotion,
  type EmoteRuntime,
} from "@/game/live-world/systems/emotes/runtime";
import type {
  ConsentRequest,
  EmoteFavoritesState,
  EmoteUiState,
  EmoteUnlockState,
  PingKind,
  PrivacySettings,
} from "@/game/live-world/systems/emotes/types";
import {
  isEmoteUnlocked,
  loadFavorites,
  loadUnlocks,
  saveFavorites,
  saveUnlocks,
  setWheelSlot,
  unlockEmoteWithCredits,
} from "@/game/live-world/systems/emotes/unlocks";

export type EmoteSystem = {
  bus: EmoteEventBus;
  runtime: EmoteRuntime;
  consent: ConsentStore;
  pings: PingController;
  pet: RiftlingReactionController;
  npc: NpcReactionController;
  getPrivacy: () => PrivacySettings;
  setPrivacy: (next: PrivacySettings) => void;
  getUnlocks: () => EmoteUnlockState;
  getFavorites: () => EmoteFavoritesState;
  setFavorites: (next: EmoteFavoritesState) => void;
  assignWheelSlot: (index: number, key: string | null) => void;
  getUi: () => EmoteUiState;
  setUi: (partial: Partial<EmoteUiState>) => void;
  getCare: () => Partial<CareStats>;
  setCare: (care: Partial<CareStats>) => void;
  playSolo: (
    key: string,
    source?: "wheel" | "chat" | "ping" | "admin",
  ) => { ok: true; emoteKey: string } | { ok: false; reason: string };
  requestSocial: (input: {
    emoteKey: string;
    toId: string;
    fromLabel?: string;
  }) => { ok: true; request: ConsentRequest } | { ok: false; reason: string };
  resolveConsent: (
    id: string,
    decision: "accepted" | "declined" | "cancelled",
  ) => { ok: true; request: ConsentRequest } | { ok: false; reason: string };
  firePing: (ping: PingKind) => { ok: true; emoteKey: string } | { ok: false; reason: string };
  unlockWithCredits: (
    key: string,
    availableCredits: number,
  ) =>
    | { ok: true; cost: number; note: string }
    | { ok: false; reason: string };
  nearbyNpcSlug: string | null;
  setNearbyNpc: (slug: string | null) => void;
  tick: (now?: number) => void;
};

export function createEmoteSystem(opts?: {
  actorId?: string;
  care?: Partial<CareStats>;
}): EmoteSystem {
  const bus = createEmoteEventBus();
  let unlocks = loadUnlocks();
  let favorites = loadFavorites();
  let privacy = loadPrivacySettings();
  let care: Partial<CareStats> = { ...DEFAULT_CARE_STATS, ...opts?.care };
  let ui: EmoteUiState = {
    mode: "closed",
    highlightIndex: 0,
    holdStartedAt: null,
  };
  let nearbyNpcSlug: string | null = null;

  const runtime = createEmoteRuntime({
    bus,
    actorId: opts?.actorId ?? "local-player",
    isUnlocked: (key) => isEmoteUnlocked(unlocks, key),
    prefersReducedMotion,
  });
  const consent = createConsentStore();
  const pings = createPingController(bus, opts?.actorId ?? "local-player");
  const pet = createRiftlingReactionController(bus);
  const npc = createNpcReactionController(bus);

  const system: EmoteSystem = {
    bus,
    runtime,
    consent,
    pings,
    pet,
    npc,
    nearbyNpcSlug: null,
    getPrivacy: () => privacy,
    setPrivacy: (next) => {
      privacy = next;
      savePrivacySettings(next);
    },
    getUnlocks: () => unlocks,
    getFavorites: () => favorites,
    setFavorites: (next) => {
      favorites = next;
      saveFavorites(next);
    },
    assignWheelSlot: (index, key) => {
      favorites = setWheelSlot(favorites, index, key);
      saveFavorites(favorites);
    },
    getUi: () => ({ ...ui }),
    setUi: (partial) => {
      ui = { ...ui, ...partial };
    },
    getCare: () => care,
    setCare: (next) => {
      care = { ...care, ...next };
    },
    setNearbyNpc: (slug) => {
      nearbyNpcSlug = slug;
      system.nearbyNpcSlug = slug;
    },
    playSolo(key, source = "wheel") {
      const resolved = resolveEmoteKey(key);
      if (!resolved) return { ok: false, reason: "Unknown emote" };
      const def = getEmoteDef(resolved)!;
      if (def.kind === "social") {
        return { ok: false, reason: "Use social request for paired emotes" };
      }
      const result = runtime.play(resolved, { source });
      if (!result.ok) return result;

      // Pet + nearby NPC cosmetic reactions
      pet.reactToPlayerEmote(resolved, care);
      if (nearbyNpcSlug) {
        npc.tryReact({ npcSlug: nearbyNpcSlug, playerEmoteKey: resolved });
      }
      return { ok: true, emoteKey: resolved };
    },
    requestSocial(input) {
      const resolved = resolveEmoteKey(input.emoteKey);
      if (!resolved) return { ok: false, reason: "Unknown emote" };
      const result = consent.request({
        fromId: opts?.actorId ?? "local-player",
        fromLabel: input.fromLabel ?? "Keeper",
        toId: input.toId,
        emoteKey: resolved,
        targetPrivacy: privacy,
      });
      if (!result.ok) return result;
      bus.publish({ type: "consent_request", payload: result.request });
      return result;
    },
    resolveConsent(id, decision) {
      const result = consent.resolve(id, decision);
      if (!result.ok) return result;
      bus.publish({ type: "consent_resolve", payload: result.request });
      if (result.request.status === "accepted") {
        runtime.play(result.request.emoteKey, {
          source: "consent",
          targetId: result.request.toId,
          force: false,
        });
      }
      return result;
    },
    firePing(ping) {
      const fired = pings.fire(ping);
      if (!fired.ok) return fired;
      const played = runtime.play(fired.emoteKey, { source: "ping" });
      if (!played.ok) return played;
      return { ok: true, emoteKey: fired.emoteKey };
    },
    unlockWithCredits(key, availableCredits) {
      const result = unlockEmoteWithCredits(unlocks, key, availableCredits);
      if (!result.ok) return result;
      unlocks = result.state;
      saveUnlocks(unlocks);
      return { ok: true, cost: result.cost, note: result.note };
    },
    tick(now) {
      runtime.tick(now);
      consent.expireStale(now);
    },
  };

  return system;
}

/** Chat slash helpers used by chat.ts */
export function describeEmoteHelp(): string {
  return "Emotes: /wave /emote <name> /dance /ready /ping <follow|help|ready|…> · T wheel · Shift+T panel";
}

export function tryParseEmoteSlash(raw: string): {
  kind: "emote" | "ping" | "help";
  key?: string;
  ping?: PingKind;
  body?: string;
} | null {
  if (!raw.startsWith("/")) return null;
  const parts = raw.slice(1).trim().split(/\s+/);
  const cmd = (parts[0] ?? "").toLowerCase();
  const rest = parts.slice(1).join(" ");

  if (cmd === "emotes" || cmd === "emotehelp") {
    return { kind: "help", body: describeEmoteHelp() };
  }
  if (cmd === "emote" || cmd === "e") {
    if (!rest) return { kind: "help", body: "Usage: /emote <name> — try /wave /dance /ready" };
    const key = resolveEmoteKey(rest);
    if (!key) return { kind: "help", body: `Unknown emote "${rest}". Try /emotes` };
    return { kind: "emote", key };
  }
  if (cmd === "ping") {
    const ping = parsePingCommand(rest || "help");
    if (!ping) {
      return {
        kind: "help",
        body: "Usage: /ping <follow|help|ready|not_ready|look|danger|celebrate|thanks>",
      };
    }
    return { kind: "ping", ping, body: PING_LABEL[ping] };
  }

  // Direct /wave /dance etc.
  const direct = resolveEmoteKey(cmd);
  if (direct) return { kind: "emote", key: direct };

  const pingDirect = parsePingCommand(cmd);
  if (pingDirect && ["follow", "help"].includes(cmd)) {
    return { kind: "ping", ping: pingDirect, body: PING_LABEL[pingDirect] };
  }

  return null;
}
