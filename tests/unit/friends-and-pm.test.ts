import { beforeEach, describe, expect, it } from "vitest";
import {
  acceptFriendRequest,
  areFriends,
  blockPlayer,
  canSendFriendRequest,
  canSendPrivateMessage,
  canonicalPair,
  declineFriendRequest,
  ensureSocialProfile,
  ensureSystemKeepersSeeded,
  isBlockedEitherWay,
  isValidHandle,
  normalizeHandle,
  presenceFromLastSeen,
  resetSocialStoreForTests,
  sendFriendRequest,
  sendPrivateMessage,
  setHandle,
  setMessagePrivacy,
} from "@/lib/social";
import { ONLINE_WINDOW_MS } from "@/lib/social/rules";

describe("friend / PM pure rules", () => {
  it("canonicalPair orders lexicographically", () => {
    expect(canonicalPair("b", "a")).toEqual(["a", "b"]);
    expect(canonicalPair("a", "a")).toEqual(["a", "a"]);
  });

  it("normalizes and validates handles", () => {
    expect(normalizeHandle(" Keeper_Mira! ")).toBe("keeper_mira");
    expect(isValidHandle("keeper_mira")).toBe(true);
    expect(isValidHandle("ab")).toBe(false);
    expect(isValidHandle("1bad")).toBe(false);
  });

  it("blocks self-friend and blocked targets", () => {
    expect(
      canSendFriendRequest({
        fromOwnerKey: "u1",
        toOwnerKey: "u1",
        alreadyFriends: false,
        eitherBlocked: false,
        pendingEitherDirection: false,
        fromFriendCount: 0,
        fromPendingOutgoing: 0,
        targetExists: true,
      }).ok,
    ).toBe(false);

    const blocked = canSendFriendRequest({
      fromOwnerKey: "u1",
      toOwnerKey: "u2",
      alreadyFriends: false,
      eitherBlocked: true,
      pendingEitherDirection: false,
      fromFriendCount: 0,
      fromPendingOutgoing: 0,
      targetExists: true,
    });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error).toBe("blocked");
  });

  it("enforces friends-only PM privacy", () => {
    const denied = canSendPrivateMessage({
      fromOwnerKey: "u1",
      toOwnerKey: "u2",
      areFriends: false,
      eitherBlocked: false,
      recipientPrivacy: "friends_only",
      bodyLen: 5,
    });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.error).toBe("friends_only");

    const allowed = canSendPrivateMessage({
      fromOwnerKey: "u1",
      toOwnerKey: "u2",
      areFriends: true,
      eitherBlocked: false,
      recipientPrivacy: "friends_only",
      bodyLen: 5,
    });
    expect(allowed.ok).toBe(true);
  });

  it("presence windows classify online/away/offline", () => {
    const now = Date.now();
    expect(presenceFromLastSeen(new Date(now - 1000).toISOString(), now)).toBe("online");
    expect(
      presenceFromLastSeen(new Date(now - ONLINE_WINDOW_MS - 1000).toISOString(), now),
    ).toBe("away");
    expect(
      presenceFromLastSeen(new Date(now - 60 * 60_000).toISOString(), now),
    ).toBe("offline");
  });
});

