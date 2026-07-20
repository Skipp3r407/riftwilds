/**
 * Riftwilds Comic Publishing Engine — types.
 * Website-first; Credits/cosmetic unlocks only (never SOL / crypto for core story).
 */

/** Cover collectible kinds — data/UI ready even when art stubs reuse the standard plate. */
export type CoverVariantKind =
  | "standard"
  | "variant-a"
  | "variant-b"
  | "anniversary"
  | "foil"
  | "animated"
  | "founder"
  | "seasonal";

export type ComicCover = {
  kind: CoverVariantKind;
  src: string;
  label: string;
  unlockHint?: string;
  /** Future: Lottie / WebM foil shimmer hook */
  animatedSrc?: string;
  foilIntensity?: number;
};

/** Page role in a published issue book (front → story → back matter). */
export type ComicPageRole =
  | "front-cover"
  | "inside-cover"
  | "title"
  | "credits"
  | "recap"
  | "story"
  | "splash"
  | "spread"
  | "profile"
  | "map"
  | "teaser"
  | "letters"
  | "ad"
  | "back-cover"
  | "end";

export type ComicPanelLayout =
  | "splash"
  | "wide"
  | "two-col"
  | "three-stack"
  | "grid-2x2"
  | "grid-3"
  | "narrative"
  | "lore"
  | "spread"
  | "end";

/** Full lettering system — original Riftwilds fantasy voice styles. */
export type ComicBubbleKind =
  | "speech"
  | "thought"
  | "narration"
  | "whisper"
  | "shout"
  | "magic"
  | "telepathy"
  | "creature"
  | "sfx"
  | "caption";

/** Tail points from the bubble toward the speaker's mouth. */
export type ComicBubbleTail =
  | "down"
  | "up"
  | "left"
  | "right"
  | "down-left"
  | "down-right"
  | "up-left"
  | "up-right";

/** Deep links from comic → Codex / TCG card / deck builder. */
export type ComicCanonLink = {
  /** World Codex entry id (`/codex/world/[entryId]`) */
  worldCodexEntryId?: string;
  /** Riftling species slug (`/codex/riftlings/[speciesSlug]`) */
  riftlingSlug?: string;
  /** TCG family id (`/tcg/codex/[familyId]`) */
  tcgFamilyId?: string;
  /** TCG card id (`/tcg/collection?card=` or deck builder) */
  tcgCardId?: string;
  /** Ability / keyword id for game-accurate visuals (e.g. forest-bond) */
  abilityId?: string;
  /** Optional override href */
  href?: string;
  label?: string;
};

export type ComicBubble = {
  kind: ComicBubbleKind;
  speaker?: string;
  text: string;
  /**
   * Coarse preset (mapped to x/y if explicit coords omitted).
   * Prefer `x` / `y` / `tail` for mouth-aimed placement.
   */
  anchor?: "tl" | "tr" | "bl" | "br" | "center" | "top" | "bottom";
  /** Bubble center X as % of the art box (0–100). */
  x?: number;
  /** Bubble center Y as % of the art box (0–100). */
  y?: number;
  /** Direction the tail aims (toward character mouth). */
  tail?: ComicBubbleTail;
  /** Canon deep link when this line mentions a creature / ability / place */
  canonLink?: ComicCanonLink;
  /** Reading-order index for guided reading (0-based within page) */
  readOrder?: number;
};

export type ComicHotspot = {
  id: string;
  label: string;
  /** Percent of page box */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Unlocks World Codex entry id when found */
  codexEntryId?: string;
  /** Stub secret for in-game quest unlock */
  secretCode?: string;
  rewardId?: string;
  hint?: string;
  canonLink?: ComicCanonLink;
};

/** Panel canvas frame — percent of page art box for multi-panel layouts. */
export type ComicPanelFrame = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Optional cinematic tilt in degrees */
  tiltDeg?: number;
  /** Speed-line / impact overlay hint (CSS class key) */
  impact?: "none" | "speed-lines" | "impact-burst" | "rift-flare";
};

export type ComicPanel = {
  id: string;
  artSrc?: string;
  artAlt?: string;
  atmosphere?:
    | "dawn"
    | "day"
    | "dusk"
    | "night"
    | "rift"
    | "festival"
    | "storm"
    | "ruin"
    | "forge"
    | "celestial"
    | "space"
    | "void"
    | "battle"
    | "memory"
    | "market";
  caption?: string;
  bubbles: ComicBubble[];
  /** Explicit canvas placement; auto-derived from layout when omitted */
  frame?: ComicPanelFrame;
  /** Focus id for guided panel reading */
  focusId?: string;
  canonLink?: ComicCanonLink;
};

export type ComicPage = {
  id: string;
  pageNumber: number;
  layout: ComicPanelLayout;
  /** Publishing role — defaults to story/splash/end from layout when omitted */
  role?: ComicPageRole;
  title?: string;
  artSrc?: string;
  artAlt?: string;
  atmosphere?: ComicPanel["atmosphere"];
  panels: ComicPanel[];
  loreSidebar?: { title: string; body: string };
  hotspots?: ComicHotspot[];
  developerNote?: string;
  isKeyArt?: boolean;
  /** Double-page spread partner page id (left/right) */
  spreadWith?: string;
  /** Future music bed cue id */
  musicCueId?: string;
  /** Future voice script cue id */
  voiceCueId?: string;
  /**
   * When true, `artSrc` is a full painted comic plate (gutters + scenes baked in).
   * Reader shows one full-bleed image and remaps panel bubble coords to page space
   * instead of CSS-cropping the same plate into each panel frame.
   */
  composedPlate?: boolean;
  /**
   * When true, dialogue / narration / SFX / titles are painted into the plate image.
   * Reader hides HTML bubble overlays and title chrome (text kept for a11y / Studio).
   */
  bakedLettering?: boolean;
};

