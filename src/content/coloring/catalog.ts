/**
 * Riftwilds kids coloring pages — printable game-sketch line art.
 * Free for personal / kids use; not for resale.
 * Assets: public/assets/coloring/* (install via scripts/assets/install-coloring-sketches.mjs).
 */

export type ColoringSheet = {
  id: string;
  slug: string;
  title: string;
  shortLabel: string;
  description: string;
  /** Public URL for the printable PNG */
  pngSrc: string;
  /** Optional SVG source (also printable) */
  svgSrc: string;
  /** Optional single-page PDF */
  pdfSrc?: string;
  tags: string[];
};

export const COLORING_CREDIT =
  "Free download for personal and kids’ use. Please do not resell or use commercially.";

export const COLORING_SHEETS: ColoringSheet[] = [
  {
    id: "spark",
    slug: "spark",
    title: "Spark coloring page",
    shortLabel: "Spark",
    description: "Spark the Glowpup — game-style sketch with backpack, scarf, and glowing-tip tail.",
    pngSrc: "/assets/coloring/spark.png",
    svgSrc: "/assets/coloring/spark.svg",
    pdfSrc: "/assets/coloring/spark.pdf",
    tags: ["riftling", "spark"],
  },
  {
    id: "riftwild-commons",
    slug: "riftwild-commons",
    title: "Riftwild Commons",
    shortLabel: "Commons",
    description: "Riftwild Commons plaza — timber halls, fountain, and the glowing gateway stone.",
    pngSrc: "/assets/coloring/riftwild-commons.png",
    svgSrc: "/assets/coloring/riftwild-commons.svg",
    pdfSrc: "/assets/coloring/riftwild-commons.pdf",
    tags: ["landmark", "commons"],
  },
  {
    id: "traveling-circus",
    slug: "traveling-circus",
    title: "Traveling Circus",
    shortLabel: "Circus",
    description: "Traveling Circus night — stage, wagon, banners, and a crowd of Riftlings.",
    pngSrc: "/assets/coloring/traveling-circus.png",
    svgSrc: "/assets/coloring/traveling-circus.svg",
    pdfSrc: "/assets/coloring/traveling-circus.pdf",
    tags: ["circus", "event"],
  },
  {
    id: "hatchery-egg",
    slug: "hatchery-egg",
    title: "Hatchery Egg",
    shortLabel: "Hatchery",
    description: "A hatchery egg with rift-scale plates in a mossy nest — almost ready to hatch!",
    pngSrc: "/assets/coloring/hatchery-egg.png",
    svgSrc: "/assets/coloring/hatchery-egg.svg",
    pdfSrc: "/assets/coloring/hatchery-egg.pdf",
    tags: ["egg", "hatchery"],
  },
  {
    id: "riftling-friends",
    slug: "riftling-friends",
    title: "Riftling Friends",
    shortLabel: "Friends",
    description: "Three Riftling friends in a meadow — Glowpup, berry-kin, and moss-kin.",
    pngSrc: "/assets/coloring/riftling-friends.png",
    svgSrc: "/assets/coloring/riftling-friends.svg",
    pdfSrc: "/assets/coloring/riftling-friends.pdf",
    tags: ["riftling", "group"],
  },
  {
    id: "elara-venn",
    slug: "elara-venn",
    title: "Elara Venn",
    shortLabel: "Elara",
    description: "Elara Venn, Commons guide — cloak, satchel, and the gateway stone behind her.",
    pngSrc: "/assets/coloring/elara-venn.png",
    svgSrc: "/assets/coloring/elara-venn.svg",
    pdfSrc: "/assets/coloring/elara-venn.pdf",
    tags: ["people", "commons"],
  },
  {
    id: "gateway-stones",
    slug: "gateway-stones",
    title: "Gateway Stones",
    shortLabel: "Gateways",
    description: "An ornate Gateway Stone with floating crystals and mossy steps.",
    pngSrc: "/assets/coloring/gateway-stones.png",
    svgSrc: "/assets/coloring/gateway-stones.svg",
    pdfSrc: "/assets/coloring/gateway-stones.pdf",
    tags: ["landmark", "history"],
  },
  {
    id: "elderwood-path",
    slug: "elderwood-path",
    title: "Elderwood Path",
    shortLabel: "Elderwood",
    description: "Elderwood path — ancient trees, lanterns, and a little bridge over a stream.",
    pngSrc: "/assets/coloring/elderwood-path.png",
    svgSrc: "/assets/coloring/elderwood-path.svg",
    pdfSrc: "/assets/coloring/elderwood-path.pdf",
    tags: ["region", "nature"],
  },
];

export function listColoringSheets(): ColoringSheet[] {
  return COLORING_SHEETS;
}

export function getColoringSheet(slug: string): ColoringSheet | undefined {
  return COLORING_SHEETS.find((s) => s.slug === slug);
}
