/**
 * Riftwilds TCG — content schema (data-first).
 * Presentation (art, VFX) references IDs; battle engine consumes stats/effects.
 * Original IP — do not copy protected TCG mechanics or characters.
 */

export const TCG_CARD_TYPES = [
  "creature",
  "hero",
  "spell",
  "equipment",
  "relic",
  "location",
  "weather",
  "artifact",
  "trap",
  "companion",
  "legendary",
  "token",
  "event",
  "quest",
] as const;
export type TcgCardType = (typeof TCG_CARD_TYPES)[number];

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
  keywords: string[];
  abilities: TcgAbility[];
  passive?: string | null;
  localization: TcgLocalization;
  art: TcgArtMeta;
  animation: TcgAnimationRef;
  sound: TcgSoundRef;
  particles?: string[];
  voiceDirection?: string;
  upgradePath?: string[];
  craftCost: number;
  sellValue: number;
  collectionTags: string[];
  expansionId: string;
  relatedNpcs: string[];
  relatedQuests: string[];
  relatedRiftlings: string[];
  /** Species slug when this card is a Riftling creature */
  riftlingSlug?: string;
  regionId?: string;
  tokenOf?: string;
  isToken?: boolean;
  balanceNotes?: string;
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
