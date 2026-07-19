/**
 * Live-service hooks — featured cards, banners, rotation notices.
 * Content-driven; admin UI writes these JSON rows in Phase 3+.
 */

export type LiveOpsFeaturedCard = {
  cardId: string;
  reason: string;
  weight: number;
  startsAt?: string;
  endsAt?: string;
};

export type LiveOpsConfig = {
  version: number;
  seasonId: string;
  seasonName: string;
  featuredCards: LiveOpsFeaturedCard[];
  bannerMessage: string;
  /** Soft currency grants this season — never crypto. */
  f2pGrants: {
    gold: number;
    riftShards: number;
    ancientFragments: number;
    note: string;
  };
  rotationNotice: string | null;
};

export const DEFAULT_LIVE_OPS: LiveOpsConfig = {
  version: 1,
  seasonId: "season-rift-dawn",
  seasonName: "Season of Rift Dawn",
  featuredCards: [
    {
      cardId: "rotr-c-ashwing",
      reason: "Foundational Riftbond showcase",
      weight: 10,
    },
    {
      cardId: "rotr-c-bramblefox",
      reason: "Grove midrange pillar",
      weight: 8,
    },
  ],
  bannerMessage:
    "Competitive decks craft with Gold, Rift Shards, and Ancient Fragments — never SOL.",
  f2pGrants: {
    gold: 2500,
    riftShards: 400,
    ancientFragments: 3,
    note: "Season login track — enough to finish a Standard ladder deck without spending.",
  },
  rotationNotice: null,
};
