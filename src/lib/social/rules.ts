/**
 * Pure friend / PM authorization rules — unit-tested, no I/O.
 */

import type { MessagePrivacyMode } from "@/lib/social/types";

export const MAX_FRIENDS = 200;
export const MAX_PENDING_OUTGOING = 40;
export const MAX_MESSAGE_LEN = 500;
export const MAX_FRIEND_NOTE_LEN = 120;
export const ONLINE_WINDOW_MS = 5 * 60_000;
export const AWAY_WINDOW_MS = 30 * 60_000;

/** Lexicographic pair so undirected friendship is unique. */
export function canonicalPair(a: string, b: string): [string, string] {
  return a <= b ? [a, b] : [b, a];
}

export function sameOwner(a: string, b: string): boolean {
  return a === b;
}

export type CanSendFriendRequestInput = {
  fromOwnerKey: string;
  toOwnerKey: string;
  alreadyFriends: boolean;
  eitherBlocked: boolean;
  pendingEitherDirection: boolean;
  fromFriendCount: number;
  fromPendingOutgoing: number;
  targetExists: boolean;
};

export function canSendFriendRequest(
  input: CanSendFriendRequestInput,
): { ok: true } | { ok: false; error: string; message: string } {
  if (!input.targetExists) {
    return { ok: false, error: "not_found", message: "No keeper found with that handle." };
  }
  if (sameOwner(input.fromOwnerKey, input.toOwnerKey)) {
    return { ok: false, error: "invalid", message: "You cannot friend yourself." };
  }
  if (input.eitherBlocked) {
    return { ok: false, error: "blocked", message: "Cannot send a request while blocked." };
  }
  if (input.alreadyFriends) {
    return { ok: false, error: "already_friends", message: "You are already friends." };
  }
  if (input.pendingEitherDirection) {
    return { ok: false, error: "pending", message: "A request is already pending." };
  }
  if (input.fromFriendCount >= MAX_FRIENDS) {
    return { ok: false, error: "limit", message: "Friend list is full." };
  }
  if (input.fromPendingOutgoing >= MAX_PENDING_OUTGOING) {
    return { ok: false, error: "limit", message: "Too many outgoing requests — wait or cancel some." };
  }
  return { ok: true };
}

export type CanSendPmInput = {
  fromOwnerKey: string;
  toOwnerKey: string;
  areFriends: boolean;
  eitherBlocked: boolean;
  recipientPrivacy: MessagePrivacyMode;
  bodyLen: number;
};

export function canSendPrivateMessage(
  input: CanSendPmInput,
): { ok: true } | { ok: false; error: string; message: string } {
  if (sameOwner(input.fromOwnerKey, input.toOwnerKey)) {
    return { ok: false, error: "invalid", message: "Cannot message yourself." };
  }
  if (input.eitherBlocked) {
    return { ok: false, error: "blocked", message: "Messaging is blocked with this keeper." };
  }
  if (input.bodyLen <= 0) {
    return { ok: false, error: "empty", message: "Message is empty." };
  }
  if (input.bodyLen > MAX_MESSAGE_LEN) {
    return { ok: false, error: "too_long", message: `Messages max ${MAX_MESSAGE_LEN} characters.` };
  }
  const friendsOnly = input.recipientPrivacy !== "anyone";
  if (friendsOnly && !input.areFriends) {
    return {
      ok: false,
      error: "friends_only",
      message: "This keeper only accepts messages from friends.",
    };
  }
  return { ok: true };
}

export function presenceFromLastSeen(
  lastSeenAtIso: string | null | undefined,
  now = Date.now(),
): "online" | "away" | "offline" | "unknown" {
  if (!lastSeenAtIso) return "unknown";
  const t = Date.parse(lastSeenAtIso);
  if (!Number.isFinite(t)) return "unknown";
  const age = now - t;
  if (age <= ONLINE_WINDOW_MS) return "online";
  if (age <= AWAY_WINDOW_MS) return "away";
  return "offline";
}

export function activityStubForPresence(
  status: "online" | "away" | "offline" | "unknown",
): string {
  switch (status) {
    case "online":
      return "In the Riftwilds";
    case "away":
      return "Away";
    case "offline":
      return "Offline";
    default:
      return "Presence unknown";
  }
}

export function normalizeHandle(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
}

export function isValidHandle(handle: string): boolean {
  return /^[a-z][a-z0-9_]{2,23}$/.test(handle);
}
