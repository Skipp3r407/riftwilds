/**
 * Personality trait tags that gate social reactions to reputation.
 * Extends authored personalities — does not replace them.
 */

import { personalityForNpc } from "@/game/npc-ai/personalities";
import { inferOccupationRole, type OccupationRole } from "@/game/npc-ai/activities";

export type PersonalityTraitTag =
  | "brave"
  | "cowardly"
  | "greedy"
  | "kind"
  | "lawful"
  | "corrupt"
  | "bloodthirsty"
  | "peaceful"
  | "curious"
  | "stern"
  | "outlaw"
  | "mercenary"
  | "devout"
  | "childish"
  | "pragmatic";

const TRAIT_ALIASES: Record<string, PersonalityTraitTag> = {
  brave: "brave",
  fierce: "brave",
  "battle-hungry": "bloodthirsty",
  bloodthirsty: "bloodthirsty",
  ruthless: "bloodthirsty",
  grim: "bloodthirsty",
  hardliner: "stern",
  stern: "stern",
  protective: "lawful",
  peaceful: "peaceful",
  gentle: "kind",
  nurturing: "kind",
  warm: "kind",
  patient: "kind",
  healing: "kind",
  timid: "cowardly",
  nervous: "cowardly",
  curious: "curious",
  playful: "childish",
  fair: "lawful",
  reliable: "lawful",
  mentor: "kind",
  sharp: "pragmatic",
  humorous: "pragmatic",
  gruff: "stern",
  "outlaw-sympathizer": "outlaw",
  corrupt: "corrupt",
  greedy: "greedy",
  mercenary: "mercenary",
  devout: "devout",
  regional: "pragmatic",
  helpful: "kind",
  grounded: "pragmatic",
  steady: "lawful",
  storyteller: "curious",
  wistful: "curious",
  practical: "pragmatic",
  bright: "kind",
  "craft-proud": "pragmatic",
};

const ROLE_DEFAULT_TRAITS: Partial<Record<OccupationRole, PersonalityTraitTag[]>> = {
  guard: ["lawful", "stern", "brave"],
  bandit: ["outlaw", "greedy", "bloodthirsty"],
  merchant: ["pragmatic", "greedy"],
  child: ["childish", "cowardly", "curious"],
  priest: ["devout", "kind", "lawful"],
  healer: ["kind", "peaceful"],
  arena: ["brave", "mercenary", "bloodthirsty"],
  scholar: ["curious", "lawful"],
  guide: ["kind", "lawful"],
  smith: ["pragmatic", "brave"],
  animal: ["cowardly"],
  citizen: ["peaceful", "pragmatic"],
};

export function normalizePersonalityTraits(
  raw: string[] | undefined,
  role?: OccupationRole,
): PersonalityTraitTag[] {
  const tags = new Set<PersonalityTraitTag>();
  for (const t of raw ?? []) {
    const key = t.toLowerCase().trim();
    const mapped = TRAIT_ALIASES[key];
    if (mapped) tags.add(mapped);
  }
  if (role) {
    for (const t of ROLE_DEFAULT_TRAITS[role] ?? []) tags.add(t);
  }
  if (!tags.size) tags.add("pragmatic");
  return [...tags];
}

export function traitsForNpc(input: {
  npcSlug: string;
  occupation?: string;
  kind?: string;
  personalityTraits?: string[];
}): PersonalityTraitTag[] {
  const role = inferOccupationRole(
    input.occupation ?? "",
    input.kind,
    input.npcSlug,
  );
  const authored =
    input.personalityTraits?.length
      ? input.personalityTraits
      : personalityForNpc(input.npcSlug).traits;
  return normalizePersonalityTraits(authored, role);
}

export function hasTrait(traits: PersonalityTraitTag[], tag: PersonalityTraitTag): boolean {
  return traits.includes(tag);
}

/** Faction / value system weights — moral complexity across groups. */
export type FactionValueSystem = {
  id: string;
  favors: Partial<Record<import("@/game/npc-ai/reputation").ReputationAxis, number>>;
  fears: Partial<Record<import("@/game/npc-ai/reputation").ReputationAxis, number>>;
};

export const FACTION_VALUES: Record<string, FactionValueSystem> = {
  commons_guard: {
    id: "commons_guard",
    favors: { honor: 1.2, town: 1, hero: 0.8, trust: 0.9 },
    fears: { notoriety: 1.4, criminal: 1.3, cruelty: 1.1, infamy: 1 },
  },
  bandit_camp: {
    id: "bandit_camp",
    favors: { notoriety: 1.3, criminal: 1.2, cruelty: 0.9, infamy: 1 },
    fears: { honor: 0.6, hero: 0.5, town: 0.4 },
  },
  merchant_guild: {
    id: "merchant_guild",
    favors: { merchant: 1.4, trust: 1.2, honor: 0.7 },
    fears: { criminal: 1.2, notoriety: 1, cruelty: 0.9 },
  },
  black_market: {
    id: "black_market",
    favors: { criminal: 1.3, notoriety: 1.1, merchant: 0.6 },
    fears: { honor: 0.5, hero: 0.4 },
  },
  village: {
    id: "village",
    favors: { hero: 1.3, mercy: 1.1, town: 1.2, trust: 1 },
    fears: { notoriety: 1.3, cruelty: 1.2, criminal: 1.1 },
  },
  mercenary: {
    id: "mercenary",
    favors: { notoriety: 0.8, monsterHunter: 1, honor: 0.6, cruelty: 0.5 },
    fears: { mercy: 0.3 },
  },
  temple: {
    id: "temple",
    favors: { mercy: 1.4, honor: 1.2, hero: 0.9 },
    fears: { cruelty: 1.5, notoriety: 1, criminal: 1 },
  },
};

export function factionForRole(role: OccupationRole): string {
  switch (role) {
    case "guard":
      return "commons_guard";
    case "bandit":
      return "bandit_camp";
    case "merchant":
      return "merchant_guild";
    case "priest":
    case "healer":
      return "temple";
    case "arena":
      return "mercenary";
    case "child":
    case "citizen":
    case "farmer":
    case "cook":
    case "musician":
      return "village";
    default:
      return "village";
  }
}

/** Corrupt merchants lean black market. */
export function resolveFactionId(
  role: OccupationRole,
  traits: PersonalityTraitTag[],
): string {
  if (role === "merchant" && (hasTrait(traits, "corrupt") || hasTrait(traits, "outlaw"))) {
    return "black_market";
  }
  return factionForRole(role);
}
