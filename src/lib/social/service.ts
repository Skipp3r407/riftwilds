/**
 * Server-authoritative friends + private messages.
 * Credits ≠ SOL; wallet never required — guest owner keys work.
 */

import {
  activityStubForPresence,
  canSendFriendRequest,
  canSendPrivateMessage,
  canonicalPair,
  isValidHandle,
  normalizeHandle,
  presenceFromLastSeen,
} from "@/lib/social/rules";
import { sanitizeFriendNote, sanitizePmBody } from "@/lib/social/sanitize";
import {
  listAvailableAvatars,
  setSocialAvatar,
  type SetAvatarInput,
} from "@/lib/social/avatars";
import {
  defaultAvatarFor,
  ensureSystemKeepersSeeded,
  getSocialStore,
} from "@/lib/social/store";
import type {
  DmMessageView,
  DmThreadView,
  FriendListEntry,
  FriendRequestRecord,
  FriendRequestView,
  MessagePrivacyMode,
  SocialHubSnapshot,
  SocialProfile,
  SocialSummary,
} from "@/lib/social/types";

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function nowIso(now = Date.now()): string {
  return new Date(now).toISOString();
}

function friendshipKey(a: string, b: string): string {
  const [x, y] = canonicalPair(a, b);
  return `${x}::${y}`;
}

function blockKey(blocker: string, blocked: string): string {
  return `${blocker}::${blocked}`;
}

function threadKey(a: string, b: string): string {
  return friendshipKey(a, b);
}

function bumpRate(map: Map<string, number[]>, ownerKey: string, now: number, windowMs: number) {
  const prev = (map.get(ownerKey) ?? []).filter((t) => now - t < windowMs);
  prev.push(now);
  map.set(ownerKey, prev);
  return prev.length;
}

export function ensureSocialProfile(
  ownerKey: string,
  opts?: { displayName?: string; handle?: string },
): SocialProfile {
  ensureSystemKeepersSeeded();
  const store = getSocialStore();
  const existing = store.profiles.get(ownerKey);
  if (existing) {
    existing.lastSeenAt = nowIso();
    if (opts?.displayName?.trim()) {
      existing.displayName = opts.displayName.trim().slice(0, 32);
    }
    return existing;
  }

  const suffix = ownerKey.replace(/[^a-z0-9]/gi, "").slice(-8).toLowerCase() || "keeper";
  let handle = opts?.handle ? normalizeHandle(opts.handle) : `keeper_${suffix}`;
  if (!isValidHandle(handle) || store.handles.has(handle)) {
    let n = 1;
    while (store.handles.has(`keeper_${suffix}${n}`) || !isValidHandle(`keeper_${suffix}${n}`)) {
      n += 1;
      if (n > 9999) {
        handle = `k_${createId("h").slice(2, 12)}`;
        break;
      }
    }
    if (n <= 9999) handle = `keeper_${suffix}${n}`;
  }

  const profile: SocialProfile = {
    ownerKey,
    handle,
    displayName: opts?.displayName?.trim().slice(0, 32) || `Keeper ${suffix.slice(0, 4)}`,
    rankTitle: "Hatchling Keeper",
    avatarSrc: defaultAvatarFor(ownerKey),
    unlockedAvatarKeys: [],
    createdAt: nowIso(),
    lastSeenAt: nowIso(),
    messagePrivacy: "friends_only",
  };
  store.profiles.set(ownerKey, profile);
  store.handles.set(profile.handle, ownerKey);
  return profile;
}

export function setDisplayName(ownerKey: string, displayName: string): SocialProfile {
  const profile = ensureSocialProfile(ownerKey);
  const cleaned = displayName.trim().slice(0, 32);
  if (cleaned.length >= 2) profile.displayName = cleaned;
  profile.lastSeenAt = nowIso();
  return profile;
}

