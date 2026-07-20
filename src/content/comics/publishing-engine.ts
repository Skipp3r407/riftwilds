/**
 * Riftwilds Comic Publishing Engine — issue assembly.
 * Wraps story beats with publisher-grade front / back matter (~30–40 page books).
 * Does not delete or replace working story pages — only frames them.
 */

import { PAGE_ART } from "@/content/comics/art";
import { resolveCanonHref } from "@/content/comics/canon-links";
import { issuePageArtSrc } from "@/content/comics/page-builder";
import { arcForIssue, volumeForIssue } from "@/content/comics/story-arcs";
import type {
  ComicBubble,
  ComicCover,
  ComicIssue,
  ComicIssueMeta,
  ComicPage,
  ComicPageRole,
  ComicPanel,
  ComicPanelFrame,
  ComicPanelLayout,
  CoverVariantKind,
} from "@/content/comics/types";

/** Original fantasy SFX lexicon — never Marvel/DC proprietary onomatopoeia. */
export const RIFTWILDS_SFX = [
  "KRRRAAAK",
  "FWOOOM",
  "THRUMMM",
  "SHIIING",
  "GROOOWL",
  "CRACKLE-VASH",
  "WHUMP",
  "RIFT-HUMMM",
  "LEAF-SNAP",
  "SHELL-SONG",
] as const;

const VARIANT_LABELS: Record<CoverVariantKind, string> = {
  standard: "Standard",
  "variant-a": "Cover A",
  "variant-b": "Cover B",
  anniversary: "Anniversary",
  foil: "Foil",
  animated: "Animated",
  founder: "Founder",
  seasonal: "Seasonal",
};

/** Expand cover list to full publisher variant set (art may stub to standard). */
export function expandCoverVariants(
  title: string,
  standardSrc: string,
  existing?: ComicCover[],
): ComicCover[] {
  const byKind = new Map((existing ?? []).map((c) => [c.kind, c]));
  const kinds: CoverVariantKind[] = [
    "standard",
    "variant-a",
    "variant-b",
    "anniversary",
    "foil",
    "animated",
    "founder",
    "seasonal",
  ];
  return kinds.map((kind) => {
    const prev = byKind.get(kind);
    if (prev) return prev;
    return {
      kind,
      src: standardSrc,
      label: `${title} — ${VARIANT_LABELS[kind]}`,
      unlockHint:
        kind === "standard"
          ? undefined
          : kind === "foil"
            ? "Find all lore hotspots (cosmetic stub)"
            : kind === "founder"
              ? "Founder pack cosmetic (never required for story)"
              : kind === "seasonal"
                ? "Seasonal event cosmetic stub"
                : kind === "animated"
                  ? "Animated cover stub — foil shimmer hook"
                  : "Finish the issue to unlock (stub)",
      animatedSrc: kind === "animated" ? standardSrc : undefined,
      foilIntensity: kind === "foil" ? 0.85 : undefined,
    };
  });
}

const LAYOUT_FRAMES: Record<ComicPanelLayout, ComicPanelFrame[]> = {
  splash: [{ x: 0, y: 0, w: 100, h: 100, impact: "rift-flare" }],
  wide: [{ x: 0, y: 0, w: 100, h: 100 }],
  narrative: [{ x: 0, y: 0, w: 100, h: 100 }],
  lore: [{ x: 0, y: 0, w: 100, h: 100 }],
  end: [{ x: 0, y: 0, w: 100, h: 100 }],
  spread: [{ x: 0, y: 0, w: 100, h: 100, impact: "speed-lines" }],
  "two-col": [
    { x: 1, y: 2, w: 48, h: 96 },
    { x: 51, y: 2, w: 48, h: 96 },
  ],
  "three-stack": [
    { x: 2, y: 1, w: 96, h: 31 },
    { x: 2, y: 34, w: 96, h: 31 },
    { x: 2, y: 67, w: 96, h: 31 },
  ],
  "grid-2x2": [
    { x: 1, y: 1, w: 48, h: 48 },
    { x: 51, y: 1, w: 48, h: 48 },
    { x: 1, y: 51, w: 48, h: 48 },
    { x: 51, y: 51, w: 48, h: 48 },
  ],
  "grid-3": [
    { x: 1, y: 1, w: 32, h: 98 },
    { x: 34, y: 1, w: 32, h: 98 },
    { x: 67, y: 1, w: 32, h: 98 },
  ],
};

