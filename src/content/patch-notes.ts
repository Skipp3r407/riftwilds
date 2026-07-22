/**
 * Public patch / update notes - newest first.
 * Append via `npm run patch-notes:add` or edit this file before every push.
 * See docs/PATCH_NOTES_WORKFLOW.md
 *
 * Player-facing only: describe what players get (Added / Changed / Fixed).
 * Never reveal how content was made (tools, providers, scripts, pipelines, stubs, etc.).
 */

export type PatchNoteSectionKey = "added" | "changed" | "fixed" | "knownIssues";

export type PatchNoteEntry = {
  /** Stable id - used as DOM anchor (`#entry-id`) */
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
    id: "2026-07-22-wallpapers-hub-energy",
    date: "2026-07-22",
    title: "Creature wallpapers, Battle Hub tiles, and early-game energy",
    summary:
      "Downloadable creature wallpapers ship with the Riftwilds logo, Battle Hub gets section art, Kids Corner stays examples-only on Comics, and Practice early-game energy/mulligan feels smoother.",
    added: [
      "Dozens of downloadable creature and scene wallpapers with the brand logo in the corner",
      "Battle Hub section thumbnails across Practice, Casual, Ranked, AI, Tournament, and Stakes panels",
      "Homepage creature and Marketplace card background art",
      "Practice Keep / Partial / Full mulligan and clearer deck mana-curve guidance",
      "More 0-cost utility cards for a healthier opening curve",
    ],
    changed: [
      "Kids Corner and Desktop Art on Comics are examples only (downloads stay on Coloring and Fan Kit)",
      "Music player and scroll-to-top docks restored on marketing and game routes",
      "Opening-hand shaping and deck rules tightened around early Energy play",
    ],
    fixed: [
      "Dock controls no longer disappear on the homepage",
    ],
    knownIssues: [
      "Some comic issues may still receive art polish",
    ],
  },
  {
    id: "2026-07-22-battle-hub-stakes-comics",
    date: "2026-07-22",
    title: "Battle Hub, Rift Stakes, and comics archive look",
    summary:
      "Rift Battle becomes a Battle Hub with mode art, Rift Stakes gets tier lobby art and clearer fees, and Comics picks up an archive-hall wallpaper, plus inventory/energy and nav cleanup.",
    added: [
      "Battle Hub mode cards with atmospheric thumbnails (Practice, Casual, Ranked, AI, Tournament, Stakes)",
      "Rift Stakes lobby tier art for Micro, Low, Standard, and High stakes",
      "Comics library archive-hall wallpaper",
      "Dedicated Battle Hub wallpaper on the battle route",
    ],
    changed: [
      "Rift Battle entry reads as a hub with clearer mode tabs, including Stakes",
      "Site nav focuses on Battle Hub; Rift Stakes lives under battle modes",
      "Inventory and energy surfaces refined for the immersive game shell",
      "Patch Notes wording scrubbed to stay player-facing",
    ],
    fixed: [
      "Battle and account play gates stay aligned so invite/join and practice paths keep working",
    ],
    knownIssues: [
      "Some comic issues may still receive art polish",
    ],
  },
  {
    id: "2026-07-20-auth-help-atmosphere",
    date: "2026-07-20",
    title: "Login atmosphere and Help page fix",
    summary:
      "Login and signup get a dedicated cavern look with denser Magical Dust; Help is back for everyone without a crash.",
    added: [
      "Dedicated cavern wallpaper on login, signup, and related account screens",
    ],
    changed: [
      "Magical Dust is denser on account pages and rift routes",
    ],
    fixed: [
      "/help loads for everyone again (no more Rift turbulence crash)",
      "Signing out clears your session cleanly",
      "Academy uses the same play gate as other play surfaces",
      "Patch Notes text encoding restored so pages display correctly",
    ],
  },

  {
    id: "2026-07-20-practice-exchange",
    date: "2026-07-20",
    title: "Practice Board persistence and Rift Exchange section art",
    summary:
      "Practice Board matches stick around after a refresh, and Rift Exchange earning methods get atmospheric section art.",
    added: [
      "Atmospheric cover thumbnails for all Rift Exchange earning-method sections",
    ],
    changed: [
      "Rift Exchange method cards use dedicated section background art instead of a flat panel",
    ],
    fixed: [
      "Practice Board / Rift Battle: matches no longer disappear after refresh or invite join",
      "Patch Notes text encoding so special characters display correctly",
    ],
  },
  {
    id: "2026-07-20-comics-mira-canon",
    date: "2026-07-20",
    title: "Comics Continuity Mira-canon & Volumes 1–2",
    summary:
      "Continuity Mira-canon issues 1–10 arrive on the shelf with covers, pages, speech balloons, sequential unlock, plus comics reader and account polish.",
    added: [
      "Comics issues 1–10 on the shelf with covers and pages (Continuity Mira-canon)",
      "Speech balloons and lettering on comic pages",
      "Sequential comic unlock — later issues stay locked until you finish earlier ones",
      "Account flows: signup, email verify, forgot/reset password, and onboarding",
      "TCG rules and tutorial routes for the battle loop",
    ],
    changed: [
      "Comics library, reader, and cover presentation refreshed for the Mira-canon shelf",
      "Brand assets and comics audio updated for the new issues",
      "Account sign-in expanded for email login and account-gated play",
    ],
    knownIssues: [
      "Some later issues may still get art polish",
      "Social login coming soon",
    ],
  },

  {
    id: "2026-07-20-tcg-build-types",
    date: "2026-07-20",
    title: "Collection Book and Deck Atelier card stats",
    summary:
      "Collection Book and Deck Atelier show full combat stats again so card rows stay accurate in binder and deck tools.",
    fixed: [
      "Collection Book and Deck Atelier card rows now show full combat stats (attack, defense, health, speed)",
    ],
  },
  {
    id: "2026-07-19-riftwilds-systems",
    date: "2026-07-19",
    title: "Premium cards, battle UX, and multiplayer prep",
    summary:
      "A large Riftwilds pass: premium TCG card look and art, richer battle/codex/hatchery/arena surfaces, treasury and marketplace prep, and early multiplayer foundations (not live yet).",
    added: [
      "Premium card look, deck builder, Rift Codex, museum, and pack-opening surfaces for the TCG loop",
      "Arena hub modes, collectibles/wallet/exchange routes, and treasury admin tools",
      "Expanded audio SFX catalog, page wallpapers, and companion/card art across codex and battle",
      "Early realtime multiplayer foundations for local experiments (off by default — not a live matchmaker yet)",
    ],
    changed: [
      "Battle match rules, practice loadout, and Rift Battle UX polish with stronger status and intel feedback",
      "Hatchery earn paths and marketplace/shop purchase flows aligned with the credits-first economy",
      "Codex world lore, comics library, quests, and social hubs refreshed with new art and navigation",
    ],
    knownIssues: [
      "Online multiplayer matchmaking is not live yet — still in early prep",
      "Some marketplace desks (auctions, rentals, commissions) are listed but not fully open yet",
    ],
  },

  {
    id: "2026-07-18-battle-desk-console",
    date: "2026-07-18",
    title: "Practice Board battle desk console",
    summary:
      "Rift Battle's Practice Board now sits inside a framed command console - Board Intel, Command Feed, and a bold action bar - while keeping the same Rift Energy rules.",
    changed: [
      "Practice Board / Battle Desk UI rebuilt as a metallic rift-console shell with corner accents and atmospheric stage",
      "Opponent and Keeper status strips show HP and Rift Energy bars alongside deck count",
      "Battle Log becomes Command Feed; left Board Intel panel adds match readout, field pressure, and a keywords legend",
      "Play card / End turn / Surrender promoted to console command actions under an integrated hand dock",
    ],
  },
  {
    id: "2026-07-18-tcg-card-market",
    date: "2026-07-18",
    title: "Card shop & trade desk redesign",
    summary:
      "Market surfaces now lead with Rift Battle packs, binders, and cosmetics - Credits-first, with original product art replacing placeholder icons.",
    added: [
      "Unique product art for Ember Spark / Tideglass / Grove / Stormspire packs, Binder Page, Extra Deck Slot, sleeves, board skin, and Keeper Folio",
      "Marketplace demo listings for Tideglass Pack, Binder Page, and Extra Deck Slot with product thumbnails",
    ],
    changed: [
      "Shop Featured is TCG-only; Live World weapons/armor/potions move under a demoted companion section",
      "Shop and Trade Desk emphasize Credits pricing; SOL stays optional cosmetics, never required for power",
      "Marketplace categories and tabs lead with Card packs / Single cards / Binders & cosmetics; eggs and pets are secondary",
      "Market nav labels: Card Shop + Trade Desk",
    ],
  },
  {
    id: "2026-07-18-hero-random-riftlings",
    date: "2026-07-18",
    title: "Home hero Mystery Egg previews randomize",
    summary:
      "The three Riftling previews under the Mystery Rift Egg now shuffle from the full launch roster on each page load.",
    changed: [
      "Home hero Mystery Rift Egg companions randomize three distinct launch Riftlings (name, portrait, affinity) on each visit instead of fixed Ember / Grove / Tide",
    ],
  },
  {
    id: "2026-07-18-product-economy-roadmap",
    date: "2026-07-18",
    title: "Public product & economy roadmap",
    summary:
      "A player-facing roadmap for Rift Battles now, Credits/coin expansion next, and Living World as a later release - SOL stays optional and never required for core play.",
    added: [
      "Public /roadmap page - Now (Rift Battles), Next (Gold · Rift Shards · optional SOL), Later (Living World)",
      "Roadmap links from Play / Economy / Community nav, Help destinations, Community page, and Learn footer",
    ],
  },
  {
    id: "2026-07-18-riftling-avatar-unlocks",
    date: "2026-07-18",
    title: "More Riftling avatars with unlock paths",
    summary:
      "Social avatar picker now offers the full launch Riftling roster as cosmetics - free starters, task unlocks, Credits buys, and optional SOL (coming soon).",
    added: [
      "100 launch Riftling species portraits in the Avatar & safety picker (was 12 starters)",
      "Unlock paths: free starters, hatchery ownership, quest/achievement tasks, Credits purchase",
      "Optional SOL price shown as coming soon while SOL purchases stay disabled",
    ],
    changed: [
      "Locked avatars show task progress and Buy with Credits; Show all expands the large grid",
      "Clear cosmetics-only copy - avatars never grant pets or gameplay power",
    ],
    knownIssues: [
      "SOL avatar checkout remains off by design for now",
    ],
  },
  {
    id: "2026-07-18-tcg-location-place-bios",
    date: "2026-07-18",
    title: "TCG location faces and place bios finished",
    summary:
      "Region aura and market-stall cards no longer show crude building-tile placeholders; inspect opens illustrated region and place lore beside creature bios.",
    added: [
      "Region bio sections on location aura cards (overview, climate, landmarks, gateway)",
      "Place lore sections on market stalls, gates, bridges, and docks with scenic images",
    ],
    changed: [
      "Location and prop card faces use region and trade scenic art instead of plain wall and stall tiles",
      "Market stall flavor and rules text are unique per trade",
    ],
    fixed: [
      "Spirit Realm, Stoneheart Canyon, Stormspire Peaks, Void Hollow, and other region auras showed brown/gray rectangle art in the binder",
      "Market stall cards all shared the same crude house icon",
    ],
  },
  {
    id: "2026-07-18-ambience-playlist-cutoff",
    date: "2026-07-18",
    title: "Ambience playlist no longer cuts out early",
    summary:
      "Frostveil's bed and a few quiet sci-fi loops were going silent after a few seconds; ambience now keeps playing through track changes.",
    changed: [
      "Frostveil / playlist track “Space Graveyard” replaced with continuous CC0 “Icy Realm”",
      "Quiet Dark Sci-Fi beds (Sector, Airy, Pulse, Urgent) stay audible at normal Music volume",
    ],
    fixed: [
      "Ambience player tracks no longer cut off after a few seconds",
    ],
  },
  {
    id: "2026-07-18-restoration-wallpaper",
    date: "2026-07-18",
    title: "World Restoration atmospheric wallpaper",
    summary:
      "World Restoration gets a full-bleed Riftwilds landscape background so the living-world dashboard feels restored instead of flat scanlines.",
    added: [
      "Full-bleed World Restoration wallpaper (rift sky, forests, forges, coasts) on /restoration",
    ],
  },
  {
    id: "2026-07-18-tcg-creature-bio-images",
    date: "2026-07-18",
    title: "Illustrated Creature Bio sections",
    summary:
      "Card inspect Creature Bio breaks into Species, Habitat, Behavior, Diet, and Affinity sections, each with its own image.",
    added: [
      "Illustrated Creature Bio sections on card inspect (portrait, region scenic, affinity vignettes) for every Riftling with species lore",
    ],
    changed: [
      "Creature Bio layout scrolls by section so images stay readable next to short lore on mobile",
    ],
  },
  {
    id: "2026-07-18-tcg-card-detail-faces",
    date: "2026-07-18",
    title: "Full TCG card faces and inspect detail",
    summary:
      "Every foundational card now has a full card face; binder and battle open an inspect view with stats and Riftling bios, and practice hand cards are larger.",
    added: [
      "Card inspect on Card Binder and Practice Board with stats, rules, flavor, and creature bio from species lore",
      "Scenic emblem card faces for the remaining cards that lacked pet/item art (spells, tokens, commons like Ash Urchin)",
    ],
    changed: [
      "Practice Board hand and board cards scaled up for clearer art",
      "Battle: tap a card to inspect; Play lives in the detail view and toolbar",
      "Card images prefer the full finished face art when available",
    ],
    fixed: [
      "Binder/battle no longer show text-only placeholders for Ember Spark, Forge Temper, Ash Urchin, and other missing faces",
    ],
  },
  {
    id: "2026-07-18-social-hub-chrome",
    date: "2026-07-18",
    title: "Social Hub image tabs and plaza wallpaper",
    summary:
      "Social Hub gets glossy image tab buttons and a Commons plaza atmospheric background for clearer community chrome.",
    added: [
      "Image-skinned hub tab buttons (idle glass + cyan/amber active glow) for Social Hub sections and route pills",
      "Full-bleed Social Hub wallpaper (Commons plaza / rift lanterns) on /social",
    ],
    changed: [
      "Social Hub Friends / Requests / Messages / Avatar & safety tabs use clearer image tab skins",
    ],
  },
  {
    id: "2026-07-18-riftling-avatars",
    date: "2026-07-18",
    title: "Riftling avatars for profiles and social",
    summary:
      "Players can pick owned Riftlings or starter species portraits as avatars on Social and Profile.",
    added: [
      "Riftling avatars section with starter species portraits when hatchery ownership is empty",
      "Avatar picker on Profile settings (Your Riftlings when owned pets exist)",
    ],
    changed: [
      "Social tab relabeled Avatar & safety; owned pet avatars still require ownership",
    ],
  },
  {
    id: "2026-07-18-tcg-flat-card-faces",
    date: "2026-07-18",
    title: "Finished Rift Battles card faces",
    summary:
      "Binder and battle UIs now show complete card face images instead of layered text overlays on crop art.",
    added: [
      "Full card face images for the foundational set (645 cards)",
    ],
    changed: [
      "Card Binder and Rift Battle boards show finished card face art",
    ],
  },
  {
    id: "2026-07-18-tcg-25d-ship",
    date: "2026-07-18",
    title: "Rift Battles set, Help, and Live World depth",
    summary:
      "Foundational TCG content and battle surfaces ship alongside Help/music polish, social avatars, optional SOL economy prep (off for now), and a Live World depth pass. Live World stays enterable while we keep polishing.",
    added: [
      "Foundational Rift Battles card set with collection, matches, and /tcg battle surfaces",
      "TCG shop paths for packs, binders, and card cosmetics plus battle wallpaper art",
      "/help center reworked around Rift Battles and card play",
      "Social avatar picker for profiles and friends",
      "Optional SOL economy foundation — all SOL purchases stay off for now",
    ],
    changed: [
      "Play hub, home hero, quests, marketplace, shop, and leaderboards lead with Rift Battles",
      "Live World immersive HUD and depth layering for a clearer 2.5D overworld read",
      "Ambience music player chrome and mute/play sync polish",
      "Live World stays publicly enterable while we keep polishing the habitat",
    ],
    knownIssues: [
      "Optional SOL purchases, marketplace settlement, minting, and withdrawals remain fully gated off",
      "Live World multiplayer habitat continues iterative polish while Rift Battles is the primary launch focus",
    ],
  },
  {
    id: "2026-07-18-build-comics-music",
    date: "2026-07-18",
    title: "Comics reader and music player polish",
    summary:
      "Comics book reader keeps speech balloons in view, and the floating music player mute/play controls match Riftwilds chrome.",
    fixed: [
      "Live World loads reliably again after a missing graphics-quality setting issue",
      "Credits, shop scrolls, storm participation, and hatchery care no longer break after updates",
      "Music player mute/play stays in sync and can unmute from the floating bar",
    ],
    changed: [
      "Comics reader uses a book-stage viewport with speech balloons that stay readable on page art",
      "Music player chrome uses warm Riftwilds glass instead of cold sci-fi violet",
      "Live World immersive settings expose graphics quality presets (Low default; Ultra opt-in)",
    ],
    added: [
      "Open-book matte frame and clearer comic speech-balloon layout on issue pages",
    ],
  },
  {
    id: "2026-07-18-live-world-hatched-companion",
    date: "2026-07-18",
    title: "Live World companion matches your hatch",
    version: "2ec87bb",
    summary:
      "Your following Riftling in Live World now uses the same species look as the pet you hatched - Glowpup-line sparklets stay distinct from Alloybits and other affinities.",
    fixed: [
      "Live World follower no longer always shows the generic cozy Spark look regardless of hatch species",
      "HUD companion label uses your hatched species name instead of always saying Spark",
    ],
    changed: [
      "Companion overworld art matches your hatch species (with affinity fallback) to cozy pixel walk sheets",
      "Ambient village Riftlings stay decorative props and no longer share your companion's identity",
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
    title: "Commons depth pass - shores, cottages, walks",
    summary:
      "Live World Commons gets richer path/pond shores, unique cottage variants, picket yards with original-IP critters, and Keeper/Riftling walk cycles.",
    added: [
      "Path border and pond shore tiles (edges + corners) for seamless village transitions",
      "Unique cottage facades (timber, row houses, tavern, farm shed, interior peek) with chimney and flower-box variety",
      "Picket fence yards, market stall cluster, and Sparkmoth / Mossbun-kit yard critters (original IP)",
      "Keeper + companion Riftling walk/idle animations with cleaner follow trailing",
    ],
    changed: [
      "Keeper Row paths connect cottage doors; pond shore expands with a small plaza reflect pool",
      "Tree/bush contact shadows and layering read more grounded in the meadow",
    ],
    knownIssues: [
      "Village art will keep getting more hand-crafted polish — more frames and unique props are still on the backlog",
    ],
  },
  {
    id: "2026-07-18-cozy-pixel-commons",
    date: "2026-07-18",
    title: "Commons goes cozy pixel village",
    summary:
      "Live World Commons shifts to a bright cute fantasy RPG look - lush grass, dirt paths, cottage facades, denser clutter, and chibi Keeper/Riftling sprites (original IP).",
    added: [
      "Original cozy 16-bit terrain pack (flowered grass, path borders, pond edges/lilies, farm soil, plaza cobble)",
      "Cute cottage building facades for Commons hubs with amber lanterns and cyan rift-glass accents",
      "Pixel prop set (fences, barrels, benches, stalls, trees, stumps) plus ambient village Riftlings",
      "Chibi Keeper + companion Riftling overworld actors sized for readable top-down play",
    ],
    changed: [
      "Commons day lighting is brighter and friendlier; rift cyan stays an accent, not gloom",
      "Live World uses crisp pixel art rendering and a closer default camera zoom",
      "Village prop scatter is denser along paths, yards, and farm hubs",
    ],
    knownIssues: [
      "Village tileset will keep deepening — further art passes will expand cottage variety and walk cycles",
    ],
  },
  {
    id: "2026-07-18-coloring-pages-batch-2",
    date: "2026-07-18",
    title: "20 more kids coloring pages",
    summary:
      "Kids Corner grows to 28 printable game-sketch coloring sheets - Keepers, harbor, academy, hatchery, species, and kid-safe boss silhouettes.",
    added: [
      "20 new Riftwilds coloring pages (PNG + PDF) on /coloring - Keeper & Companion, Commons Arena, Player Academy, Moonwater Harbor, Hatchery Care, Ember Forge, Riftling Species, Glowpup Den, Emberkit Scout, Pouchling Market, Stone Guardian, Rift Serpent, Circus Acrobat, Gateway Awakening, Elderwood Camp, Market Day, Homestead Garden, Riftstone Plaza, First Bond, and Lantern Night",
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
      "/printables art and chrome retuned to epic warm fantasy - Keepers, rift storms, bronze/amber/cyan CTAs (no purple pills).",
    changed: [
      "All 12 × 300 DPI printables refreshed with richer warfront scenes: damaged Commons timber, lanterns, storm debris, athletic Glowpup stance",
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
      "Creator Hub cards on /creators no longer share one plain charcoal well - Echo Archives, Ember Atelier, Groveheart Field Notes, and Lantern Homestead Kit each get a distinct parchment, ember, grove, or lantern background",
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
      "Feedback + patch notes, comic storybook narration clips, Social friends/PM, printable fan gear, game-sketch coloring, brand marks, a large game asset library, chat auto-hide, and a Live Care fix.",
    added: [
      "Feedback / Bug Report at /feedback (alias /bugs)",
      "Patch Notes at /patch-notes (alias /updates)",
      "Comic storybook and commercial voice-over clips you can play in-reader when available",
      "Social Hub friends + private messages (/social) with unread badge and Live World deep-links",
      "300 DPI Printables hub at /printables with game-theme adventure art",
      "Large game asset library for in-world props and scenic pieces",
      "Live World Commons prop install (~232 library props scattered in-world)",
      "Theme4 egg + Riftwilds logo/wordmark/favicon set",
    ],
    changed: [
      "Kids coloring sheets redone as detailed game-sketch line art",
      "Downloadable wallpapers redone as cinematic battle / warfront scenes",
      "Printables refreshed to warm fantasy + cyan/amber rift energy",
      "Live World chat supports auto-hide / transparent idle peek (pin keeps it open)",
      "Header SOL / RIFT currency pills get clearer spacing",
      "Nav/footer links for Feedback, Patch Notes, Printables, and Social",
    ],
    fixed: [
      "Live Care panel no longer breaks when you have no active pet",
    ],
    knownIssues: [
      "Fuller 2.5D terrain/HUD overhaul is still in progress and is not in this release",
      "Friends/PM cloud save is prepare-only until that storage path is fully enabled",
    ],
  },
  {
    id: "2026-07-18-printables-theme-pass",
    date: "2026-07-18",
    title: "Printables theme pass - adventure art",
    version: "printables-v2",
    summary:
      "/printables chrome and all 300 DPI assets retuned to warm fantasy + cyan/amber rift energy: Keepers, Riftlings, living towns under threat.",
    changed: [
      "Printables hub restyled with bronze/parchment chrome (no purple mush)",
      "All 12 printables refreshed: Spark's Stand, Commons Under Threat, Hatchery Aurora, fantasy MMO trading-card frames, adventure bookmarks, circus under fire",
      "Copy and card order sell battles, exploration, and care - not toddler-cute stickers",
    ],
    fixed: [
      "Poster preview thumbs now show full scene art (full-bleed on dark ink frames)",
    ],
  },
  {
    id: "2026-07-18-friends-and-pm",
    date: "2026-07-18",
    title: "Friends and private messages",
    version: "social",
    summary:
      "Social Hub now supports real friend requests, inbox PMs, block/report/privacy tools, and Live World deep-links - no wallet required.",
    added: [
      "Friends and private messages in Social Hub",
      "Social Hub tabs: Friends, Requests, Messages, Safety (block / report / privacy)",
      "Unread badge on sidebar Social",
      "Live World nearby actions: Add friend / Whisper / Invite → /social deep-links",
      "Town keepers (keeper_mira, captain_reed, archivist_echo) for onboarding",
    ],
    changed: [
      "/social upgraded from demo-only friends/DMs to a real Social Hub",
      "Footer Learn links include Social Hub",
    ],
    knownIssues: [
      "PMs update when you open or refresh — live push notifications are still backlog",
      "Cloud save for friends/PM is prepare-only until that storage path is fully enabled",
      "Party invites are listed but not fully live until multiplayer Phase 2",
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
      "Printables hub at /printables with 12 × 300 DPI assets (PNG + PDF)",
      "Sticker sheets, mini posters (Letter + A4), bookmark trio, trading-card sheet, 5×7 cards, Spark standee, circus invite",
      "Fan Kit and Kids Coloring cross-links",
    ],
    changed: [
      "Nav and footer include Printables next to Fan Kit / Coloring",
    ],
  },
  {
    id: "2026-07-18-patch-notes-narration",
    date: "2026-07-18",
    title: "Patch Notes, narration, and Live Care fix",
    version: "0.1.1",
    summary:
      "Public update log, optional comic/commercial voice-over clips, kids coloring polish, and a Live Care fix when you have no active pet.",
    added: [
      "Public Patch Notes page at /patch-notes (alias /updates)",
      "Comic storybook and commercial voice-over clips you can play when available",
    ],
    changed: [
      "Kids coloring sheets refreshed toward clearer game-sketch line art where updated",
    ],
    fixed: [
      "Live Care panel no longer breaks when you have no active pet during companion audio setup",
    ],
    knownIssues: [
      "A fuller 2.5D visual overhaul is still in progress and is not part of this release",
      "Comic page narration only plays when voice clips are available for that issue",
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
      "Fan Kit hub - wallpapers, stickers, avatar frames, share cards, and download packs",
      "Kids coloring pages (printable PNG/SVG/PDF) and Press / Streamer kit surfaces",
      "World Codex lore art for major Aeryndra moments and places",
    ],
    changed: [
      "Marketing footer and Fan Kit wallpaper panels for clearer community downloads",
    ],
  },
  {
    id: "2026-07-18-living-world-batch",
    date: "2026-07-18",
    title: "Housing, world expansion, and Live World fixes",
    version: "73b2c66",
    summary:
      "Homestead/housing systems, early world-expansion prep, early Legends of the Rift comic covers, and Live World input/HUD stability.",
    added: [
      "Player housing build/place flow and homestead/neighborhood foundations",
      "Early world-expansion prep for capacity and neighborhood assignment (not fully live yet)",
      "Early Legends of the Rift comic covers and series foundations",
    ],
    changed: [
      "Live World HUD docking for Chat / Presence and talk-prompt layout",
    ],
    fixed: [
      "WASD movement restored when chat is pinned; HUD remount stability improved",
      "Live World HUD overlap and layout issues for Chat / Presence panels",
    ],
    knownIssues: [
      "World-expansion capacity tools stay off until operators approve them for live use",
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
      "Living-world population and retention events",
      "Draggable / slot-based Live World HUD layouts",
      "Credits economy icon and related UI polish",
    ],
    changed: [
      "Live World shell updated after HUD drag support",
    ],
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
      "NPC full-body art and overworld sprites",
    ],
  },
  {
    id: "2026-07-17-platform-foundation",
    date: "2026-07-17",
    title: "Riftwilds platform foundation",
    version: "b70a3d6",
    summary:
      "Initial closed-alpha platform: hatchery, Live World, arena, marketplace, economy framing, and core Keepers loop.",
    added: [
      "Core Keepers loop - hatch, care, collection, quests, and Academy",
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