export function setHandle(
  ownerKey: string,
  rawHandle: string,
): { ok: true; profile: SocialProfile } | { ok: false; error: string; message: string } {
  const store = getSocialStore();
  const profile = ensureSocialProfile(ownerKey);
  const handle = normalizeHandle(rawHandle);
  if (!isValidHandle(handle)) {
    return {
      ok: false,
      error: "invalid_handle",
      message: "Handle must be 3–24 chars, start with a letter, use a–z, 0–9, _.",
    };
  }
  const taken = store.handles.get(handle);
  if (taken && taken !== ownerKey) {
    return { ok: false, error: "taken", message: "That handle is already taken." };
  }
  store.handles.delete(profile.handle);
  profile.handle = handle;
  store.handles.set(handle, ownerKey);
  profile.lastSeenAt = nowIso();
  return { ok: true, profile };
}

export function setMessagePrivacy(
  ownerKey: string,
  mode: MessagePrivacyMode,
): SocialProfile {
  const profile = ensureSocialProfile(ownerKey);
  profile.messagePrivacy = mode;
  profile.lastSeenAt = nowIso();
  return profile;
}

export function getAvatarCatalog(ownerKey: string) {
  ensureSocialProfile(ownerKey);
  return listAvailableAvatars(ownerKey);
}

export function setAvatar(ownerKey: string, input: SetAvatarInput) {
  ensureSocialProfile(ownerKey);
  return setSocialAvatar(ownerKey, input);
}

export function resolveOwnerByHandle(handleOrKey: string): SocialProfile | null {
  ensureSystemKeepersSeeded();
  const store = getSocialStore();
  const byKey = store.profiles.get(handleOrKey);
  if (byKey) return byKey;
  const handle = normalizeHandle(handleOrKey);
  const ownerKey = store.handles.get(handle);
  if (!ownerKey) return null;
  return store.profiles.get(ownerKey) ?? null;
}

export function areFriends(a: string, b: string): boolean {
  if (a === b) return false;
  const store = getSocialStore();
  return store.friendships.has(friendshipKey(a, b));
}

export function isBlockedEitherWay(a: string, b: string): boolean {
  const store = getSocialStore();
  return store.blocks.has(blockKey(a, b)) || store.blocks.has(blockKey(b, a));
}

function pendingBetween(a: string, b: string): FriendRequestRecord | null {
  const store = getSocialStore();
  for (const r of store.requests.values()) {
    if (r.status !== "pending") continue;
    if (
      (r.fromOwnerKey === a && r.toOwnerKey === b) ||
      (r.fromOwnerKey === b && r.toOwnerKey === a)
    ) {
      return r;
    }
  }
  return null;
}

function friendCount(ownerKey: string): number {
  const store = getSocialStore();
  let n = 0;
  for (const f of store.friendships.values()) {
    if (f.ownerKeyA === ownerKey || f.ownerKeyB === ownerKey) n += 1;
  }
  return n;
}

function pendingOutgoingCount(ownerKey: string): number {
  const store = getSocialStore();
  let n = 0;
  for (const r of store.requests.values()) {
    if (r.status === "pending" && r.fromOwnerKey === ownerKey) n += 1;
  }
  return n;
}