export function framesForLayout(layout: ComicPanelLayout, count: number): ComicPanelFrame[] {
  const preset = LAYOUT_FRAMES[layout] ?? LAYOUT_FRAMES.narrative;
  if (count <= preset.length) return preset.slice(0, count);
  // Fall back: stack extras as equal rows
  const h = 100 / count;
  return Array.from({ length: count }, (_, i) => ({
    x: 2,
    y: i * h + 1,
    w: 96,
    h: h - 2,
  }));
}

export function ensurePanelFrames(page: ComicPage): ComicPage {
  const frames = framesForLayout(page.layout, page.panels.length);
  return {
    ...page,
    panels: page.panels.map((p, i) => ({
      ...p,
      frame: p.frame ?? frames[i] ?? { x: 0, y: 0, w: 100, h: 100 },
      focusId: p.focusId ?? `${page.id}-focus-${i}`,
    })),
  };
}

function roleFromLayout(layout: ComicPanelLayout, explicit?: ComicPageRole): ComicPageRole {
  if (explicit) return explicit;
  if (layout === "splash") return "splash";
  if (layout === "spread") return "spread";
  if (layout === "end") return "end";
  if (layout === "lore") return "story";
  return "story";
}

function matterPage(
  slug: string,
  role: ComicPageRole,
  title: string,
  artSrc: string,
  bubbles: ComicBubble[],
  opts?: { atmosphere?: ComicPanel["atmosphere"]; layout?: ComicPanelLayout },
): Omit<ComicPage, "id" | "pageNumber"> {
  return {
    layout: opts?.layout ?? (role === "splash" ? "splash" : "narrative"),
    role,
    title,
    artSrc,
    atmosphere: opts?.atmosphere ?? "dusk",
    isKeyArt: role === "front-cover" || role === "splash",
    panels: [
      {
        id: `${slug}-${role}-panel`,
        artSrc,
        atmosphere: opts?.atmosphere ?? "dusk",
        bubbles,
      },
    ],
  };
}

/** Build publisher front matter (cover → recap). */
export function buildFrontMatter(meta: ComicIssueMeta): ComicPage[] {
  const coverArt = meta.covers.find((c) => c.kind === "standard")?.src ?? PAGE_ART.commons;
  const slug = meta.slug;
  const cast = meta.characters
    .slice(0, 4)
    .map((c) => c.name)
    .join(" · ");

  const pages: Omit<ComicPage, "id" | "pageNumber">[] = [
    matterPage(
      slug,
      "front-cover",
      meta.title,
      coverArt,
      [
        { kind: "caption", text: `Legends of the Rift · Issue #${meta.issueNumber}` },
        { kind: "narration", text: meta.subtitle, x: 50, y: 78 },
      ],
      { atmosphere: "rift", layout: "splash" },
    ),
    matterPage(
      slug,
      "inside-cover",
      "Inside cover",
      coverArt,
      [
        {
          kind: "caption",
          text: "Riftwilds Comic Publishing — original fantasy. No crypto required to read.",
        },
        {
          kind: "narration",
          text: "Credits & cosmetics may unlock along the way. The story itself stays free.",
        },
      ],
      { atmosphere: "night" },
    ),
    matterPage(
      slug,
      "title",
      meta.title,
      coverArt,
      [
        { kind: "caption", text: `Issue #${meta.issueNumber}` },
        { kind: "narration", text: meta.synopsis },
        { kind: "speech", speaker: "Series", text: cast || "Keepers of the Commons", x: 50, y: 72 },
      ],
      { atmosphere: "dawn" },
    ),
    matterPage(
      slug,
      "credits",
      "Credits",
      PAGE_ART.commonsDusk ?? PAGE_ART.commons,
      [
        { kind: "caption", text: "Story · Riftwilds Lore Desk" },
        { kind: "caption", text: "Art · Commons Archive (official plates)" },
        { kind: "caption", text: "Lettering · Publishing Engine" },
        {
          kind: "narration",
          text: "Canon alignment: World Codex · Riftling Codex · Legends of the Rift TCG.",
        },
      ],
      { atmosphere: "dusk" },
    ),
    matterPage(
      slug,
      "recap",
      "Previously in the Riftwilds…",
      PAGE_ART.rift ?? coverArt,
      [
        {
          kind: "narration",
          text:
            meta.issueNumber === 1
              ? "Aeryndra's Prime Gateway failed. Layered roads learned to rewrite themselves. A courier carried a warm egg toward mud that would become the Commons."
              : `After Issue #${meta.issueNumber - 1}, Keepers still walk Fracture roads. Bonds deepen. Shadows listen.`,
        },
        {
          kind: "caption",
          text: meta.timelineNote ?? "Age of First Eggs — Keepers' Road.",
        },
      ],
      { atmosphere: "rift" },
    ),
  ];

  return pages.map((p, i) => ({
    ...p,
    id: `${slug}-front-${String(i + 1).padStart(2, "0")}`,
    pageNumber: i + 1,
  }));
}

