/**
 * Creator Hub scaffolding — tips, cosmetics packs, event sponsorships.
 * Token utility purchases are entertainment; no investment language.
 */

export type CreatorHubBgTheme =
  | "echo-archives"
  | "ember-atelier"
  | "groveheart-field-notes"
  | "lantern-homestead";

export type CreatorProfileStub = {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  specialties: string[];
  tipEnabled: boolean;
  packCount: number;
  /** Transparent cutout under public/assets/creators/ */
  artSrc: string;
  /** Unique thematic well behind the cutout */
  bgTheme: CreatorHubBgTheme;
  /** Optional texture under public/assets/creators/backgrounds/ */
  bgSrc: string;
};

export type CreatorOfferStub = {
  id: string;
  creatorId: string;
  title: string;
  kind: "cosmetic_pack" | "lore_drop" | "event_sponsor" | "homestead_kit";
  priceLabel: string;
  status: "stub" | "preview";
  /** Transparent cutout under public/assets/creators/offers/ */
  artSrc: string;
  /** Unique thematic well behind the cutout */
  bgTheme: CreatorHubBgTheme;
  /** Optional texture under public/assets/creators/backgrounds/ */
  bgSrc: string;
};

/** Bump when Creator Hub cutouts or backgrounds are regenerated. */
export const CREATOR_HUB_ART_V = "ch2";

function creatorBg(theme: CreatorHubBgTheme): string {
  return `/assets/creators/backgrounds/${theme}.svg?v=${CREATOR_HUB_ART_V}`;
}

export type CreatorHubSnapshot = {
  title: string;
  lede: string;
  creators: CreatorProfileStub[];
  offers: CreatorOfferStub[];
  guidelines: string[];
  disclaimers: string[];
};

export function getCreatorHubSnapshot(): CreatorHubSnapshot {
  const creators: CreatorProfileStub[] = [
    {
      id: "creator_archivist",
      handle: "echo_archives",
      displayName: "Echo Archives",
      bio: "Lore packs and region field notes for Keepers.",
      specialties: ["lore", "codex"],
      tipEnabled: false,
      packCount: 2,
      artSrc: `/assets/creators/echo-archives.png?v=${CREATOR_HUB_ART_V}`,
      bgTheme: "echo-archives",
      bgSrc: creatorBg("echo-archives"),
    },
    {
      id: "creator_forge",
      handle: "ember_atelier",
      displayName: "Ember Atelier",
      bio: "Cosmetic skins and homestead flourishes.",
      specialties: ["cosmetics", "housing"],
      tipEnabled: false,
      packCount: 1,
      artSrc: `/assets/creators/ember-atelier.png?v=${CREATOR_HUB_ART_V}`,
      bgTheme: "ember-atelier",
      bgSrc: creatorBg("ember-atelier"),
    },
  ];

  return {
    title: "Creator Hub",
    lede: "Community creators publish cosmetic packs, lore drops, and event kits. Scaffolding only until payouts and moderation are live.",
    creators,
    offers: [
      {
        id: "offer_lore_1",
        creatorId: "creator_archivist",
        title: "Groveheart Field Notes",
        kind: "lore_drop",
        priceLabel: "Token utility (stub)",
        status: "stub",
        artSrc: `/assets/creators/offers/groveheart-field-notes.png?v=${CREATOR_HUB_ART_V}`,
        bgTheme: "groveheart-field-notes",
        bgSrc: creatorBg("groveheart-field-notes"),
      },
      {
        id: "offer_cosmo_1",
        creatorId: "creator_forge",
        title: "Lantern Homestead Kit",
        kind: "homestead_kit",
        priceLabel: "Token utility (stub)",
        status: "preview",
        artSrc: `/assets/creators/offers/lantern-homestead-kit.png?v=${CREATOR_HUB_ART_V}`,
        bgTheme: "lantern-homestead",
        bgSrc: creatorBg("lantern-homestead"),
      },
    ],
    guidelines: [
      "Original Riftwilds IP only — no third-party brands.",
      "No guaranteed value or investment framing.",
      "Optional creator allocations into the community reward vault must be verified deposits.",
    ],
    disclaimers: [
      "Purchases are entertainment cosmetics / content — not financial products.",
      "Tip rails and revenue splits stay feature-flagged until settlement authority exists.",
    ],
  };
}
