/**
 * Legends of the Rift — official ten-issue catalog.
 * Aligns with docs/story/STORY_BIBLE.md (Aeryndra, Fracture, Elara, Commons).
 */

import { COVER, PAGE_ART, SPLASH, WALLPAPERS } from "@/content/comics/art";
import {
  buildEndPages,
  caption,
  ensureIssueArt,
  expandBeatsToPages,
  narrate,
  sfx,
  speech,
  thought,
  type Beat,
} from "@/content/comics/page-builder";
import type { ComicIssue, ComicIssueMeta } from "@/content/comics/types";
import { estimateReadingTimeMinutes } from "@/lib/comics/navigation";

function covers(slug: keyof typeof COVER, title: string) {
  return [
    { kind: "standard" as const, src: COVER[slug], label: `${title} — Standard` },
    {
      kind: "anniversary" as const,
      src: COVER[slug],
      label: `${title} — Anniversary`,
      unlockHint: "Finish the issue to unlock (stub)",
    },
    {
      kind: "foil" as const,
      src: COVER[slug],
      label: `${title} — Foil`,
      unlockHint: "Find all lore hotspots (stub)",
    },
  ];
}

function baseRewards(issueNumber: number) {
  return [
    {
      id: `rw-issue-${issueNumber}-badge`,
      label: `Issue #${issueNumber} Badge`,
      description: "Cosmetic badge for finishing this issue.",
      kind: "badge" as const,
      creditsStub: 8,
    },
    {
      id: `rw-issue-${issueNumber}-frame`,
      label: `Issue #${issueNumber} Frame`,
      description: "Comic panel frame for galleries.",
      kind: "frame" as const,
    },
  ];
}

type IssueSeed = Omit<ComicIssueMeta, "readingTimeMinutes" | "covers" | "rewards" | "collectibles"> & {
  coverKey: keyof typeof COVER;
  beats: Beat[];
  minPages?: number;
};

function buildIssue(seed: IssueSeed): ComicIssue {
  const coversList = covers(seed.coverKey, seed.title);
  const meta: ComicIssueMeta = {
    slug: seed.slug,
    issueNumber: seed.issueNumber,
    title: seed.title,
    subtitle: seed.subtitle,
    synopsis: seed.synopsis,
    publishedAt: seed.publishedAt,
    readingTimeMinutes: 12,
    status: seed.status,
    covers: coversList,
    tags: seed.tags,
    playChapterHref: seed.playChapterHref,
    playChapterLabel: seed.playChapterLabel,
    worldEventKey: seed.worldEventKey,
    worldEventHref: seed.worldEventHref,
    collectibles: [
      {
        id: `${seed.slug}-cover-std`,
        kind: "cover",
        label: "Standard cover",
        description: "Default series cover.",
        coverKind: "standard",
      },
      {
        id: `${seed.slug}-cover-ann`,
        kind: "cover",
        label: "Anniversary variant",
        description: "Celebratory ink wash variant (stub).",
        coverKind: "anniversary",
      },
      {
        id: `${seed.slug}-cover-foil`,
        kind: "cover",
        label: "Foil variant",
        description: "Cyan-foil collector cover (stub).",
        coverKind: "foil",
      },
    ],
    rewards: baseRewards(seed.issueNumber),
    hasCommunityVote: seed.hasCommunityVote,
    votePrompt: seed.votePrompt,
    voteOptions: seed.voteOptions,
    characters: seed.characters,
    locations: seed.locations,
    timelineNote: seed.timelineNote,
    factions: seed.factions,
    commentary: seed.commentary,
    conceptArtSrcs: seed.conceptArtSrcs,
    wallpaperSrcs: seed.wallpaperSrcs,
  };

  const coverArt = coversList.find((c) => c.kind === "standard")?.src ?? COVER[seed.coverKey];
  const storyPages = expandBeatsToPages(seed.slug, seed.beats, {
    minPages: seed.minPages ?? 22,
    maxPages: 34,
    fallbackArt: coverArt,
  });
  const endPages = buildEndPages(meta, storyPages.length + 1);
  const pages = ensureIssueArt(
    [...storyPages, ...endPages].map((p, i) => ({
      ...p,
      pageNumber: i + 1,
      id: `${seed.slug}-p${String(i + 1).padStart(2, "0")}`,
    })),
    coverArt,
  );

  return {
    ...meta,
    readingTimeMinutes: estimateReadingTimeMinutes(pages.length),
    pages,
  };
}