/** Build publisher back matter (profiles → ads → teaser → letters → back cover). */
export function buildBackMatter(meta: ComicIssueMeta, startPage: number): ComicPage[] {
  const coverArt = meta.covers.find((c) => c.kind === "standard")?.src ?? PAGE_ART.commons;
  const slug = meta.slug;
  const next = meta.nextIssueTeaser;
  const profileBubbles: ComicBubble[] = meta.characters.slice(0, 4).flatMap((c, i) => {
    const href = c.canonLink ? resolveCanonHref(c.canonLink) : null;
    return [
      {
        kind: "speech" as const,
        speaker: c.name,
        text: `${c.role} — ${c.blurb}`,
        x: i % 2 === 0 ? 28 : 72,
        y: 22 + i * 16,
        tail: "down" as const,
        canonLink: c.canonLink,
      },
      ...(href
        ? [
            {
              kind: "caption" as const,
              text: `Open: ${href}`,
              x: 50,
              y: 88,
            },
          ]
        : []),
    ];
  });

  const draft: Omit<ComicPage, "id" | "pageNumber">[] = [
    matterPage(
      slug,
      "profile",
      "Keeper & Companion Profiles",
      PAGE_ART.forest ?? coverArt,
      profileBubbles.length
        ? profileBubbles
        : [{ kind: "narration", text: "Profiles load from issue cast." }],
      { atmosphere: "day" },
    ),
    matterPage(
      slug,
      "map",
      "Map of the Fracture Roads",
      PAGE_ART.layeredRuin ?? coverArt,
      [
        {
          kind: "narration",
          text: "Paths rewrite overnight. Marked sites: Commons · Hatchery · Gateway shards · Festival lantern ring.",
        },
        ...meta.locations.slice(0, 3).map((l, i) => ({
          kind: "caption" as const,
          text: `${l.name}: ${l.blurb}`,
          x: 50,
          y: 40 + i * 14,
        })),
      ],
      { atmosphere: "ruin" },
    ),
    matterPage(
      slug,
      "ad",
      "Commons Notice Board",
      PAGE_ART.festival ?? coverArt,
      [
        {
          kind: "shout",
          speaker: "Crier",
          text: "WAYBREAD FAIR — two loaves, one story!",
          x: 50,
          y: 28,
        },
        {
          kind: "caption",
          text: "Fake Riftwilds ad · Visit the Hatchery Compact · Credits welcome, crypto never required for reading.",
        },
        {
          kind: "sfx",
          text: "THRUMMM",
          x: 70,
          y: 70,
        },
      ],
      { atmosphere: "festival" },
    ),
    matterPage(
      slug,
      "teaser",
      next ? "Next issue" : "The road continues",
      coverArt,
      [
        {
          kind: "caption",
          text: next
            ? `Next: ${next.slug.replace(/-/g, " ")}`
            : "Next issue brewing in the Archive…",
        },
        {
          kind: "narration",
          text: next?.hook ?? "Keep your bookmark warm. The Fracture is not finished with you.",
        },
        {
          kind: "speech",
          speaker: "Archive Keeper",
          text: "Tease cards in the Codex. Build the bond in Deck Atelier.",
          x: 40,
          y: 68,
          tail: "up",
        },
      ],
      { atmosphere: "night" },
    ),
    matterPage(
      slug,
      "letters",
      "Letters from the Commons",
      PAGE_ART.commons ?? coverArt,
      [
        {
          kind: "caption",
          text: "Dear Archive — My Bramblefox used Forest Bond on a scarecrow. Is that allowed?",
        },
        {
          kind: "narration",
          text: "Archive replies: Bonds are for living hearts. Scarecrows get a polite leaf-pat and a comic reread.",
        },
        {
          kind: "whisper",
          speaker: "Mossprig",
          text: "*soft rustle of approval*",
          x: 30,
          y: 72,
        },
      ],
      { atmosphere: "dusk" },
    ),
    matterPage(
      slug,
      "back-cover",
      meta.title,
      coverArt,
      [
        {
          kind: "caption",
          text: `Legends of the Rift #${meta.issueNumber}`,
        },
        {
          kind: "narration",
          text: "Official Riftwilds comic · Unlock Codex · Tease cards · Never P2W story gates.",
        },
      ],
      { atmosphere: "rift", layout: "splash" },
    ),
  ];

  return draft.map((p, i) => ({
    ...ensurePanelFrames({
      ...p,
      id: `${slug}-back-${String(i + 1).padStart(2, "0")}`,
      pageNumber: startPage + i,
    }),
  }));
}

