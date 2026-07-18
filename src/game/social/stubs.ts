/**
 * Social foundations — guilds+, trading, mentors, chat, mail, emotes.
 * APIs return structured stubs; Prisma Guild models already exist.
 */

import { emoteCatalogForSocialStub } from "@/game/live-world/systems/emotes/catalog";

export type EmoteDef = {
  key: string;
  label: string;
  animationKey: string;
  unlockHint: string;
};

export type MailMessage = {
  id: string;
  fromLabel: string;
  subject: string;
  body: string;
  at: string;
  read: boolean;
  avatarSrc?: string;
};

export type MentorOffer = {
  id: string;
  mentorLabel: string;
  focus: string;
  description: string;
};

/** Re-exports Live World emote catalog (cosmetic stubs for social hub). */
export const EMOTE_CATALOG: EmoteDef[] = emoteCatalogForSocialStub();

export const DEMO_MAIL: MailMessage[] = [
  {
    id: "mail_1",
    fromLabel: "Archivist Echo",
    subject: "Your living timeline grows",
    body: "I filed your latest discovery. Visit the Ecosystem dashboard when you can.",
    at: new Date().toISOString(),
    read: false,
    avatarSrc: "/assets/social/avatars/archivist-echo.png",
  },
];

export const MENTOR_OFFERS: MentorOffer[] = [
  {
    id: "mentor_care",
    mentorLabel: "Keeper Mira",
    focus: "Care mastery",
    description: "Guided tips for care streaks and mood recovery.",
  },
  {
    id: "mentor_arena",
    mentorLabel: "Yard Captain Reed",
    focus: "Arena training",
    description: "Affinity matchups and loadout basics — no wagering.",
  },
];

export type TradeProposalStub = {
  id: string;
  status: "draft" | "pending" | "accepted" | "cancelled";
  offerSummary: string;
  requestSummary: string;
  disclaimer: string;
};

export function createTradeProposalStub(input: {
  offerSummary: string;
  requestSummary: string;
}): TradeProposalStub {
  return {
    id: `trade_${Date.now()}`,
    status: "draft",
    offerSummary: input.offerSummary,
    requestSummary: input.requestSummary,
    disclaimer:
      "Player trading is entertainment. Items and pets have no guaranteed market value.",
  };
}

export type ChatChannelStub = {
  id: string;
  name: string;
  kind: "region" | "guild" | "party" | "whisper";
  messages: { from: string; text: string; at: string }[];
};

export function demoChatChannels(): ChatChannelStub[] {
  return [
    {
      id: "chat_commons",
      name: "Riftwild Commons",
      kind: "region",
      messages: [
        {
          from: "System",
          text: "Chat stub — Live World multiplayer will host authoritative messages.",
          at: new Date().toISOString(),
        },
      ],
    },
  ];
}

// ─── Friends / party / DM / community posts / calendar ───────────────────────

/** Future-ready generic keeper avatars under /assets/social/avatars/. */
export const GENERIC_SOCIAL_AVATARS = [
  "/assets/social/avatars/generic-01.png",
  "/assets/social/avatars/generic-02.png",
  "/assets/social/avatars/generic-03.png",
] as const;

export type FriendStub = {
  id: string;
  displayName: string;
  rankTitle: string;
  /** Presence is stubbed — prefer "unknown" until live presence ships. */
  status: "online" | "away" | "offline" | "unknown";
  regionLabel?: string;
  avatarSrc: string;
};

export type PartyStub = {
  id: string;
  leaderLabel: string;
  memberLabels: string[];
  maxSize: number;
  objective: string;
  leaderAvatarSrc: string;
  objectiveThumbSrc: string;
};

export type DirectMessageStub = {
  id: string;
  fromLabel: string;
  preview: string;
  at: string;
  read: boolean;
  avatarSrc: string;
};

export type CommunityPostStub = {
  id: string;
  authorLabel: string;
  title: string;
  body: string;
  at: string;
  channel: "announcements" | "keepers" | "creators" | "help";
  thumbSrc: string;
  authorAvatarSrc?: string;
};

