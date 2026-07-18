/**
 * Riftwilds 300 DPI printables — stickers, posters, bookmarks, cards, crafts.
 * Free for personal / kids / party use; not for resale.
 * Tone: warm fantasy + cyan/amber rift energy — adventure, care, and stakes.
 */

export type PrintableKind =
  | "sticker-sheet"
  | "poster"
  | "bookmark"
  | "trading-card"
  | "card"
  | "invite"
  | "standee";

export type PrintablePaper = "letter" | "a4" | "5x7";

/** Subtle card-well atmosphere keyed for CSS (bronze / cyan / ember / grove). */
export type PrintableAtmosphere =
  | "spark-storm"
  | "commons-plaza"
  | "hatchery-aurora"
  | "trading-bronze"
  | "bookmark-ink"
  | "sticker-parchment"
  | "crest-seal"
  | "circus-ember"
  | "standee-hearth";

export type PrintableItem = {
  id: string;
  slug: string;
  title: string;
  shortLabel: string;
  description: string;
  kind: PrintableKind;
  paper: PrintablePaper;
  /** Human paper note shown in UI */
  paperNote: string;
  pngSrc: string;
  pdfSrc: string;
  tags: string[];
  /** Unique card atmosphere behind the preview art */
  atmosphere: PrintableAtmosphere;
};

export const PRINTABLES_CREDIT =
  "Free download for personal, kids, and party use. Please do not resell or use commercially. Credit Riftwilds when you share.";

export const PRINTABLES_DPI_NOTE =
  "All files are 300 DPI print-ready (PNG with density metadata + PDF). Print at 100% scale — do not “fit to page” if you want true size.";