export type PublishOptions = {
  /** Include front matter pages (default true) */
  frontMatter?: boolean;
  /** Include back matter pages (default true) */
  backMatter?: boolean;
  /** Cap total pages after assembly */
  maxPages?: number;
};

/**
 * Publish an issue: expand covers, stamp arc/volume, wrap story with matter,
 * ensure panel frames + reading roles. Idempotent if pages already have roles.
 */
export function publishIssue(issue: ComicIssue, opts?: PublishOptions): ComicIssue {
  const frontMatter = opts?.frontMatter !== false;
  const backMatter = opts?.backMatter !== false;
  const maxPages = opts?.maxPages ?? 42;

  const standardSrc =
    issue.covers.find((c) => c.kind === "standard")?.src ?? PAGE_ART.commons;
  const covers = expandCoverVariants(issue.title, standardSrc, issue.covers);
  const arc = arcForIssue(issue.slug);
  const volume = volumeForIssue(issue.slug);

  // Detect if already published (has front-cover role)
  const alreadyFramed = issue.pages.some((p) => p.role === "front-cover");

  let storyPages = issue.pages.map((p) =>
    ensurePanelFrames({
      ...p,
      role: roleFromLayout(p.layout, p.role),
    }),
  );

  // Strip prior matter if re-publishing from a fully framed book
  if (alreadyFramed) {
    storyPages = storyPages.filter(
      (p) =>
        p.role === "story" ||
        p.role === "splash" ||
        p.role === "spread" ||
        p.role === "end" ||
        !p.role,
    );
  }

  const meta: ComicIssueMeta = {
    ...issue,
    covers,
    arcId: issue.arcId ?? arc?.id,
    volumeId: issue.volumeId ?? volume?.id,
    expansionId: issue.expansionId ?? arc?.expansionId ?? "exp-legends-core",
    unlockGates: issue.unlockGates ?? [{ kind: "free" }],
    nextIssueTeaser:
      issue.nextIssueTeaser ??
      (nextTeaserFor(issue.issueNumber)
        ? nextTeaserFor(issue.issueNumber)
        : undefined),
    collectibles: mergeCoverCollectibles(issue),
  };

  const front = frontMatter ? buildFrontMatter(meta) : [];
  const back = backMatter ? buildBackMatter(meta, 1) : [];

  // End pages from story stay before publisher back matter
  const storyCore = storyPages.filter((p) => p.role !== "end");
  const endPages = storyPages.filter((p) => p.role === "end" || p.layout === "end");

  let assembled: ComicPage[] = [
    ...front.map(ensurePanelFrames),
    ...storyCore,
    ...endPages.map(ensurePanelFrames),
    ...back,
  ];

  if (assembled.length > maxPages) {
    // Prefer keeping front + story + teaser/back-cover; trim ads/letters first
    const trimRoles: ComicPageRole[] = ["ad", "letters", "map"];
    for (const role of trimRoles) {
      if (assembled.length <= maxPages) break;
      assembled = assembled.filter((p) => p.role !== role);
    }
    assembled = assembled.slice(0, maxPages);
  }

  // Prefer unique plate paths for matter pages that aren't key art
  assembled = assembled.map((p, i) => {
    const pageNumber = i + 1;
    const keepArt =
      p.isKeyArt ||
      p.role === "front-cover" ||
      p.role === "back-cover" ||
      p.role === "splash" ||
      Boolean(p.artSrc?.includes("/covers/")) ||
      Boolean(p.artSrc?.includes("/splashes/"));
    const artSrc = keepArt
      ? (p.artSrc ?? issuePageArtSrc(issue.slug, pageNumber))
      : issuePageArtSrc(issue.slug, pageNumber);
    return {
      ...p,
      id: `${issue.slug}-p${String(pageNumber).padStart(2, "0")}`,
      pageNumber,
      artSrc,
      panels: p.panels.map((panel) => ({
        ...panel,
        artSrc: keepArt ? (panel.artSrc ?? artSrc) : artSrc,
      })),
    };
  });

  return {
    ...meta,
    readingTimeMinutes: Math.max(8, Math.round(assembled.length * 0.45)),
    pages: assembled,
  };
}

