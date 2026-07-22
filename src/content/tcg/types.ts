/**
 * Riftwilds TCG — content schema (data-first).
 * Presentation (art, VFX) references IDs; battle engine consumes stats/effects.
 * Original IP — do not copy protected TCG mechanics or characters.
 */

/**
 * Canonical card categories (Companion / Spell / Item / Equipment / Terrain /
 * Relic / Trap / Commander / Evolution). See `framework/card-categories.ts`.
 * Legacy aliases remain accepted until callers migrate fully.
 */
export const TCG_CARD_CATEGORIES_CANONICAL = [
  "companion",
  "spell",
  "item",
  "equipment",
  "terrain",
  "relic",
  "trap",
  "commander",
  "evolution",
] as const;

/** @deprecated Prefer TCG_CARD_CATEGORIES_CANONICAL — kept for legacy JSON/readers. */
export const TCG_CARD_TYPES = [
  ...TCG_CARD_CATEGORIES_CANONICAL,
  "creature",
  "hero",
  "location",
  "weather",
  "artifact",
  "legendary",
  "token",
  "event",
  "quest",
] as const;
export type TcgCardType = (typeof TCG_CARD_TYPES)[number];
export type TcgCardCategoryCanonical =
  (typeof TCG_CARD_CATEGORIES_CANONICAL)[number];

export const TCG_RARITIES = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
  "founder",
  "seasonal",
  "holiday",
  "animated",
  "foil",
  "signed",
  "collector",
] as const;
export type TcgRarity = (typeof TCG_RARITIES)[number];

export const TCG_ELEMENTS = [
  "fire",
  "water",
  "nature",
  "earth",
  "storm",
  "crystal",
  "shadow",
  "light",
  "spirit",
  "arcane",
  "poison",
  "metal",
  "celestial",
  "void",
  "neutral",
] as const;
export type TcgElement = (typeof TCG_ELEMENTS)[number];

/** Structured effect the battle engine can interpret. */
export type TcgEffectOp =
  | "deal_damage"
  | "heal"
  | "draw"
  | "gain_energy"
  | "spend_energy"
  | "buff_atk"
  | "buff_hp"
  | "summon_token"
  | "apply_keyword"
  | "destroy_target"
  | "silence"
  | "riftbond_link"
  | "echo_replay"
  | "ward_grant"
  | "corrupt_drain"
  | "awaken_transform"
  | "overflow_splash"
  | "guardian_taunt"
  | "soulbind_pair"
  | "harmony_buff"
  | "charge_ready"
  | "empower_scale"
  | "ancient_once"
  | "shatter_armor"
  | "bloom_grow"
  | "custom";

export type TcgEffect = {
  op: TcgEffectOp;
  value?: number;
  target?: "self" | "enemy" | "all_enemies" | "all_allies" | "board" | "random_enemy" | "hero";
  keyword?: string;
  tokenId?: string;
  /** Freeform engine hint for AI / scripting */
  aiHint?: string;
  notes?: string;
};

export type TcgAbility = {
  id: string;
  name: string;
  timing: "battlecry" | "deathrattle" | "passive" | "activated" | "aura" | "trigger" | "ultimate";
  text: string;
  effects: TcgEffect[];
  energyCost?: number;
};

export type TcgLocalization = {
  name: string;
  typeLine?: string;
  rulesText: string;
  flavorText: string;
  loreBlurb?: string;
  /** Longer collection / codex lore (optional). */
  loreBody?: string;
  /** World / overworld hook id for item/equipment scaffolding. */
  worldHookId?: string;
  /** Short UI hint for battle + world dual-use items. */
  worldHookHint?: string;
};

export type TcgArtMeta = {
  promptId: string;
  prompt: string;
  negativePrompt: string;
  camera?: string;
  lighting?: string;
  palette?: string[];
  mood?: string;
  pose?: string;
  background?: string;
  /**
   * Existing public asset path when art already exists (e.g. `/assets/pets/thumbs/cindercub.webp`).
   * Presentation should prefer this over generating from `prompt`.
   */
  assetPath?: string;
  /**
   * Composited full card face (frame + creature/item art), e.g. `/assets/tcg/cards/rotr-c-ashwing.webp`.
   * Prefer over `assetPath` in binder / battle presentation.
   */
  cardImagePath?: string;
  /** Optional game-library entry id when art is sourced from `game-library.json`. */
  libraryAssetId?: string;
};

export type TcgAnimationRef = {
  idle?: string;
  play?: string;
  attack?: string;
  death?: string;
  ultimate?: string;
};

export type TcgSoundRef = {
  play?: string;
  hit?: string;
  death?: string;
  ambient?: string;
};

