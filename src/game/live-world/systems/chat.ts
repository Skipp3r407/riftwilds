/**
 * Live World chat — local stub with sanitize, rate limit, channels, slash commands.
 * Flag: LIVE_WORLD_CHAT_ENABLED. Server moderation is Phase 2.
 * Emote slash commands never run while typing focus is false for WASD — chat submit only.
 */

import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getEmoteDef } from "@/game/live-world/systems/emotes/catalog";
import {
  describeEmoteHelp,
  tryParseEmoteSlash,
} from "@/game/live-world/systems/emotes/emote-system";
import { PING_TO_EMOTE } from "@/game/live-world/systems/emotes/pings";

export type ChatChannel =
  | "nearby"
  | "guild"
  | "party"
  | "trade"
  | "whisper"
  | "system"
  | "combat"
  | "global";

export type ChatMessage = {
  id: string;
  channel: ChatChannel;
  from: string;
  body: string;
  at: number;
  whisperTo?: string;
  /** When set, Live World shell should play this cosmetic emote. */
  emoteKey?: string;
  pingKind?: string;
};

const MAX_LEN = 240;
const RATE_WINDOW_MS = 4000;
const RATE_MAX = 4;

const PROFANITY_STUB = /\b(badword|hateword)\b/gi;

export function sanitizeChatBody(raw: string): string {
  let s = raw.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  s = s.slice(0, MAX_LEN);
  s = s.replace(PROFANITY_STUB, "***");
  // Strip script/style blocks entirely, then remaining tags
  s = s.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
  s = s.replace(/<[^>]*>/g, "");
  return s.trim();
}

export type SlashCommandResult =
  | {
      kind: "message";
      channel: ChatChannel;
      body: string;
      whisperTo?: string;
      emoteKey?: string;
      pingKind?: string;
    }
  | { kind: "system"; body: string }
  | { kind: "error"; body: string }
  | { kind: "ui"; action: "help" | "clear" | "who" | "invite" | "leave" }
  | { kind: "emote"; emoteKey: string; body: string }
  | { kind: "ping"; pingKind: string; emoteKey: string; body: string };

export function parseSlashCommand(raw: string): SlashCommandResult | null {
  if (!raw.startsWith("/")) return null;
  const parts = raw.slice(1).trim().split(/\s+/);
  const cmd = (parts[0] ?? "").toLowerCase();
  const rest = parts.slice(1).join(" ");

  switch (cmd) {
    case "help":
      return {
        kind: "system",
        body: `Commands: /help /who /invite /leave /party /w <name> <msg> /me <text> /clear · ${describeEmoteHelp()}`,
      };
    case "who":
      return { kind: "ui", action: "who" };
    case "invite":
      return { kind: "ui", action: "invite" };
    case "leave":
      return { kind: "ui", action: "leave" };
    case "clear":
      return { kind: "ui", action: "clear" };
    case "party":
      return {
        kind: "message",
        channel: "party",
        body: rest || "(empty party message)",
      };
    case "w":
    case "whisper": {
      const [name, ...msgParts] = rest.split(/\s+/);
      if (!name || msgParts.length === 0) {
        return { kind: "error", body: "Usage: /w <name> <message>" };
      }
      return {
        kind: "message",
        channel: "whisper",
        body: msgParts.join(" "),
        whisperTo: name,
      };
    }
    case "me": {
      // /me wave → visual emote + RP text; /me shrugs → text only
      const emoteGuess = tryParseEmoteSlash(`/emote ${rest}`);
      if (emoteGuess?.kind === "emote" && emoteGuess.key && rest.trim().split(/\s+/).length === 1) {
        const def = getEmoteDef(emoteGuess.key);
        return {
          kind: "emote",
          emoteKey: emoteGuess.key,
          body: `* ${def?.label ?? rest}`,
        };
      }
      return {
        kind: "message",
        channel: "nearby",
        body: `* ${rest || "gestures"}`,
      };
    }
    default: {
      const emoteSlash = tryParseEmoteSlash(raw);
      if (emoteSlash?.kind === "help") {
        return { kind: "system", body: emoteSlash.body ?? describeEmoteHelp() };
      }
      if (emoteSlash?.kind === "emote" && emoteSlash.key) {
        const def = getEmoteDef(emoteSlash.key);
        return {
          kind: "emote",
          emoteKey: emoteSlash.key,
          body: `* ${def?.label ?? emoteSlash.key}`,
        };
      }
      if (emoteSlash?.kind === "ping" && emoteSlash.ping) {
        return {
          kind: "ping",
          pingKind: emoteSlash.ping,
          emoteKey: emoteSlash.key ?? PING_TO_EMOTE[emoteSlash.ping],
          body: `* ${emoteSlash.body ?? emoteSlash.ping}`,
        };
      }
      return { kind: "error", body: `Unknown command /${cmd}. Try /help` };
    }
  }
}

