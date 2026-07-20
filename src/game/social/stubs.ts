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
    avatarSrc: "/assets/npcs/riftwild-commons/archivist-solen/thumbnail.png",
  },
  {
    id: "mail_2",
    fromLabel: "Keeper Mira",
    subject: "Care streak checkpoint",
    body: "Your Groveheart rhythm looks steady — soft Credits only, no token promises.",
    at: new Date(Date.now() - 3_600_000).toISOString(),
    read: false,
    avatarSrc: "/assets/npcs/riftwild-commons/mira-shellbright/thumbnail.png",
  },
  {
    id: "mail_3",
    fromLabel: "Crystal Courier",
    subject: "Spirit crystal parcel waiting",
    body: "A sealed Spirit Crystal crate is ready at the Commons vault — cosmetics & crafting only.",
    at: new Date(Date.now() - 7_200_000).toISOString(),
    read: true,
    avatarSrc: "/assets/cards/rise-of-the-rift/item-spirit-crystal/thumb.png",
  },
  {
    id: "mail_4",
    fromLabel: "Hatchery Desk",
    subject: "Emberfox wants a play date",
    body: "Your Emberfox left a soot-print invite for the Training Yard this evening.",
    at: new Date(Date.now() - 12_000_000).toISOString(),
    read: true,
    avatarSrc: "/assets/pets/thumbs/emberfox.webp",
  },
  {
    id: "mail_5",
    fromLabel: "Bloomtide Office",
    subject: "Festival lantern shift open",
    body: "Volunteer for Bloomtide lantern duty — Presence XP only, never SOL.",
    at: new Date(Date.now() - 28_800_000).toISOString(),
    read: true,
    avatarSrc: "/assets/festivals/bloomtide-festival.png",
  },
  {
    id: "mail_6",
    fromLabel: "Yard Captain Reed",
    subject: "Arena showcase roster",
    body: "Training showcase slots open tomorrow. Affinity drills — no wagering.",
    at: new Date(Date.now() - 50_400_000).toISOString(),
    read: true,
    avatarSrc: "/assets/npcs/riftwild-commons/captain-orren/thumbnail.png",
  },
  {
    id: "mail_7",
    fromLabel: "Gemwright Opal",
    subject: "Harmony crystal polish ready",
    body: "Your Harmony Crystal came off the wheel — pick it up in Stoneheart when you pass through.",
    at: new Date(Date.now() - 72_000_000).toISOString(),
    read: true,
    avatarSrc: "/assets/cards/rise-of-the-rift/mat-harmony-crystal/thumb.png",
  },
]

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

/**
 * Default social avatars when the player has not picked one yet.
 * Uses real brand / NPC art (legacy /assets/social/avatars/ stubs were never shipped).
 */
export const GENERIC_SOCIAL_AVATARS = [
  "/assets/brand/riftwilds-mark.png",
  "/assets/npcs/riftwild-commons/mira-shellbright/thumbnail.png",
  "/assets/npcs/riftwild-commons/elara-venn/thumbnail.png",
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
  /** Your party vs pending invite row (still stub actions). */
  kind: "active" | "invite";
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
    avatarSrc: "/assets/npcs/riftwild-commons/mira-shellbright/thumbnail.png",
  },
  {
    id: "friend_reed",
    displayName: "Yard Captain Reed",
    rankTitle: "Warden",
    status: "unknown",
    regionLabel: "Training Yard",
    avatarSrc: "/assets/npcs/riftwild-commons/captain-orren/thumbnail.png",
  },
];

/** Multi-row party board — destinations reuse official region / scenic thumbs. */
export const DEMO_PARTIES: PartyStub[] = [
  {
    id: "party_ember",
    leaderLabel: "You",
    memberLabels: [],
    maxSize: 4,
    objective: "Explore Ember Crater (stub)",
    leaderAvatarSrc: "/assets/brand/riftwilds-mark.png",
    objectiveThumbSrc: "/assets/social/thumbs/ember-crater-explore.png",
    kind: "active",
  },
  {
    id: "party_moonwater",
    leaderLabel: "Luma Tidecrest",
    memberLabels: ["Luma Tidecrest", "Coast Child Shell"],
    maxSize: 4,
    objective: "Tidewalk Moonwater Coast",
    leaderAvatarSrc: "/assets/npcs/moonwater-coast/luma-tidecrest/thumbnail.png",
    objectiveThumbSrc: "/assets/cards/rise-of-the-rift/region-moonwater-coast/thumb.png",
    kind: "invite",
  },
  {
    id: "party_elderwood",
    leaderLabel: "Keeper Mira",
    memberLabels: ["Keeper Mira"],
    maxSize: 4,
    objective: "Scout Elderwood canopy trails",
    leaderAvatarSrc: "/assets/npcs/riftwild-commons/mira-shellbright/thumbnail.png",
    objectiveThumbSrc: "/assets/cards/rise-of-the-rift/region-elderwood-forest/thumb.png",
    kind: "invite",
  },
  {
    id: "party_stoneheart",
    leaderLabel: "Petra Stoneveil",
    memberLabels: ["Petra Stoneveil", "Gemwright Opal"],
    maxSize: 5,
    objective: "Forge run — Stoneheart Canyon",
    leaderAvatarSrc: "/assets/npcs/stoneheart-canyon/petra-stoneveil/thumbnail.png",
    objectiveThumbSrc: "/assets/cards/rise-of-the-rift/region-stoneheart-canyon/thumb.png",
    kind: "invite",
  },
  {
    id: "party_stormspire",
    leaderLabel: "Aeron Cloudstep",
    memberLabels: ["Aeron Cloudstep"],
    maxSize: 4,
    objective: "Stormspire ridge patrol",
    leaderAvatarSrc: "/assets/npcs/stormspire-peaks/aeron-cloudstep/thumbnail.png",
    objectiveThumbSrc: "/assets/cards/rise-of-the-rift/region-stormspire-peaks/thumb.png",
    kind: "invite",
  },
  {
    id: "party_spirit",
    leaderLabel: "Medium Amara",
    memberLabels: ["Medium Amara", "Marsh Singer Fog"],
    maxSize: 4,
    objective: "Lantern walk — Spirit Marsh",
    leaderAvatarSrc: "/assets/npcs/spirit-marsh/medium-amara/thumbnail.png",
    objectiveThumbSrc: "/assets/cards/rise-of-the-rift/region-spirit-marsh/thumb.png",
    kind: "invite",
  },
];

