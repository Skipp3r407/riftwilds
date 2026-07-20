/**
 * Dump per-page GenerateImage prompts for Legends of the Rift issues.
 *
 * Usage:
 *   npx tsx scripts/comics/dump-illustrated-prompts.mts
 *   npx tsx scripts/comics/dump-illustrated-prompts.mts the-first-rift
 *   npx tsx scripts/comics/dump-illustrated-prompts.mts the-first-rift --force
 *
 * Writes:
 *   artifacts/comics/prompts/<slug>.json
 *   artifacts/comics/prompts/<slug>.md
 *   artifacts/comics/prompts/manifest.json (progress tracker)
 */
import fs from "node:fs";
import path from "node:path";
import { COMIC_ISSUES, getComicIssue } from "../../src/content/comics/catalog";
import type { ComicIssue, ComicPage } from "../../src/content/comics/types";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "artifacts/comics/prompts");

const STYLE = [
  "Premium painted fantasy comic BOOK PAGE for original Riftwilds IP (Legends of the Rift).",
  "Portrait comic page composition 3:4, rich full-bleed illustration with clear inked panel gutters,",
  "characters in scene, atmospheric backgrounds, cinematic lighting.",
  "Warm earth greens, sandstone, timber, moss first; cyan rift energy and amber hearth as accents only.",
  "NO purple AI-fantasy default. NO Marvel/DC characters, logos, or proprietary SFX lettering.",
  "Leave clean negative space in upper/lower panel corners for speech bubbles (do NOT paint dialogue text,",
  "captions, logos, watermarks, page numbers, or UI). Fantasy onomatopoeia shapes OK without readable English.",
  "Painterly digital comic art, professional publishing quality — not a diagram, icon plate, or abstract lore card.",
].join(" ");

const CAST: Record<string, string> = {
  "Elara Venn":
    "Elara Venn: young adult woman courier-Keeper, weathered travel cloak, warm brown skin, dark braided hair with amber beads, determined gentle eyes, carries a glowing soft egg or young Riftling",
  Bramblefox:
    "Bramblefox: small foxlike Grove Riftling with living vine fur, leaf-tufted ears, amber eyes, green thread Forest Bond glow",
  Mossprig:
    "Mossprig: slender cervine-botanical Riftling with moss cape, branching leaf antlers with golden veins, cream muzzle, vine tail",
  Ashwing:
    "Ashwing: ember-feathered avian Riftling, warm charcoal and amber plumage, intelligent eyes, soft ash motes",
  Thornling:
    "Thornling: compact bristly plant Riftling, thorn crest, mossy hide, cautious stance",
  Spark:
    "Spark / Glowpup: small curious pup-like Riftling with cyan-amber glow along fur seams",
  "Mira Eggwarden":
    "Mira Eggwarden: hatchery mentor, practical robes, kind firm expression, egg-care satchel",
  "First Riftling":
    "First Riftling: newly hatched soft archive creature, pale shell-glow body, large curious eyes, not a weapon",
};

function layoutHint(layout: ComicPage["layout"], panelCount: number): string {
  switch (layout) {
    case "splash":
    case "wide":
    case "spread":
      return "Single full-bleed cinematic splash panel filling the page.";
    case "two-col":
      return "Two tall side-by-side panels with a dark gutter between them.";
    case "three-stack":
      return "Three horizontal stacked panels with gutters between rows.";
    case "grid-2x2":
      return "Four-panel 2x2 grid with even gutters.";
    case "grid-3":
      return "Three vertical columns of panels.";
    case "lore":
      return "Illustrated lore plate: large atmospheric scene with an ornate crystal/heart motif and room at the bottom for a lore box overlay.";
    case "end":
      return "Closing story plate: warm Commons dusk scene with companions silhouetted, ceremonial feel.";
    case "narrative":
    default:
      if (panelCount >= 4) return "Multi-panel comic page (4 panels) with clear gutters and varied camera distances.";
      if (panelCount === 3) return "Three-panel comic page with clear gutters.";
      if (panelCount === 2) return "Two-panel comic page with clear gutter.";
      return "Single illustrated narrative panel filling most of the page with rich environment detail.";
  }
}

