/**
 * Quick communication pings — rate-limited, cosmetic map/chat signals.
 */

import type { EmoteEventBus } from "@/game/live-world/systems/emotes/event-bus";
import type { PingKind } from "@/game/live-world/systems/emotes/types";

export const PING_COOLDOWN_MS: Record<PingKind, number> = {
  follow_me: 4000,
  help: 5000,
  ready: 3000,
  not_ready: 3000,
  look_here: 3500,
  celebrate: 4000,
  danger: 5000,
  thanks: 3000,
};

export const PING_TO_EMOTE: Record<PingKind, string> = {
  follow_me: "ping_follow",
  help: "ping_help",
  ready: "ready",
  not_ready: "not_ready",
  look_here: "ping_look",
  celebrate: "celebrate",
  danger: "ping_danger",
  thanks: "thanks",
};

export const PING_LABEL: Record<PingKind, string> = {
  follow_me: "Follow me",
  help: "Help",
  ready: "Ready",
  not_ready: "Not ready",
  look_here: "Look here",
  celebrate: "Celebrate",
  danger: "Caution",
  thanks: "Thanks",
};

export type PingController = {
  fire: (
    ping: PingKind,
    opts?: { actorId?: string; now?: number },
  ) => { ok: true; ping: PingKind; emoteKey: string } | { ok: false; reason: string };
  lastAt: (ping: PingKind) => number;
};

export function createPingController(bus: EmoteEventBus, actorId = "local-player"): PingController {
  const last = new Map<PingKind, number>();

  return {
    lastAt: (ping) => last.get(ping) ?? 0,
    fire(ping, opts) {
      const now = opts?.now ?? Date.now();
      const cd = PING_COOLDOWN_MS[ping];
      const prev = last.get(ping);
      if (prev !== undefined && now - prev < cd) {
        return { ok: false, reason: `${PING_LABEL[ping]} ping on cooldown` };
      }
      last.set(ping, now);
      const id = opts?.actorId ?? actorId;
      bus.publish({ type: "ping", payload: { ping, actorId: id, at: now } });
      return { ok: true, ping, emoteKey: PING_TO_EMOTE[ping] };
    },
  };
}

export function parsePingCommand(cmd: string): PingKind | null {
  const map: Record<string, PingKind> = {
    follow: "follow_me",
    followme: "follow_me",
    follow_me: "follow_me",
    help: "help",
    ready: "ready",
    rdy: "ready",
    notready: "not_ready",
    not_ready: "not_ready",
    wait: "not_ready",
    look: "look_here",
    lookhere: "look_here",
    look_here: "look_here",
    danger: "danger",
    caution: "danger",
    celebrate: "celebrate",
    thanks: "thanks",
    ty: "thanks",
  };
  return map[cmd.toLowerCase()] ?? null;
}
