import type { StoryTemplate } from "@/lib/pets/lore-types";

export const FIRST_MEMORY_TEMPLATES: StoryTemplate[] = [
  {
    id: "warmth-of-hands",
    text: "The warmth of its Riftkeeper’s hands against the cracking shell, steadier than the Hatchery lamps.",
  },
  {
    id: "rain-on-roof",
    text: "Rain ticking on the Hatchery roof, each drop sounding like a soft invitation to wake.",
  },
  {
    id: "riftstone-glow",
    text: "The glow of a nearby Riftstone pulsing in time with its first breath.",
  },
  {
    id: "another-pet-waiting",
    text: "Another pet waiting quietly nearby, eyes bright, as if the world had already prepared a friend.",
  },
  {
    id: "smell-of-food",
    compatibleAffinities: ["EMBER", "GROVE", "TIDE", "STONE"],
    text: "The smell of {food} drifting from a care tray—comfort before language.",
  },
  {
    id: "loud-world-event",
    compatibleTemperaments: ["Brave", "Energetic", "Mischievous"],
    text: "A distant cheer from a world event outside the Hatchery walls, bright and overwhelming.",
  },
  {
    id: "moonlit-room",
    compatibleAffinities: ["TIDE", "SPIRIT", "FROST", "VOID"],
    text: "A quiet moonlit room, silver light lying across the incubator like a soft road.",
  },
  {
    id: "affinity-burst",
    text: "A burst of {affinity} energy unfurling from the shell, painting the air with its first color.",
  },
  {
    id: "keeper-voice",
    text: "The Hatchery keeper’s calm voice counting heartbeats until the shell finally opened.",
  },
  {
    id: "shell-symbol",
    minimumRarity: "UNCOMMON",
    text: "A strange symbol visible for a heartbeat inside the shell—then gone, leaving only a question.",
  },
  {
    id: "static-tickle",
    compatibleAffinities: ["STORM", "ALLOY"],
    text: "A tickle of static along its whiskers before its eyes fully opened.",
  },
  {
    id: "soft-lantern",
    compatibleAffinities: ["SPIRIT", "RADIANT"],
    text: "A soft lantern crest of light hovering above the nest, gentle as a held breath.",
  },
];
