import type { StoryTemplate } from "@/lib/pets/lore-types";

export const OWNER_BOND_TEMPLATES: StoryTemplate[] = [
  {
    id: "cautious-first",
    compatibleTemperaments: ["Shy", "Independent", "Calm"],
    text: "Still learning which footsteps mean safety, it watches its Riftkeeper from half-cover before approaching.",
  },
  {
    id: "eager-greeting",
    compatibleTemperaments: ["Social", "Playful", "Energetic"],
    text: "Greets its Riftkeeper with unrestrained joy, as if every return is a festival.",
  },
  {
    id: "quiet-loyalty",
    compatibleTemperaments: ["Gentle", "Protective", "Brave"],
    text: "Shows loyalty in quiet ways—standing near, matching pace, offering warmth without fuss.",
  },
  {
    id: "mischief-tests",
    compatibleTemperaments: ["Mischievous", "Curious"],
    text: "Tests the bond with harmless pranks, then checks that laughter still follows.",
  },
  {
    id: "shared-silence",
    compatibleTemperaments: ["Sleepy", "Calm", "Independent"],
    text: "Prefers shared silence over chatter, resting where its keeper’s shadow falls.",
  },
  {
    id: "side-by-side",
    text: "Walks half a step ahead on familiar paths and half a step behind on new ones.",
  },
];

export const BOND_STAGE_PARAGRAPHS: Record<string, string> = {
  NEWLY_BONDED:
    "The bond is new: curiosity outweighs certainty, and every routine is still a negotiation.",
  FAMILIAR:
    "Familiar rhythms have formed—mealtimes, resting places, and the soft signals of mood.",
  TRUSTED:
    "Trust has settled in. It recognizes protective intent and answers with protective instinct of its own.",
  CLOSE_COMPANION:
    "As a close companion, it anticipates needs and shares small private rituals no stranger would notice.",
  DEEPLY_BONDED:
    "Deeply bonded, it carries a personal language of glances, taps, and affinity flickers with its keeper.",
  LIFELONG_PARTNER:
    "Lifelong partnership shows in coordinated courage: victories and losses are remembered as a shared story.",
};
