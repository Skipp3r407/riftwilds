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
    id: "2026-07-18-live-world-hatched-companion",
    date: "2026-07-18",
    title: "Live World companion matches your hatch",
    summary:
      "Your following Riftling in Live World now uses the same species look as the pet you hatched — Glowpup-line sparklets stay distinct from Alloybits and other affinities.",
    fixed: [
      "Live World follower no longer always shows the generic cozy Spark sheet regardless of hatch species",
      "HUD companion label uses your hatched species name instead of a hardcoded Spark stub",
    ],
    changed: [
      "Companion overworld art maps hatch species (and affinity fallback) to matching cozy pixel walk sheets",
      "Ambient village Riftlings stay decorative props and no longer share the player companion’s identity or anim keys",
    ],
    added: [
      "Extra cozy companion palettes for storm, spirit, void, alloy, and radiant affinities",
    ],
  },
  {
    id: "2026-07-18-economy-page-backgrounds",
    date: "2026-07-18",
    title: "Cinematic economy & care backgrounds",
    summary:
      "Community Reward Treasury, Care & survival, and sibling economy pages get stronger full-bleed Riftwilds cavern/vault art behind the glass panels.",
    added: [
      "Dedicated care cavern wallpaper plus economy section backgrounds for Community Reward Treasury and Care & survival stages",
    ],
    changed: [
      "/economy, /treasury, /rewards, /token, /transparency, and /fairness show richer cinematic wallpapers with lighter scrims so the art reads through translucent panels",
    ],
  },
  {
    id: "2026-07-18-cozy-depth-pass-2",
    date: "2026-07-18",
    title: "Commons depth pass — shores, cottages, walks",
    summary:
      "Live World Commons gets richer path/pond autotiles, unique cottage variants, picket yards with original-IP critters, and Keeper/Riftling walk cycles.",
    added: [
      "Neighbor-aware path border and pond shore autotiles (edges + corners) for seamless village transitions",
      "Unique cottage facades (timber, row houses, tavern, farm shed, interior peek) with chimney and flower-box variety",
      "Picket fence yards, market stall cluster, and Sparkmoth / Mossbun-kit yard critters (original IP)",
      "4-frame Keeper + companion Riftling walk/idle sheets with cleaner follow trailing",
    ],
    changed: [
      "Keeper Row paths connect cottage doors; pond shore expands with a small plaza reflect pool",
      "Tree/bush contact shadows and layering read more grounded in the meadow",
    ],
    knownIssues: [
      "Still procedural pixel art vs hand-painted Kenmi-quality tiles — more frame polish and unique props remain on the backlog",
    ],
  },
  {
    id: "2026-07-18-cozy-pixel-commons",
    date: "2026-07-18",
    title: "Commons goes cozy pixel village",
    summary:
      "Live World Commons shifts to a bright cute fantasy RPG look — lush grass, dirt paths, cottage facades, denser clutter, and chibi Keeper/Riftling sprites (original IP).",
    added: [
      "Original cozy 16-bit terrain pack (flowered grass, path borders, pond edges/lilies, farm soil, plaza cobble)",
      "Cute cottage building facades for Commons hubs with amber lanterns and cyan rift-glass accents",
      "Pixel prop set (fences, barrels, benches, stalls, trees, stumps) plus ambient village Riftlings",
      "Chibi Keeper + companion Riftling overworld actors sized for readable top-down play",
    ],
    changed: [
      "Commons day lighting is brighter and friendlier; rift cyan stays an accent, not gloom",
      "Phaser Live World uses crisp pixelArt rendering and a closer default camera zoom",
      "Village prop scatter is denser along paths, yards, and farm hubs",
    ],
    knownIssues: [
      "Procedural pixel pack approximates a hand-authored cute RPG tileset — further art passes will deepen cottage variety and walk cycles",
    ],
  },
  {
    id: "2026-07-18-coloring-pages-batch-2",
    date: "2026-07-18",
    title: "20 more kids coloring pages",
    summary:
      "Kids Corner grows to 28 printable game-sketch coloring sheets — Keepers, harbor, academy, hatchery, species, and kid-safe boss silhouettes.",
    added: [
      "20 new Riftwilds coloring pages (PNG + PDF) on /coloring — Keeper & Companion, Commons Arena, Player Academy, Moonwater Harbor, Hatchery Care, Ember Forge, Riftling Species, Glowpup Den, Emberkit Scout, Pouchling Market, Stone Guardian, Rift Serpent, Circus Acrobat, Gateway Awakening, Elderwood Camp, Market Day, Homestead Garden, Riftstone Plaza, First Bond, and Lantern Night",
    ],
    changed: [
      "Coloring, comics kids section, Fan Kit, and press copy now list 28 printable game-sketch pages",
    ],
  },
  {
    id: "2026-07-18-quest-card-gaps",
    date: "2026-07-18",
    title: "Quest cards pack tight again",
    summary:
      "Short-objective quests on /quests no longer leave a huge empty gap above Rewards; cards stay dense with light region tints.",
    fixed: [
      "Quest board cards no longer stretch to equal row height with empty space between Objectives and Rewards",
    ],
    changed: [
      "Each quest card gets a subtle category/region body tint without hurting text contrast",
    ],
  },
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
