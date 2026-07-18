import type { FaqEntry } from "@/game/academy/types";

export const ACADEMY_FAQ: FaqEntry[] = [
  {
    id: "faq-sol-required",
    question: "Do I need SOL to play Riftwilds?",
    answer:
      "No. SOL is never required for core play — Rift Battles, Card Binder, quests, Credit packs, hatchery, or Academy lessons. Credits are earned by playing. Optional marketplace/token features may involve crypto later and are clearly labeled.",
    keywords: ["sol", "crypto", "pay", "free", "required", "wallet"],
    relatedLessonIds: ["b05-credits-sol", "cur-economy"],
    category: "economy",
  },
  {
    id: "faq-credits",
    question: "What are Keeper Credits?",
    answer:
      "Credits are soft currency earned through battles, quests, care, and events. Spend them in the Shop for packs and everyday goods, or trade on the Credits marketplace. They are not a promise of profit.",
    keywords: ["credits", "currency", "earn", "shop", "packs"],
    relatedLessonIds: ["b05-credits-sol", "b16-shop"],
    category: "economy",
  },
  {
    id: "faq-rift-battle",
    question: "How do Rift Battles work?",
    answer:
      "Open /tcg/battle for a practice match. Spend Rift Energy to play units and spells, then End turn so your board strikes. Reduce the foe’s Keeper HP to 0. SOL is never required.",
    keywords: ["battle", "tcg", "rift battle", "practice", "combat", "duel"],
    relatedLessonIds: ["b15-training", "cur-combat"],
    category: "combat",
  },
  {
    id: "faq-rift-energy",
    question: "What is Rift Energy?",
    answer:
      "Rift Energy is the turn resource for playing cards. You start with 1 max, gain +1 max each turn up to a cap of 10, and refill to the turn max at the start of your turn (no carry-over).",
    keywords: ["rift energy", "energy", "re", "mana", "cost"],
    relatedLessonIds: ["cur-combat"],
    category: "combat",
  },
  {
    id: "faq-binder",
    question: "Where is my card collection?",
    answer:
      "Open Card Binder at /tcg/collection. Shape a legal deck (20–40 cards) from cards you own. Packs from the Shop add to this binder.",
    keywords: ["binder", "collection", "deck", "cards"],
    relatedLessonIds: ["b14-inventory"],
    category: "ui",
  },
  {
    id: "faq-packs",
    question: "How do I get more cards?",
    answer:
      "Buy gameplay packs in the Shop with Credits, complete quests, or trade on the Marketplace. Premium SOL packs stay optional and never grant exclusive match power.",
    keywords: ["packs", "cards", "shop", "marketplace"],
    relatedLessonIds: ["b16-shop"],
    category: "economy",
  },
  {
    id: "faq-quests-tcg",
    question: "What do quests track at launch?",
    answer:
      "Primarily Rift Battle wins, binder opens, energy spends, hatchery, and care. Living World habitat steps are soft-deferred — you can ignore Live World and still clear TCG quests.",
    keywords: ["quests", "daily", "weekly", "objectives"],
    relatedLessonIds: ["b13-quests"],
    category: "general",
  },
  {
    id: "faq-arena-points",
    question: "Are Arena Points worth real money?",
    answer:
      "No. Arena Points are earn-only, non-transferable, and have no monetary value. Legacy Arena is soft-secondary to Rift Battles and has no wagering.",
    keywords: ["arena", "points", "money", "wager", "gamble"],
    relatedLessonIds: ["b15-training", "adv-ranked"],
    category: "combat",
  },
  {
    id: "faq-help-page",
    question: "Where is the Help guide?",
    answer:
      "Open /help for the TCG-first Keeper Guide (battles, energy, binder, packs, quests, shop). The header Help link goes there. Academy holds interactive drills and this searchable FAQ.",
    keywords: ["help", "guide", "f1", "tutorial"],
    relatedLessonIds: ["b01-welcome", "b28-keybinds"],
    category: "ui",
  },
  {
    id: "faq-move",
    question: "How do I move in Live World preview?",
    answer:
      "Live World is an optional habitat preview — not required for Rift Battles. If you enter: use W A S D or arrow keys, hold Shift to sprint. On mobile, use the on-screen stick when enabled.",
    keywords: ["move", "wasd", "walk", "controls", "live world"],
    relatedLessonIds: ["b02-controls", "cur-controls"],
    category: "controls",
  },
  {
    id: "faq-interact",
    question: "How do I talk to NPCs in Live World?",
    answer:
      "Only inside the Live World preview: walk close until a prompt appears, then press E or Space. Core play (battles, binder, quests) does not require NPC dialogue.",
    keywords: ["npc", "talk", "interact", "e"],
    relatedLessonIds: ["b03-interact", "b12-npcs"],
    category: "npcs",
  },
  {
    id: "faq-map",
    question: "How do I open the Live World map?",
    answer:
      "In the Live World preview, press M or use the map control on the HUD when available. For the card game, use Play destinations from /help instead.",
    keywords: ["map", "m", "waypoint"],
    relatedLessonIds: ["b04-map", "cur-world-map"],
    category: "world",
  },
  {
    id: "faq-academy-building",
    question: "Where is the Player Academy in Commons?",
    answer:
      "In Live World Commons (preview), look east of the central plaza near the Rift Archive / training yard. Interact (E) and choose Enter Academy — or open /academy / /help from the site anytime.",
    keywords: ["academy", "building", "commons", "where"],
    relatedLessonIds: ["b11-commons"],
    category: "world",
  },
  {
    id: "faq-help-key",
    question: "What does F1 do?",
    answer:
      "F1 opens Help from Live World (Keeper Guide at /help). F2 opens keybinds settings. Esc closes panels, then the pause menu.",
    keywords: ["f1", "help", "esc", "f2"],
    relatedLessonIds: ["b28-keybinds"],
    category: "controls",
  },
  {
    id: "faq-hatch",
    question: "How do I get my first Riftling?",
    answer:
      "Open the Hatchery, claim an eligible starter egg, wait for incubation, then hatch. Check Collection / Profile afterward. Hatching is optional alongside the TCG loop.",
    keywords: ["hatch", "egg", "starter", "first"],
    relatedLessonIds: ["b06-hatchery", "b07-hatch"],
    category: "riftlings",
  },
  {
    id: "faq-care",
    question: "How do I care for my pet?",
    answer:
      "Use feed, play, and rest actions on the pet page. Visit Recovery Center after hard content. Keep an eye on care score — care quests still award Credits.",
    keywords: ["care", "feed", "pet", "hunger"],
    relatedLessonIds: ["b09-care", "cur-pet-care"],
    category: "pet-care",
  },
  {
    id: "faq-scam",
    question: "Someone DMed me asking for my seed phrase. What do I do?",
    answer:
      "Never share seed phrases or private keys. Official staff will not ask for them. Report the account and review Fairness / Risk pages.",
    keywords: ["scam", "seed", "phishing", "dm", "wallet"],
    relatedLessonIds: ["b24-fairness"],
    category: "general",
  },
  {
    id: "faq-progress",
    question: "Does Academy progress save?",
    answer:
      "Yes — progress, favorites, and achievements save locally in your browser (riftwilds-academy-progress-v1). Backend sync is a future phase.",
    keywords: ["save", "progress", "local", "sync"],
    relatedLessonIds: ["b01-welcome"],
    category: "general",
  },
  {
    id: "faq-rewards",
    question: "What rewards does the Academy give?",
    answer:
      "Small one-time badges, titles, and token credit gifts for path completion. There are no large repeatable currency farms in the Academy.",
    keywords: ["reward", "badge", "graduate", "credits"],
    relatedLessonIds: ["b30-graduate"],
    category: "general",
  },
  {
    id: "faq-mobile",
    question: "Does Help work on mobile?",
    answer:
      "Yes. The Help guide stacks sections for small screens; Play destinations stay tappable. Academy’s three-panel layout also stacks for touch.",
    keywords: ["mobile", "phone", "responsive"],
    relatedLessonIds: ["b27-mobile"],
    category: "ui",
  },
  {
    id: "faq-video",
    question: "Do tutorial videos autoplay?",
    answer:
      "No. Embedded videos never autoplay by default. You can change speed, toggle captions when provided, and use fullscreen.",
    keywords: ["video", "autoplay", "captions", "speed"],
    relatedLessonIds: ["b01-welcome"],
    category: "ui",
  },
];
