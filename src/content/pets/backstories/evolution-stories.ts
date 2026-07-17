import type { StoryTemplate } from "@/lib/pets/lore-types";

/** Chapters appended when evolution occurs — never erase prior biography. */
export const EVOLUTION_STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: "ember-heat-awakening",
    compatibleAffinities: ["EMBER"],
    text: "Heat gathered along its spine until plates brightened. The evolution felt like standing closer to a hearth that had always been waiting.",
  },
  {
    id: "tide-memory-deepen",
    compatibleAffinities: ["TIDE"],
    text: "Currents of memory deepened. Patterns once glimpsed in foam became instincts it could follow with eyes closed.",
  },
  {
    id: "grove-root-reach",
    compatibleAffinities: ["GROVE"],
    text: "Roots of self reached farther. It felt seasons rearrange inside its body without losing the child it had been.",
  },
  {
    id: "storm-freedom-surge",
    compatibleAffinities: ["STORM"],
    text: "A surge of freedom cracked through caution. Wings, sparks, or stride widened—but the laugh remained the same.",
  },
  {
    id: "stone-patience-harden",
    compatibleAffinities: ["STONE"],
    text: "Patience hardened into armor. What changed was not its loyalty, but how much weight that loyalty could carry.",
  },
  {
    id: "frost-stillness-clarity",
    compatibleAffinities: ["FROST"],
    text: "Stillness clarified into purpose. Cold that once meant survival now meant precision.",
  },
  {
    id: "radiant-duty-brighten",
    compatibleAffinities: ["RADIANT"],
    text: "Duty brightened without becoming harsh. Light settled into a steadier frequency—hope with edges.",
  },
  {
    id: "void-distance-narrow",
    compatibleAffinities: ["VOID"],
    text: "Distance narrowed. The Hollow’s quiet remained, but it no longer swallowed the names it loved.",
  },
  {
    id: "alloy-purpose-click",
    compatibleAffinities: ["ALLOY"],
    text: "Inner mechanisms clicked into a clearer purpose. Repair became identity, not only skill.",
  },
  {
    id: "spirit-memory-bridge",
    compatibleAffinities: ["SPIRIT"],
    text: "Memory bridges lengthened. It could hold more ghosts gently without becoming one.",
  },
  {
    id: "generic-with-owner",
    text: "With its Riftkeeper present, the transformation felt less like becoming someone else and more like becoming more itself.",
  },
];