export type EventCalendarEntry = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  kind: "festival" | "arena" | "community" | "creator";
  href?: string;
  thumbSrc: string;
};

export const DEMO_FRIENDS: FriendStub[] = [
  {
    id: "friend_mira",
    displayName: "Keeper Mira",
    rankTitle: "Ranger",
    status: "unknown",
    regionLabel: "Groveheart",
    avatarSrc: "/assets/social/avatars/keeper-mira.png",
  },
  {
    id: "friend_reed",
    displayName: "Yard Captain Reed",
    rankTitle: "Warden",
    status: "unknown",
    regionLabel: "Training Yard",
    avatarSrc: "/assets/social/avatars/yard-captain-reed.png",
  },
];

export const DEMO_PARTY: PartyStub = {
  id: "party_demo",
  leaderLabel: "You",
  memberLabels: [],
  maxSize: 4,
  objective: "Explore Ember Crater (stub)",
  leaderAvatarSrc: "/assets/social/avatars/party-leader.png",
  objectiveThumbSrc: "/assets/social/thumbs/ember-crater-explore.png",
};

export const DEMO_DMS: DirectMessageStub[] = [
  {
    id: "dm_1",
    fromLabel: "Archivist Echo",
    preview: "Your living timeline has a new chapter ready.",
    at: new Date().toISOString(),
    read: false,
    avatarSrc: "/assets/social/avatars/archivist-echo.png",
  },
];

export const DEMO_COMMUNITY_POSTS: CommunityPostStub[] = [
  {
    id: "post_welcome",
    authorLabel: "Riftwilds",
    title: "Welcome to the ecosystem",
    body: "Pump.fun was the launch chapter. Play, restore the world, and trade here.",
    at: new Date().toISOString(),
    channel: "announcements",
    thumbSrc: "/assets/social/thumbs/post-welcome-ecosystem.png",
  },
  {
    id: "post_help",
    authorLabel: "Keeper Mira",
    title: "Care streak tips",
    body: "Feed and rest on a rhythm — soft rewards only, no token buy promises.",
    at: new Date(Date.now() - 86_400_000).toISOString(),
    channel: "help",
    thumbSrc: "/assets/social/thumbs/post-care-streak.png",
    authorAvatarSrc: "/assets/social/avatars/keeper-mira.png",
  },
];

export function listEventCalendarStubs(now = Date.now()): EventCalendarEntry[] {
  return [
    {
      id: "cal_festival",
      title: "Bloomtide Festival window",
      startsAt: new Date(now + 3 * 86_400_000).toISOString(),
      endsAt: new Date(now + 10 * 86_400_000).toISOString(),
      kind: "festival",
      href: "/ecosystem",
      // Local social copy of public/assets/festivals/bloomtide-festival.png
      thumbSrc: "/assets/social/thumbs/event-bloomtide.png",
    },
    {
      id: "cal_arena",
      title: "Arena training showcase",
      startsAt: new Date(now + 2 * 86_400_000).toISOString(),
      endsAt: null,
      kind: "arena",
      href: "/arena",
      thumbSrc: "/assets/social/thumbs/event-arena-training.png",
    },
    {
      id: "cal_creator",
      title: "Creator Hub preview drop",
      startsAt: new Date(now + 5 * 86_400_000).toISOString(),
      endsAt: null,
      kind: "creator",
      href: "/creators",
      thumbSrc: "/assets/social/thumbs/event-creator-hub.png",
    },
  ];
}

export function getSocialHubSnapshot() {
  return {
    friends: DEMO_FRIENDS,
    party: DEMO_PARTY,
    dms: DEMO_DMS,
    mail: DEMO_MAIL,
    posts: DEMO_COMMUNITY_POSTS,
    calendar: listEventCalendarStubs(),
    mentors: MENTOR_OFFERS,
    chat: demoChatChannels(),
    note: "Social graph and chat stay stubs until presence + moderation services ship.",
  };
}
