import type { FaqEntry } from "@/game/academy/types";

export const ACADEMY_FAQ: FaqEntry[] = [
  {
    id: "faq-sol-required",
    question: "Do I need SOL to play Riftwilds?",
    answer:
      "No. SOL is never required for basic gameplay — hatching a starter, caring for Riftlings, walking Live World, training in Arena, or completing the Academy. Credits are earned by playing. Optional marketplace/token features may involve crypto later and are clearly labeled.",
    keywords: ["sol", "crypto", "pay", "free", "required", "wallet"],
    relatedLessonIds: ["b05-credits-sol", "cur-economy"],
    category: "economy",
  },
  {
    id: "faq-credits",
    question: "What are Keeper Credits?",
    answer:
      "Credits are soft currency earned through play, care, quests, and events. Spend them in shops for everyday goods. They are not a promise of profit.",
    keywords: ["credits", "currency", "earn", "shop"],
    relatedLessonIds: ["b05-credits-sol", "b16-shop"],
    category: "economy",
  },
  {
    id: "faq-arena-points",
    question: "Are Arena Points worth real money?",
    answer:
      "No. Arena Points are earn-only, non-transferable, and have no monetary value. Arena has no wagering.",
    keywords: ["arena", "points", "money", "wager", "gamble"],
    relatedLessonIds: ["b15-training", "adv-ranked"],
    category: "combat",
  },
  {
    id: "faq-move",
    question: "How do I move in Live World?",
    answer: "Use W A S D or arrow keys. Hold Shift to sprint. On mobile, use the on-screen stick when enabled.",
    keywords: ["move", "wasd", "walk", "controls"],
    relatedLessonIds: ["b02-controls", "cur-controls"],
    category: "controls",
  },
  {
    id: "faq-interact",
    question: "How do I talk to NPCs?",
    answer: "Walk close until a prompt appears, then press E or Space. Choose Talk, Inspect, or Leave.",
    keywords: ["npc", "talk", "interact", "e"],
    relatedLessonIds: ["b03-interact", "b12-npcs"],
    category: "npcs",
  },
  {
    id: "faq-map",
    question: "How do I open the map?",
    answer: "Press M in Live World, or use the map control on the HUD when available.",
    keywords: ["map", "m", "waypoint"],
    relatedLessonIds: ["b04-map", "cur-world-map"],
    category: "world",
  },
  {
    id: "faq-academy-building",
    question: "Where is the Player Academy in Commons?",
    answer:
      "Look east of the central plaza near the Rift Archive / training yard for the Player Academy building. Interact (E) and choose Enter Academy. Archivist Solen can also point you here.",
    keywords: ["academy", "building", "commons", "where"],
    relatedLessonIds: ["b11-commons"],
    category: "world",
  },
  {
    id: "faq-help-key",
    question: "What does F1 do?",
    answer: "F1 opens Help / Academy from Live World. F2 opens keybinds settings. Esc closes panels, then the pause menu.",
    keywords: ["f1", "help", "esc", "f2"],
    relatedLessonIds: ["b28-keybinds"],
    category: "controls",
  },
  {
    id: "faq-hatch",
    question: "How do I get my first Riftling?",
    answer:
      "Open the Hatchery, claim an eligible starter egg, wait for incubation, then hatch. Check Collection / Profile afterward.",
    keywords: ["hatch", "egg", "starter", "first"],
    relatedLessonIds: ["b06-hatchery", "b07-hatch"],
    category: "riftlings",
  },
  {
    id: "faq-care",
    question: "How do I care for my pet?",
    answer:
      "Use feed, play, and rest actions on the pet page. Visit Recovery Center after hard content. Keep an eye on care score.",
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
    question: "Does the Academy work on mobile?",
    answer:
      "Yes. The three-panel layout stacks: search and categories first, lesson content, then progress tips. Touch targets are large enough for interactives.",
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
