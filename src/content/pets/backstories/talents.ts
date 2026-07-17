import type { StoryTemplate } from "@/lib/pets/lore-types";

export const TALENT_TEMPLATES: StoryTemplate[] = [
  {
    id: "guides-through-ash",
    compatibleAffinities: ["EMBER"],
    text: "Guiding smaller creatures through ash haze by the warmth of its back.",
  },
  {
    id: "reads-tide",
    compatibleAffinities: ["TIDE"],
    text: "Reading the next tide change from the way foam curls around stone.",
  },
  {
    id: "hears-root-stress",
    compatibleAffinities: ["GROVE"],
    text: "Hearing when roots are stressed long before leaves wilt.",
  },
  {
    id: "predicts-gusts",
    compatibleAffinities: ["STORM"],
    text: "Predicting sudden gusts a breath before they arrive.",
  },
  {
    id: "senses-faultlines",
    compatibleAffinities: ["STONE"],
    text: "Sensing weak stone underfoot before a ledge cracks.",
  },
  {
    id: "preserves-tracks",
    compatibleAffinities: ["FROST"],
    text: "Preserving footprints in frost so a lost trail can be found again.",
  },
  {
    id: "softens-arguments",
    compatibleAffinities: ["RADIANT", "SPIRIT"],
    text: "Softening tense rooms with a quiet pulse of calming light.",
  },
  {
    id: "finds-lost-echoes",
    compatibleAffinities: ["VOID"],
    text: "Finding lost echoes—words spoken once and stuck in hollow corners.",
  },
  {
    id: "repairs-small-gears",
    compatibleAffinities: ["ALLOY"],
    text: "Nudging tiny gears back into place with patient paws.",
  },
  {
    id: "soothes-nightmares",
    compatibleAffinities: ["SPIRIT"],
    text: "Easing nightmares by humming the same note three times.",
  },
  {
    id: "maps-shortcuts",
    compatibleTemperaments: ["Curious", "Independent", "Energetic"],
    text: "Remembering shortcut paths after a single walk.",
  },
  {
    id: "shields-friends",
    compatibleTemperaments: ["Protective", "Brave", "Gentle"],
    text: "Placing itself between friends and sudden danger without hesitation.",
  },
];
