import type { AcademyLesson } from "@/game/academy/types";

/**
 * Additive lore curriculum — story bible summaries for Keepers.
 * Does not alter beginner/advanced lesson IDs. Full canon: docs/story/STORY_BIBLE.md
 */
export const LORE_PATH_LESSONS: AcademyLesson[] = [
  {
    id: "lore-01-aeryndra",
    slug: "aeryndra-and-the-riftwilds",
    path: "curriculum",
    category: "world",
    difficulty: "beginner",
    order: 200,
    title: "Aeryndra & the Riftwilds",
    summary: "How a living networked world became the layered lands you explore.",
    etaMinutes: 4,
    keywords: ["aeryndra", "riftwilds", "fracture", "world", "lore", "history"],
    body: [
      "Before the Rifts, the world was called Aeryndra — not one kingdom, but regions joined by living Gateway Hearts.",
      "When the Prime Gateway overloaded during the Great Activation, reality layered instead of simply burning. People named those layered lands the Riftwilds.",
      "You still walk Aeryndra — remembered crooked. The Commons sits where stable Gateway paths still meet.",
    ],
    tips: ["Visit /about for the cinematic origin.", "Read docs/story/WORLD_HISTORY.md for continent maps."],
    media: [
      {
        type: "illustration",
        src: "/assets/story/timeline/age-of-gateways.png",
        alt: "Connected Gateway Hearts over a living world of many biomes",
      },
    ],
    interactive: [
      {
        id: "lore-aeryndra-quiz",
        kind: "quiz",
        instruction: "Check what you remember",
      },
    ],
    quiz: [
      {
        id: "q-world-name",
        prompt: "What was the world called before the Fracture?",
        choices: [
          { id: "a", label: "Aeryndra", correct: true },
          { id: "b", label: "Celestora", correct: false },
          { id: "c", label: "Riftstone", correct: false },
        ],
        explainCorrect:
          "Aeryndra is the whole living network. Celestora is a scholarly tradition; Riftstone is the Commons hub shard.",
      },
    ],
    relatedIds: ["lore-02-hearts", "b01-welcome"],
    rewards: [{ id: "badge-world-listener", label: "World Listener", kind: "badge" }],
  },
  {
    id: "lore-02-hearts",
    slug: "gateway-hearts-and-stones",
    path: "curriculum",
    category: "world",
    difficulty: "beginner",
    order: 201,
    title: "Hearts, Stones & the Riftstone",
    summary: "Living cores, travel shards, and the Commons hub — three related mysteries.",
    etaMinutes: 4,
    keywords: ["gateway", "heart", "stone", "riftstone", "prime", "lore"],
    body: [
      "Gateway Hearts were living cores that balanced regions — heat and cold, tide and root, memory and machine-song.",
      "Gateway Stones are stabilized shards you discover for fast travel. They are remnants, not the full Hearts.",
      "The Commons Riftstone was cut from a surviving piece of the Prime Gateway. At night it sometimes maps places not yet found.",
    ],
    tips: ["Activate Stones by visiting them in Live World.", "Travel fees use Credits — never SOL."],
    relatedIds: ["lore-01-aeryndra", "lore-03-riftlings", "b04-map"],
  },
  {
    id: "lore-03-riftlings",
    slug: "why-riftlings-exist",
    path: "curriculum",
    category: "riftlings",
    difficulty: "beginner",
    order: 202,
    title: "Why Riftlings Exist",
    summary: "Living archives from Soft Exodus — preservation first, battle later.",
    etaMinutes: 5,
    keywords: ["riftling", "egg", "fragment", "keeper", "compact", "lore"],
    body: [
      "When the Hearts could not repair the Prime, they divided into living fragments. Fragments bonded with surviving life and closed into eggs.",
      "Riftlings preserve ecosystems, routes, and memories. They were not made as weapons or trophies.",
      "Hatchery Compact etiquette: invite, wait, keep the invitation honest. Care stabilizes affinity; friendship grows identity.",
    ],
    tips: ["Species lore lives in the Codex under Riftlings.", "Slogan: Riftlings preserve pieces of the world. Riftkeepers give those pieces a future."],
    relatedIds: ["lore-02-hearts", "b01-welcome"],
    rewards: [{ id: "badge-soft-exodus", label: "Soft Exodus Student", kind: "badge" }],
  },
  {
    id: "lore-04-elara",
    slug: "elara-and-first-keeper",
    path: "curriculum",
    category: "npcs",
    difficulty: "beginner",
    order: 203,
    title: "Elara Venn, First Keeper",
    summary: "The courier who refused titles — and still keeps records in the Commons.",
    etaMinutes: 3,
    keywords: ["elara", "first keeper", "commons", "history", "lore"],
    body: [
      "Elara Venn found a damaged egg beneath fallen Elderwood roots and carried it nine days through collapsing paths.",
      "When it hatched, she refused every title and called herself only its keeper. The name Riftkeeper spread from her example.",
      "Today she is Founder Historian by the Riftstone — living memory of the Fracture, still distrustful of political shortcuts.",
    ],
    relatedIds: ["lore-03-riftlings", "lore-01-aeryndra"],
  },
  {
    id: "lore-05-awakening",
    slug: "present-awakening",
    path: "curriculum",
    category: "world",
    difficulty: "advanced",
    order: 204,
    title: "The Present Awakening",
    summary: "Hearts stir, machines wake, and something in the Celestial Rift calls to Riftlings.",
    etaMinutes: 4,
    keywords: ["awakening", "celestial", "campaign", "call", "lore"],
    body: [
      "The Riftwilds never fully stabilized. Some Hearts awaken; others corrupt. Alloy machines restart without command.",
      "Spirit Marsh speaks of a memory missing from the world. Radiant archives still hide Fracture ledgers.",
      "Beyond mapped regions, the Celestial Rift calls to Riftlings — help, or unfinished Activation? Your chapter decides.",
    ],
    tips: ["Full campaign structure: docs/story/MAIN_CAMPAIGN.md", "Finish the starter chain before chasing Celestial mysteries."],
    relatedIds: ["lore-02-hearts", "lore-03-riftlings"],
  },
];