function roleHint(role: ComicPage["role"] | undefined, title?: string): string {
  switch (role) {
    case "front-cover":
      return "Treat as interior showcase plate matching cover energy (not a second book cover with title text).";
    case "inside-cover":
      return "Quiet inside-cover atmosphere: parchment light, soft Gateway glow, invitation to read.";
    case "title":
      return "Title-spread energy without painted lettering: cast gathered near the Prime Gateway.";
    case "credits":
      return "Workshop / lore-desk scene: quills, rift-ink, maps — no readable credit text.";
    case "recap":
      return "Recap montage plate: Fracture tear, road, egg, Commons founding — sequential beats in panels.";
    case "profile":
      return "Character profile plate: portraits of Elara, First Riftling, Bramblefox, Mossprig in ornate frames within the page.";
    case "map":
      return "Hand-painted fantasy map of Riftwilds Commons and Fracture roads — decorative, no tiny unreadable labels.";
    case "ad":
      return "In-universe playful poster for Riftwilds TCG / Live World — illustrated scene, no real logos or readable ad copy.";
    case "teaser":
      return "Next-issue teaser silhouette cliffhanger — mysterious, atmospheric.";
    case "letters":
      return "Letters page atmosphere: Keeper mail, wax seals, egg sketches on a wooden table.";
    case "back-cover":
      return "Back-matter closing vista of the Commons under soft riftlight.";
    default:
      return title ? `Story page titled conceptually: ${title}.` : "Story page.";
  }
}

function bubbleSummary(page: ComicPage): string {
  const lines = page.panels.flatMap((p) =>
    p.bubbles.map((b) => {
      const who = b.speaker ? `${b.speaker}: ` : `${b.kind}: `;
      return `${who}${b.text}`;
    }),
  );
  if (!lines.length) return "";
  return `Story beats to illustrate (do not paint this text): ${lines.slice(0, 8).join(" | ")}`;
}

function castForIssue(issue: ComicIssue): string {
  const names = new Set<string>();
  for (const c of issue.characters ?? []) names.add(c.name);
  for (const page of issue.pages) {
    for (const panel of page.panels) {
      for (const b of panel.bubbles) {
        if (b.speaker) names.add(b.speaker);
      }
    }
  }
  const bits = [...names]
    .map((n) => CAST[n] ?? `${n}: original Riftwilds fantasy character`)
    .slice(0, 8);
  return bits.join(". ");
}

function buildPrompt(issue: ComicIssue, page: ComicPage): string {
  const panelCount = Math.max(1, page.panels.length);
  const parts = [
    STYLE,
    `Issue #${issue.issueNumber} "${issue.title}" (${issue.slug}), page ${page.pageNumber} of ${issue.pages.length}.`,
    roleHint(page.role, page.title),
    layoutHint(page.layout, panelCount),
    page.artAlt ? `Scene: ${page.artAlt}.` : "",
    page.atmosphere ? `Atmosphere: ${page.atmosphere}.` : "",
    page.loreSidebar
      ? `Lore motif: ${page.loreSidebar.title} — ${page.loreSidebar.body}`
      : "",
    bubbleSummary(page),
    `Feature cast when relevant: ${castForIssue(issue)}.`,
    "Make it look like a real printed fantasy comic page with depth, acting, and environment — never a minimalist icon diagram.",
  ];
  return parts.filter(Boolean).join(" ");
}

type PromptJob = {
  id: string;
  issueSlug: string;
  pageNumber: number;
  role?: string;
  layout: string;
  title?: string;
  outputRelPath: string;
  aspectRatio: "3:4";
  prompt: string;
  referenceRelPaths: string[];
  status: "pending" | "generated" | "skipped_dedicated";
};

