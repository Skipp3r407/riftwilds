import type { StoryTemplate } from "@/lib/pets/lore-types";

export const HABIT_TEMPLATES: StoryTemplate[] = [
  {
    id: "arranges-warm-stones",
    compatibleAffinities: ["EMBER", "STONE"],
    text: "Arranges warm stones around its bed before sleeping.",
  },
  {
    id: "collects-tideglass",
    compatibleAffinities: ["TIDE"],
    text: "Juggles smooth tideglass pebbles whenever it is thinking.",
  },
  {
    id: "braids-moss",
    compatibleAffinities: ["GROVE"],
    text: "Braids stray moss into tiny rings and leaves them for companions.",
  },
  {
    id: "chases-sparks",
    compatibleAffinities: ["STORM"],
    compatibleTemperaments: ["Playful", "Energetic", "Mischievous"],
    text: "Chases sparks along metal railings until they vanish into the air.",
  },
  {
    id: "polishes-fossils",
    compatibleAffinities: ["STONE"],
    text: "Polishes fossil chips with its paws until they shine like river glass.",
  },
  {
    id: "rolls-in-snow",
    compatibleAffinities: ["FROST"],
    compatibleTemperaments: ["Playful", "Shy", "Sleepy"],
    text: "Rolls once through fresh snow before settling, as if resetting the day.",
  },
  {
    id: "follows-sunshafts",
    compatibleAffinities: ["RADIANT"],
    text: "Follows moving sunshafts across floors and waits where they pause.",
  },
  {
    id: "blinks-between-corners",
    compatibleAffinities: ["VOID"],
    text: "Blinks from one quiet corner to another when startled, never quite vanishing.",
  },
  {
    id: "ticks-before-rest",
    compatibleAffinities: ["ALLOY"],
    text: "Ticks softly three times before resting, like a clock closing a chapter.",
  },
  {
    id: "hums-at-dusk",
    compatibleAffinities: ["SPIRIT"],
    text: "Hums a thin lantern-note at dusk that settles nearby pets.",
  },
  {
    id: "hides-toys",
    compatibleTemperaments: ["Mischievous", "Playful", "Curious"],
    text: "Hides small toys in pockets of furniture and waits for discovery.",
  },
  {
    id: "patrols-doorway",
    compatibleTemperaments: ["Protective", "Brave"],
    text: "Patrols the doorway once each evening before allowing itself to sleep.",
  },
  {
    id: "naps-on-boots",
    compatibleTemperaments: ["Sleepy", "Gentle", "Social"],
    text: "Naps on its keeper’s boots whenever weather turns uncertain.",
  },
  {
    id: "maps-with-scratches",
    compatibleTemperaments: ["Curious", "Independent"],
    text: "Draws tiny scratch-maps of new rooms on soft dirt or dust.",
  },
  {
    id: "shares-food-bits",
    compatibleTemperaments: ["Gentle", "Social", "Protective"],
    text: "Pushes the best bite of food toward friends before eating.",
  },
];
