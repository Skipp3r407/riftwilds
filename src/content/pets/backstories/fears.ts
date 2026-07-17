import type { StoryTemplate } from "@/lib/pets/lore-types";

export const FEAR_TEMPLATES: StoryTemplate[] = [
  {
    id: "collapsing-walls",
    compatibleAffinities: ["EMBER", "STONE"],
    text: "The sound of collapsing cave walls.",
  },
  {
    id: "sudden-metal",
    compatibleAffinities: ["EMBER", "ALLOY", "STORM"],
    text: "Sudden metallic crashes without warning.",
  },
  {
    id: "empty-tidepools",
    compatibleAffinities: ["TIDE"],
    text: "Tide pools drained to dry stone under a harsh noon sun.",
  },
  {
    id: "axe-on-wood",
    compatibleAffinities: ["GROVE"],
    text: "The bite of an axe against living wood.",
  },
  {
    id: "caged-sky",
    compatibleAffinities: ["STORM"],
    text: "Rooms with no window to the sky.",
  },
  {
    id: "thaw-too-fast",
    compatibleAffinities: ["FROST"],
    text: "Heat that arrives too fast, melting frost before it can sing.",
  },
  {
    id: "false-light",
    compatibleAffinities: ["RADIANT", "VOID"],
    text: "Bright light that feels wrong—too sharp, too hungry.",
  },
  {
    id: "being-named-wrong",
    compatibleAffinities: ["VOID", "SPIRIT"],
    text: "Being called by a name that does not fit.",
  },
  {
    id: "crowds",
    compatibleTemperaments: ["Shy", "Independent", "Calm"],
    text: "Crowded plazas where voices blur into one roar.",
  },
  {
    id: "abandonment",
    compatibleTemperaments: ["Social", "Gentle", "Protective"],
    text: "Doors closing with its keeper on the other side for too long.",
  },
  {
    id: "stillness-forced",
    compatibleTemperaments: ["Energetic", "Playful", "Brave"],
    text: "Being forced to stay perfectly still when every muscle wants to move.",
  },
  {
    id: "broken-promises",
    compatibleAffinities: ["SPIRIT", "ALLOY"],
    text: "Promises spoken lightly and forgotten by morning.",
  },
];