function refsForIssue(slug: string): string[] {
  const coverNum = String(
    COMIC_ISSUES.find((i) => i.slug === slug)?.issueNumber ?? 1,
  ).padStart(2, "0");
  const cover = `public/assets/comics/covers/${coverNum}-${slug === "the-traveling-circus" ? "traveling-circus" : slug === "the-merchants-secret" ? "merchants-secret" : slug}.png`;
  // Cover filenames are a bit irregular — resolve existing
  const coversDir = path.join(ROOT, "public/assets/comics/covers");
  const coverFile = fs.existsSync(coversDir)
    ? fs.readdirSync(coversDir).find((f) => f.includes(slug.replace(/^the-/, "").slice(0, 12)) || f.includes(slug))
    : null;
  const refs = [
    coverFile ? `public/assets/comics/covers/${coverFile}` : cover,
    "public/assets/cards/rise-of-the-rift/elara-venn/art.png",
    "public/assets/cards/rise-of-the-rift/bramblefox/art.webp",
    "public/assets/cards/rise-of-the-rift/mossprig/art.webp",
    "public/assets/npcs/riftwild-commons/elara-venn/full-body.png",
  ];
  return refs.filter((r) => fs.existsSync(path.join(ROOT, r)));
}

function jobsForIssue(issue: ComicIssue): PromptJob[] {
  const refs = refsForIssue(issue.slug);
  return issue.pages.map((page) => {
    const dedicated =
      Boolean(page.isKeyArt) ||
      page.layout === "splash" ||
      Boolean(page.artSrc?.includes("/covers/")) ||
      Boolean(page.artSrc?.includes("/splashes/"));
    return {
      id: `${issue.slug}-p${String(page.pageNumber).padStart(2, "0")}`,
      issueSlug: issue.slug,
      pageNumber: page.pageNumber,
      role: page.role,
      layout: page.layout,
      title: page.title,
      outputRelPath: `assets/comics/pages/${issue.slug}/page-${String(page.pageNumber).padStart(2, "0")}.webp`,
      aspectRatio: "3:4" as const,
      prompt: buildPrompt(issue, page),
      referenceRelPaths: refs,
      // Still generate plates for dedicated pages so folders are complete; reader may keep splash/cover.
      status: "pending" as const,
      dedicated,
    } as PromptJob & { dedicated?: boolean };
  });
}

function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const slugFilter = args[0];
  fs.mkdirSync(OUT, { recursive: true });

  const issues = slugFilter
    ? ([getComicIssue(slugFilter)].filter(Boolean) as ComicIssue[])
    : COMIC_ISSUES;

  if (!issues.length) {
    console.error(`No issue for slug: ${slugFilter}`);
    process.exit(1);
  }

  const manifestPath = path.join(OUT, "manifest.json");
  const manifest: Record<string, { total: number; pending: number; generated: number }> = fs.existsSync(
    manifestPath,
  )
    ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    : {};

  for (const issue of issues) {
    const jobs = jobsForIssue(issue);
    const jsonPath = path.join(OUT, `${issue.slug}.json`);
    const mdPath = path.join(OUT, `${issue.slug}.md`);
    fs.writeFileSync(jsonPath, JSON.stringify(jobs, null, 2), "utf8");
    const md = [
      `# ${issue.title} — illustrated page prompts`,
      ``,
      `${jobs.length} pages · slug \`${issue.slug}\``,
      ``,
      ...jobs.map(
        (j, i) =>
          `## ${i + 1}. Page ${j.pageNumber} (${j.role ?? "story"} / ${j.layout})\n\n- **Out:** \`public/${j.outputRelPath}\`\n- **Refs:** ${j.referenceRelPaths.join(", ") || "none"}\n\n\`\`\`\n${j.prompt}\n\`\`\`\n`,
      ),
    ].join("\n");
    fs.writeFileSync(mdPath, md, "utf8");
    manifest[issue.slug] = {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === "pending").length,
      generated: 0,
    };
    console.log(`wrote ${jobs.length} prompts → ${path.relative(ROOT, jsonPath)}`);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`manifest → ${path.relative(ROOT, manifestPath)}`);
}

main();
