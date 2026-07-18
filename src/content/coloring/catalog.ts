/**
 * Riftwilds kids coloring pages — original printable line art.
 * Free for personal / kids use; not for resale.
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
    description: "Spark the Glowpup — a friendly companion ready for crayons.",
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
    description: "The welcoming plaza, fountain, and gateway stones of Riftwild Commons.",
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
    description: "A cheerful circus tent, balloons, and a friendly ringmaster hat.",
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
    description: "A cozy hatchery egg on a nest of soft leaves — almost ready to hatch!",
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
    description: "Three cheerful Riftlings playing together under a gentle sun.",
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
    description: "Elara Venn, the kind Commons guide, with her satchel and smile.",
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
    description: "The five Gateway Stones that welcome travelers into the Commons.",
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
    description: "A sunny forest path with friendly trees and a little bridge.",
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