export type ChatStore = {
  list: (channel?: ChatChannel) => ChatMessage[];
  send: (
    channel: ChatChannel,
    body: string,
    opts?: { from?: string; whisperTo?: string },
  ) => { ok: true; message: ChatMessage } | { ok: false; reason: string };
  clear: () => void;
  submit: (
    raw: string,
    opts?: { channel?: ChatChannel; from?: string },
  ) =>
    | {
        ok: true;
        message?: ChatMessage;
        system?: string;
        ui?: SlashCommandResult;
        emoteKey?: string;
        pingKind?: string;
      }
    | { ok: false; reason: string };
};

export function createChatStore(): ChatStore {
  const messages: ChatMessage[] = [
    {
      id: "sys-welcome",
      channel: "system",
      from: "System",
      body: "Welcome to Riftwild Commons. Press Enter to chat · / for commands.",
      at: Date.now(),
    },
  ];
  const recentSends: number[] = [];

  function rateLimited(): boolean {
    const now = Date.now();
    while (recentSends.length && now - recentSends[0]! > RATE_WINDOW_MS) {
      recentSends.shift();
    }
    return recentSends.length >= RATE_MAX;
  }

  const store: ChatStore = {
    list: (channel) =>
      channel ? messages.filter((m) => m.channel === channel) : messages.slice(),
    clear: () => {
      messages.length = 0;
    },
    send: (channel, body, opts) => {
      if (!featureFlagDefaults.LIVE_WORLD_CHAT_ENABLED) {
        return { ok: false, reason: "Chat is disabled" };
      }
      const clean = sanitizeChatBody(body);
      if (!clean) return { ok: false, reason: "Empty message" };
      if (rateLimited()) return { ok: false, reason: "Slow down — rate limited" };
      recentSends.push(Date.now());
      const message: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        channel,
        from: opts?.from ?? "Keeper",
        body: clean,
        at: Date.now(),
        whisperTo: opts?.whisperTo,
      };
      messages.push(message);
      if (messages.length > 200) messages.shift();
      return { ok: true, message };
    },
    submit: (raw, opts) => {
      const trimmed = raw.trim();
      if (!trimmed) return { ok: false, reason: "Empty message" };
      const slash = parseSlashCommand(trimmed);
      if (slash) {
        if (slash.kind === "error") return { ok: false, reason: slash.body };
        if (slash.kind === "system") {
          const message: ChatMessage = {
            id: `sys-${Date.now()}`,
            channel: "system",
            from: "System",
            body: slash.body,
            at: Date.now(),
          };
          messages.push(message);
          return { ok: true, message, system: slash.body };
        }
        if (slash.kind === "ui") {
          if (slash.action === "clear") store.clear();
          if (slash.action === "who") {
            const message: ChatMessage = {
              id: `sys-${Date.now()}`,
              channel: "system",
              from: "System",
              body: "Nearby: Keeper (you) · companions online in Phase 2.",
              at: Date.now(),
            };
            messages.push(message);
            return { ok: true, message, ui: slash };
          }
          return { ok: true, ui: slash };
        }
        if (slash.kind === "emote") {
          if (rateLimited()) return { ok: false, reason: "Slow down — rate limited" };
          recentSends.push(Date.now());
          const message: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            channel: "nearby",
            from: opts?.from ?? "Keeper",
            body: sanitizeChatBody(slash.body),
            at: Date.now(),
            emoteKey: slash.emoteKey,
          };
          messages.push(message);
          return { ok: true, message, emoteKey: slash.emoteKey };
        }
        if (slash.kind === "ping") {
          if (rateLimited()) return { ok: false, reason: "Slow down — rate limited" };
          recentSends.push(Date.now());
          const message: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            channel: "nearby",
            from: opts?.from ?? "Keeper",
            body: sanitizeChatBody(slash.body),
            at: Date.now(),
            emoteKey: slash.emoteKey,
            pingKind: slash.pingKind,
          };
          messages.push(message);
          return {
            ok: true,
            message,
            emoteKey: slash.emoteKey,
            pingKind: slash.pingKind,
          };
        }
        return store.send(slash.channel, slash.body, {
          from: opts?.from,
          whisperTo: slash.whisperTo,
        });
      }
      return store.send(opts?.channel ?? "nearby", trimmed, { from: opts?.from });
    },
  };

  return store;
}
