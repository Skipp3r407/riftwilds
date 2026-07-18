/**
 * Friends + private messages — server-authoritative social graph.
 * Hot path: in-memory. Prisma models prepared behind FRIENDS_AND_PM_PRISMA_ENABLED.
 */

export type FriendshipStatus = "pending" | "accepted" | "declined" | "cancelled" | "removed";

export type SocialPresenceStub = "online" | "away" | "offline" | "unknown";

export type MessagePrivacyMode = "friends_only" | "anyone";

export type SocialProfile = {
  ownerKey: string;
  handle: string;
  displayName: string;
  rankTitle: string;
  avatarSrc: string;
  /** Stable selection id: `pet:…` | `npc:…` | `lore:…` | `brand:…`. */
  avatarKey?: string | null;
  /** ISO */
  createdAt: string;
  lastSeenAt: string;
  messagePrivacy: MessagePrivacyMode;
  /** System town keepers auto-accept requests for onboarding. */
  systemKeeper?: boolean;
};

export type FriendRequestRecord = {
  id: string;
  fromOwnerKey: string;
  toOwnerKey: string;
  status: FriendshipStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FriendshipRecord = {
  id: string;
  /** Canonical ordered pair (lexicographic). */
  ownerKeyA: string;
  ownerKeyB: string;
  createdAt: string;
};

export type BlockRecord = {
  id: string;
  blockerOwnerKey: string;
  blockedOwnerKey: string;
  reason: string | null;
  createdAt: string;
};

export type ReportRecord = {
  id: string;
  reporterOwnerKey: string;
  targetOwnerKey: string;
  targetType: "player" | "message";
  targetId: string;
  reason: string;
  details: string | null;
  createdAt: string;
  status: "open" | "stub_logged";
};

export type DmThreadRecord = {
  id: string;
  ownerKeyA: string;
  ownerKeyB: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
};

export type DmMessageRecord = {
  id: string;
  threadId: string;
  senderOwnerKey: string;
  body: string;
  createdAt: string;
  /** Recipient read receipt. */
  readAt: string | null;
};

export type FriendListEntry = {
  friendshipId: string;
  ownerKey: string;
  handle: string;
  displayName: string;
  rankTitle: string;
  avatarSrc: string;
  status: SocialPresenceStub;
  activityStub: string;
  friendsSince: string;
};

export type FriendRequestView = {
  id: string;
  direction: "incoming" | "outgoing";
  peer: {
    ownerKey: string;
    handle: string;
    displayName: string;
    avatarSrc: string;
    rankTitle: string;
  };
  note: string | null;
  status: FriendshipStatus;
  createdAt: string;
};

export type DmThreadView = {
  id: string;
  peer: {
    ownerKey: string;
    handle: string;
    displayName: string;
    avatarSrc: string;
  };
  preview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type DmMessageView = {
  id: string;
  threadId: string;
  senderOwnerKey: string;
  body: string;
  createdAt: string;
  mine: boolean;
  readAt: string | null;
};

export type SocialSummary = {
  friendsCount: number;
  onlineFriendsCount: number;
  pendingIncomingRequests: number;
  unreadMessages: number;
};

export type SocialHubSnapshot = {
  me: SocialProfile;
  friends: FriendListEntry[];
  requests: FriendRequestView[];
  threads: DmThreadView[];
  blocks: Array<{
    ownerKey: string;
    handle: string;
    displayName: string;
    avatarSrc: string;
    blockedAt: string;
  }>;
  summary: SocialSummary;
  messagePrivacy: MessagePrivacyMode;
  note: string;
};
