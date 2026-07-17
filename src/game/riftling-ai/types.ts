/**
 * Advanced Riftling AI — personality, mood, memories, social graph foundations.
 * Pure state machines; Live World idle interactions consume these later.
 */

export type MoodAxis =
  | "content"
  | "playful"
  | "curious"
  | "anxious"
  | "sleepy"
  | "bold"
  | "homesick";

export type PersonalityFacet =
  | "loyalty"
  | "curiosity"
  | "bravery"
  | "mischief"
  | "empathy"
  | "independence";

export type RiftlingMemoryKind =
  | "care"
  | "adventure"
  | "friendship"
  | "fear"
  | "discovery"
  | "family"
  | "festival"
  | "battle";

export type RiftlingMemory = {
  id: string;
  kind: RiftlingMemoryKind;
  label: string;
  salience: number;
  occurredAt: string;
  metadata?: Record<string, string | number | boolean>;
};

export type FriendshipBond = {
  otherCreaturePublicId: string;
  score: number;
  status: "acquaintance" | "friend" | "bonded" | "rival";
};

export type RiftlingAiState = {
  publicPetId: string;
  mood: MoodAxis;
  moodIntensity: number;
  personality: Record<PersonalityFacet, number>;
  preferences: string[];
  fears: string[];
  memories: RiftlingMemory[];
  friendships: FriendshipBond[];
  family: { parentIds: string[]; siblingIds: string[]; offspringIds: string[] };
  learning: { trainedSkills: string[]; lessons: number };
  lastIdleInteraction?: string;
};