export type ComicCollectible = {
  id: string;
  kind: "cover" | "frame" | "wallpaper" | "avatar" | "badge" | "title";
  label: string;
  description: string;
  coverKind?: CoverVariantKind;
};

export type ComicReward = {
  id: string;
  label: string;
  description: string;
  kind: "achievement" | "badge" | "title" | "wallpaper" | "avatar" | "frame" | "gallery";
  /** Credits cosmetic only — never SOL */
  creditsStub?: number;
};

export type ComicCommunityVoteOption = {
  id: string;
  label: string;
  blurb: string;
};

/** How an issue becomes readable — never crypto-gated for core story. */
export type ComicUnlockGate =
  | { kind: "free" }
  | { kind: "campaign"; chapterId: string; label: string }
  | { kind: "boss"; bossId: string; label: string }
  | { kind: "achievement"; achievementId: string; label: string }
  | { kind: "event"; eventKey: string; label: string }
  | { kind: "battle-pass"; seasonId: string; tier: number; label: string }
  | { kind: "season"; seasonId: string; label: string }
  | { kind: "marketplace"; skuId: string; label: string; cosmeticOnly: true }
  /** Sequential shelf lock — complete a prior issue (or use admin-dev / COMICS_DEV_UNLOCK). */
  | { kind: "prior-issue"; slug: string; label: string }
  /** Development / admin override gate (paired with prior-issue locks). */
  | { kind: "admin-dev"; label: string };

export type ComicCharacterRef = {
  name: string;
  role: string;
  blurb: string;
  /** Official species / companion slug when applicable */
  speciesSlug?: string;
  canonLink?: ComicCanonLink;
};

export type ComicIssueMeta = {
  slug: string;
  issueNumber: number;
  title: string;
  subtitle: string;
  synopsis: string;
  publishedAt: string;
  readingTimeMinutes: number;
  status: "published" | "scheduled" | "draft";
  covers: ComicCover[];
  tags: string[];
  playChapterHref?: string;
  playChapterLabel?: string;
  /** Links to Dynamic World Event when present */
  worldEventKey?: string;
  worldEventHref?: string;
  collectibles: ComicCollectible[];
  rewards: ComicReward[];
  hasCommunityVote?: boolean;
  votePrompt?: string;
  voteOptions?: ComicCommunityVoteOption[];
  characters: ComicCharacterRef[];
  locations: { name: string; blurb: string; canonLink?: ComicCanonLink }[];
  timelineNote?: string;
  factions?: { name: string; blurb: string }[];
  commentary?: string[];
  conceptArtSrcs?: string[];
  wallpaperSrcs?: string[];
  /** Story arc id (see story-arcs.ts) */
  arcId?: string;
  /** Volume id within series */
  volumeId?: string;
  /** True when this issue closes a volume (Archive Shelves badge). */
  volumeFinale?: boolean;
  /** True when this issue opens a volume (Archive Shelves badge). */
  volumeOpener?: boolean;
  /** Short shelf badge label (e.g. "Volume One Finale"). */
  shelfBadge?: string;
  /** Expansion / set tag */
  expansionId?: string;
  /** Unlock rules — core story must include a free path */
  unlockGates?: ComicUnlockGate[];
  /** Next-issue teaser copy */
  nextIssueTeaser?: { slug: string; hook: string };
  /** Fake in-universe ad ids used on ad pages */
  adIds?: string[];
  /** Archive Shelf spoiler gates (e.g. traitor identity until complete). */
  spoilerPolicy?: {
    hideTraitorNameUntilComplete?: boolean;
    hideEvidenceFileUntilReveal?: boolean;
    hideTraitorProfileUntilComplete?: boolean;
    publicCharactersOmitTraitorRole?: boolean;
  };
};

export type ComicIssue = ComicIssueMeta & {
  pages: ComicPage[];
};

export type ComicStoryArc = {
  id: string;
  title: string;
  subtitle: string;
  issueSlugs: string[];
  expansionId?: string;
};

export type ComicVolume = {
  id: string;
  title: string;
  volumeNumber: number;
  issueSlugs: string[];
};

export type ComicSeriesDef = {
  id: string;
  title: string;
  subtitle: string;
  volumes: ComicVolume[];
  arcs: ComicStoryArc[];
};

export type ComicProgressIssue = {
  currentPage: number;
  maxPageReached: number;
  completed: boolean;
  bookmarkedPage: number | null;
  favorite: boolean;
  foundHotspots: string[];
  unlockedSecrets: string[];
  unlockedRewards: string[];
  collectedCovers: CoverVariantKind[];
  voteChoiceId?: string;
  lastReadAt?: string;
  completedAt?: string;
};

export type ComicProgressState = {
  version: 1;
  issues: Record<string, ComicProgressIssue>;
  favorites: string[];
  achievements: string[];
  unlockedCodex: string[];
  unlockedRewards: string[];
  /** Card / family ids teased from comic hotspots */
  unlockedCards: string[];
  settings: {
    darkMode: boolean;
    highContrast: boolean;
    musicEnabled: boolean;
    sfxEnabled: boolean;
    /** Pre-generated ElevenLabs page VO (silent if clips missing) */
    narrationEnabled: boolean;
    /** Guided panel-by-panel reading */
    guidedReading: boolean;
    zoom: number;
  };
};