/** Competitive / board role — orthogonal to card type. */
export const TCG_ROLES = [
  "tank",
  "bruiser",
  "assassin",
  "support",
  "healer",
  "controller",
  "summoner",
  "swarm",
  "defender",
  "energy_generator",
  "disruptor",
  "finisher",
  "utility",
  /** @deprecated legacy aliases — canonicalize via roles.ts */
  "striker",
  "skirmisher",
  "wall",
  "ramp",
] as const;
export type TcgRole = (typeof TCG_ROLES)[number];

/** How a gameplay card enters a binder (never crypto-gated for competitive). */
export const TCG_UNLOCK_METHODS = [
  "starter",
  "pack",
  "quest",
  "craft",
  "season_reward",
  "event",
  "codex",
  "hatch_companion",
  "npc_gift",
  "placeholder",
] as const;
export type TcgUnlockMethod = (typeof TCG_UNLOCK_METHODS)[number];

/** Soft currencies for crafting — NEVER SOL / crypto. */
export type TcgCraftCost = {
  /** Soft Gold (Credits / Gold ledger alias in UI). */
  gold: number;
  /** Rift Shards from packs / duels / dusting. */
  riftShards: number;
  /** Ancient Fragments for mythic / legendary lines. */
  ancientFragments: number;
  /** Duplicate copies consumed (same card id). */
  duplicateCopies: number;
};

export type TcgVoiceLines = {
  play?: string;
  attack?: string;
  death?: string;
  ultimate?: string;
  idle?: string;
};

export type TcgBalanceMetrics = {
  /** Designer / auto score 0–100 (higher = stronger). */
  powerScore: number;
  /** Win-rate proxy target band midpoint (0–1). */
  targetWinRate: number;
  /** Play-rate watch flag. */
  watchlist: boolean;
  /** Last balance pass id (e.g. ROTR-B3). */
  patchTag?: string;
  notes?: string;
};

export type TcgCard = {
  id: string;
  setId: string;
  collectorNumber: number;
  type: TcgCardType;
  element: TcgElement;
  rarity: TcgRarity;
  energyCost: number;
  attack?: number | null;
  health?: number | null;
  /** Optional AAA combat axis — derived when absent. */
  defense?: number | null;
  /** Optional AAA tempo axis — derived when absent. */
  speed?: number | null;
  /** Board / deck role — derived when absent. */
  role?: TcgRole | null;
  /** Creature family id (`family-{slug}`) when bonded to a line. */
  familyId?: string | null;
  evolutionStage?: string | null;
  keywords: string[];
  abilities: TcgAbility[];
  passive?: string | null;
  /** Structured ability hooks (optional; abilities[] remains canonical). */
  activeAbilityId?: string | null;
  ultimateAbilityId?: string | null;
  strengths?: string[];
  weaknesses?: string[];
  factionId?: string | null;
  localization: TcgLocalization;
  art: TcgArtMeta;
  animation: TcgAnimationRef;
  sound: TcgSoundRef;
  particles?: string[];
  voiceDirection?: string;
  voiceLines?: TcgVoiceLines;
  upgradePath?: string[];
  /** Legacy scalar craft cost (Gold). Prefer `craftCosts`. */
  craftCost: number;
  craftCosts?: TcgCraftCost;
  sellValue: number;
  unlockMethod?: TcgUnlockMethod;
  collectionTags: string[];
  /**
   * Competitive curve / playstyle tags (Tempo, Starter, Utility, …).
   * Orthogonal to board role.
   */
  curveTags?: string[];
  expansionId: string;
  relatedNpcs: string[];
  relatedQuests: string[];
  relatedRiftlings: string[];
  /** Species slug when this card is a Riftling creature */
  riftlingSlug?: string;
  regionId?: string;
  tokenOf?: string;
  isToken?: boolean;
  /** True when auto-generated for pool scale tests (replaceable). */
  isPlaceholder?: boolean;
  /** Competitive constructed eligibility (false = lore/prop only). */
  competitiveEligible?: boolean;
  balanceNotes?: string;
  balance?: TcgBalanceMetrics;
  /** Base gameplay card id when this row is a cosmetic variant shell. */
  baseCardId?: string | null;
  /** Cosmetic finish — never changes competitive stats. */
  finish?: TcgCardFinish | null;
};

export type TcgKeyword = {
  id: string;
  name: string;
  shortText: string;
  rules: string;
  interactions: string[];
  counterplay: string[];
  animationHint: string;
};

export type TcgHero = {
  id: string;
  name: string;
  title: string;
  element: TcgElement;
  biography: string;
  personality: string[];
  voice: string;
  passive: TcgAbility;
  ultimate: TcgAbility;
  deckPreference: string[];
  startingCardIds: string[];
  difficulty: "easy" | "medium" | "hard" | "expert";
  visualIdentity: string;
  portraitPromptId: string;
  relatedRegion?: string;
  relatedNpc?: string;
};

