/**
 * Synchronized social emote consent — mutual accept required before playback.
 * Server-authoritative validation shape; local stub until multiplayer WS ships.
 */

import { getEmoteDef } from "@/game/live-world/systems/emotes/catalog";
import { canReceiveSocialRequest } from "@/game/live-world/systems/emotes/privacy";
import type { ConsentRequest, PrivacySettings } from "@/game/live-world/systems/emotes/types";

export const CONSENT_TTL_MS = 20_000;

export type ConsentStore = {
  listPending: () => ConsentRequest[];
  request: (input: {
    fromId: string;
    fromLabel: string;
    toId: string;
    emoteKey: string;
    targetPrivacy: PrivacySettings;
    now?: number;
  }) => { ok: true; request: ConsentRequest } | { ok: false; reason: string };
  resolve: (
    id: string,
    decision: "accepted" | "declined" | "cancelled",
    now?: number,
  ) => { ok: true; request: ConsentRequest } | { ok: false; reason: string };
  expireStale: (now?: number) => ConsentRequest[];
  clear: () => void;
};

export function createConsentStore(): ConsentStore {
  const pending = new Map<string, ConsentRequest>();

  function expireStale(now = Date.now()): ConsentRequest[] {
    const expired: ConsentRequest[] = [];
    for (const [id, req] of pending) {
      if (req.status === "pending" && now >= req.expiresAt) {
        const next = { ...req, status: "expired" as const };
        pending.set(id, next);
        expired.push(next);
      }
    }
    return expired;
  }

  return {
    listPending: () => {
      expireStale();
      return [...pending.values()].filter((r) => r.status === "pending");
    },
    request: (input) => {
      const def = getEmoteDef(input.emoteKey);
      if (!def) return { ok: false, reason: "Unknown emote" };
      if (!def.requiresConsent || def.kind !== "social") {
        return { ok: false, reason: "Emote does not require consent" };
      }
      if (input.fromId === input.toId) {
        return { ok: false, reason: "Cannot request social emote with yourself" };
      }
      const gate = canReceiveSocialRequest(input.targetPrivacy, input.fromId);
      if (!gate.ok) return gate;

      const now = input.now ?? Date.now();
      expireStale(now);

      // One pending request per pair+emote
      for (const req of pending.values()) {
        if (
          req.status === "pending" &&
          req.fromId === input.fromId &&
          req.toId === input.toId &&
          req.emoteKey === def.key
        ) {
          return { ok: false, reason: "Request already pending" };
        }
      }

      const request: ConsentRequest = {
        id: `consent-${now}-${Math.random().toString(36).slice(2, 8)}`,
        fromId: input.fromId,
        fromLabel: input.fromLabel,
        toId: input.toId,
        emoteKey: def.key,
        createdAt: now,
        expiresAt: now + CONSENT_TTL_MS,
        status: "pending",
      };
      pending.set(request.id, request);
      return { ok: true, request };
    },
    resolve: (id, decision, now = Date.now()) => {
      expireStale(now);
      const req = pending.get(id);
      if (!req) return { ok: false, reason: "Request not found" };
      if (req.status !== "pending") {
        return { ok: false, reason: `Request already ${req.status}` };
      }
      if (now >= req.expiresAt) {
        const expired = { ...req, status: "expired" as const };
        pending.set(id, expired);
        return { ok: false, reason: "Request expired" };
      }
      const next = { ...req, status: decision };
      pending.set(id, next);
      return { ok: true, request: next };
    },
    expireStale,
    clear: () => pending.clear(),
  };
}
