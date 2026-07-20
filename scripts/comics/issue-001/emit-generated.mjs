/**
 * Emit client-safe TypeScript module for Issue #1 (no fs at runtime).
 *   node scripts/comics/issue-001/emit-generated.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const ISSUE = path.join(ROOT, "src/content/comics/the-first-rift/issue-001");
const OUT = path.join(ROOT, "src/content/comics/the-first-rift/issue-001.generated.ts");

const ROLE_MAP = {
  "front-cover": "front-cover",
  "inside-cover": "inside-cover",
  credits: "credits",
  title: "title",
  story: "story",
  splash: "splash",
  teaser: "teaser",
  profile: "profile",
  lore: "lore",
  map: "map",
  letters: "letters",
  "back-cover": "back-cover",
};

const LAYOUT_MAP = {
  splash: "splash",
  wide: "wide",
  "two-col": "two-col",
  "three-stack": "three-stack",
  "grid-2x2": "grid-2x2",
  "grid-3": "grid-3",
  narrative: "narrative",
  lore: "lore",
  spread: "spread",
  end: "end",
};

function esc(s) {
  return JSON.stringify(s);
}

const pages = fs
  .readdirSync(path.join(ISSUE, "pages"))
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => JSON.parse(fs.readFileSync(path.join(ISSUE, "pages", f), "utf8")));

const issueMeta = JSON.parse(fs.readFileSync(path.join(ISSUE, "issue.json"), "utf8"));

const comicPages = pages.map((p) => {
  const artSrc = `/assets/comics/pages/the-first-rift/page-${String(p.pageNumber).padStart(2, "0")}.webp`;
  const layoutType = p.layout?.type || (p.bookRole === "front-cover" ? "splash" : "narrative");
  const role = ROLE_MAP[p.bookRole] || "story";
  const panels = (p.panels || []).map((panel) => ({
    id: panel.id,
    artSrc,
    artAlt: p.artAlt,
    atmosphere: p.atmosphere,
    bubbles: (panel.bubbles || []).map((b) => ({
      kind: b.kind,
      speaker: b.speaker,
      text: b.text,
      x: b.x,
      y: b.y,
      tail: b.tail,
      readOrder: b.readOrder,
    })),
  }));
  return {
    id: `the-first-rift-p${String(p.pageNumber).padStart(2, "0")}`,
    pageNumber: p.pageNumber,
    layout: LAYOUT_MAP[layoutType] || "narrative",
    role,
    title: p.title,
    artSrc,
    artAlt: p.artAlt || p.title,
    atmosphere: p.atmosphere,
    panels,
    composedPlate: true,
    bakedLettering: true,
    isKeyArt: Boolean(
      role === "front-cover" ||
        p.storyPageNumber === 1 ||
        p.storyPageNumber === 12 ||
        p.storyPageNumber === 25,
    ),
    developerNote:
      p.storyPageNumber != null
        ? `Story ${p.storyPageNumber}/25 · baked lettering`
        : `${role} · baked lettering`,
  };
});

const transcripts = {};
for (const p of pages) {
  const lines = [];
  for (const panel of p.panels || []) {
    for (const b of panel.bubbles || []) {
      if (!b.text?.trim()) continue;
      lines.push(b.speaker ? `${b.speaker}: ${b.text}` : b.text);
    }
  }
  transcripts[p.pageNumber] = lines;
}

const coverSrc = "/assets/comics/covers/the-first-rift.webp";

const issue = {
  slug: "the-first-rift",
  issueNumber: 1,
  title: issueMeta.title,
  subtitle: issueMeta.subtitle,
  synopsis: issueMeta.synopsis,
  publishedAt: issueMeta.publishedAt || "2026-07-20",
  readingTimeMinutes: Math.max(12, Math.round(comicPages.length * 0.45)),
  status: "published",
  covers: [
    { kind: "standard", src: coverSrc, label: "The First Rift — Standard" },
    {
      kind: "variant-a",
      src: coverSrc,
      label: "The First Rift — Creature variant",
      unlockHint: "Finish the issue (cosmetic stub)",
    },
    {
      kind: "variant-b",
      src: coverSrc,
      label: "The First Rift — Catastrophe variant",
      unlockHint: "Finish the issue (cosmetic stub)",
    },
    {
      kind: "foil",
      src: coverSrc,
      label: "The First Rift — Foil",
      unlockHint: "Find lore hotspots (cosmetic stub)",
      foilIntensity: 0.85,
    },
  ],
  tags: ["origin", "cal-reed", "fracture", "commons", "pulse-below", "issue-001"],
  playChapterHref: "/live-world",
  playChapterLabel: "Enter Live World — Commons",
  characters: [
    {
      name: "Cal Reed",
      role: "Junior Keeper (comic POV)",
      blurb: "Codex student who follows companion fear into the Pulse Below chamber.",
    },
    {
      name: "Elara Venn",
      role: "First Keeper (vision / counsel)",
      blurb: "Living memory of the founding road — not present-day POV.",
    },
    {
      name: "Mira Shellbright",
      role: "Hatchery caretaker",
      blurb: "Recognizes the egg's shell-song after the seal.",
    },
    {
      name: "Bramblefox",
      role: "Companion",
      blurb: "Forest Bond — vine-light armor with Nature allies.",
      speciesSlug: "bramblefox",
    },
    {
      name: "Mossprig",
      role: "Companion",
      blurb: "Living Bulwark — moss barrier for allies.",
      speciesSlug: "mossprig",
    },
    {
      name: "Thornling",
      role: "Companion",
      blurb: "Sprouting Energy — feeds team Rift Energy.",
      speciesSlug: "thornling",
    },
    {
      name: "Wisplet",
      role: "Spirit guide",
      blurb: "Spectral lantern companion.",
      speciesSlug: "wisplet",
    },
    {
      name: "Spirit Moth",
      role: "Spirit guide",
      blurb: "Lantern-wing pathfinder; reveals betrayer sigil.",
      speciesSlug: "spirit-moth",
    },
  ],
  locations: [
    { name: "Riftwild Commons", blurb: "Opening aurora and quiet aftermath." },
    { name: "Pulse Below Chamber", blurb: "Sealed Riftkeeper chamber near the Commons." },
    { name: "Vision: Pre-Fracture Aeryndra", blurb: "Shared memory of the Activation catastrophe." },
  ],
  timelineNote: "Present-day Commons discovery → vision of First Rift / Activation.",
  factions: [
    { name: "Commons Keepers", blurb: "Care before conquest." },
    { name: "Unknown Activation mark", blurb: "Three-arc betrayer sigil — Issue #2 hook." },
  ],
  commentary: [
    "POV: Cal Reed — see THE_FIRST_RIFT_CANON_AUDIT.md. Elara founding remains About-canon via vision.",
    "All dialogue baked into page images. Transcript drawer for accessibility only.",
  ],
  wallpaperSrcs: [
    "/assets/comics/bonus/wallpaper-rift.png",
    "/assets/comics/bonus/wallpaper-commons.png",
  ],
  hasCommunityVote: true,
  votePrompt: "What should Cal do with the resonance egg?",
  voteOptions: [
    { id: "vote-hatchery", label: "Hatchery Compact", blurb: "Bring it to Mira under Compact law." },
    { id: "vote-codex", label: "Codex study", blurb: "Archive the sigil with Solen first." },
  ],
  collectibles: [
    {
      id: "the-first-rift-cover-std",
      kind: "cover",
      label: "Standard cover",
      description: "Issue #1 cover plate.",
      coverKind: "standard",
    },
  ],
  rewards: [
    {
      id: "rw-issue-1-badge",
      label: "Issue #1 Badge",
      description: "Cosmetic badge for finishing The First Rift.",
      kind: "badge",
      creditsStub: 8,
    },
  ],
  nextIssueTeaser: {
    slug: "sparks-journey",
    hook: "The mark has a keeper. The ledger has missing pages.",
  },
  pages: comicPages,
};

const header = `/**
 * AUTO-GENERATED — do not edit by hand.
 * Source: src/content/comics/the-first-rift/issue-001/
 * Regen: node scripts/comics/issue-001/emit-generated.mjs
 */
import type { ComicIssue } from "@/content/comics/types";

export const ISSUE_001_TRANSCRIPTS: Record<number, string[]> = ${JSON.stringify(transcripts, null, 2)};

export function getIssue001Transcript(pageNumber: number): string[] {
  return ISSUE_001_TRANSCRIPTS[pageNumber] ?? [];
}

export const ISSUE_001_COMIC: ComicIssue = ${JSON.stringify(issue, null, 2)} as ComicIssue;
`;

fs.writeFileSync(OUT, header);
console.log(`Wrote ${OUT} (${comicPages.length} pages)`);
