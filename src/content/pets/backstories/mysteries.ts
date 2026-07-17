import type { StoryTemplate } from "@/lib/pets/lore-types";

export const MYSTERY_TEMPLATES: StoryTemplate[] = [
  {
    id: "plate-symbol-caldera",
    compatibleAffinities: ["EMBER"],
    minimumRarity: "UNCOMMON",
    text: "A faint mark on its shell matches a sealed door inside the Caldera Temple.",
  },
  {
    id: "tideglass-map",
    compatibleAffinities: ["TIDE"],
    text: "One tideglass shard it favors shows coastline curves that do not match any modern map.",
  },
  {
    id: "root-whistle",
    compatibleAffinities: ["GROVE"],
    text: "When it sleeps, nearby roots shift as if answering a whistle no one else hears.",
  },
  {
    id: "storm-sigil",
    compatibleAffinities: ["STORM"],
    text: "Lightning scars along its fur form a sigil known only in old Stormspire journals.",
  },
  {
    id: "fossil-echo",
    compatibleAffinities: ["STONE"],
    text: "A fossil plate on its shoulder echoes when certain canyon winds blow.",
  },
  {
    id: "aurora-thread",
    compatibleAffinities: ["FROST"],
    text: "A thread of aurora light follows it on clear nights, then vanishes at dawn.",
  },
  {
    id: "prism-memory",
    compatibleAffinities: ["RADIANT"],
    text: "In certain mirrors it appears older by a single heartbeat—then normal again.",
  },
  {
    id: "hollow-name",
    compatibleAffinities: ["VOID"],
    minimumRarity: "RARE",
    text: "Sometimes strangers greet it by a name it has never been given.",
  },
  {
    id: "blueprint-hum",
    compatibleAffinities: ["ALLOY"],
    text: "It hums a sequence that matches an unfinished blueprint in the Alloy Ruins archive.",
  },
  {
    id: "lantern-promise",
    compatibleAffinities: ["SPIRIT"],
    text: "Its lantern-crest brightens near unmarked graves as if remembering a promise.",
  },
  {
    id: "shared-dream",
    text: "It shares a recurring dream of a locked gate and a key shaped like its own pawprint.",
  },
  {
    id: "egg-symbol",
    minimumRarity: "RARE",
    text: "A symbol from inside its egg briefly reappears in frost, ash, or dust after storms.",
  },
];