export function sendFriendRequest(input: {
  fromOwnerKey: string;
  toHandleOrKey: string;
  note?: string | null;
}):
  | { ok: true; request: FriendRequestView }
  | { ok: false; error: string; message: string } {
  ensureSystemKeepersSeeded();
  const store = getSocialStore();
  const from = ensureSocialProfile(input.fromOwnerKey);
  const to = resolveOwnerByHandle(input.toHandleOrKey);

  const gate = canSendFriendRequest({
    fromOwnerKey: from.ownerKey,
    toOwnerKey: to?.ownerKey ?? "",
    alreadyFriends: to ? areFriends(from.ownerKey, to.ownerKey) : false,
    eitherBlocked: to ? isBlockedEitherWay(from.ownerKey, to.ownerKey) : false,
    pendingEitherDirection: to ? !!pendingBetween(from.ownerKey, to.ownerKey) : false,
    fromFriendCount: friendCount(from.ownerKey),
    fromPendingOutgoing: pendingOutgoingCount(from.ownerKey),
    targetExists: !!to,
  });
  if (!gate.ok) return gate;
  if (!to) return { ok: false, error: "not_found", message: "No keeper found with that handle." };

  const now = Date.now();
  const recent = bumpRate(store.requestTimestamps, from.ownerKey, now, 60_000);
  if (recent > 12) {
    return { ok: false, error: "rate_limited", message: "Too many friend requests — try again shortly." };
  }

  const iso = nowIso(now);
  const request = {
    id: createId("freq"),
    fromOwnerKey: from.ownerKey,
    toOwnerKey: to.ownerKey,
    status: "pending" as const,
    note: sanitizeFriendNote(input.note),
    createdAt: iso,
    updatedAt: iso,
  };
  store.requests.set(request.id, request);

  // System keepers auto-accept for onboarding without multiplayer peers.
  if (to.systemKeeper) {
    const accepted = acceptFriendRequest({
      actorOwnerKey: to.ownerKey,
      requestId: request.id,
    });
    if (!accepted.ok) return accepted;
    return { ok: true, request: accepted.request };
  }

  return { ok: true, request: toRequestView(request, from.ownerKey) };
}

export function acceptFriendRequest(input: {
  actorOwnerKey: string;
  requestId: string;
}):
  | { ok: true; request: FriendRequestView; friendshipId: string }
  | { ok: false; error: string; message: string } {
  const store = getSocialStore();
  ensureSocialProfile(input.actorOwnerKey);
  const req = store.requests.get(input.requestId);
  if (!req || req.status !== "pending") {
    return { ok: false, error: "not_found", message: "Friend request not found." };
  }
  if (req.toOwnerKey !== input.actorOwnerKey) {
    return { ok: false, error: "forbidden", message: "Only the recipient can accept." };
  }
  if (isBlockedEitherWay(req.fromOwnerKey, req.toOwnerKey)) {
    return { ok: false, error: "blocked", message: "Cannot accept while blocked." };
  }
  if (friendCount(req.toOwnerKey) >= 200 || friendCount(req.fromOwnerKey) >= 200) {
    return { ok: false, error: "limit", message: "Friend list is full." };
  }

  const iso = nowIso();
  req.status = "accepted";
  req.updatedAt = iso;

  const [a, b] = canonicalPair(req.fromOwnerKey, req.toOwnerKey);
  const friendship = {
    id: createId("friend"),
    ownerKeyA: a,
    ownerKeyB: b,
    createdAt: iso,
  };
  store.friendships.set(friendshipKey(a, b), friendship);

  return {
    ok: true,
    request: toRequestView(req, input.actorOwnerKey),
    friendshipId: friendship.id,
  };
}

export function declineFriendRequest(input: {
  actorOwnerKey: string;
  requestId: string;
}):
  | { ok: true; request: FriendRequestView }
  | { ok: false; error: string; message: string } {
  const store = getSocialStore();
  const req = store.requests.get(input.requestId);
  if (!req || req.status !== "pending") {
    return { ok: false, error: "not_found", message: "Friend request not found." };
  }
  const isRecipient = req.toOwnerKey === input.actorOwnerKey;
  const isSender = req.fromOwnerKey === input.actorOwnerKey;
  if (!isRecipient && !isSender) {
    return { ok: false, error: "forbidden", message: "Not your request." };
  }
  req.status = isSender ? "cancelled" : "declined";
  req.updatedAt = nowIso();
  return { ok: true, request: toRequestView(req, input.actorOwnerKey) };
}

