/**
 * Emit complete The Traveling Circus Issue #3 (Mira Eggwarden canon).
 *   node scripts/comics/issue-003/write-full-script.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { buildBook } from "./story-data.mjs";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const OUT = path.join(ROOT, "content/comics/the-traveling-circus/issue-003");

const { storyPages, book, continuityTrack, STYLE } = buildBook();

fs.mkdirSync(path.join(OUT, "pages"), { recursive: true });
fs.mkdirSync(path.join(OUT, "prompts"), { recursive: true });
fs.mkdirSync(path.join(OUT, "reports"), { recursive: true });
fs.mkdirSync(path.join(OUT, "generated", "raw-art"), { recursive: true });
fs.mkdirSync(path.join(OUT, "generated", "lettered-pages"), { recursive: true });
fs.mkdirSync(path.join(OUT, "generated", "thumbnails"), { recursive: true });
fs.mkdirSync(path.join(OUT, "generated", "covers"), { recursive: true });

const script = {
  title: "The Traveling Circus",
  issue: 3,
  subtitle: "Lanternveil",
  protagonist: "Mira Eggwarden",
  companion: "Spark",
  synopsis:
    "Mira Eggwarden, Spark, and their companions follow the Meridian collection trail to the Lanternveil Traveling Circus. Wonder hides wards, infiltrators, and the Shellward crystal. A public battle frees a controlled companion and points the map toward the Lost City — where the Guardian remembers.",
  themes: [
    "performance versus truth",
    "found family",
    "masks",
    "consent",
    "freedom",
    "protection vs imprisonment",
  ],
  storyPageCount: 25,
  bookPageCount: book.length,
  requiredMoments: Array.from({ length: 25 }, (_, i) => i + 1),
  pages: storyPages.map((p) => ({
    pageNumber: p.storyPageNumber,
    title: p.title,
    beat: p.storyPurpose,
    transcript: p.transcript,
  })),
  canonLock: { keeper: "Mira Eggwarden", vision: "Elara Venn", rejected: "Cal Reed" },
};

fs.writeFileSync(path.join(OUT, "script.json"), JSON.stringify(script, null, 2) + "\n");
fs.writeFileSync(
  path.join(OUT, "continuity.json"),
  JSON.stringify({ pages: continuityTrack, canonLock: script.canonLock }, null, 2) + "\n",
);
fs.writeFileSync(
  path.join(OUT, "characters.json"),
  JSON.stringify(
    {
      cast: [
        { id: "mira-eggwarden", name: "Mira Eggwarden", role: "Keeper protagonist" },
        { id: "lanternmaster", name: "Cael Vesper", title: "The Lanternmaster" },
        { id: "seris-vale", name: "Seris Vale", role: "Meridian infiltrator" },
        { id: "nira-quill", name: "Nira Quill", role: "Uncertain hunter" },
        { id: "elara-venn", name: "Elara Venn", role: "Vision/About canon only" },
      ],
      rejected: [{ id: "cal-reed", note: "Non-canon draft — do not ship" }],
    },
    null,
    2,
  ) + "\n",
);
fs.writeFileSync(
  path.join(OUT, "creatures.json"),
  JSON.stringify(
    {
      featured: [
        { id: "spark", name: "Spark" },
        { id: "lumenhare", name: "Lumenhare", note: "See LUMENHARE_CANON_PROPOSAL.md" },
        { id: "bramblefox", name: "Bramblefox" },
        { id: "mossprig", name: "Mossprig" },
        { id: "thornling", name: "Thornling" },
        { id: "wisplet", name: "Wisplet" },
        { id: "spirit-moth", name: "Spirit Moth" },
        { id: "ironmantle", name: "Ironmantle", note: "Controlled then freed" },
      ],
    },
    null,
    2,
  ) + "\n",
);
fs.writeFileSync(
  path.join(OUT, "factions.json"),
  JSON.stringify(
    {
      factions: [
        { id: "veiled-meridian", name: "Veiled Meridian" },
        { id: "lanternveil", name: "Lanternveil Traveling Circus" },
        { id: "hatchery-compact", name: "Hatchery Compact" },
      ],
    },
    null,
    2,
  ) + "\n",
);
fs.writeFileSync(
  path.join(OUT, "locations.json"),
  JSON.stringify(
    {
      locations: [
        { id: "lanternveil-circus", name: "Lanternveil Traveling Circus" },
        { id: "grand-pavilion", name: "Grand Pavilion" },
        { id: "artifact-vault", name: "Artifact Vault" },
        { id: "archive-wagon", name: "Mobile Archive Wagon" },
        { id: "lost-city", name: "The Lost City", note: "Cliffhanger only" },
      ],
    },
    null,
    2,
  ) + "\n",
);
fs.writeFileSync(
  path.join(OUT, "covers.json"),
  JSON.stringify(
    {
      main: { title: "The Traveling Circus", issue: 3, prompt: book[0].grokPrompt },
      "variant-a": {
        label: "Lanternmaster portrait",
        prompt: `${STYLE} Variant A: Lanternmaster portrait with circus masks and hidden symbols. Empty title zones. NO text. NO Cal Reed.`,
      },
      "variant-b": {
        label: "Companion performance",
        prompt: `${STYLE} Variant B: Spark and Lumenhare performance cover. Empty title zones. NO text.`,
      },
      foil: {
        label: "Foil lanterns",
        prompt: `${STYLE} Foil: animated lantern lights and cyan Rift energy. Empty title zones. NO text.`,
      },
    },
    null,
    2,
  ) + "\n",
);

const issue = {
  slug: "the-traveling-circus",
  issueNumber: 3,
  title: "The Traveling Circus",
  subtitle: "Chapter Three — Lanternveil",
  synopsis: script.synopsis,
  publishedAt: "2026-07-20",
  status: "published",
  storyPageCount: 25,
  bookPageCount: book.length,
  estimatedReadMinutes: 22,
  protagonist: "Mira Eggwarden",
  featuredCreatures: ["Spark", "Lumenhare", "Bramblefox", "Mossprig", "Thornling", "Wisplet", "Ironmantle"],
  locations: ["Lanternveil Traveling Circus", "Shellward crystal vault", "Lost City (teaser)"],
  unlockGates: [
    { kind: "prior-issue", slug: "sparks-journey", label: "Complete Issue #2: Spark's Journey" },
    { kind: "admin-dev", label: "Admin / COMICS_DEV_UNLOCK override" },
  ],
  nextIssueTeaser: { slug: "the-lost-city", hook: "The Guardian remembers." },
  worldEventKey: "traveling_circus",
  worldEventHref: "/live-world",
  pipeline: {
    artProvider: "grok",
    lettering: "programmatic",
    bakedLettering: true,
    contentRoot: "content/comics/the-traveling-circus/issue-003",
  },
  bookPages: book.map((p) => ({
    pageNumber: p.pageNumber,
    storyPageNumber: p.storyPageNumber ?? null,
    role: p.bookRole,
    title: p.title,
  })),
  canonLock: script.canonLock,
};
fs.writeFileSync(path.join(OUT, "issue.json"), JSON.stringify(issue, null, 2) + "\n");

for (const p of book) {
  const nn = String(p.pageNumber).padStart(3, "0");
  const pageOut = {
    ...p,
    id: `the-traveling-circus-issue-003-p${nn}`,
    cleanArtRel: `generated/raw-art/page-${nn}.png`,
    letteredArtRel: `generated/lettered-pages/page-${nn}.webp`,
    publicArtRel: `assets/comics/the-traveling-circus/issue-003/pages/page-${nn}.webp`,
  };
  fs.writeFileSync(path.join(OUT, "pages", `page-${nn}.json`), JSON.stringify(pageOut, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT, "prompts", `page-${nn}.prompt.txt`), pageOut.grokPrompt + "\n");
}

console.log(
  JSON.stringify(
    {
      out: OUT,
      storyPages: storyPages.length,
      bookPages: book.length,
      continuityPages: continuityTrack.length,
      protagonist: "Mira Eggwarden",
    },
    null,
    2,
  ),
);
