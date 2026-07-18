/**
 * Dynamic dialogue lines by reputation knowledge + personal memory.
 */

import type { OccupationRole } from "@/game/npc-ai/activities";
import { inferOccupationRole } from "@/game/npc-ai/activities";
import {
  hasMemory,
  personalGratitude,
  personalHostility,
} from "@/game/npc-ai/npc-memory-events";
import type { NpcRelationshipStore } from "@/game/npc-ai/relationships";
import {
  dominantReputationIdentity,
  type PlayerReputation,
} from "@/game/npc-ai/reputation";
import { resolveSocialReaction } from "@/game/npc-ai/social-reactions";

export function reputationDialoguePrefix(input: {
  npcSlug: string;
  displayName?: string;
  occupation?: string;
  kind?: string;
  personalityTraits?: string[];
  knownAxes: PlayerReputation;
  relationshipStore?: NpcRelationshipStore;
  alreadyReacted?: boolean;
}): string[] {
  const store = input.relationshipStore;
  const name = input.displayName ?? input.npcSlug;

  if (store && personalHostility(store, input.npcSlug)) {
    return [
      `${name} doesn't forget. "You raised steel against me — or mine."`,
      "Words won't wipe that clean. Deeds might.",
    ];
  }
  if (store && personalGratitude(store, input.npcSlug)) {
    const promise = hasMemory(store, input.npcSlug, "promise");
    if (promise) {
      return [
        `${name} softens. "You kept your word. That still counts here."`,
      ];
    }
    return [
      `${name} smiles. "You helped when it mattered. The Commons remember."`,
    ];
  }

  const reaction = resolveSocialReaction({
    npcSlug: input.npcSlug,
    displayName: input.displayName,
    occupation: input.occupation,
    kind: input.kind,
    personalityTraits: input.personalityTraits,
    knownAxes: input.knownAxes,
    alreadyReacted: input.alreadyReacted,
  });
  if (reaction?.lines.length) return reaction.lines;

  const identity = dominantReputationIdentity(input.knownAxes);
  const role = inferOccupationRole(
    input.occupation ?? "",
    input.kind,
    input.npcSlug,
  );
  return identityFallbackLines(identity.identity, role, name, input.knownAxes);
}

function identityFallbackLines(
  identity: string,
  role: OccupationRole,
  name: string,
  axes: PlayerReputation,
): string[] {
  if (identity === "hero" && axes.hero >= 30) {
    return [`${name} nods. "Good to see a steady hand on the plaza."`];
  }
  if (identity === "criminal" && axes.notoriety >= 30) {
    if (role === "bandit") {
      return [`${name} tips a chin. "Famous blade. Don't waste it on soft work."`];
    }
    return [`${name} keeps distance. "Your name carries weight — the wrong kind."`];
  }
  if (identity === "merchant" && axes.merchant >= 35) {
    return [`${name} brightens. "A fair trader's always welcome."`];
  }
  if (identity === "hunter" && axes.monsterHunter >= 30) {
    return [`${name} eyes your gear. "Rift beasts fear that look."`];
  }
  if (identity === "explorer" && axes.explorer >= 35) {
    return [`${name} asks, "Bring any trail stories from beyond the markers?"`];
  }
  return [];
}