export function removeFriend(input: {
  actorOwnerKey: string;
  peerOwnerKey: string;
}): { ok: true } | { ok: false; error: string; message: string } {
  const store = getSocialStore();
  const key = friendshipKey(input.actorOwnerKey, input.peerOwnerKey);
  if (!store.friendships.has(key)) {
    return { ok: false, error: "not_found", message: "Not friends." };
  }
  store.friendships.delete(key);
  return { ok: true };
}

export function blockPlayer(input: {
  actorOwnerKey: string;
  peerHandleOrKey: string;
  reason?: string | null;
}):
  | { ok: true }
  | { ok: false; error: string; message: string } {
  const store = getSocialStore();
  const actor = ensureSocialProfile(input.actorOwnerKey);
  const peer = resolveOwnerByHandle(input.peerHandleOrKey);
  if (!peer) return { ok: false, error: "not_found", message: "Keeper not found." };
  if (peer.ownerKey === actor.ownerKey) {
    return { ok: false, error: "invalid", message: "Cannot block yourself." };
  }

  // Remove friendship + pending requests
  store.friendships.delete(friendshipKey(actor.ownerKey, peer.ownerKey));
  for (const r of store.requests.values()) {
    if (r.status !== "pending") continue;
    if (
      (r.fromOwnerKey === actor.ownerKey && r.toOwnerKey === peer.ownerKey) ||
      (r.fromOwnerKey === peer.ownerKey && r.toOwnerKey === actor.ownerKey)
    ) {
      r.status = "cancelled";
      r.updatedAt = nowIso();
    }
  }

  store.blocks.set(blockKey(actor.ownerKey, peer.ownerKey), {
    id: createId("block"),
    blockerOwnerKey: actor.ownerKey,
    blockedOwnerKey: peer.ownerKey,
    reason: sanitizeFriendNote(input.reason),
    createdAt: nowIso(),
  });
  return { ok: true };
}

export function unblockPlayer(input: {
  actorOwnerKey: string;
  peerOwnerKey: string;
}): { ok: true } | { ok: false; error: string; message: string } {
  const store = getSocialStore();
  const key = blockKey(input.actorOwnerKey, input.peerOwnerKey);
  if (!store.blocks.has(key)) {
    return { ok: false, error: "not_found", message: "Not blocked." };
  }
  store.blocks.delete(key);
  return { ok: true };
}

export function reportPlayer(input: {
  reporterOwnerKey: string;
  targetHandleOrKey: string;
  reason: string;
  details?: string | null;
  targetType?: "player" | "message";
  targetId?: string;
}):
  | { ok: true; reportId: string }
  | { ok: false; error: string; message: string } {
  const store = getSocialStore();
  ensureSocialProfile(input.reporterOwnerKey);
  const target = resolveOwnerByHandle(input.targetHandleOrKey);
  if (!target) return { ok: false, error: "not_found", message: "Keeper not found." };
  if (target.ownerKey === input.reporterOwnerKey) {
    return { ok: false, error: "invalid", message: "Cannot report yourself." };
  }
  const reason = sanitizeFriendNote(input.reason) ?? "unspecified";
  const report = {
    id: createId("report"),
    reporterOwnerKey: input.reporterOwnerKey,
    targetOwnerKey: target.ownerKey,
    targetType: input.targetType ?? ("player" as const),
    targetId: input.targetId ?? target.ownerKey,
    reason,
    details: sanitizeFriendNote(input.details),
    createdAt: nowIso(),
    status: "stub_logged" as const,
  };
  store.reports.set(report.id, report);
  console.info("[social-report-stub]", {
    id: report.id,
    target: target.handle,
    reason: report.reason,
  });
  return { ok: true, reportId: report.id };
}

