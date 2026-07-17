/**
 * Live MMO presence stubs — online counts, region players, chat channels.
 * Authoritative presence requires the multiplayer WebSocket service.
 */

export type ChatChannelStub = {
  id: string;
  label: string;
  scope: "global" | "region" | "guild" | "party" | "trade" | "help";
  onlineEstimate: number | null;
  authoritative: false;
};

export type RegionPresenceStub = {
  regionSlug: string;
  regionName: string;
  playersOnline: number | null;
  note: string;
};

export type LivePresenceSnapshot = {
  globalOnline: number | null;
  availability: "stub" | "partial" | "live";
  note: string;
  regions: RegionPresenceStub[];
  channels: ChatChannelStub[];
  partyStub: { maxSize: number; members: string[] };
  refreshedAt: string;
};

const REGION_SEEDS: { slug: string; name: string }[] = [
  { slug: "hatchery-plaza", name: "Hatchery Plaza" },
  { slug: "ember-crater", name: "Ember Crater" },
  { slug: "tideglass-shore", name: "Tideglass Shore" },
  { slug: "groveheart", name: "Groveheart" },
  { slug: "stormspine", name: "Stormspine" },
];

export function getLivePresenceSnapshot(): LivePresenceSnapshot {
  return {
    globalOnline: null,
    availability: "stub",
    note: "Online counts stay null until the Live World multiplayer service reports presence. UI shows structure only — no fabricated player counts.",
    regions: REGION_SEEDS.map((r) => ({
      regionSlug: r.slug,
      regionName: r.name,
      playersOnline: null,
      note: "Awaiting presence authority",
    })),
    channels: [
      {
        id: "global",
        label: "Global",
        scope: "global",
        onlineEstimate: null,
        authoritative: false,
      },
      {
        id: "region",
        label: "Region",
        scope: "region",
        onlineEstimate: null,
        authoritative: false,
      },
      {
        id: "guild",
        label: "Guild",
        scope: "guild",
        onlineEstimate: null,
        authoritative: false,
      },
      {
        id: "party",
        label: "Party",
        scope: "party",
        onlineEstimate: null,
        authoritative: false,
      },
      {
        id: "trade",
        label: "Trade",
        scope: "trade",
        onlineEstimate: null,
        authoritative: false,
      },
      {
        id: "help",
        label: "Help",
        scope: "help",
        onlineEstimate: null,
        authoritative: false,
      },
    ],
    partyStub: { maxSize: 4, members: [] },
    refreshedAt: new Date().toISOString(),
  };
}
