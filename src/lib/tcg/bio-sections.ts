import {
  affinityIconPath,
  creaturePortraitPath,
  regionImagePath,
} from "@/lib/assets/paths";
import type { RegionContentPack } from "@/content/regions/types";
import type { SpeciesLore } from "@/lib/pets/lore-types";
import { regionSlugFromName } from "@/lib/world/region-slugs";

/** Prefer scenic map plates; fall back to legacy region banners. */
function habitatImageSrc(regionSlug: string): {
  imageSrc: string;
  imageFallback: string;
} {
  return {
    imageSrc: `/assets/maps/regions/${regionSlug}.png`,
    imageFallback: regionImagePath(regionSlug),
  };
}

/** Wallpaper / overview fallbacks when a region plate is missing. */
const REGION_IMAGE_FALLBACK: Record<string, string> = {
  "spirit-realm": "/assets/wallpapers/cosmic-aurora.png",
};

export type TcgBioSectionId =
  | "portrait"
  | "habitat"
  | "behavior"
  | "diet"
  | "affinity"
  | "overview"
  | "landmarks"
  | "climate"
  | "portal"
  | "place"
  | "wares"
  | "setting";

export type TcgBioSection = {
  id: TcgBioSectionId;
  label: string;
  body: string;
  /** Primary image for the section (portrait, region plate, vignette, etc.). */
  imageSrc: string;
  /** Optional fallback if primary fails to load. */
  imageFallback?: string;
  imageAlt: string;
  /** Wider scenic crop vs square icon plate. */
  imageLayout: "hero" | "scenic" | "plate";
};

const AFFINITY_KEY = [
  "ember",
  "tide",
  "grove",
  "storm",
  "stone",
  "frost",
  "radiant",
  "void",
  "alloy",
  "spirit",
  "celestial",
] as const;

function affinityKey(affinity: string): string {
  const key = affinity.trim().toLowerCase();
  if ((AFFINITY_KEY as readonly string[]).includes(key)) return key;
  return "spirit";
}

export { regionSlugFromName } from "@/lib/world/region-slugs";

function regionScenicSrc(regionId: string): {
  imageSrc: string;
  imageFallback: string;
} {
  if (regionId === "spirit-realm") {
    return {
      imageSrc: REGION_IMAGE_FALLBACK["spirit-realm"],
      imageFallback: "/assets/maps/regions/spirit-marsh.png",
    };
  }
  const plate = habitatImageSrc(regionId);
  return {
    imageSrc: plate.imageSrc,
    imageFallback:
      REGION_IMAGE_FALLBACK[regionId] ||
      `/assets/maps/${regionId}-overview.png`,
  };
}

function bioVignette(section: "behavior" | "diet", affinity: string): string {
  const key = affinityKey(affinity);
  // Prefer painted PNG masters; SVG remains a lightweight fallback.
  return `/assets/tcg/bio/${section}-${key}.png`;
}

function bioVignetteFallback(section: "behavior" | "diet", affinity: string): string {
  return `/assets/tcg/bio/${section}-${affinityKey(affinity)}.svg`;
}

/** Painted affinity medallions (not battle letter badges like EMB/TID). */
function affinityPlate(affinity: string): {
  imageSrc: string;
  imageFallback: string;
} {
  const key = affinityKey(affinity);
  return {
    imageSrc: affinityIconPath(key, false),
    imageFallback: affinityIconPath(key, true),
  };
}

