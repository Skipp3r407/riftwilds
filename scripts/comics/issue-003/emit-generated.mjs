/**
 * Emit client-safe TypeScript module for Issue #3.
 *   node scripts/comics/issue-003/emit-generated.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const ISSUE = path.join(ROOT, "src/content/comics/the-traveling-circus/issue-003");
const OUT = path.join(ROOT, "src/content/comics/the-traveling-circus/issue-003.generated.ts");

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

const pages = fs
  .readdirSync(path.join(ISSUE, "pages"))
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => JSON.parse(fs.readFileSync(path.join(ISSUE, "pages", f), "utf8")));

const issueMeta = JSON.parse(fs.readFileSync(path.join(ISSUE, "issue.json"), "utf8"));

const comicPages = pages.map((p) => {
  const artSrc = `/assets/comics/pages/the-traveling-circus/page-${String(p.pageNumber).padStart(2, "0")}.webp`;
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
    id: `the-traveling-circus-p${String(p.pageNumber).padStart(2, "0")}`,
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
      role === "front-cover" || p.storyPageNumber === 1 || p.storyPageNumber === 18 || p.storyPageNumber === 25,
    ),
    developerNote:
      p.storyPageNumber != null ? `Story ${p.storyPageNumber}/25 · baked lettering` : `${role} · baked lettering`,
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

const coverSrc = "/assets/comics/covers/03-traveling-circus.webp";

const issue = {
  slug: "the-traveling-circus",
  issueNumber: 3,
  title: issueMeta.title,
  subtitle: issueMeta.subtitle,
  synopsis: issueMeta.synopsis,
  publishedAt: issueMeta.publishedAt || "2026-07-20",
  readingTimeMinutes: Math.max(12, Math.round(comicPages.length * 0.45)),
  status: "published",
  covers: [
    { kind: "standard", src: coverSrc, label: "The Traveling Circus — Standard" },
    {
      kind: "variant-a",
      src: coverSrc,
      label: "The Traveling Circus — Lanternmaster variant",
      unlockHint: "Finish the issue (cosmetic stub)",
    },
    {
      kind: "variant-b",
      src: coverSrc,
      label: "The Traveling Circus — Companion performance",
      unlockHint: "Finish the issue (cosmetic stub)",
    },
    {
      kind: "foil",
      src: coverSrc,
      label: "The Traveling Circus — Foil",
      unlockHint: "Find lore hotspots (cosmetic stub)",
      foilIntensity: 0.85,
    },
  ],
  tags: ["circus", "lanternveil", "mira-eggwarden", "spark", "world-event", "issue-003"],
  playChapterHref: "/live-world",
  playChapterLabel: "Join the Circus event",
  worldEventKey: "traveling_circus",
  worldEventHref: "/live-world",
  unlockGates: issueMeta.unlockGates,
  nextIssueTeaser: issueMeta.nextIssueTeaser,
  characters: [
    {
      name: "Mira Eggwarden",
      role: "Keeper protagonist",
      blurb: "Hatchery mentor who keeps Spark by Compact — invite, not order.",
    },
    {
      name: "Cael Vesper",
      role: "The Lanternmaster",
      blurb: "Theatrical host who shelters unusual companions along Rift lines.",
    },
    {
      name: "Spark",
      role: "Riftborn companion",
      blurb: "Glowpup-line Subject One — voluntary bond with Mira.",
      speciesSlug: "glowpup",
    },
    {
      name: "Lumenhare",
      role: "Circus companion",
      blurb: "Illusion / mobility support — Grand Illusion spotlight.",
    },
    {
      name: "Bramblefox",
      role: "Companion",
      blurb: "Forest Bond — tracks Meridian scent.",
      speciesSlug: "bramblefox",
    },
    {
      name: "Mossprig",
      role: "Companion",
      blurb: "Living Bulwark for civilians.",
      speciesSlug: "mossprig",
    },
    {
      name: "Thornling",
      role: "Companion",
      blurb: "Sprouting Energy — comic chaos with clues.",
      speciesSlug: "thornling",
    },
    {
      name: "Nira Quill",
      role: "Uncertain Meridian hunter",
      blurb: "Secretly disables a control relay.",
    },
  ],
  locations: [
    { name: "Lanternveil Traveling Circus", blurb: "Roaming sanctuary on ancient Rift lines." },
    { name: "Artifact Vault", blurb: "Holds the Shellward crystal under lantern ward." },
    { name: "The Lost City", blurb: "Cliffhanger — the Guardian remembers." },
  ],
  timelineNote: "Present Awakening — after Spark's Journey sanctuary cliffhanger.",
  factions: [
    { name: "Lanternveil Circus", blurb: "Shelter unusual companions; sometimes masks the truth." },
    { name: "Veiled Meridian", blurb: "Collection hunters infiltrating the show." },
  ],
  commentary: [
    "Canon lock: Mira Eggwarden + Elara Venn (vision from #1). Cal Reed rejected.",
    "All dialogue baked into page images. Transcript drawer for accessibility only.",
    "Live connection: Dynamic World Event key traveling_circus.",
  ],
  hasCommunityVote: true,
  votePrompt: "Which circus side-act should return next season?",
  voteOptions: [
    { id: "vote-lumenhare", label: "Lumenhare encore", blurb: "More Grand Illusion set pieces." },
    { id: "vote-ironmantle", label: "Ironmantle recovery", blurb: "Follow the freed companion's healing." },
  ],
  collectibles: [
    {
      id: "the-traveling-circus-cover-std",
      kind: "cover",
      label: "Standard cover",
      description: "Issue #3 cover plate.",
      coverKind: "standard",
    },
  ],
  rewards: [
    {
      id: "rw-issue-3-badge",
      label: "Issue #3 Badge",
      description: "Cosmetic badge for finishing The Traveling Circus.",
      kind: "badge",
      creditsStub: 8,
    },
  ],
  pages: comicPages,
};

const header = `/**
 * AUTO-GENERATED — do not edit by hand.
 * Source: src/content/comics/the-traveling-circus/issue-003/
 * Regen: node scripts/comics/issue-003/emit-generated.mjs
 */
import type { ComicIssue } from "@/content/comics/types";

export const ISSUE_003_TRANSCRIPTS: Record<number, string[]> = ${JSON.stringify(transcripts, null, 2)};

export function getIssue003Transcript(pageNumber: number): string[] {
  return ISSUE_003_TRANSCRIPTS[pageNumber] ?? [];
}

export const ISSUE_003_COMIC: ComicIssue = ${JSON.stringify(issue, null, 2)} as ComicIssue;
`;

fs.writeFileSync(OUT, header);
console.log(`Wrote ${OUT} (${comicPages.length} pages)`);