/** Playable battle faction (affinity-aligned). Complements narrative factions. */
export type TcgFaction = {
  id: string;
  name: string;
  shortName: string;
  /** Arena / engine affinity name string (e.g. EMBER). */
  affinity: string;
  primaryElement: TcgElement;
  secondaryElements: TcgElement[];
  storyFactionHook: string;
  lore: string;
  playstyle: string;
  commanderHeroIds: string[];
  defaultStarterDeckId: string;
  bannerAccent: string;
  regionHints: string[];
};

/** Curated teaching / showcase list (ids only). */
export type TcgStarterSet = {
  id: string;
  name: string;
  version: number;
  purpose: string;
  deckSize: number;
  recommendedCommanderId: string;
  factionMix: string[];
  cardIds: string[];
  notes: string[];
};

/** Bond-line stage along a species Card Family (original Riftwilds terms). */
export const TCG_EVOLUTION_STAGES = [
  "shellseed",
  "softling",
  "companion",
  "keeper",
  "riftmarked",
  "awaken",
  "ascendant",
] as const;
export type TcgEvolutionStageId = (typeof TCG_EVOLUTION_STAGES)[number];

/** Cosmetic finishes only — never competitive power. */
export const TCG_CARD_FINISHES = [
  "standard",
  "foil",
  "gold",
  "crystal",
  "animated",
] as const;
export type TcgCardFinish = (typeof TCG_CARD_FINISHES)[number];

export type TcgEvolutionStage = {
  stageId: TcgEvolutionStageId | string;
  label: string;
  order: number;
  status: "released" | "planned";
  cardId: string | null;
  displayName: string;
  rarityHint: string;
  animationHook: string;
  loreUnlock: string;
  flavorText: string;
  /** Branch ids available from this stage (usually awaken). */
  branchIds: string[];
};

export type TcgEvolutionBranch = {
  id: string;
  name: string;
  fromStageId: string;
  description: string;
  status: "released" | "planned";
  tipCardIds: string[];
  /** If true, branch is cosmetic-only (no PvP power). */
  cosmeticOnly: boolean;
};

export type TcgFamilyLoreChapter = {
  id: string;
  title: string;
  unlockStageId: string;
  body: string;
};

export type TcgCardFamily = {
  id: string;
  speciesSlug: string;
  name: string;
  title: string;
  factionId: string;
  affinity: string;
  identity: string;
  strengths: string[];
  weaknesses: string[];
  signatureMechanic: string;
  portraitArtPath: string;
  stages: TcgEvolutionStage[];
  branches: TcgEvolutionBranch[];
  finishesSupported: TcgCardFinish[];
  completionReward: {
    id: string;
    label: string;
    kind: "cosmetic" | "credits" | "title";
    notes: string;
  };
  loreChapters: TcgFamilyLoreChapter[];
};

export type TcgCardFamilyBundle = {
  version: number;
  stageLabels: { id: string; label: string; order: number }[];
  finishes: { id: TcgCardFinish | string; label: string; cosmetic: boolean }[];
  families: TcgCardFamily[];
};

export type TcgDeck = {
  id: string;
  name: string;
  strategy: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  strengths: string[];
  weaknesses: string[];
  /** cardId → count */
  cards: Record<string, number>;
  recommendedUpgrades: string[];
  npcOwner?: string;
  lore: string;
  archetype: string;
  kind: "starter" | "npc" | "boss" | "tournament" | "ai";
};

export type TcgExpansion = {
  id: string;
  name: string;
  code: string;
  status: "foundational" | "planned" | "live" | "retired";
  story: string;
  newRegion?: string;
  estimatedCardCount: number;
  themes: string[];
  releaseOrder: number;
};

export type TcgBoardTheme = {
  id: string;
  name: string;
  regionHint?: string;
  ambientAnimation: string;
  weather: string;
  particles: string[];
  musicCue: string;
  interactiveProps: string[];
  artPrompt: string;
};

export type TcgCardFrame = {
  id: string;
  name: string;
  appliesTo: string[];
  layers: string[];
  accentColor: string;
  notes: string;
};

export type TcgContentBundle = {
  version: string;
  generatedAt: string;
  expansionId: string;
  riftEnergy: {
    start: number;
    maxCap: number;
    perTurnGain: number;
    notes: string;
  };
  keywords: TcgKeyword[];
  cards: TcgCard[];
  heroes: TcgHero[];
  decks: TcgDeck[];
  expansions: TcgExpansion[];
  boardThemes: TcgBoardTheme[];
  cardFrames: TcgCardFrame[];
};
