/**
 * Public patch / update notes — newest first.
 * Append via `npm run patch-notes:add` or edit this file before every push.
 * See docs/PATCH_NOTES_WORKFLOW.md
 */

export type PatchNoteSectionKey = "added" | "changed" | "fixed" | "knownIssues";

export type PatchNoteEntry = {
  /** Stable id — used as DOM anchor (`#entry-id`) */
  id: string;
  /** ISO date YYYY-MM-DD (display + sort) */
  date: string;
  /** Short human title for the release */
  title: string;
  /** Semver-ish label or short git SHA shown beside the title */
  version?: string;
  /** One-line summary under the title */
  summary?: string;
  added?: string[];
  changed?: string[];
  fixed?: string[];
  knownIssues?: string[];
};

export const PATCH_NOTE_SECTION_LABELS: Record<PatchNoteSectionKey, string> = {
  added: "Added",
  changed: "Changed",
  fixed: "Fixed",
  knownIssues: "Known issues",
};

/**
 * Chronological release notes (newest first).
 * Push coordinators: prepend a new object at the top before every push.
 */
export const PATCH_NOTES: PatchNoteEntry[] = [
  {
    id: "2026-07-18-printables-riftwilds-theme",
    date: "2026-07-18",
    title: "Printables match Riftwilds theme",
    version: "printables-v3",
    summary:
      "/printables art and chrome retuned to epic warm fantasy — Keepers, rift storms, bronze/amber/cyan CTAs (no purple pills).",
    changed: [
      "All 12 × 300 DPI printables regenerated with richer warfront scenes: damaged Commons timber, lanterns, storm debris, athletic Glowpup stance",
      "Download buttons use bronze/amber PDF and cyan-outline PNG styles instead of purple crypto primary skins",
      "Each printable card gets a unique subtle atmosphere well (spark storm, plaza, hatchery aurora, circus ember, and more)",
    ],
  },
  {
    id: "2026-07-18-creator-hub-card-backgrounds",
    date: "2026-07-18",
    title: "Creator Hub unique card backgrounds",
    summary:
      "Every Creator Hub creator and offer card now has its own thematic atmosphere behind the cutout art.",
    changed: [
      "Creator Hub cards on /creators no longer share one plain charcoal well — Echo Archives, Ember Atelier, Groveheart Field Notes, and Lantern Homestead Kit each get a distinct parchment, ember, grove, or lantern background",
    ],
  },
  {
    id: "2026-07-18-homepage-hero-cta",
    date: "2026-07-18",
    title: "Homepage hero egg and CTA contrast",
    summary:
      "Restores a clear Mystery Rift Egg on the home hero and makes Claim egg / Connect Wallet readable again.",
    fixed: [
      "Home hero Mystery Rift Egg now uses the premium portrait hatchery egg so it fills the showcase instead of looking like an empty glow ring",
      "Claim egg and Connect Wallet primary buttons keep a solid underlay and light label text so they no longer look disabled or invisible on dark chrome",
    ],
  },
  {
    id: "2026-07-18-community-audio-assets",
    date: "2026-07-18",
    title: "Community tools, narration, and asset library",
    version: "0.2.0",
    summary:
      "Feedback + patch notes, ElevenLabs comic VO pipeline, Social friends/PM, printable fan gear, game-sketch coloring, Theme4 brand marks, 1284-piece game asset library, chat auto-hide, and Live Care build fix.",
    added: [
      "Feedback / Bug Report at /feedback (alias /bugs) with API + safety checks",
      "Patch Notes at /patch-notes (alias /updates) and maintainer workflow docs",
      "ElevenLabs narration tooling for comic storybook clips and commercial VO (pre-generated, runtime key-free)",
      "Social Hub friends + private messages (/social) with APIs, badge, and Live World deep-links",
      "300 DPI Printables hub at /printables with game-theme adventure art",
      "Game asset library catalog (~1284 WebP entries) under /assets/game/library/",
      "Live World Commons prop install (~232 library props scattered in-world)",
      "Theme4 egg + Riftwilds logo/wordmark/favicon set under /assets/brand/",
    ],
    changed: [
      "Kids coloring sheets redone as detailed game-sketch line art",
      "Downloadable wallpapers redone as cinematic battle / warfront scenes",
      "Printables regenerated to warm fantasy + cyan/amber rift energy",
      "Live World chat supports auto-hide / transparent idle peek (pin keeps it open)",
      "Header SOL / RIFT currency pills get clearer spacing",
      "Nav/footer links for Feedback, Patch Notes, Printables, and Social",
    ],
    fixed: [
      "Vercel production build: live-care-panel no longer type-errors when pet is null",
    ],
    knownIssues: [
      "Fuller 2.5D terrain/HUD overhaul remains unapproved and is not in this release",
      "Friends/PM Prisma persistence stays prepare-only until migration is enabled",
    ],
  },
  {
    id: "2026-07-18-printables-theme-pass",
    date: "2026-07-18",
    title: "Printables theme pass — adventure art",
    version: "printables-v2",
    summary:
      "/printables chrome and all 300 DPI assets retuned to warm fantasy + cyan/amber rift energy: Keepers, Riftlings, living towns under threat.",
    changed: [
      "Printables hub restyled with bronze/parchment chrome (no purple mush)",
      "All 12 printables regenerated: Spark’s Stand, Commons Under Threat, Hatchery Aurora, fantasy MMO trading-card frames, adventure bookmarks, circus under fire",
      "Copy and card order sell battles, exploration, and care — not toddler-cute stickers",
    ],
    fixed: [
      "Poster preview thumbs now show full scene art (object-cover on dark ink frames)",
    ],
  },
  {
    id: "2026-07-18-friends-and-pm",
    date: "2026-07-18",
    title: "Friends and private messages",
    version: "social",
    summary:
      "Social Hub now supports real friend requests, inbox PMs, blocks/reports stubs, and Live World deep-links — no wallet required.",
    added: [
      "Friends + PM APIs at /api/social/friends, /api/social/messages, /api/social/summary",
      "Social Hub tabs: Friends, Requests, Messages, Safety (block / report / privacy)",
      "Unread badge on sidebar Social + summary poller",
      "Live World nearby actions: Add friend / Whisper / Invite → /social deep-links",
      "Town keepers (keeper_mira, captain_reed, archivist_echo) for onboarding",
      "docs/social/FRIENDS_AND_PM.md and unit tests for friend/PM rules",
    ],
    changed: [
      "/social upgraded from demo-only stubs for friends/DMs",
      "Footer Learn links include Social Hub",
    ],
    knownIssues: [
      "PM delivery is request/response only — WebSocket push is backlog",
      "Prisma friends/PM tables are prepare-only (FRIENDS_AND_PM_PRISMA_ENABLED off)",
      "Party invites remain stubs until multiplayer Phase 2",
    ],
  },
  {
    id: "2026-07-18-printables-300dpi",
    date: "2026-07-18",
    title: "300 DPI printable fan gear",
    version: "printables",
    summary:
      "Downloadable print-ready stickers, posters, bookmarks, trading cards, and a Traveling Circus party invite for viewers.",
    added: [
      "Printables hub at /printables with 12 × 300 DPI assets (PNG + PDF) under /assets/printables/",
      "Sticker sheets, mini posters (Letter + A4), bookmark trio, trading-card sheet, 5×7 cards, Spark standee, circus invite",
      "Fan Kit and Kids Coloring cross-links plus regenerator script (npm run assets:printables)",
    ],
    changed: [
      "Nav and footer include Printables next to Fan Kit / Coloring",
    ],
    fixed: [],
  },
  {
    id: "2026-07-18-patch-notes-narration",
    date: "2026-07-18",
    title: "Patch Notes, narration, and build hardening",
    version: "0.1.1",
    summary:
      "Public update log, optional ElevenLabs comic/commercial VO pipeline, kids coloring polish, and a Vercel TypeScript fix for Live Care.",
    added: [
      "Public Patch Notes page at /patch-notes (alias /updates) with a typed content catalog for every push",
      "Maintainer workflow + CLI stub helper so release notes ship with each push",
      "ElevenLabs narration tooling for comic storybook clips and commercial VO (pre-generated assets; runtime stays key-free)",
    ],
    changed: [
      "Kids coloring sheets refreshed toward clearer game-sketch line art where updated",
    ],
    fixed: [
      "Vercel production build: `live-care-panel` no longer type-errors when pet is null during companion/cry audio setup",
    ],
    knownIssues: [
      "A fuller 2.5D visual overhaul is still in progress and is not part of this release",
      "Comic page narration only plays when pre-generated clips are present for that issue",
    ],
  },
  {
    id: "2026-07-18-comics-fan-kit",
    date: "2026-07-18",
    title: "Comics book-feel, Fan Kit, and Codex art",
    version: "272ab3f",
    summary:
      "Legends of the Rift reader polish, free downloads / Fan Kit hub, printable coloring, and World Codex illustration pass.",
    added: [
      "Comics library with book-feel reader experience for published issues",
      "Fan Kit hub — wallpapers, stickers, avatar frames, share cards, and download packs",
      "Kids coloring pages (printable PNG/SVG/PDF) and Press / Streamer kit surfaces",
      "World Codex lore art for major Aeryndra moments and places",
    ],
    changed: [
      "Marketing footer and Fan Kit wallpaper panels for clearer community downloads",
    ],
    fixed: [],
  },
  {
    id: "2026-07-18-living-world-batch",
    date: "2026-07-18",
    title: "Housing, world expansion, and Live World fixes",
    version: "73b2c66",
    summary:
      "Homestead/housing systems, automatic world-expansion scaffolding, comic series foundations, and Live World input/HUD stability.",
    added: [
      "Player housing build/place flow and homestead/neighborhood foundations",
      "World expansion admin + capacity/assignment scaffolding (prepare-first migrations)",
      "Official comic series content pipeline and covers for early Legends of the Rift issues",
    ],
    changed: [
      "Live World HUD docking for Chat / Presence and talk-prompt layout",
    ],
    fixed: [
      "WASD movement restored when chat is pinned; HUD remount stability improved",
      "Live World HUD overlap and layout migration issues for Chat / Presence panels",
    ],
    knownIssues: [
      "World-expansion migrations remain prepare-first — operators should not force-enable capacity expansion until approved",
    ],
  },
  {
    id: "2026-07-18-live-world-systems",
    date: "2026-07-18",
    title: "Living World systems and draggable HUD",
    version: "05a6877",
    summary:
      "Population/presence systems, retention events, credits UI polish, and a draggable Live World HUD shell.",
    added: [
      "Living-world population and retention event hooks",
      "Draggable / slot-based Live World HUD layouts",
      "Credits economy icon and related UI polish",
    ],
    changed: [
      "Live World shell wiring after HUD drag integration",
    ],
    fixed: [],
  },
  {
    id: "2026-07-17-npcs-quests-art",
    date: "2026-07-17",
    title: "Live World NPCs, quests, and creature art",
    version: "584ccd8",
    summary:
      "Playable Commons NPCs with starter quests, full-body portraits/sprites, and illustration fills for quests and battle.",
    added: [
      "Playable Live World NPCs and a starter quest chain with portraits",
      "Unique illustrations across the quest catalog",
      "Creature battle animation sheets plus ability/feature icon artwork",
      "NPC full-body art, overworld sprites, and sync/report tooling",
    ],
    fixed: [],
  },
  {
    id: "2026-07-17-platform-foundation",
    date: "2026-07-17",
    title: "Riftwilds platform foundation",
    version: "b70a3d6",
    summary:
      "Initial closed-alpha platform: hatchery, Live World, arena, marketplace, economy framing, and core Keepers loop.",
    added: [
      "Core Keepers loop — hatch, care, collection, quests, and Academy",
      "Live World exploration shell and Arena combat foundations",
      "Marketplace, shop, inventory, guilds, and homestead entry points",
      "Token / treasury / transparency / fairness marketing surfaces",
    ],
    knownIssues: [
      "Token mint and mainnet rewards remain gated until launch checklist items complete",
      "Some systems ship as playable foundations with ongoing content and balance work",
    ],
  },
];

/** Newest-first catalog (maintain order when editing). */
export function listPatchNotes(): PatchNoteEntry[] {
  return PATCH_NOTES;
}

export function getLatestPatchNote(): PatchNoteEntry | undefined {
  return PATCH_NOTES[0];
}
