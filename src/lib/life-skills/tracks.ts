/**
 * Expanded Life Skills — gathering, craft, care, performance tracks.
 * XP / soft Credits only. Never SOL. Anti-AFK via engaged flag.
 */

import { trackAnalytics } from "@/lib/analytics/events";
import { creditCredits } from "@/lib/credits/ledger";

export type LifeSkillId =
  | "foraging"
  | "fishing"
  | "cooking"
  | "crafting"
  | "riftling_care"
  | "performance"
  | "cartography"
  | "gardening";

export type LifeSkillDef = {
  id: LifeSkillId;
  label: string;
  blurb: string;
  xpPerAction: number;
  creditHint: number;
};

export const LIFE_SKILL_CATALOG: LifeSkillDef[] = [
  {
    id: "foraging",
    label: "Foraging",
    blurb: "Wild herbs and riftmoss along safe trails.",
    xpPerAction: 8,
    creditHint: 4,
  },
  {
    id: "fishing",
    label: "Fishing",
    blurb: "Dock and moonwater casts — patience, not AFK bots.",
    xpPerAction: 7,
    creditHint: 4,
  },
  {
    id: "cooking",
    label: "Cooking",
    blurb: "Campfire meals that restore bonds, not wallets.",
    xpPerAction: 9,
    creditHint: 5,
  },
  {
    id: "crafting",
    label: "Crafting",
    blurb: "Simple tools and homestead goods.",
    xpPerAction: 10,
    creditHint: 5,
  },
  {
    id: "riftling_care",
    label: "Riftling Care",
    blurb: "Grooming, feeding, and comfort loops.",
    xpPerAction: 6,
    creditHint: 3,
  },
  {
    id: "performance",
    label: "Performance",
    blurb: "Plaza music and emote circles.",
    xpPerAction: 5,
    creditHint: 3,
  },
  {
    id: "cartography",
    label: "Cartography",
    blurb: "Map notes and secret hints without spoilers.",
    xpPerAction: 8,
    creditHint: 4,
  },
  {
    id: "gardening",
    label: "Gardening",
    blurb: "Homestead plots and festival blooms.",
    xpPerAction: 7,
    creditHint: 4,
  },
];

export type LifeSkillProgress = {
  skillId: LifeSkillId;
  xp: number;
  level: number;
};

export type LifeSkillProfile = {
  userId: string;
  skills: Record<LifeSkillId, LifeSkillProgress>;
};

function levelFromXp(xp: number): number {
  return Math.min(50, 1 + Math.floor(Math.sqrt(xp / 10)));
}

type Store = { byUser: Map<string, LifeSkillProfile> };

function store(): Store {
  const g = globalThis as unknown as { __rwLifeSkills?: Store };
  if (!g.__rwLifeSkills) g.__rwLifeSkills = { byUser: new Map() };
  return g.__rwLifeSkills;
}

function emptyProfile(userId: string): LifeSkillProfile {
  const skills = {} as Record<LifeSkillId, LifeSkillProgress>;
  for (const def of LIFE_SKILL_CATALOG) {
    skills[def.id] = { skillId: def.id, xp: 0, level: 1 };
  }
  return { userId, skills };
}

export function resetLifeSkillsForTests(): void {
  store().byUser.clear();
}

export function getLifeSkillProfile(userId: string): LifeSkillProfile {
  return store().byUser.get(userId) ?? emptyProfile(userId);
}

export function practiceLifeSkill(params: {
  userId: string;
  skillId: LifeSkillId;
  engaged: boolean;
  requestId: string;
}):
  | {
      ok: true;
      progress: LifeSkillProgress;
      creditsGranted: number;
      leveled: boolean;
    }
  | { ok: false; error: string; message: string } {
  if (!params.engaged) {
    return {
      ok: false,
      error: "afk",
      message: "Life skills need real practice — motionless standing earns nothing.",
    };
  }
  const def = LIFE_SKILL_CATALOG.find((d) => d.id === params.skillId);
  if (!def) return { ok: false, error: "unknown", message: "Unknown skill." };

  const profile = getLifeSkillProfile(params.userId);
  const prev = profile.skills[params.skillId];
  const xp = prev.xp + def.xpPerAction;
  const level = levelFromXp(xp);
  const leveled = level > prev.level;
  const progress = { skillId: params.skillId, xp, level };
  profile.skills[params.skillId] = progress;
  store().byUser.set(params.userId, profile);

  let creditsGranted = 0;
  if (leveled) {
    const grant = creditCredits({
      userId: params.userId,
      amount: def.creditHint,
      reason: "CRAFT",
      requestId: params.requestId,
      metadata: { skillId: params.skillId, level },
    });
    if (grant.ok) creditsGranted = def.creditHint;
  }

  trackAnalytics("life_skill_xp", { skill: params.skillId, xp: def.xpPerAction });
  return { ok: true, progress, creditsGranted, leveled };
}

export function lifeSkillsSnapshot(userId: string) {
  return {
    catalog: LIFE_SKILL_CATALOG,
    profile: getLifeSkillProfile(userId),
    note: "Expanded life skills feed festivals, housing, and care — never SOL.",
  };
}
