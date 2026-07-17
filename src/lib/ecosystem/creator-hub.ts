/**
 * Creator Hub scaffolding — tips, cosmetics packs, event sponsorships.
 * Token utility purchases are entertainment; no investment language.
 */

export type CreatorProfileStub = {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  specialties: string[];
  tipEnabled: boolean;
  packCount: number;
};

export type CreatorOfferStub = {
  id: string;
  creatorId: string;
  title: string;
  kind: "cosmetic_pack" | "lore_drop" | "event_sponsor" | "homestead_kit";
  priceLabel: string;
  status: "stub" | "preview";
};

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
    },
    {
      id: "creator_forge",
      handle: "ember_atelier",
      displayName: "Ember Atelier",
      bio: "Cosmetic skins and homestead flourishes.",
      specialties: ["cosmetics", "housing"],
      tipEnabled: false,
      packCount: 1,
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
      },
      {
        id: "offer_cosmo_1",
        creatorId: "creator_forge",
        title: "Lantern Homestead Kit",
        kind: "homestead_kit",
        priceLabel: "Token utility (stub)",
        status: "preview",
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