const SEEDS: IssueSeed[] = [
  {
    coverKey: "the-first-rift",
    slug: "the-first-rift",
    issueNumber: 1,
    title: "The First Rift",
    subtitle: "When the Prime broke, a courier chose to keep.",
    synopsis:
      "Elara Venn carries a damaged egg through the Fracture's first nights and names the path of keeping at the Riftstone.",
    publishedAt: "2026-01-12",
    status: "published",
    tags: ["origin", "elara", "fracture", "commons"],
    playChapterHref: "/live-world",
    playChapterLabel: "Enter Live World — Commons",
    characters: [
      { name: "Elara Venn", role: "First Keeper", blurb: "Courier who refused a crown and kept an egg." },
      { name: "First Riftling", role: "Companion", blurb: "Living archive born from Soft Exodus fragment." },
    ],
    locations: [
      { name: "Riftwild Commons", blurb: "Refuge around the Prime shard — the Riftstone." },
      { name: "Fracture roads", blurb: "Layered paths that rewrite themselves overnight." },
    ],
    timelineNote: "Age of First Eggs → Founding of the Commons.",
    factions: [{ name: "Commons Keepers", blurb: "Care before conquest." }],
    commentary: [
      "Issue #1 retells About-canon without overwriting quest keys.",
      "Hidden glyph on page 7 unlocks World Codex: The Fracture.",
    ],
    conceptArtSrcs: [PAGE_ART.timelineGateways, PAGE_ART.storyFirstLight],
    wallpaperSrcs: [WALLPAPERS.rift],
    hasCommunityVote: true,
    votePrompt: "What should Elara's next courier route emphasize?",
    voteOptions: [
      { id: "vote-care", label: "Care first", blurb: "More hatchery ethics scenes next arc." },
      { id: "vote-explore", label: "Exploration", blurb: "Push toward unmapped Gateway paths." },
    ],
    beats: [
      {
        kind: "splash",
        title: "The sky tears",
        artSrc: SPLASH.riftDawn,
        artAlt: "Cyan rift opening over warm Commons plaza at dawn",
        atmosphere: "rift",
        narration:
          "Aeryndra's Prime Gateway screamed once — then the world learned how to layer.",
        isKeyArt: true,
        hotspots: [
          {
            id: "hs-first-rift-glyph",
            label: "Fracture glyph",
            x: 72,
            y: 18,
            w: 14,
            h: 12,
            codexEntryId: "wl-fracture",
            secretCode: "FIRST-LIGHT-01",
            rewardId: "rw-lore-seeker",
            hint: "A cyan mark pulses in the upper tear…",
          },
        ],
      },
      {
        kind: "scene",
        atmosphere: "dusk",
        artSrc: PAGE_ART.regionCommons,
        panels: [
          {
            caption: "Nine days before the Commons had a name",
            bubbles: [
              narrate("Roads crossed deserts that had never met forests.", { x: 50, y: 10 }),
              speech("Elara Venn", "The egg is warm. That is enough to keep walking.", {
                x: 28,
                y: 34,
                tail: "down",
              }),
              sfx("rift-crack…", { x: 62, y: 58 }),
            ],
          },
          {
            bubbles: [
              thought("Elara Venn", "If I name myself hero, I will fail the small thing in my arms.", {
                x: 24,
                y: 62,
                tail: "up-right",
              }),
              speech("Stranger", "Take the crown road — safer.", {
                x: 74,
                y: 30,
                tail: "down-left",
              }),
              speech("Elara Venn", "Safer for whom?", {
                x: 32,
                y: 74,
                tail: "up",
              }),
            ],
          },
        ],
      },
      {
        kind: "dialogue",
        atmosphere: "night",
        artSrc: PAGE_ART.rift,
        lines: [
          narrate("She shared waybread with a child who had lost a name."),
          speech("Elara Venn", "Call the creature yours to keep — not yours to own."),
          caption("Codex echo: Waybread on the First Night"),
          sfx("soft crack — shell-song"),
        ],
        hotspots: [
          {
            id: "hs-elara-book",
            label: "Waybread scrap",
            x: 20,
            y: 70,
            w: 16,
            h: 14,
            codexEntryId: "wl-book-waybread",
            hint: "A crust of bread hides a margin note.",
          },
        ],
      },
      {
        kind: "lore",
        title: "Gateway Hearts",
        body: "Hearts were living cores. Stones are travel shards. The Commons Riftstone is a fragment of the Prime — maps of places not yet found.",
        atmosphere: "rift",
      },
      {
        kind: "splash",
        title: "The Riftstone claims mud",
        artSrc: PAGE_ART.storyFirstLight,
        artAlt: "First rift light over founding Commons",
        atmosphere: "dawn",
        narration: "Farmers, healers, and Keepers gathered where stable paths still intersected.",
        developerNote: "BTS: warm earth first — cyan only on the crystal.",
      },
      {
        kind: "scene",
        layout: "grid-2x2",
        atmosphere: "day",
        artSrc: PAGE_ART.commons,
        panels: [
          {
            bubbles: [
              speech("Mira (young)", "Is it… looking at me?"),
              speech("Elara Venn", "It is remembering the world. Help it stay gentle."),
            ],
          },
          {
            bubbles: [
              sfx("HATCH—!"),
              narrate("The Soft Exodus had closed into eggs. Battle culture would come later."),
            ],
          },
          {
            bubbles: [
              speech("Village elder", "What do we call you?"),
              speech("Elara Venn", "Courier. Keeper, if the egg agrees."),
            ],
          },
          {
            bubbles: [
              caption("Secret symbol: FIRST-LIGHT-01"),
              thought("First Riftling", "…keep…"),
            ],
          },
        ],
        loreSidebar: {
          title: "Original IP note",
          body: "Riftlings are living archives — not weapons-first. Preservation before prowess.",
        },
      },
      {
        kind: "dialogue",
        atmosphere: "festival",
        artSrc: PAGE_ART.regionCommons,
        lines: [
          narrate("Years soft-shifted. Elara's bond slowed her aging — Spirit bleed, not magic vanity."),
          speech("Elara Venn", "New Keepers still arrive with empty hands and full fear."),
          speech("Elara Venn", "Good. Fear means they noticed the egg is becoming."),
          caption("Play this chapter in Live World when you are ready."),
        ],
      },
    ],
  },
  {
    coverKey: "sparks-journey",
    slug: "sparks-journey",
    issueNumber: 2,
    title: "Spark's Journey",
    subtitle: "A Glowpup learns the road between hatchery and heart.",
    synopsis:
      "Spark, a curious Glowpup, leaves the hatchery under Compact law and discovers that consent travels farther than force.",
    publishedAt: "2026-01-26",
    status: "published",
    tags: ["riftling", "hatchery", "spark"],
    playChapterHref: "/hatchery",
    playChapterLabel: "Visit the Hatchery",
    characters: [
      { name: "Spark", role: "Glowpup", blurb: "Cyan-amber spark companion learning invitations." },
      { name: "Mira Eggwarden", role: "Mentor", blurb: "Protects eggs like promises." },
    ],
    locations: [
      { name: "Commons Hatchery", blurb: "Compact law: invite, wait, keep the invitation honest." },
      { name: "Elderwood fringe", blurb: "Sproutfall trails and soft tutorial light." },
    ],
    timelineNote: "Hatchery Compact era.",
    commentary: ["Avatar reward stub unlocks on completion."],
    wallpaperSrcs: [WALLPAPERS.commons],
    beats: [
      {
        kind: "splash",
        title: "Spark wakes",
        artSrc: SPLASH.sparkPath,
        artAlt: "Glowpup on a mossy forest path at golden hour",
        atmosphere: "day",
        narration: "Eggs are becoming, not inventory.",
        hotspots: [
          {
            id: "hs-spark-compact",
            label: "Compact seal",
            x: 12,
            y: 60,
            w: 12,
            h: 12,
            codexEntryId: "wl-hatchery-compact",
            secretCode: "SPARK-CONSENT",
            hint: "A wax seal glints on a fallen leaf.",
          },
        ],
      },
      {
        kind: "scene",
        atmosphere: "day",
        artSrc: PAGE_ART.forest,
        panels: [
          {
            bubbles: [
              speech("Mira Eggwarden", "If it backs away, you back away. That is Compact."),
              speech("Spark", "yip!"),
              sfx("soft padding"),
            ],
          },
          {
            bubbles: [
              narrate("Credits buy supplies. Consent is not for sale."),
              thought("Keeper trainee", "I wanted a partner. Spark wanted a listener."),
            ],
          },
        ],
      },
      {
        kind: "dialogue",
        atmosphere: "dawn",
        artSrc: PAGE_ART.regionElderwood,
        lines: [
          narrate("On the Elderwood fringe, Spark chased a mote of rift-dust — then stopped."),
          speech("Spark", "…?"),
          speech("Elara Venn", "Good. Curiosity that can pause is Keeper-shaped."),
          sfx("chiming leaves"),
        ],
      },
      {
        kind: "lore",
        title: "Riftling etiquette",
        body: "Bond is invitation. Forced hatching breaks Compact and scars the archive within.",
        atmosphere: "day",
      },
      {
        kind: "scene",
        layout: "three-stack",
        atmosphere: "dusk",
        artSrc: PAGE_ART.commons,
        panels: [
          { bubbles: [speech("Market kid", "Can it do tricks?"), speech("Spark", "yip?")] },
          { bubbles: [speech("Keeper trainee", "It can choose. That is the trick.")] },
          { bubbles: [narrate("They walked home under amber lanterns — equals in patience.")] },
        ],
      },
    ],
  },
  {
    coverKey: "the-traveling-circus",
    slug: "the-traveling-circus",
    issueNumber: 3,
    title: "The Traveling Circus",
    subtitle: "Lantern wagons, honest raffles, and a plaza that remembers applause.",
    synopsis:
      "The Riftling Traveling Circus rolls into Commons — performers, pet tricks, and a live world event waiting for Keepers.",
    publishedAt: "2026-02-09",
    status: "published",
    tags: ["circus", "commons", "world-event"],
    playChapterHref: "/live-world",
    playChapterLabel: "Join the Circus event",
    worldEventKey: "traveling_circus",
    worldEventHref: "/live-world",
    characters: [
      { name: "Plaza Crier", role: "Ringmaster stub", blurb: "No SOL in the hat — only cheers and Credits." },
      { name: "Spark", role: "Guest act", blurb: "Optional cameo under Compact rules." },
    ],
    locations: [{ name: "Commons Plaza", blurb: "Festival weather, lost raffle tickets, confetti." }],
    timelineNote: "Present Awakening — seasonal / local events.",
    commentary: [
      "Live connection: Dynamic World Event key `traveling_circus`.",
      "See docs/comics/LIVE_CONNECTION.md",
    ],
    hasCommunityVote: true,
    votePrompt: "Which circus side-act should return next season?",
    voteOptions: [
      { id: "vote-acrobats", label: "Rift acrobats", blurb: "More aerial cyan ribbon acts." },
      { id: "vote-raffle", label: "Honest raffle", blurb: "Focus on community prize stubs." },
    ],
    beats: [
      {
        kind: "splash",
        title: "Wagons at dusk",
        artSrc: SPLASH.circus,
        artAlt: "Traveling circus lantern wagons arriving at Commons plaza",
        atmosphere: "festival",
        narration: "Lantern wagons rolled in — and the plaza remembered how to cheer.",
        hotspots: [
          {
            id: "hs-circus-ticket",
            label: "Lost raffle ticket",
            x: 40,
            y: 75,
            w: 14,
            h: 10,
            secretCode: "CIRCUS-APPLAUSE",
            rewardId: "rw-cover-collector",
            hint: "A ticket peeks from under a wagon wheel.",
          },
        ],
      },
      {
        kind: "scene",
        atmosphere: "festival",
        artSrc: PAGE_ART.festival,
        panels: [
          {
            bubbles: [
              speech("Plaza Crier", "Step right up! No SOL in the hat — only cheers, Credits, and confetti!"),
              sfx("BRASS FANFARE"),
            ],
          },
          {
            bubbles: [
              speech("Performer", "If your Riftling wants the stage, ask. Then wait."),
              thought("Keeper", "Compact law even under spotlights."),
            ],
          },
        ],
      },
      {
        kind: "dialogue",
        atmosphere: "night",
        artSrc: SPLASH.circus,
        lines: [
          narrate("Three acts. One recovered prop. Applause that counted as participation."),
          speech("Plaza Crier", "Play this chapter when the circus world event is live."),
          caption("World event → traveling_circus"),
          sfx("confetti pop!"),
        ],
      },
      {
        kind: "lore",
        title: "Festival weather",
        body: "clear_festival — a Dynamic World Event weather hint. Ambient band beds, denser NPC performers, lost tickets as treasure stubs.",
        atmosphere: "festival",
      },
      {
        kind: "scene",
        layout: "grid-2x2",
        atmosphere: "festival",
        artSrc: PAGE_ART.regionCommons,
        panels: [
          { bubbles: [speech("Kid", "Again!"), sfx("laughs")] },
          { bubbles: [speech("Spark", "yip-yip!")] },
          { bubbles: [narrate("A suspiciously honest raffle paid in cosmetics.")] },
          { bubbles: [caption("Easter egg: CIRCUS-APPLAUSE")] },
        ],
      },
    ],
  },
  {
    coverKey: "the-lost-city",
    slug: "the-lost-city",
    issueNumber: 4,
    title: "The Lost City",
    subtitle: "A layered ruin where forests still argue with deserts.",
    synopsis:
      "Keepers follow a Riftstone map into a Fracture-layered city and find a Gateway Heart that is not quite asleep.",
    publishedAt: "2026-02-23",
    status: "published",
    tags: ["exploration", "gateway", "ruins"],
    playChapterHref: "/world",
    playChapterLabel: "Open World Map",
    characters: [
      { name: "Archivist Solen", role: "Guide", blurb: "Celestora indexes in a travel satchel." },
      { name: "Pip Courier", role: "Scout", blurb: "Faster than fear, usually." },
    ],
    locations: [{ name: "Layered City", blurb: "Post-Fracture merge of stone, moss, and sand." }],
    timelineNote: "Age of Exploration.",
    beats: [
      {
        kind: "splash",
        title: "Streets that forget order",
        artSrc: SPLASH.lostCity,
        artAlt: "Ancient lost city ruins with Gateway Heart crystal",
        atmosphere: "ruin",
        narration: "The map showed a plaza that existed in three climates at once.",
        hotspots: [
          {
            id: "hs-lost-heart",
            label: "Heart shard",
            x: 48,
            y: 40,
            w: 12,
            h: 14,
            codexEntryId: "wl-aeryndra",
            secretCode: "LAYER-CITY",
            hint: "The crystal pulses when you look away.",
          },
        ],
      },
      {
        kind: "scene",
        atmosphere: "ruin",
        artSrc: PAGE_ART.rift,
        panels: [
          {
            bubbles: [
              speech("Pip Courier", "My satchel says north. My feet say sideways."),
              speech("Archivist Solen", "Both may be correct. Annotate, do not argue."),
              sfx("stone settle…"),
            ],
          },
          {
            bubbles: [
              narrate("Celestora tradition named living cores before crowns did."),
              thought("Keeper", "Hearts. Stones. Riftstone. Three words, one duty."),
            ],
          },
        ],
      },
      {
        kind: "dialogue",
        atmosphere: "dusk",
        artSrc: PAGE_ART.timelineGateways,
        lines: [
          speech("Gateway echo", "…who keeps the invitation…"),
          speech("Archivist Solen", "We do. If we are careful."),
          sfx("HUMMMMM"),
          caption("Secret: LAYER-CITY"),
        ],
      },
      {
        kind: "lore",
        title: "Celestora",
        body: "Not another world-name — a Radiant–Celestial scholarly tradition that studied living cores.",
        atmosphere: "dusk",
      },
    ],
  },
  {
    coverKey: "the-storm-king",
    slug: "the-storm-king",
    issueNumber: 5,
    title: "The Storm King",
    subtitle: "A highland trial where lightning learns manners.",
    synopsis:
      "Stormspire Keepers face a storm-affinity legend — not a cartoon villain, but a rival who believes force preserves better than patience.",
    publishedAt: "2026-03-09",
    status: "published",
    tags: ["storm", "rival", "peaks"],
    playChapterHref: "/live-world",
    playChapterLabel: "Travel toward Stormspire",
    characters: [
      { name: "Storm King", role: "Rival Keeper", blurb: "Moral complexity — preservation by control." },
      { name: "Voltkit", role: "Companion", blurb: "Storm-affinity spark with opinions." },
    ],
    locations: [{ name: "Stormspire Peaks", blurb: "Cyan rim light, amber village hearths below." }],
    hasCommunityVote: true,
    votePrompt: "Should the Storm King become ally, rival, or both?",
    voteOptions: [
      { id: "vote-ally", label: "Reluctant ally", blurb: "Join against a greater shadow." },
      { id: "vote-rival", label: "Ongoing rival", blurb: "Keep the highland duel thread." },
    ],
    beats: [
      {
        kind: "splash",
        title: "The peaks answer",
        artSrc: SPLASH.stormKing,
        artAlt: "Storm over highland cliffs with lightning cyan rim light",
        atmosphere: "storm",
        narration: "Thunder named a king. The Commons refused the coronation.",
      },
      {
        kind: "scene",
        atmosphere: "storm",
        artSrc: PAGE_ART.regionStorm,
        panels: [
          {
            bubbles: [
              speech("Storm King", "Patience loses eggs to weather."),
              speech("Elara Venn", "Force loses the thing inside the egg."),
              sfx("KRACK-BOOM"),
            ],
          },
          {
            bubbles: [
              narrate("Villains in Riftwilds carry reasons — still wrong when they break Compact."),
              thought("Keeper", "I came for a duel. I found a debate with lightning."),
            ],
          },
        ],
        hotspots: [
          {
            id: "hs-storm-rune",
            label: "Storm rune",
            x: 80,
            y: 22,
            w: 12,
            h: 12,
            secretCode: "STORM-KINDNESS",
            hint: "A rune hides in the cloud edge.",
          },
        ],
      },
      {
        kind: "dialogue",
        atmosphere: "night",
        artSrc: SPLASH.stormKing,
        lines: [
          speech("Storm King", "Meet me when the peaks clear — if your kindness still stands."),
          speech("Voltkit", "zzzt!"),
          caption("Quest unlock stub: STORM-KINDNESS"),
        ],
      },
      {
        kind: "lore",
        title: "Rival ethics",
        body: "Story bible antagonists carry moral complexity. The Storm King is a foil to Compact law — not a monster mask.",
        atmosphere: "storm",
      },
    ],
  },
  {
    coverKey: "the-merchants-secret",
    slug: "the-merchants-secret",
    issueNumber: 6,
    title: "The Merchant's Secret",
    subtitle: "Sealed crates, amber lanterns, and a ledger that glows cyan.",
    synopsis:
      "A night-market deal nearly sells a Heart shard as inventory — Keepers intervene without turning commerce into a crusade.",
    publishedAt: "2026-03-23",
    status: "published",
    tags: ["market", "mystery", "economy"],
    playChapterHref: "/marketplace",
    playChapterLabel: "Visit Marketplace",
    characters: [
      { name: "Serae Ledger", role: "Archivist-General", blurb: "Ink burns slower than wood — usually." },
      { name: "Hooded Merchant", role: "Antagonist stub", blurb: "Profits from Fracture leftovers." },
    ],
    locations: [{ name: "Commons Market", blurb: "Timber stalls, lantern light, sealed crates." }],
    beats: [
      {
        kind: "splash",
        title: "After last call",
        artSrc: SPLASH.merchant,
        artAlt: "Night market stall with cyan glow leaking from crates",
        atmosphere: "night",
        narration: "The crate leaked cyan like a guilty conscience.",
        hotspots: [
          {
            id: "hs-merchant-seal",
            label: "False ledger seal",
            x: 55,
            y: 55,
            w: 14,
            h: 12,
            secretCode: "LEDGER-TRUE",
            codexEntryId: "wl-commons",
            hint: "The seal is stamped twice — once wrong.",
          },
        ],
      },
      {
        kind: "scene",
        atmosphere: "night",
        artSrc: PAGE_ART.commons,
        panels: [
          {
            bubbles: [
              speech("Hooded Merchant", "Heart shards are just bright rocks to most buyers."),
              speech("Serae Ledger", "Most buyers are not my problem. You are."),
              sfx("crate creak"),
            ],
          },
          {
            bubbles: [
              narrate("Credits may price supplies. Living cores are not SKUs."),
              thought("Keeper", "I came for a bargain. I stayed for a principle."),
            ],
          },
        ],
      },
      {
        kind: "dialogue",
        atmosphere: "dusk",
        lines: [
          speech("Serae Ledger", "Mark the ledger true. Or I mark you public."),
          caption("Secret: LEDGER-TRUE"),
          sfx("stamp!"),
        ],
      },
      {
        kind: "lore",
        title: "Economy ethics",
        body: "Website + game economy: cosmetics and Credits — never sell story consent for SOL.",
        atmosphere: "night",
      },
    ],
  },
  {
    coverKey: "the-great-hunt",
    slug: "the-great-hunt",
    issueNumber: 7,
    title: "The Great Hunt",
    subtitle: "A luminous quarry, and a rule: chase without cruelty.",
    synopsis:
      "Keepers race Elderwood trails after a luminous quarry — the prize is witness, not conquest.",
    publishedAt: "2026-04-06",
    status: "published",
    tags: ["hunt", "elderwood", "companions"],
    playChapterHref: "/quests",
    playChapterLabel: "Open Quests",
    characters: [
      { name: "Cal Reed", role: "Hunt lead", blurb: "Competent, dry humor, Compact-loyal." },
      { name: "Mossprig", role: "Tracker", blurb: "Grove-affinity pathfinder." },
    ],
    locations: [{ name: "Elderwood Forest", blurb: "Golden light shafts, cyan trail markers." }],
    beats: [
      {
        kind: "splash",
        title: "Trail light",
        artSrc: SPLASH.hunt,
        artAlt: "Keepers and riftlings racing through elderwood on a hunt",
        atmosphere: "dawn",
        narration: "The quarry left light, not blood.",
      },
      {
        kind: "scene",
        atmosphere: "day",
        artSrc: PAGE_ART.regionElderwood,
        panels: [
          {
            bubbles: [
              speech("Cal Reed", "If you corner it, you failed."),
              speech("Mossprig", "*soft rustle*"),
              sfx("dash!"),
            ],
          },
          {
            bubbles: [
              narrate("The Great Hunt teaches reading the world — not owning the horizon."),
              thought("Keeper", "I wanted a trophy. Spark wanted a story."),
            ],
          },
        ],
        hotspots: [
          {
            id: "hs-hunt-marker",
            label: "Cyan trail marker",
            x: 30,
            y: 40,
            w: 10,
            h: 10,
            secretCode: "HUNT-WITNESS",
            hint: "A trail marker blinks once.",
          },
        ],
      },
      {
        kind: "dialogue",
        atmosphere: "dusk",
        artSrc: PAGE_ART.forest,
        lines: [
          speech("Cal Reed", "We saw it. That is enough for the Compact."),
          caption("Quest stub: HUNT-WITNESS"),
          sfx("wind through boughs"),
        ],
      },
      {
        kind: "lore",
        title: "Hunt culture",
        body: "Preservation first. Battle culture later as survival training — never as excuse for cruelty.",
        atmosphere: "dawn",
      },
    ],
  },
  {
    coverKey: "the-last-guardian",
    slug: "the-last-guardian",
    issueNumber: 8,
    title: "The Last Guardian",
    subtitle: "Stone remembers a Heart that asked to be kept.",
    synopsis:
      "An ancient guardian awakens at a ruined Gateway Heart. A lone Keeper must choose dialogue over demolition.",
    publishedAt: "2026-04-20",
    status: "published",
    tags: ["guardian", "ruin", "spirit"],
    playChapterHref: "/restoration",
    playChapterLabel: "World Restoration",
    characters: [
      { name: "Last Guardian", role: "Awakened construct", blurb: "Moss, stone, cyan veins." },
      { name: "Keeper", role: "You", blurb: "Lantern in one hand, patience in the other." },
    ],
    locations: [{ name: "Ruined Heart plaza", blurb: "Vines over oaths." }],
    beats: [
      {
        kind: "splash",
        title: "Eyes in stone",
        artSrc: SPLASH.guardian,
        artAlt: "Ancient stone guardian awakening at ruined Gateway Heart",
        atmosphere: "ruin",
        narration: "The statue stood up like a promise remembering its wording.",
        hotspots: [
          {
            id: "hs-guardian-eye",
            label: "Guardian eye",
            x: 50,
            y: 28,
            w: 10,
            h: 10,
            secretCode: "GUARD-LISTEN",
            codexEntryId: "wl-present-awakening",
            hint: "One eye opens slower than the other.",
          },
        ],
      },
      {
        kind: "scene",
        atmosphere: "ruin",
        artSrc: PAGE_ART.rift,
        panels: [
          {
            bubbles: [
              speech("Last Guardian", "WHO KEEPS THE HEART?"),
              speech("Keeper", "We do — if you let us ask first."),
              sfx("STONE GRIND"),
            ],
          },
          {
            bubbles: [
              narrate("Restoration is not conquest of ruins. It is conversation with what survived."),
              thought("Keeper", "Credits will not buy this answer."),
            ],
          },
        ],
      },
      {
        kind: "dialogue",
        atmosphere: "dusk",
        lines: [
          speech("Last Guardian", "Then listen when the Celestial call returns."),
          caption("Present Awakening foreshadow"),
          sfx("deep silence"),
        ],
      },
      {
        kind: "lore",
        title: "Present Awakening",
        body: "Hearts stir; ancient machines restart. The next chapter is unwritten — help, or unfinished Activation.",
        atmosphere: "rift",
      },
    ],
  },
  {
    coverKey: "festival-of-lights",
    slug: "festival-of-lights",
    issueNumber: 9,
    title: "Festival of Lights",
    subtitle: "Lanterns rise; the Commons remembers joy on purpose.",
    synopsis:
      "Bloomtide lanterns fill the Commons sky. Keepers release light for those the Fracture scattered — and for those still arriving.",
    publishedAt: "2026-05-04",
    status: "published",
    tags: ["festival", "commons", "community"],
    playChapterHref: "/social",
    playChapterLabel: "Social Hub",
    characters: [
      { name: "Plaza Crier", role: "Host", blurb: "Confetti professional." },
      { name: "Elara Venn", role: "Founder Historian", blurb: "Still greets new Keepers by the Riftstone." },
    ],
    locations: [{ name: "Commons rooftops", blurb: "Amber and cyan floating lanterns." }],
    wallpaperSrcs: [WALLPAPERS.commons],
    beats: [
      {
        kind: "splash",
        title: "Lights choose the sky",
        artSrc: SPLASH.festival,
        artAlt: "Festival of floating lanterns over Commons rooftops",
        atmosphere: "festival",
        narration: "Joy is also Compact — practiced, not assumed.",
      },
      {
        kind: "scene",
        atmosphere: "festival",
        artSrc: PAGE_ART.storyBloom,
        panels: [
          {
            bubbles: [
              speech("Elara Venn", "Release one lantern for someone who cannot stand here yet."),
              speech("Crowd", "For the Soft Exodus."),
              sfx("lantern whoosh"),
            ],
          },
          {
            bubbles: [
              narrate("Wallpaper unlock stub: Commons Lantern."),
              thought("Keeper", "I came for spectacle. I stayed for names."),
            ],
          },
        ],
        hotspots: [
          {
            id: "hs-festival-lantern",
            label: "Named lantern",
            x: 65,
            y: 15,
            w: 12,
            h: 14,
            secretCode: "LIGHTS-KEEP",
            rewardId: "rw-wallpaper-commons",
            hint: "One lantern carries a handwritten name.",
          },
        ],
      },
      {
        kind: "dialogue",
        atmosphere: "night",
        artSrc: PAGE_ART.festival,
        lines: [
          speech("Plaza Crier", "No SOL in the sky — only light."),
          caption("Community event tone: festive, Credits cosmetics"),
          sfx("cheers"),
        ],
      },
      {
        kind: "lore",
        title: "Bloomtide",
        body: "Seasonal festival narratives live in World Events docs — comics preview the feeling Keepers will play.",
        atmosphere: "festival",
      },
    ],
  },
  {
    coverKey: "the-shadow-beyond",
    slug: "the-shadow-beyond",
    issueNumber: 10,
    title: "The Shadow Beyond",
    subtitle: "Mapped regions end. Something still calls.",
    synopsis:
      "At the edge of known Riftwilds, Keepers face a void-tinged call — Present Awakening's cliffhanger toward the unwritten chapter.",
    publishedAt: "2026-05-18",
    status: "published",
    tags: ["finale", "void", "awakening"],
    playChapterHref: "/live-world",
    playChapterLabel: "Return to Live World",
    characters: [
      { name: "Keeper", role: "You", blurb: "Amber hope at your back." },
      { name: "Spark", role: "Witness", blurb: "Glows harder near the unknown." },
    ],
    locations: [
      { name: "Void Hollow edge", blurb: "Cool navy shadows; violet only as distant storm hint." },
    ],
    timelineNote: "Present Awakening — endgame hook.",
    hasCommunityVote: true,
    votePrompt: "What should Issue #11 pursue first?",
    voteOptions: [
      { id: "vote-celestial", label: "Celestial call", blurb: "Follow the clean Hearts." },
      { id: "vote-corrupt", label: "Corrupt Heart", blurb: "Investigate the wrong awakening." },
    ],
    commentary: ["Series finale of wave one — does not spoil Future Expansions docs."],
    wallpaperSrcs: [WALLPAPERS.rift],
    beats: [
      {
        kind: "splash",
        title: "Beyond the map",
        artSrc: SPLASH.shadow,
        artAlt: "Keeper and riftling facing the shadow beyond mapped regions",
        atmosphere: "rift",
        narration: "Something beyond mapped regions calls — help, or unfinished Activation.",
        hotspots: [
          {
            id: "hs-shadow-glyph",
            label: "Beyond glyph",
            x: 70,
            y: 45,
            w: 14,
            h: 14,
            codexEntryId: "wl-present-awakening",
            secretCode: "SHADOW-LISTEN",
            rewardId: "rw-series-complete",
            hint: "A glyph waits where the portal rim thins.",
          },
        ],
      },
      {
        kind: "scene",
        atmosphere: "rift",
        artSrc: PAGE_ART.regionVoid,
        panels: [
          {
            bubbles: [
              speech("Spark", "…yip."),
              speech("Keeper", "We do not rush the dark. We listen first."),
              sfx("void hush"),
            ],
          },
          {
            bubbles: [
              narrate("Riftlings preserve pieces of the world. Riftkeepers give those pieces a future."),
              thought("Elara Venn", "If they still choose keeping here, the Commons was worth founding."),
            ],
          },
        ],
      },
      {
        kind: "dialogue",
        atmosphere: "night",
        artSrc: PAGE_ART.timelineAwakening,
        lines: [
          caption("End of wave one"),
          speech("Distant call", "…keeper…"),
          speech("Keeper", "We are coming — with consent, Compact, and company."),
          sfx("soft portal thrum"),
        ],
      },
      {
        kind: "lore",
        title: "Unwritten chapter",
        body: "Future Expansions foreshadow without spoiling shipped About. Comics stop at the threshold on purpose.",
        atmosphere: "rift",
      },
      {
        kind: "splash",
        title: "Amber at your back",
        artSrc: PAGE_ART.storyFirstLight,
        artAlt: "Hope light behind Keepers at the rift edge",
        atmosphere: "dawn",
        narration: "The series closes with light behind you — not darkness ahead alone.",
        developerNote: "Thanks for reading Legends of the Rift.",
      },
    ],
  },
];

export const COMIC_ISSUES: ComicIssue[] = SEEDS.map(buildIssue);

export const COMIC_SERIES = {
  title: "Legends of the Rift",
  subtitle: "Official Riftwilds comic series — original IP graphic novels of Aeryndra.",
  issueCount: COMIC_ISSUES.length,
} as const;

export function getComicIssue(slug: string): ComicIssue | undefined {
  return COMIC_ISSUES.find((i) => i.slug === slug);
}

export function listPublishedComics(): ComicIssue[] {
  return COMIC_ISSUES.filter((i) => i.status === "published").sort(
    (a, b) => a.issueNumber - b.issueNumber,
  );
}

export function getComicIssueOrThrow(slug: string): ComicIssue {
  const issue = getComicIssue(slug);
  if (!issue) throw new Error(`Unknown comic issue: ${slug}`);
  return issue;
}