export const PRINTABLES: PrintableItem[] = [
  {
    id: "poster-spark",
    slug: "poster-spark",
    title: "Spark's Stand poster",
    shortLabel: "Spark poster",
    description:
      "Spark the Glowpup faces a cyan rift storm — heroic companion wall art for Keepers.",
    kind: "poster",
    paper: "letter",
    paperNote: 'US Letter 8.5×11" · 2550×3300 px @ 300 DPI',
    pngSrc: "/assets/printables/poster-spark.png",
    pdfSrc: "/assets/printables/poster-spark.pdf",
    tags: ["poster", "spark", "battle"],
    atmosphere: "spark-storm",
  },
  {
    id: "poster-spark-a4",
    slug: "poster-spark-a4",
    title: "Spark's Stand poster (A4)",
    shortLabel: "Spark A4",
    description: "Same Spark vs rift storm art sized for A4 printers outside the US.",
    kind: "poster",
    paper: "a4",
    paperNote: "A4 · 2480×3508 px @ 300 DPI",
    pngSrc: "/assets/printables/poster-spark-a4.png",
    pdfSrc: "/assets/printables/poster-spark-a4.pdf",
    tags: ["poster", "spark", "a4"],
    atmosphere: "spark-storm",
  },
  {
    id: "poster-commons",
    slug: "poster-commons",
    title: "Commons Under Threat poster",
    shortLabel: "Commons poster",
    description:
      "Keepers and Riftlings hold the cracked fountain plaza as a rift storm tears the Commons.",
    kind: "poster",
    paper: "letter",
    paperNote: 'US Letter 8.5×11" · 2550×3300 px @ 300 DPI',
    pngSrc: "/assets/printables/poster-commons.png",
    pdfSrc: "/assets/printables/poster-commons.pdf",
    tags: ["poster", "commons", "battle"],
    atmosphere: "commons-plaza",
  },
  {
    id: "poster-hatchery",
    slug: "poster-hatchery",
    title: "Hatchery Aurora poster",
    shortLabel: "Hatchery poster",
    description:
      "Nest eggs under cyan–amber aurora — care and wonder before the next rift aftershock.",
    kind: "poster",
    paper: "letter",
    paperNote: 'US Letter 8.5×11" · 2550×3300 px @ 300 DPI',
    pngSrc: "/assets/printables/poster-hatchery.png",
    pdfSrc: "/assets/printables/poster-hatchery.pdf",
    tags: ["poster", "hatchery"],
    atmosphere: "hatchery-aurora",
  },
  {
    id: "trading-cards-sheet",
    slug: "trading-cards-sheet",
    title: "Riftling trading cards",
    shortLabel: "Trading cards",
    description:
      "Four collectible cards with bronze rarity frames — Spark, Cindercub, Mossprig, Bubbloon.",
    kind: "trading-card",
    paper: "letter",
    paperNote: 'US Letter · four ~2.5×3.5" cards',
    pngSrc: "/assets/printables/trading-cards-sheet.png",
    pdfSrc: "/assets/printables/trading-cards-sheet.pdf",
    tags: ["trading-card", "riftling"],
    atmosphere: "trading-bronze",
  },
  {
    id: "bookmarks-sheet",
    slug: "bookmarks-sheet",
    title: "Adventure bookmark trio",
    shortLabel: "Bookmarks",
    description: "Three cut-out bookmarks: Spark's Stand, Circus Under Fire, and Keeper oath.",
    kind: "bookmark",
    paper: "letter",
    paperNote: 'US Letter 8.5×11" · cut into three bookmarks',
    pngSrc: "/assets/printables/bookmarks-sheet.png",
    pdfSrc: "/assets/printables/bookmarks-sheet.pdf",
    tags: ["bookmark"],
    atmosphere: "bookmark-ink",
  },
  {
    id: "sticker-sheet-riftlings",
    slug: "sticker-sheet-riftlings",
    title: "Riftling sticker sheet",
    shortLabel: "Riftling stickers",
    description:
      "Full-color Spark, Cindercub, Mossprig, Bubbloon, and badge cutouts with dashed cut guides.",
    kind: "sticker-sheet",
    paper: "letter",
    paperNote: 'US Letter 8.5×11" · 2550×3300 px @ 300 DPI',
    pngSrc: "/assets/printables/sticker-sheet-riftlings.png",
    pdfSrc: "/assets/printables/sticker-sheet-riftlings.pdf",
    tags: ["stickers", "riftling"],
    atmosphere: "sticker-parchment",
  },
  {
    id: "sticker-sheet-crests",
    slug: "sticker-sheet-crests",
    title: "Crest & badge stickers",
    shortLabel: "Crest stickers",
    description: "Commons crest, hatch egg, care heart, Keeper badge, and companion seals.",
    kind: "sticker-sheet",
    paper: "letter",
    paperNote: 'US Letter 8.5×11" · 2550×3300 px @ 300 DPI',
    pngSrc: "/assets/printables/sticker-sheet-crests.png",
    pdfSrc: "/assets/printables/sticker-sheet-crests.pdf",
    tags: ["stickers", "commons"],
    atmosphere: "crest-seal",
  },
  {
    id: "card-spark-5x7",
    slug: "card-spark-5x7",
    title: "Spark's Stand 5×7 card",
    shortLabel: "Spark 5×7",
    description: "Desk keepsake — Spark leaping into the rift storm with a Keeper at their side.",
    kind: "card",
    paper: "5x7",
    paperNote: '5×7" · 1500×2100 px @ 300 DPI',
    pngSrc: "/assets/printables/card-spark-5x7.png",
    pdfSrc: "/assets/printables/card-spark-5x7.pdf",
    tags: ["card", "spark"],
    atmosphere: "spark-storm",
  },
  {
    id: "card-circus-5x7",
    slug: "card-circus-5x7",
    title: "Circus Under Fire 5×7 card",
    shortLabel: "Circus 5×7",
    description: "Traveling Circus tent torn by rift fire — Keepers and Riftlings hold the ring.",
    kind: "card",
    paper: "5x7",
    paperNote: '5×7" · 1500×2100 px @ 300 DPI',
    pngSrc: "/assets/printables/card-circus-5x7.png",
    pdfSrc: "/assets/printables/card-circus-5x7.pdf",
    tags: ["card", "circus"],
    atmosphere: "circus-ember",
  },
  {
    id: "circus-party-invite",
    slug: "circus-party-invite",
    title: "Traveling Circus party invite",
    shortLabel: "Circus invite",
    description:
      "Fill-in party flyer — celebrate under the big top with date and place blanks for home parties.",
    kind: "invite",
    paper: "letter",
    paperNote: 'US Letter 8.5×11" · 2550×3300 px @ 300 DPI',
    pngSrc: "/assets/printables/circus-party-invite.png",
    pdfSrc: "/assets/printables/circus-party-invite.pdf",
    tags: ["invite", "circus"],
    atmosphere: "circus-ember",
  },
  {
    id: "standee-spark",
    slug: "standee-spark",
    title: "Spark paper standee",
    shortLabel: "Spark standee",
    description: "Cut-and-fold paper craft — Spark desk companion with fold tab.",
    kind: "standee",
    paper: "letter",
    paperNote: "US Letter · cut + fold craft",
    pngSrc: "/assets/printables/standee-spark.png",
    pdfSrc: "/assets/printables/standee-spark.pdf",
    tags: ["standee", "craft", "spark"],
    atmosphere: "standee-hearth",
  },
];

export function listPrintables(): PrintableItem[] {
  return PRINTABLES;
}

export function getPrintable(slug: string): PrintableItem | undefined {
  return PRINTABLES.find((p) => p.slug === slug);
}
