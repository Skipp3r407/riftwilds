/**
 * Structured battle events for the player-facing Event Feed.
 * Engine still emits typed codes; payloads are enriched for NL rendering.
 */

export type TcgFeedFilter =
  | "all"
  | "combat"
  | "abilities"
  | "cards"
  | "status"
  | "system";

export type TcgFeedIcon =
  | "draw"
  | "energy"
  | "summon"
  | "attack"
  | "damage"
  | "heal"
  | "death"
  | "ability"
  | "shield"
  | "buff"
  | "debuff"
  | "phase"
  | "victory"
  | "system"
  | "card"
  | "rest";

export type TcgFeedTone =
  | "neutral"
  | "you"
  | "foe"
  | "damage"
  | "heal"
  | "energy"
  | "death"
  | "system"
  | "phase";

/** Categories used for filter chips (an event may map to multiple). */
export type TcgEventCategory =
  | "combat"
  | "abilities"
  | "cards"
  | "status"
  | "system"
  | "energy"
  | "draw";

export type TcgMatchEventPayload = Record<string, unknown> & {
  /** Monotonic id within the match. */
  seq?: number;
  turn?: number;
  phase?: string;
  /** Resolved display name for primary card/unit. */
  cardName?: string | null;
  attackerName?: string | null;
  targetName?: string | null;
  /** True when this should never appear in the player feed (dev-only). */
  hiddenFromPlayer?: boolean;
};

export type FeedParticipant = {
  instanceId?: string;
  defId?: string;
  name?: string;
  sideId?: string;
};

export type FeedLine = {
  id: string;
  kind: "line" | "divider" | "phase" | "combat-block" | "summary";
  /** Filters this line matches (besides "all"). */
  filters: Exclude<TcgFeedFilter, "all">[];
  icon: TcgFeedIcon;
  tone: TcgFeedTone;
  text: string;
  /** Hover detail — attack/target/damage/etc. */
  tooltip?: string;
  /** Board units / keepers to pulse when clicked. */
  highlightIds?: string[];
  turn?: number;
  /** Raw engine types that produced this line (for Dev console). */
  sourceTypes?: string[];
  flash?: "damage" | "heal" | "energy" | "newest";
  children?: FeedLine[];
  yours?: boolean;
};

export type MatchFeedSummary = {
  turns: number;
  damageDealt: number;
  damageTaken: number;
  healing: number;
  cardsPlayed: number;
  companionsLost: number;
  abilitiesFired: number;
  winnerId: string | null;
  reason: string | null;
};
