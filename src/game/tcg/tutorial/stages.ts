/**
 * Staged interactive tutorial scaffold for Riftwilds TCG.
 * Rewards are soft-currency / cosmetics only — never crypto.
 */

export type TutorialStageId =
  | "summon"
  | "combat"
  | "energy"
  | "lanes"
  | "spells"
  | "evolve"
  | "cardadvantage"
  | "deckbuild"
  | "fullmatch";

export type TutorialStage = {
  id: TutorialStageId;
  order: number;
  title: string;
  objective: string;
  hint: string;
  /** Optional practice mode flag when launching a guided match. */
  launchMode?: "tutorial";
};

export const TUTORIAL_STAGES: TutorialStage[] = [
  {
    id: "summon",
    order: 1,
    title: "Play a creature",
    objective: "Spend Rift Energy to summon one creature to the Frontline.",
    hint: "Select a cheap unit in hand, then Play or drag onto your field.",
    launchMode: "tutorial",
  },
  {
    id: "combat",
    order: 2,
    title: "Attack and defend",
    objective: "End your turn so ready creatures strike. Watch Frontline protect the Keeper.",
    hint: "Exhausted units rest. Ready units strike during Combat.",
    launchMode: "tutorial",
  },
  {
    id: "energy",
    order: 3,
    title: "Energy and abilities",
    objective: "See Energy rise each turn (2 → 10) and play a second card.",
    hint: "Energy refills to the turn maximum at the start of your turn.",
    launchMode: "tutorial",
  },
  {
    id: "lanes",
    order: 4,
    title: "Frontline and Backline",
    objective: "Fill a Frontline slot, then place a Backline support unit.",
    hint: "Frontline blocks Keeper strikes. Flying and Pierce can bypass.",
    launchMode: "tutorial",
  },
  {
    id: "spells",
    order: 5,
    title: "Spells and reactions",
    objective: "Cast a spell. Learn Slow / Fast timing (Reaction windows scaffolded).",
    hint: "Fast spells may resolve in Second Main. Reactions nest up to depth 4.",
    launchMode: "tutorial",
  },
  {
    id: "evolve",
    order: 6,
    title: "Evolve a companion",
    objective: "Trigger Awaken or an evolution-style transform on a unit.",
    hint: "Awaken units transform at the start of your next turn.",
    launchMode: "tutorial",
  },
  {
    id: "cardadvantage",
    order: 7,
    title: "Card advantage",
    objective:
      "Draw comes at turn start — not when you play. Use Insight, Scout, Channel, or Focus for extra cards.",
    hint:
      "You draw 1 at the start of each turn. Playing a card does not auto-replace it. Channel spends leftover Energy; Recycle filters bricks.",
    launchMode: "tutorial",
  },
  {
    id: "deckbuild",
    order: 8,
    title: "Build a legal deck",
    objective: "Assemble 29 cards + 1 Commander within copy and composition limits.",
    hint: "Min 14 creatures · max 10 spells · max 6 support · max 3 power rarities.",
  },
  {
    id: "fullmatch",
    order: 9,
    title: "Guided match",
    objective: "Finish a complete Practice Board duel under Standard rules.",
    hint: "Win by reducing the enemy Keeper to 0 HP.",
    launchMode: "tutorial",
  },
];

export const TUTORIAL_REWARDS = {
  gold: 250,
  starterPackHint: "Starter cards already in binder",
  cosmeticCardBack: "tutorial-rift-sigil",
  codexEntry: "codex-tutorial-keeper-oath",
} as const;

export function getTutorialStage(id: TutorialStageId): TutorialStage | undefined {
  return TUTORIAL_STAGES.find((s) => s.id === id);
}