function nextTeaserFor(
  issueNumber: number,
): { slug: string; hook: string } | undefined {
  const teasers: Record<number, { slug: string; hook: string }> = {
    1: {
      slug: "sparks-journey",
      hook: "A spark chooses a path — and a Keeper learns what 'bond' costs.",
    },
    2: {
      slug: "the-traveling-circus",
      hook: "Tents arrive before the roads finish writing themselves.",
    },
    3: {
      slug: "the-lost-city",
      hook: "Stone remembers a sky that never learned to forget.",
    },
    4: {
      slug: "the-storm-king",
      hook: "Thunder wears a crown. Keepers bring lanterns.",
    },
    5: {
      slug: "the-merchants-secret",
      hook: "Every fair price hides a quieter ledger.",
    },
    6: {
      slug: "the-traitors-gate",
      hook: "The Keeper has the egg. Proceed to the next gate.",
    },
    7: {
      slug: "the-forge-of-rifts",
      hook: "Beyond the Gate waits a machine that made the First Rift possible.",
    },
    8: {
      slug: "the-riftwright",
      hook: "So… after all this time… someone finally reached my Forge.",
    },
    9: {
      slug: "festival-of-lights",
      hook: "Lanterns rise. Shadows learn new names.",
    },
  };
  return teasers[issueNumber];
}

function mergeCoverCollectibles(issue: ComicIssueMeta) {
  const kinds: CoverVariantKind[] = [
    "standard",
    "variant-a",
    "variant-b",
    "anniversary",
    "foil",
    "animated",
    "founder",
    "seasonal",
  ];
  const existing = new Map(
    issue.collectibles.filter((c) => c.coverKind).map((c) => [c.coverKind!, c]),
  );
  const coverCollectibles = kinds.map((kind) => {
    const prev = existing.get(kind);
    if (prev) return prev;
    return {
      id: `${issue.slug}-cover-${kind}`,
      kind: "cover" as const,
      label: `${VARIANT_LABELS[kind]} cover`,
      description: `${VARIANT_LABELS[kind]} collectible cover (art may stub).`,
      coverKind: kind,
    };
  });
  const nonCover = issue.collectibles.filter((c) => !c.coverKind);
  return [...coverCollectibles, ...nonCover];
}

/** Studio / admin: summarize an issue for the publishing dashboard. */
export function summarizeIssueForStudio(issue: ComicIssue) {
  const roles = issue.pages.reduce<Record<string, number>>((acc, p) => {
    const r = p.role ?? "story";
    acc[r] = (acc[r] ?? 0) + 1;
    return acc;
  }, {});
  const bubbleKinds = new Set<string>();
  let bubbleCount = 0;
  let hotspotCount = 0;
  let canonLinks = 0;
  for (const page of issue.pages) {
    hotspotCount += page.hotspots?.length ?? 0;
    for (const panel of page.panels) {
      for (const b of panel.bubbles) {
        bubbleCount += 1;
        bubbleKinds.add(b.kind);
        if (b.canonLink) canonLinks += 1;
      }
      if (panel.canonLink) canonLinks += 1;
    }
    for (const h of page.hotspots ?? []) {
      if (h.canonLink || h.codexEntryId) canonLinks += 1;
    }
  }
  return {
    slug: issue.slug,
    issueNumber: issue.issueNumber,
    title: issue.title,
    status: issue.status,
    pageCount: issue.pages.length,
    coverCount: issue.covers.length,
    roles,
    bubbleCount,
    bubbleKinds: [...bubbleKinds],
    hotspotCount,
    canonLinks,
    arcId: issue.arcId,
    volumeId: issue.volumeId,
    unlockGates: issue.unlockGates ?? [{ kind: "free" as const }],
  };
}