/** Build illustrated Creature Bio sections from species lore. */
export function buildCreatureBioSections(lore: SpeciesLore): TcgBioSection[] {
  const regionSlug = regionSlugFromName(lore.nativeRegion);
  const affinity = lore.affinity;
  const foods =
    lore.favoriteFoods.length > 0
      ? lore.favoriteFoods.join(", ")
      : lore.diet;

  const sections: TcgBioSection[] = [
    {
      id: "portrait",
      label: "Species",
      body: lore.shortBio,
      imageSrc: creaturePortraitPath(lore.slug),
      imageFallback: `/assets/pets/thumbs/${lore.slug}.webp`,
      imageAlt: `${lore.name} portrait`,
      imageLayout: "hero",
    },
    {
      id: "habitat",
      label: "Habitat",
      body: [
        `Native to ${lore.nativeRegion}.`,
        lore.origin,
        lore.secondaryHabitats.length > 0
          ? `Also found near ${lore.secondaryHabitats.join(", ")}.`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
      ...habitatImageSrc(regionSlug),
      imageAlt: `${lore.nativeRegion} landscape`,
      imageLayout: "scenic",
    },
    {
      id: "behavior",
      label: "Behavior",
      body: [lore.naturalBehavior, lore.socialBehavior]
        .filter(Boolean)
        .join(" "),
      imageSrc: bioVignette("behavior", affinity),
      imageFallback: bioVignetteFallback("behavior", affinity),
      imageAlt: `${lore.name} social behavior`,
      imageLayout: "plate",
    },
    {
      id: "diet",
      label: "Diet",
      body: [lore.diet, foods ? `Favorite foods: ${foods}.` : ""]
        .filter(Boolean)
        .join(" "),
      imageSrc: bioVignette("diet", affinity),
      imageFallback: bioVignetteFallback("diet", affinity),
      imageAlt: `${lore.name} diet`,
      imageLayout: "plate",
    },
    {
      id: "affinity",
      label: "Affinity",
      body: `${lore.name} channels ${affinity}${
        lore.secondaryAffinities.length > 0
          ? `, with secondary ties to ${lore.secondaryAffinities.join(", ")}`
          : ""
      }. ${lore.weatherPreference ? `Prefers ${lore.weatherPreference}.` : ""}`.trim(),
      ...affinityPlate(affinity),
      imageAlt: `${affinity} affinity`,
      imageLayout: "plate",
    },
  ];

  return sections.filter((s) => s.body.trim().length > 0);
}

/** Region / location aura cards — habitat lore from content packs. */
export function buildRegionBioSections(pack: RegionContentPack): TcgBioSection[] {
  const scenic = regionScenicSrc(pack.regionId);
  const landmarkBody = pack.pois
    .slice(0, 4)
    .map((p) => `${p.name}: ${p.blurb}`)
    .join(" ");
  const activityNames = pack.activities
    .slice(0, 3)
    .map((a) => a.name)
    .join(", ");

  const sections: TcgBioSection[] = [
    {
      id: "overview",
      label: "Region",
      body: pack.blurb,
      ...scenic,
      imageAlt: `${pack.regionName} vista`,
      imageLayout: "scenic",
    },
    {
      id: "climate",
      label: "Climate & theme",
      body: [
        pack.theme.lighting,
        `Weather leans ${pack.theme.weatherDefault.replace(/_/g, " ")}.`,
        `Flora: ${pack.theme.vegetation}.`,
        `Built form: ${pack.theme.architecture}.`,
      ].join(" "),
      ...scenic,
      imageAlt: `${pack.regionName} atmosphere`,
      imageLayout: "scenic",
    },
    {
      id: "landmarks",
      label: "Landmarks",
      body:
        landmarkBody ||
        (activityNames
          ? `Keepers often gather for ${activityNames}.`
          : `${pack.regionName} holds quieter paths still waiting to be charted.`),
      ...scenic,
      imageAlt: `${pack.regionName} landmarks`,
      imageLayout: "scenic",
    },
    {
      id: "portal",
      label: "Gateway",
      body: `${pack.portal.name}. ${pack.portal.arrivalNote}`,
      ...scenic,
      imageAlt: `${pack.portal.name}`,
      imageLayout: "plate",
    },
  ];

  return sections.filter((s) => s.body.trim().length > 0);
}

type PlaceLoreDef = {
  title: string;
  place: string;
  wares: string;
  setting: string;
  imageSrc: string;
  imageFallback?: string;
};

const STALL_PLACE_LORE: Record<string, PlaceLoreDef> = {
  produce: {
    title: "Produce Market Stall",
    place: "A sun-warm awning where orchard crates stack higher than the keeper behind them.",
    wares: "River-melons, ember peppers, frostveil berries, and dewleaf bunches still beaded from the morning cart.",
    setting: "Riftwild Commons plaza — the first stop for cooks, hatchery aides, and hungry Riftlings.",
    imageSrc: "/assets/wallpapers/commons-plaza.png",
    imageFallback: "/assets/maps/regions/riftwild-commons.png",
  },
  fish: {
    title: "Fish Market Stall",
    place: "Salt-bright boards and ice trays where the tide’s catch is called by name before noon.",
    wares: "Moonwater silvers, kelp-wrapped fillets, smoked reef strips, and shellfish in woven sea-grass baskets.",
    setting: "Downwind of the harbor path so gulls argue and lanterns never quite dry.",
    imageSrc: "/assets/wallpapers/moonwater-harbor.png",
    imageFallback: "/assets/maps/regions/moonwater-coast.png",
  },
  cloth: {
    title: "Cloth Market Stall",
    place: "Bolts of dye-rich fabric spill from shelves like soft banners in a parade.",
    wares: "Wind-silk scarves, canyon wool, radiant linen, and ribbon dyed in festival lantern hues.",
    setting: "Between the plaza fountain and the tailor’s alley — fingers always sticky with chalk and dye.",
    imageSrc: "/assets/wallpapers/festival-lanterns.png",
    imageFallback: "/assets/wallpapers/commons-plaza.png",
  },
  tools: {
    title: "Tools Market Stall",
    place: "A pegboard of honest steel — hammers, chisels, and coil-spanners that still smell of oil.",
    wares: "Quarry picks, dock spikes, forge tongs, and pocket kits for field repairs on the road.",
    setting: "Near the smithy stand where sparks jump and apprentices bargain for their first real wrench.",
    imageSrc: "/assets/wallpapers/lantern-street.png",
    imageFallback: "/assets/wallpapers/homestead-dusk.png",
  },
  potions: {
    title: "Potions Market Stall",
    place: "Glass stoppers wink under a violet awning; labels are handwritten and slightly smudged.",
    wares: "Glow salves, calm tonics, spark vials, and soft-blue draughts for bruised Riftling paws.",
    setting: "Kept a polite distance from the bakery — heat and volatile oils make poor neighbors.",
    imageSrc: "/assets/wallpapers/circus-night.png",
    imageFallback: "/assets/wallpapers/rift-sky.png",
  },
  pets: {
    title: "Pets Market Stall",
    place: "Cushion nests and brass bells — not a sale of souls, but of collars, treats, and gentle gear.",
    wares: "Bond ribbons, soft brushes, travel bowls, and toys that squeak in three polite tones.",
    setting: "Beside the hatchery notice board where new keepers learn which whistle means ‘home’.",
    imageSrc: "/assets/wallpapers/riftling-meadow.png",
    imageFallback: "/assets/wallpapers/commons-plaza.png",
  },
  books: {
    title: "Books Market Stall",
    place: "A leaning tower of field guides, scrap maps, and half-sung ballads pressed between boards.",
    wares: "Region primers, recipe pamphlets, storm charts, and children’s picture eggs with glittered shells.",
    setting: "In the shade of the academy overhang — readers linger until the lanterns take over.",
    imageSrc: "/assets/wallpapers/keeper-academy.png",
    imageFallback: "/assets/wallpapers/fountain-square.png",
  },
  bakery: {
    title: "Bakery Market Stall",
    place: "Warm sugar and hearth smoke curl from a stall that never quite closes its shutters.",
    wares: "Waybread, ember rolls, honey twists, and seed crackers sized for both keepers and Riftlings.",
    setting: "Corner of the commons where dawn queues form before the plaza fountain wakes.",
    imageSrc: "/assets/wallpapers/homestead-dusk.png",
    imageFallback: "/assets/wallpapers/commons-plaza.png",
  },
};

const PROP_KIND_LORE: Record<
  string,
  { place: string; wares: string; setting: string; imageSrc: string }
> = {
  gate: {
    place: "A threshold carved for arrivals — timber, stone, or seal-iron that remembers every crossing.",
    wares: "Not goods, but permission: toll ledgers, welcome banners, and the hush before a new region opens.",
    setting: "Where Riftwild roads tighten into a named doorway.",
    imageSrc: "/assets/wallpapers/commons-plaza.png",
  },
  bridge: {
    place: "Span-work over gap, river, or rift — boards that teach balance before they teach travel.",
    wares: "Rope, rivets, and the shared habit of pausing mid-crossing to look down.",
    setting: "Links plaza to pier, cliff to cliff, ruin to the next honest path.",
    imageSrc: "/assets/wallpapers/fountain-square.png",
  },
  dock: {
    place: "Wet timber and bollards where boats kiss the edge of the commons harbor line.",
    wares: "Nets, crates, lantern oil, and tide-stained rope coiled like sleeping serpents.",
    setting: "Moonwater influence on Riftwild shores — salt air even on clear days.",
    imageSrc: "/assets/wallpapers/moonwater-harbor.png",
  },
};

function stallKeyFromCardId(cardId: string): string | null {
  const m = cardId.match(/rotr-prop-stall-([a-z0-9-]+)/i);
  return m?.[1] ?? null;
}

function propKindFromCardId(cardId: string): keyof typeof PROP_KIND_LORE | null {
  if (cardId.includes("-prop-gate-")) return "gate";
  if (cardId.includes("-prop-bridge-")) return "bridge";
  if (cardId.includes("-prop-dock-")) return "dock";
  return null;
}

/** Market stalls, gates, bridges, docks — short place lore with scenic images. */
export function buildPlaceBioSections(input: {
  id: string;
  name: string;
  regionId?: string | null;
  flavorText?: string;
  loreBlurb?: string;
}): TcgBioSection[] {
  const stallKey = stallKeyFromCardId(input.id);
  if (stallKey && STALL_PLACE_LORE[stallKey]) {
    const lore = STALL_PLACE_LORE[stallKey];
    return [
      {
        id: "place",
        label: "Place",
        body: lore.place,
        imageSrc: lore.imageSrc,
        imageFallback: lore.imageFallback,
        imageAlt: `${lore.title} scene`,
        imageLayout: "scenic",
      },
      {
        id: "wares",
        label: "Wares",
        body: lore.wares,
        imageSrc: lore.imageSrc,
        imageFallback: lore.imageFallback,
        imageAlt: `${lore.title} wares`,
        imageLayout: "plate",
      },
      {
        id: "setting",
        label: "Setting",
        body: lore.setting,
        imageSrc: "/assets/maps/regions/riftwild-commons.png",
        imageFallback: lore.imageSrc,
        imageAlt: "Riftwild Commons market",
        imageLayout: "scenic",
      },
    ];
  }

  const propKind = propKindFromCardId(input.id);
  if (propKind) {
    const lore = PROP_KIND_LORE[propKind];
    const regionSlug = input.regionId || "riftwild-commons";
    const scenic = regionScenicSrc(regionSlug);
    return [
      {
        id: "place",
        label: "Place",
        body: `${input.name}. ${lore.place}`,
        imageSrc: lore.imageSrc,
        imageFallback: scenic.imageSrc,
        imageAlt: `${input.name}`,
        imageLayout: "scenic",
      },
      {
        id: "wares",
        label: "Role",
        body: lore.wares,
        imageSrc: scenic.imageSrc,
        imageFallback: lore.imageSrc,
        imageAlt: `${input.name} role`,
        imageLayout: "plate",
      },
      {
        id: "setting",
        label: "Setting",
        body: [
          lore.setting,
          input.loreBlurb,
          input.flavorText,
        ]
          .filter(Boolean)
          .join(" "),
        ...scenic,
        imageAlt: `${input.name} setting`,
        imageLayout: "scenic",
      },
    ].filter((s) => s.body.trim().length > 0);
  }

  // Generic location/prop fallback from card text + region plate
  const regionSlug = input.regionId || "riftwild-commons";
  const scenic = regionScenicSrc(regionSlug);
  const body =
    input.loreBlurb?.trim() ||
    input.flavorText?.trim() ||
    `${input.name} is remembered as a Living World place that shapes the board when played.`;
  return [
    {
      id: "place",
      label: "Place",
      body,
      ...scenic,
      imageAlt: `${input.name}`,
      imageLayout: "scenic",
    },
    {
      id: "setting",
      label: "Setting",
      body: `Tied to ${regionSlug.replace(/-/g, " ")} — keepers know the light here before they know the name.`,
      ...scenic,
      imageAlt: `${regionSlug} landscape`,
      imageLayout: "scenic",
    },
  ];
}