/** @deprecated Prefer DEMO_PARTIES — kept for callers expecting a single active party. */
export const DEMO_PARTY: PartyStub = DEMO_PARTIES[0]!;

export const DEMO_DMS: DirectMessageStub[] = [
  {
    id: "dm_1",
    fromLabel: "Archivist Echo",
    preview: "Your living timeline has a new chapter ready.",
    at: new Date().toISOString(),
    read: false,
    avatarSrc: "/assets/npcs/riftwild-commons/archivist-solen/thumbnail.png",
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
    authorAvatarSrc: "/assets/npcs/riftwild-commons/mira-shellbright/thumbnail.png",
  },
  {
    id: "post_festival",
    authorLabel: "Bloomtide Office",
    title: "Bloomtide lantern rehearsal",
    body: "Practice routes open in the Commons plaza — Presence XP for helpers, never SOL.",
    at: new Date(Date.now() - 43_200_000).toISOString(),
    channel: "announcements",
    thumbSrc: "/assets/festivals/bloomtide-festival.png",
  },
  {
    id: "post_creature",
    authorLabel: "Hatchery Desk",
    title: "Creature of the week: Emberfox",
    body: "Share a cozy Emberfox moment in Keepers chat — cosmetics and bragging rights only.",
    at: new Date(Date.now() - 129_600_000).toISOString(),
    channel: "keepers",
    thumbSrc: "/assets/pets/thumbs/emberfox.webp",
  },
  {
    id: "post_crystal",
    authorLabel: "Gemwright Opal",
    title: "Harmony crystal polish hour",
    body: "Stoneheart benches are open for cosmetic crystal work — Credits crafting, no market guarantees.",
    at: new Date(Date.now() - 172_800_000).toISOString(),
    channel: "keepers",
    thumbSrc: "/assets/cards/rise-of-the-rift/mat-harmony-crystal/thumb.png",
    authorAvatarSrc: "/assets/npcs/stoneheart-canyon/gemwright-opal/thumbnail.png",
  },
  {
    id: "post_creator",
    authorLabel: "Creator Hub",
    title: "Creator preview drop",
    body: "Fan-kit stills and press boards refresh this week — open /creators when you are ready.",
    at: new Date(Date.now() - 216_000_000).toISOString(),
    channel: "creators",
    thumbSrc: "/assets/social/thumbs/event-creator-hub.png",
  },
];

/** Scenic Town Featured placeholders when the hour has no live winners yet. */
export type TownFeaturedStub = {
  title: string;
  displayName: string;
  regionSlug: string;
  regionLabel: string;
  avatarSrc: string;
  scenicThumbSrc: string;
};

export const DEMO_TOWN_FEATURED: TownFeaturedStub[] = [
  {
    title: "Town Hero",
    displayName: "Keeper Mira",
    regionSlug: "riftwild-commons",
    regionLabel: "Riftwild Commons",
    avatarSrc: "/assets/npcs/riftwild-commons/mira-shellbright/thumbnail.png",
    scenicThumbSrc: "/assets/cards/rise-of-the-rift/region-riftwild-commons/thumb.png",
  },
  {
    title: "Master Merchant",
    displayName: "Plaza Vendor Cal",
    regionSlug: "riftwild-commons",
    regionLabel: "Riftwild Commons",
    avatarSrc: "/assets/npcs/riftwild-commons/plaza-vendor-cal/thumbnail.png",
    scenicThumbSrc: "/assets/festivals/commons-moon-market.png",
  },
  {
    title: "Community Favorite",
    displayName: "Archivist Solen",
    regionSlug: "riftwild-commons",
    regionLabel: "Riftwild Commons",
    avatarSrc: "/assets/npcs/riftwild-commons/archivist-solen/thumbnail.png",
    scenicThumbSrc: "/assets/social/avatar-bgs/rift-commons.svg",
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
    parties: DEMO_PARTIES,
    dms: DEMO_DMS,
    mail: DEMO_MAIL,
    posts: DEMO_COMMUNITY_POSTS,
    townFeaturedPreview: DEMO_TOWN_FEATURED,
    calendar: listEventCalendarStubs(),
    mentors: MENTOR_OFFERS,
    chat: demoChatChannels(),
    note: "Party / mail / community posts remain stubs. Friends + PMs ship via /api/social (see docs/social/FRIENDS_AND_PM.md).",
  };
}