function getOrCreateThread(a: string, b: string) {
  const store = getSocialStore();
  const key = threadKey(a, b);
  for (const t of store.threads.values()) {
    if (threadKey(t.ownerKeyA, t.ownerKeyB) === key) return t;
  }
  const [x, y] = canonicalPair(a, b);
  const iso = nowIso();
  const thread = {
    id: createId("dmthread"),
    ownerKeyA: x,
    ownerKeyB: y,
    createdAt: iso,
    updatedAt: iso,
    lastMessageAt: null as string | null,
  };
  store.threads.set(thread.id, thread);
  return thread;
}

export function sendPrivateMessage(input: {
  fromOwnerKey: string;
  toHandleOrKey: string;
  body: string;
}):
  | { ok: true; message: DmMessageView; threadId: string }
  | { ok: false; error: string; message: string } {
  ensureSystemKeepersSeeded();
  const store = getSocialStore();
  const from = ensureSocialProfile(input.fromOwnerKey);
  const to = resolveOwnerByHandle(input.toHandleOrKey);
  if (!to) return { ok: false, error: "not_found", message: "Keeper not found." };

  const body = sanitizePmBody(input.body);
  const gate = canSendPrivateMessage({
    fromOwnerKey: from.ownerKey,
    toOwnerKey: to.ownerKey,
    areFriends: areFriends(from.ownerKey, to.ownerKey),
    eitherBlocked: isBlockedEitherWay(from.ownerKey, to.ownerKey),
    recipientPrivacy: to.messagePrivacy,
    bodyLen: body.length,
  });
  if (!gate.ok) return gate;

  const now = Date.now();
  const recent = bumpRate(store.sendTimestamps, from.ownerKey, now, 10_000);
  if (recent > 8) {
    return { ok: false, error: "rate_limited", message: "Slow down — too many messages." };
  }

  const thread = getOrCreateThread(from.ownerKey, to.ownerKey);
  const iso = nowIso(now);
  const msg = {
    id: createId("dm"),
    threadId: thread.id,
    senderOwnerKey: from.ownerKey,
    body,
    createdAt: iso,
    readAt: null as string | null,
  };
  store.messages.set(msg.id, msg);
  thread.lastMessageAt = iso;
  thread.updatedAt = iso;

  // System keepers auto-reply once per thread for empty-state feel.
  if (to.systemKeeper) {
    const alreadyReplied = [...store.messages.values()].some(
      (m) => m.threadId === thread.id && m.senderOwnerKey === to.ownerKey,
    );
    if (!alreadyReplied) {
      const reply = {
        id: createId("dm"),
        threadId: thread.id,
        senderOwnerKey: to.ownerKey,
        body: `${to.displayName} nods. "Friends and whispers — Credits, never SOL. Stay kind in the wilds."`,
        createdAt: nowIso(now + 1),
        readAt: null as string | null,
      };
      store.messages.set(reply.id, reply);
      thread.lastMessageAt = reply.createdAt;
      thread.updatedAt = reply.createdAt;
    }
  }

  return {
    ok: true,
    threadId: thread.id,
    message: {
      id: msg.id,
      threadId: msg.threadId,
      senderOwnerKey: msg.senderOwnerKey,
      body: msg.body,
      createdAt: msg.createdAt,
      mine: true,
      readAt: msg.readAt,
    },
  };
}

