/**
 * In-memory friends / PM store — survives local hot reload via globalThis.
 */

import type {
  BlockRecord,
  DmMessageRecord,
  DmThreadRecord,
  FriendRequestRecord,
  FriendshipRecord,
  ReportRecord,
  SocialProfile,
} from "@/lib/social/types";
import { GENERIC_SOCIAL_AVATARS } from "@/game/social/stubs";

export type SocialStore = {
  profiles: Map<string, SocialProfile>;
  handles: Map<string, string>;
  friendships: Map<string, FriendshipRecord>;
  requests: Map<string, FriendRequestRecord>;
  blocks: Map<string, BlockRecord>;
  threads: Map<string, DmThreadRecord>;
  messages: Map<string, DmMessageRecord>;
  reports: Map<string, ReportRecord>;
  /** Per-owner send timestamps for anti-spam. */
  sendTimestamps: Map<string, number[]>;
  requestTimestamps: Map<string, number[]>;
  seeded: boolean;
};

const globalForSocial = globalThis as unknown as {
  __riftwildsFriendsPm?: SocialStore;
};

function createStore(): SocialStore {
  return {
    profiles: new Map(),
    handles: new Map(),
    friendships: new Map(),
    requests: new Map(),
    blocks: new Map(),
    threads: new Map(),
    messages: new Map(),
    reports: new Map(),
    sendTimestamps: new Map(),
    requestTimestamps: new Map(),
    seeded: false,
  };
}

export function getSocialStore(): SocialStore {
  if (!globalForSocial.__riftwildsFriendsPm) {
    globalForSocial.__riftwildsFriendsPm = createStore();
  }
  return globalForSocial.__riftwildsFriendsPm;
}

export function resetSocialStoreForTests(): void {
  globalForSocial.__riftwildsFriendsPm = createStore();
}

const SYSTEM_KEEPERS: Array<{
  ownerKey: string;
  handle: string;
  displayName: string;
  rankTitle: string;
  avatarSrc: string;
}> = [
  {
    ownerKey: "system_keeper_mira",
    handle: "keeper_mira",
    displayName: "Keeper Mira",
    rankTitle: "Ranger",
    avatarSrc: "/assets/social/avatars/keeper-mira.png",
  },
  {
    ownerKey: "system_keeper_reed",
    handle: "captain_reed",
    displayName: "Yard Captain Reed",
    rankTitle: "Warden",
    avatarSrc: "/assets/social/avatars/yard-captain-reed.png",
  },
  {
    ownerKey: "system_archivist_echo",
    handle: "archivist_echo",
    displayName: "Archivist Echo",
    rankTitle: "Archivist",
    avatarSrc: "/assets/social/avatars/archivist-echo.png",
  },
];

export function ensureSystemKeepersSeeded(now = new Date()): void {
  const store = getSocialStore();
  if (store.seeded) return;
  const iso = now.toISOString();
  for (const k of SYSTEM_KEEPERS) {
    const profile: SocialProfile = {
      ownerKey: k.ownerKey,
      handle: k.handle,
      displayName: k.displayName,
      rankTitle: k.rankTitle,
      avatarSrc: k.avatarSrc,
      createdAt: iso,
      lastSeenAt: iso,
      messagePrivacy: "friends_only",
      systemKeeper: true,
    };
    store.profiles.set(k.ownerKey, profile);
    store.handles.set(k.handle, k.ownerKey);
  }
  store.seeded = true;
}

export function defaultAvatarFor(ownerKey: string): string {
  const idx =
    Math.abs(
      [...ownerKey].reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
    ) % GENERIC_SOCIAL_AVATARS.length;
  return GENERIC_SOCIAL_AVATARS[idx] ?? GENERIC_SOCIAL_AVATARS[0];
}
