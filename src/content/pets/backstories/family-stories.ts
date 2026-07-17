import type { StoryTemplate } from "@/lib/pets/lore-types";

export const FAMILY_STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: "inherited-markings",
    tags: ["bred"],
    text: "This Riftling inherited distinctive markings from {parentA} and a cautious streak from {parentB}.",
  },
  {
    id: "unexpected-resonance",
    tags: ["bred"],
    text: "Unlike either parent, it developed a faint {affinity} resonance while still inside its egg.",
  },
  {
    id: "shared-temperament",
    tags: ["bred"],
    text: "Family watchers note it shares {parentA}’s social warmth while carrying {parentB}’s stubborn focus.",
  },
  {
    id: "mutation-soft",
    tags: ["bred", "mutation"],
    text: "A gentle mutation appeared early: {mutation}, rare in both parent lines yet stable.",
  },
  {
    id: "generation-pride",
    tags: ["bred"],
    text: "As a generation {generation} hatchling, it carries both lineage memory and a blank page of its own.",
  },
];