export function listThreadMessages(input: {
  actorOwnerKey: string;
  threadId: string;
  markRead?: boolean;
}):
  | { ok: true; messages: DmMessageView[]; thread: DmThreadView }
  | { ok: false; error: string; message: string } {
  const store = getSocialStore();
  ensureSocialProfile(input.actorOwnerKey);
  const thread = store.threads.get(input.threadId);
  if (!thread) return { ok: false, error: "not_found", message: "Thread not found." };
  if (thread.ownerKeyA !== input.actorOwnerKey && thread.ownerKeyB !== input.actorOwnerKey) {
    return { ok: false, error: "forbidden", message: "Not your thread." };
  }

  const msgs = [...store.messages.values()]
    .filter((m) => m.threadId === thread.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  if (input.markRead !== false) {
    const iso = nowIso();
    for (const m of msgs) {
      if (m.senderOwnerKey !== input.actorOwnerKey && !m.readAt) {
        m.readAt = iso;
      }
    }
  }

  const peerKey =
    thread.ownerKeyA === input.actorOwnerKey ? thread.ownerKeyB : thread.ownerKeyA;
  const peer = store.profiles.get(peerKey);
  const view: DmThreadView = {
    id: thread.id,
    peer: {
      ownerKey: peerKey,
      handle: peer?.handle ?? "unknown",
      displayName: peer?.displayName ?? "Unknown",
      avatarSrc: peer?.avatarSrc ?? defaultAvatarFor(peerKey),
    },
    preview: msgs.at(-1)?.body ?? null,
    lastMessageAt: thread.lastMessageAt,
    unreadCount: 0,
  };

  return {
    ok: true,
    thread: view,
    messages: msgs.map((m) => ({
      id: m.id,
      threadId: m.threadId,
      senderOwnerKey: m.senderOwnerKey,
      body: m.body,
      createdAt: m.createdAt,
      mine: m.senderOwnerKey === input.actorOwnerKey,
      readAt: m.readAt,
    })),
  };
}

export function markThreadRead(input: {
  actorOwnerKey: string;
  threadId: string;
}): { ok: true } | { ok: false; error: string; message: string } {
  const result = listThreadMessages({ ...input, markRead: true });
  if (!result.ok) return result;
  return { ok: true };
}

function toRequestView(
  req: {
    id: string;
    fromOwnerKey: string;
    toOwnerKey: string;
    status: import("@/lib/social/types").FriendshipStatus;
    note: string | null;
    createdAt: string;
  },
  viewerOwnerKey: string,
): FriendRequestView {
  const store = getSocialStore();
  const peerKey =
    req.fromOwnerKey === viewerOwnerKey ? req.toOwnerKey : req.fromOwnerKey;
  const peer = store.profiles.get(peerKey);
  return {
    id: req.id,
    direction: req.toOwnerKey === viewerOwnerKey ? "incoming" : "outgoing",
    peer: {
      ownerKey: peerKey,
      handle: peer?.handle ?? "unknown",
      displayName: peer?.displayName ?? "Unknown",
      avatarSrc: peer?.avatarSrc ?? defaultAvatarFor(peerKey),
      rankTitle: peer?.rankTitle ?? "Keeper",
    },
    note: req.note,
    status: req.status,
    createdAt: req.createdAt,
  };
}

export function listFriends(ownerKey: string): FriendListEntry[] {
  ensureSocialProfile(ownerKey);
  const store = getSocialStore();
  const out: FriendListEntry[] = [];
  for (const f of store.friendships.values()) {
    if (f.ownerKeyA !== ownerKey && f.ownerKeyB !== ownerKey) continue;
    const peerKey = f.ownerKeyA === ownerKey ? f.ownerKeyB : f.ownerKeyA;
    const peer = store.profiles.get(peerKey);
    if (!peer) continue;
    const status = presenceFromLastSeen(peer.lastSeenAt);
    out.push({
      friendshipId: f.id,
      ownerKey: peer.ownerKey,
      handle: peer.handle,
      displayName: peer.displayName,
      rankTitle: peer.rankTitle,
      avatarSrc: peer.avatarSrc,
      status,
      activityStub: activityStubForPresence(status),
      friendsSince: f.createdAt,
    });
  }
  out.sort((a, b) => {
    const rank = { online: 0, away: 1, offline: 2, unknown: 3 } as const;
    return rank[a.status] - rank[b.status] || a.displayName.localeCompare(b.displayName);
  });
  return out;
}

export function listFriendRequests(ownerKey: string): FriendRequestView[] {
  ensureSocialProfile(ownerKey);
  const store = getSocialStore();
  const out: FriendRequestView[] = [];
  for (const r of store.requests.values()) {
    if (r.status !== "pending") continue;
    if (r.fromOwnerKey !== ownerKey && r.toOwnerKey !== ownerKey) continue;
    out.push(toRequestView(r, ownerKey));
  }
  out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return out;
}

export function listDmThreads(ownerKey: string): DmThreadView[] {
  ensureSocialProfile(ownerKey);
  const store = getSocialStore();
  const out: DmThreadView[] = [];
  for (const t of store.threads.values()) {
    if (t.ownerKeyA !== ownerKey && t.ownerKeyB !== ownerKey) continue;
    const peerKey = t.ownerKeyA === ownerKey ? t.ownerKeyB : t.ownerKeyA;
    const peer = store.profiles.get(peerKey);
    const msgs = [...store.messages.values()]
      .filter((m) => m.threadId === t.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const unread = msgs.filter(
      (m) => m.senderOwnerKey !== ownerKey && !m.readAt,
    ).length;
    out.push({
      id: t.id,
      peer: {
        ownerKey: peerKey,
        handle: peer?.handle ?? "unknown",
        displayName: peer?.displayName ?? "Unknown",
        avatarSrc: peer?.avatarSrc ?? defaultAvatarFor(peerKey),
      },
      preview: msgs.at(-1)?.body ?? null,
      lastMessageAt: t.lastMessageAt,
      unreadCount: unread,
    });
  }
  out.sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
  return out;
}

export function getSocialSummary(ownerKey: string): SocialSummary {
  const friends = listFriends(ownerKey);
  const requests = listFriendRequests(ownerKey);
  const threads = listDmThreads(ownerKey);
  return {
    friendsCount: friends.length,
    onlineFriendsCount: friends.filter((f) => f.status === "online").length,
    pendingIncomingRequests: requests.filter((r) => r.direction === "incoming").length,
    unreadMessages: threads.reduce((acc, t) => acc + t.unreadCount, 0),
  };
}

export function getSocialHubData(ownerKey: string): SocialHubSnapshot {
  const me = ensureSocialProfile(ownerKey);
  const store = getSocialStore();
  const blocks = [...store.blocks.values()]
    .filter((b) => b.blockerOwnerKey === ownerKey)
    .map((b) => {
      const peer = store.profiles.get(b.blockedOwnerKey);
      return {
        ownerKey: b.blockedOwnerKey,
        handle: peer?.handle ?? "unknown",
        displayName: peer?.displayName ?? "Unknown",
        avatarSrc: peer?.avatarSrc ?? defaultAvatarFor(b.blockedOwnerKey),
        blockedAt: b.createdAt,
      };
    });

  return {
    me,
    friends: listFriends(ownerKey),
    requests: listFriendRequests(ownerKey),
    threads: listDmThreads(ownerKey),
    blocks,
    summary: getSocialSummary(ownerKey),
    messagePrivacy: me.messagePrivacy,
    note:
      "Friends and PMs are server-validated. Delivery is request/response for now — WebSocket push is backlog. Credits ≠ SOL; no wallet required.",
  };
}

/** Party invite stub — multiplayer Phase 1 has no authoritative party service. */
export function partyInviteStub(input: {
  actorOwnerKey: string;
  peerHandleOrKey: string;
}): { ok: true; stub: true; message: string } | { ok: false; error: string; message: string } {
  ensureSocialProfile(input.actorOwnerKey);
  const peer = resolveOwnerByHandle(input.peerHandleOrKey);
  if (!peer) return { ok: false, error: "not_found", message: "Keeper not found." };
  if (isBlockedEitherWay(input.actorOwnerKey, peer.ownerKey)) {
    return { ok: false, error: "blocked", message: "Cannot invite while blocked." };
  }
  return {
    ok: true,
    stub: true,
    message: `Party invite to ${peer.displayName} queued as a stub — live parties need multiplayer Phase 2.`,
  };
}
