/**
 * Dynamic Story Engine — branching arcs, reputation, seasonal/community hooks.
 */

export type StoryScope = "personal" | "world" | "seasonal" | "community" | "region";

export type StoryChoice = {
  id: string;
  label: string;
  /** Next node id, or null to end branch. */
  nextNodeId: string | null;
  reputationDelta?: Record<string, number>;
  flagsSet?: string[];
  unlockAchievementKey?: string;
  unlockQuestKey?: string;
};

export type StoryNode = {
  id: string;
  title: string;
  body: string;
  speaker?: string;
  choices: StoryChoice[];
  /** Auto-advance if no choices (cinematic beat). */
  autoNextId?: string | null;
};

export type StoryArcDef = {
  key: string;
  name: string;
  synopsis: string;
  scope: StoryScope;
  regionKey?: string;
  seasonKey?: string;
  startNodeId: string;
  nodes: StoryNode[];
  /** Prerequisite arc keys. */
  requires?: string[];
  featureFlag?: string;
  /** Cinematic card background under `public/assets/story/`. */
  imageSrc: string;
};

export type StoryProgressState = {
  arcKey: string;
  currentNodeId: string;
  flags: string[];
  reputation: Record<string, number>;
  completed: boolean;
  history: { nodeId: string; choiceId?: string; at: string }[];
};

export type EncounterDef = {
  key: string;
  name: string;
  regionKey?: string;
  weight: number;
  minReputation?: Record<string, number>;
  storyArcKey?: string;
  description: string;
};