describe("friends + PM service", () => {
  beforeEach(() => {
    resetSocialStoreForTests();
    ensureSystemKeepersSeeded();
  });

  it("auto-accepts system keeper friend requests", () => {
    const a = ensureSocialProfile("guest_tester_a");
    const result = sendFriendRequest({
      fromOwnerKey: a.ownerKey,
      toHandleOrKey: "keeper_mira",
    });
    expect(result.ok).toBe(true);
    expect(areFriends(a.ownerKey, "system_keeper_mira")).toBe(true);
  });

  it("supports request → accept between players", () => {
    const a = ensureSocialProfile("guest_alpha");
    const b = ensureSocialProfile("guest_beta");
    expect(setHandle(b.ownerKey, "beta_keeper").ok).toBe(true);

    const sent = sendFriendRequest({
      fromOwnerKey: a.ownerKey,
      toHandleOrKey: "beta_keeper",
      note: "Hello",
    });
    expect(sent.ok).toBe(true);
    if (!sent.ok) return;

    const accepted = acceptFriendRequest({
      actorOwnerKey: b.ownerKey,
      requestId: sent.request.id,
    });
    expect(accepted.ok).toBe(true);
    expect(areFriends(a.ownerKey, b.ownerKey)).toBe(true);
  });

  it("decline cancels pending without friendship", () => {
    const a = ensureSocialProfile("guest_c");
    const b = ensureSocialProfile("guest_d");
    setHandle(b.ownerKey, "delta_keep");

    const sent = sendFriendRequest({
      fromOwnerKey: a.ownerKey,
      toHandleOrKey: "delta_keep",
    });
    expect(sent.ok).toBe(true);
    if (!sent.ok) return;

    const declined = declineFriendRequest({
      actorOwnerKey: b.ownerKey,
      requestId: sent.request.id,
    });
    expect(declined.ok).toBe(true);
    expect(areFriends(a.ownerKey, b.ownerKey)).toBe(false);
  });

  it("blocks PM until friends when privacy is friends_only", () => {
    const a = ensureSocialProfile("guest_pm_a");
    const b = ensureSocialProfile("guest_pm_b");
    setHandle(b.ownerKey, "pm_target");

    const denied = sendPrivateMessage({
      fromOwnerKey: a.ownerKey,
      toHandleOrKey: "pm_target",
      body: "hi there",
    });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.error).toBe("friends_only");
  });

  it("allows PM after friendship and respects block", () => {
    const a = ensureSocialProfile("guest_pm_c");
    ensureSocialProfile("guest_pm_d");
    setHandle("guest_pm_d", "pm_friend");

    const sent = sendFriendRequest({
      fromOwnerKey: a.ownerKey,
      toHandleOrKey: "pm_friend",
    });
    expect(sent.ok).toBe(true);
    if (!sent.ok) return;
    acceptFriendRequest({
      actorOwnerKey: "guest_pm_d",
      requestId: sent.request.id,
    });

    const msg = sendPrivateMessage({
      fromOwnerKey: a.ownerKey,
      toHandleOrKey: "pm_friend",
      body: "Hello friend",
    });
    expect(msg.ok).toBe(true);

    blockPlayer({
      actorOwnerKey: "guest_pm_d",
      peerHandleOrKey: a.ownerKey,
      reason: "test",
    });
    expect(isBlockedEitherWay(a.ownerKey, "guest_pm_d")).toBe(true);
    expect(areFriends(a.ownerKey, "guest_pm_d")).toBe(false);

    const blockedMsg = sendPrivateMessage({
      fromOwnerKey: a.ownerKey,
      toHandleOrKey: "pm_friend",
      body: "still there?",
    });
    expect(blockedMsg.ok).toBe(false);
    if (!blockedMsg.ok) expect(blockedMsg.error).toBe("blocked");
  });

  it("allows anyone privacy for non-friends", () => {
    const a = ensureSocialProfile("guest_open_a");
    const b = ensureSocialProfile("guest_open_b");
    setHandle(b.ownerKey, "open_keep");
    setMessagePrivacy(b.ownerKey, "anyone");

    const msg = sendPrivateMessage({
      fromOwnerKey: a.ownerKey,
      toHandleOrKey: "open_keep",
      body: "cold open",
    });
    expect(msg.ok).toBe(true);
  });

  it("system keeper PM works after friendship", () => {
    const a = ensureSocialProfile("guest_echo");
    sendFriendRequest({ fromOwnerKey: a.ownerKey, toHandleOrKey: "archivist_echo" });
    const msg = sendPrivateMessage({
      fromOwnerKey: a.ownerKey,
      toHandleOrKey: "archivist_echo",
      body: "Any lore today?",
    });
    expect(msg.ok).toBe(true);
  });
});
