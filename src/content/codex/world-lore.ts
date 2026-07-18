/**
 * Additive Codex world-lore entries (story bible summaries).
 * Species lore remains in src/content/pets/lore/.
 * Canon index: docs/story/STORY_BIBLE.md
 */

export type WorldLoreEntry = {
  id: string;
  title: string;
  category: "history" | "cosmology" | "faction" | "region" | "person" | "book";
  summary: string;
  body: string[];
  relatedRegionIds?: string[];
  relatedBookIds?: string[];
  artSrc?: string;
};

export const WORLD_LORE_ENTRIES: WorldLoreEntry[] = [
  {
    id: "wl-aeryndra",
    title: "Aeryndra",
    category: "cosmology",
    summary: "The living networked world before — and beneath — the Riftwilds.",
    body: [
      "Aeryndra was never a single crown. It was a lattice of regions balanced by Gateway Hearts.",
      "After the Fracture, people named the layered lands the Riftwilds. The old name still means the whole.",
    ],
    artSrc: "/assets/story/timeline/age-of-gateways.png",
  },
  {
    id: "wl-fracture",
    title: "The Fracture",
    category: "history",
    summary: "Prime Gateway overload that layered reality into the Riftwilds.",
    body: [
      "A coalition linked every Heart at once to end famine and sickness. For one moment it worked.",
      "Then the Prime broke. Forests crossed deserts; time skewed; openings called Rifts appeared.",
    ],
    artSrc: "/assets/about/about-fracture.png",
  },
  {
    id: "wl-soft-exodus",
    title: "The Soft Exodus",
    category: "cosmology",
    summary: "The Hearts’ last act: living fragments that became Riftling eggs.",
    body: [
      "Unable to repair the Prime, the Hearts divided themselves. Fragments bonded with surviving life and closed into eggs.",
      "Riftlings are living archives — preservation first. Battle culture came later as survival training.",
    ],
    artSrc: "/assets/about/about-first-riftlings.png",
  },
  {
    id: "wl-elara",
    title: "Elara Venn",
    category: "person",
    summary: "First recorded Riftkeeper; Founder Historian of the Commons.",
    body: [
      "A courier who carried a damaged egg nine days, refused titles, and named the path of keeping.",
      "She still greets new Keepers by the Riftstone and authorizes first portals with measured hope.",
    ],
    relatedRegionIds: ["riftwild-commons", "elderwood-forest"],
    artSrc: "/assets/about/comic/comic-elara-portrait.png",
  },
  {
    id: "wl-commons",
    title: "Riftwild Commons",
    category: "region",
    summary: "Refuge built where stable Gateway paths still intersect.",
    body: [
      "Farmers, healers, craftspeople, and Keepers gathered around the Riftstone — a shard of the Prime.",
      "It remains the hub of hatchery life, plaza work, and the starter path of every modern Keeper.",
    ],
    relatedRegionIds: ["riftwild-commons"],
    artSrc: "/assets/regions/riftwild-commons.png",
  },
  {
    id: "wl-hatchery-compact",
    title: "Hatchery Compact",
    category: "faction",
    summary: "Care ethics: invite, wait, keep the invitation honest.",
    body: [
      "After early abuses of forced bonding, hatcheries formalized Compact law.",
      "Eggs are becoming, not inventory. Credits may price supplies; consent is not for sale.",
    ],
    relatedRegionIds: ["riftwild-commons"],
  },
  {
    id: "wl-celestora",
    title: "Celestora Tradition",
    category: "faction",
    summary: "Radiant–Celestial scholarly school that studied living cores.",
    body: [
      "Celestora is not another world-name. It is a manuscript and research tradition from the Listening Centuries.",
      "Archivist Solen still teaches from its indexes; Archivist-General Serae fears its truths in the wrong hands.",
    ],
    relatedRegionIds: ["radiant-citadel", "celestial-rift"],
  },
  {
    id: "wl-present-awakening",
    title: "Present Awakening",
    category: "history",
    summary: "Hearts stir; the Celestial call reaches Riftlings.",
    body: [
      "Ancient machines restart. Marsh spirits name a missing memory. Some Hearts corrupt; others wake clean.",
      "Something beyond mapped regions calls — help, or unfinished Activation. The next chapter is unwritten.",
    ],
    relatedRegionIds: ["celestial-rift"],
    artSrc: "/assets/story/timeline/present-awakening.png",
  },
  {
    id: "wl-book-waybread",
    title: "Waybread on the First Night",
    category: "book",
    summary: "Commons folklore of Elara sharing waybread after the founding.",
    body: [
      "When the Riftstone was only a glowing wound in mud, Elara broke waybread for a child who had lost a name.",
      "She said of her companion: call it yours to keep, not yours to own.",
    ],
    relatedBookIds: ["CW-01"],
    relatedRegionIds: ["riftwild-commons"],
  },
];

export function getWorldLore(id: string): WorldLoreEntry | undefined {
  return WORLD_LORE_ENTRIES.find((e) => e.id === id);
}

export function worldLoreByCategory(
  category: WorldLoreEntry["category"],
): WorldLoreEntry[] {
  return WORLD_LORE_ENTRIES.filter((e) => e.category === category);
}
