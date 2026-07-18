/**
 * Legends of the Rift — official comic series types.
 * Website-first; Credits/cosmetic unlocks only (never SOL).
 */

export type CoverVariantKind = "standard" | "anniversary" | "foil";

export type ComicCover = {
  kind: CoverVariantKind;
  src: string;
  label: string;
  unlockHint?: string;
};

export type ComicPanelLayout =
  | "splash"
  | "wide"
  | "two-col"
  | "three-stack"
  | "grid-2x2"
  | "grid-3"
  | "narrative"
  | "lore"
  | "end";

export type ComicBubbleKind = "speech" | "thought" | "narration" | "sfx" | "caption";

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
};

export type ComicPanel = {
  id: string;
  artSrc?: string;
  artAlt?: string;
  atmosphere?: "dawn" | "day" | "dusk" | "night" | "rift" | "festival" | "storm" | "ruin";
  caption?: string;
  bubbles: ComicBubble[];
};

export type ComicPage = {
  id: string;
  pageNumber: number;
  layout: ComicPanelLayout;
  title?: string;
  artSrc?: string;
  artAlt?: string;
  atmosphere?: ComicPanel["atmosphere"];
  panels: ComicPanel[];
  loreSidebar?: { title: string; body: string };
  hotspots?: ComicHotspot[];
  developerNote?: string;
  isKeyArt?: boolean;
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
  characters: { name: string; role: string; blurb: string }[];
  locations: { name: string; blurb: string }[];
  timelineNote?: string;
  factions?: { name: string; blurb: string }[];
  commentary?: string[];
  conceptArtSrcs?: string[];
  wallpaperSrcs?: string[];
};

export type ComicIssue = ComicIssueMeta & {
  pages: ComicPage[];
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
  settings: {
    darkMode: boolean;
    highContrast: boolean;
    musicEnabled: boolean;
    sfxEnabled: boolean;
    /** Pre-generated ElevenLabs page VO (silent if clips missing) */
    narrationEnabled: boolean;
    zoom: number;
  };
};
