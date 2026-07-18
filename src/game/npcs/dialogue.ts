import { getNpcBySlug, npcDefaultLines } from "@/content/npcs";
import type { DialogueChoice, DialogueNode, NpcDef } from "@/game/npcs/types";
import {
  acceptQuest,
  applyService,
  completeQuest,
  loadLivePlayState,
  recordNpcTalk,
  saveLivePlayState,
  syncKillerReputation,
  type LivePlayState,
} from "@/game/npcs/play-state";
import {
  buildKillerReputation,
  resolveKillerReaction,
} from "@/game/npc-ai/killer-reputation";
import {
  loadReputationStore,
  reputationFromPlayState,
  saveReputationStore,
  syncReputationFromKiller,
} from "@/game/npc-ai/reputation";
import {
  knownReputationInRegion,
  loadGossipStore,
  tickGossipSpread,
} from "@/game/npc-ai/gossip";
import { resolveSocialReaction } from "@/game/npc-ai/social-reactions";
import { reputationDialoguePrefix } from "@/game/npc-ai/reputation-dialogue";
import {
  adjustRelationship,
  loadRelationships,
  recordTalk,
  saveRelationships,
} from "@/game/npc-ai/relationships";
import { ambientRumorLine } from "@/game/npc-ai/living-runtime";

export type ActiveDialogue = {
  npcSlug: string;
  speaker: string;
  portraitAsset: string;
  nodeId: string;
  lines: string[];
  lineIndex: number;
  choices: DialogueChoice[];
  shopId?: string;
  serviceId?: string;
};

function sanitizeLine(line: string | undefined, fallback: string): string {
  if (!line || /undefined|null|TODO|placeholder/i.test(line)) return fallback;
  return line;
}

function nodeById(npc: NpcDef, id: string): DialogueNode | undefined {
  return npc.dialogueNodes.find((n) => n.id === id);
}

export function startNpcDialogue(npcSlug: string): ActiveDialogue | null {
  const npc = getNpcBySlug(npcSlug);
  if (!npc) return null;
  const node = nodeById(npc, "greeting") ?? {
    id: "greeting",
    lines: npcDefaultLines(npc),
    choices: [{ id: "bye", label: "Goodbye", action: "close" as const }],
  };
  let lines = (node.lines?.length ? node.lines : npcDefaultLines(npc)).map((l) =>
    sanitizeLine(l, "The keeper greets you warmly."),
  );
  let state = loadLivePlayState();
  state = syncKillerReputation(state);
  state = recordNpcTalk(state, npcSlug);

  // Relationship + multi-axis reputation dialogue (gossip-lagged knowledge)
  const rel = loadRelationships();
  recordTalk(rel, npcSlug, "dialogue");
  const killer = buildKillerReputation(state);
  let repStore = loadReputationStore();
  repStore.axes = syncReputationFromKiller(
    reputationFromPlayState(state),
    killer,
  );
  saveReputationStore(repStore);

  let gossip = loadGossipStore();
  gossip = tickGossipSpread(gossip, Date.now());
  const regionId = state.regionsVisited?.[0] ?? "riftwild-commons";
  const knownAxes = knownReputationInRegion(repStore.axes, gossip, regionId);

  const alreadySocial = rel.byNpc[npcSlug]?.socialNoticed ?? false;
  const social = resolveSocialReaction({
    npcSlug,
    displayName: npc.displayName,
    occupation: npc.occupation,
    kind: npc.kind,
    personalityTraits: npc.personalityTraits,
    knownAxes,
    trueAxes: repStore.axes,
    alreadyReacted: alreadySocial,
  });

  let merchantWary = false;
  let shopLocked = false;

  if (social) {
    lines = [...social.lines, ...lines].slice(0, 5);
    merchantWary = social.merchantWary || social.shopLocked;
    shopLocked = social.shopLocked;
    adjustRelationship(rel, npcSlug, social.relationshipDelta, `social:${social.kind}`);
    if (rel.byNpc[npcSlug]) {
      rel.byNpc[npcSlug]!.socialNoticed = true;
      if (
        social.kind === "fear" ||
        social.kind === "hide" ||
        social.kind === "arrest" ||
        social.kind === "challenge"
      ) {
        rel.byNpc[npcSlug]!.killerNoticed = true;
      }
    }
  } else {
    const killerReact = resolveKillerReaction({
      npcSlug,
      displayName: npc.displayName,
      occupation: npc.occupation,
      kind: npc.kind,
      personalityTraits: npc.personalityTraits,
      reputation: killer,
      alreadyNoticed: rel.byNpc[npcSlug]?.killerNoticed,
    });
    if (killerReact) {
      lines = [...killerReact.lines, ...lines].slice(0, 5);
      merchantWary = killerReact.merchantWary;
      adjustRelationship(
        rel,
        npcSlug,
        killerReact.relationshipDelta,
        `killer:${killerReact.kind}`,
      );
      if (rel.byNpc[npcSlug]) rel.byNpc[npcSlug]!.killerNoticed = true;
    } else {
      const prefix = reputationDialoguePrefix({
        npcSlug,
        displayName: npc.displayName,
        occupation: npc.occupation,
        kind: npc.kind,
        personalityTraits: npc.personalityTraits,
        knownAxes,
        relationshipStore: rel,
        alreadyReacted: alreadySocial,
      });
      if (prefix.length) {
        lines = [...prefix, ...lines].slice(0, 5);
      } else if (Math.random() < 0.12 && !npc.questIds.length) {
        lines = [...lines, ambientRumorLine(npcSlug, Date.now())].slice(0, 4);
      }
    }
  }
  saveRelationships(rel);

  // Auto-accept available starter quests tied to this NPC when talking
  for (const qid of npc.questIds) {
    if (state.quests[qid]?.status === "available") {
      state = acceptQuest(state, qid);
    }
    if (state.quests[qid]?.status === "ready") {
      state = completeQuest(state, qid);
    }
  }
  saveLivePlayState(state);
  const dialoguePortrait = npc.portraitAsset.replace(
    /\/portrait\.(png|webp)$/i,
    "/dialogue-portrait.png",
  );
  let choices = filterChoices(
    npc,
    node.choices ?? [{ id: "bye", label: "Goodbye", action: "close" }],
    state,
  );
  if (merchantWary || shopLocked) {
    choices = choices.filter((c) => c.action !== "open_shop");
    if (!choices.some((c) => c.id === "bye")) {
      choices.push({ id: "bye", label: "I'll go", action: "close" });
    }
  }
  return {
    npcSlug,
    speaker: npc.displayName,
    portraitAsset: dialoguePortrait !== npc.portraitAsset ? dialoguePortrait : npc.portraitAsset,
    nodeId: node.id,
    lines,
    lineIndex: 0,
    choices,
  };
}

function filterChoices(
  npc: NpcDef,
  choices: DialogueChoice[],
  state: LivePlayState,
): DialogueChoice[] {
  return choices
    .filter((c) => {
      if (c.requiresFlags?.some((f) => !state.flags.includes(f))) return false;
      if (c.requiresQuestStatus) {
        const st = state.quests[c.requiresQuestStatus.questId]?.status;
        if (st !== c.requiresQuestStatus.status) return false;
      }
      if (c.action === "accept_quest" && c.questId) {
        const st = state.quests[c.questId]?.status;
        if (st !== "available" && st !== "locked") return false;
      }
      if (c.action === "turn_in_quest" && c.questId) {
        if (state.quests[c.questId]?.status !== "ready") return false;
      }
      return Boolean(c.label && !/undefined|null|TODO/i.test(c.label));
    })
    .map((c) => ({
      ...c,
      label: sanitizeLine(c.label, "Continue"),
    }));
}

export function advanceDialogueLine(d: ActiveDialogue): ActiveDialogue {
  if (d.lineIndex < d.lines.length - 1) {
    return { ...d, lineIndex: d.lineIndex + 1 };
  }
  return d;
}

export function dialogueHasMoreLines(
  d: Pick<ActiveDialogue, "lines" | "lineIndex"> | { lines: string[]; lineIndex: number },
): boolean {
  return d.lineIndex < d.lines.length - 1;
}

function findChoice(npc: NpcDef, choiceId: string): DialogueChoice | undefined {
  for (const node of npc.dialogueNodes) {
    const hit = node.choices?.find((c) => c.id === choiceId);
    if (hit) return hit;
  }
  // Fallback synthetic close
  if (choiceId === "bye") return { id: "bye", label: "Goodbye", action: "close" };
  return undefined;
}

export function selectDialogueChoice(
  d: ActiveDialogue,
  choiceId: string,
): {
  dialogue: ActiveDialogue | null;
  openShopId?: string;
  openServiceId?: string;
  message?: string;
} {
  const npc = getNpcBySlug(d.npcSlug);
  if (!npc) return { dialogue: null };
  const choice =
    d.choices.find((c) => c.id === choiceId && "action" in c) ??
    findChoice(npc, choiceId) ??
    d.choices.find((c) => c.id === choiceId);
  if (!choice) return { dialogue: d };

  let state = loadLivePlayState();

  if (choice.action === "close") {
    saveLivePlayState(state);
    return { dialogue: null };
  }
  if (choice.action === "open_shop" && choice.shopId) {
    saveLivePlayState(state);
    return { dialogue: d, openShopId: choice.shopId };
  }
  if (choice.action === "open_service" && choice.serviceId) {
    const result = applyService(state, choice.serviceId);
    state = result.state;
    saveLivePlayState(state);
    return {
      dialogue: {
        ...d,
        lines: [sanitizeLine(result.message, "Done.")],
        lineIndex: 0,
        choices: [{ id: "bye", label: "Goodbye", action: "close" }],
      },
      openServiceId: choice.serviceId,
      message: result.message,
    };
  }
  if (choice.action === "accept_quest" && choice.questId) {
    state = acceptQuest(state, choice.questId);
    saveLivePlayState(state);
    return {
      dialogue: {
        ...d,
        lines: ["Quest accepted. Check your objectives — the Commons will guide you."],
        lineIndex: 0,
        choices: [{ id: "bye", label: "On my way", action: "close" }],
      },
    };
  }
  if (choice.action === "turn_in_quest" && choice.questId) {
    state = completeQuest(state, choice.questId);
    saveLivePlayState(state);
    return {
      dialogue: {
        ...d,
        lines: ["Quest complete. Rewards granted once — well kept."],
        lineIndex: 0,
        choices: [{ id: "bye", label: "Thank you", action: "close" }],
      },
    };
  }

  if (choice.next) {
    const node = nodeById(npc, choice.next);
    if (!node) {
      return {
        dialogue: {
          ...d,
          lines: ["The keeper pauses, then smiles."],
          lineIndex: 0,
          choices: [{ id: "bye", label: "Goodbye", action: "close" }],
        },
      };
    }
    const lines = (node.lines?.length ? node.lines : npcDefaultLines(npc)).map((l) =>
      sanitizeLine(l, "…"),
    );
    return {
      dialogue: {
        ...d,
        nodeId: node.id,
        lines,
        lineIndex: 0,
        choices: filterChoices(
          npc,
          node.choices ?? [{ id: "bye", label: "Goodbye", action: "close" }],
          state,
        ),
      },
    };
  }

  saveLivePlayState(state);
  return { dialogue: null };
}

/** Legacy flat lines for Phaser spawn metadata. */
export function flatLinesForNpc(npcSlug: string): string[] {
  const npc = getNpcBySlug(npcSlug);
  if (!npc) return ["The local nods."];
  return npcDefaultLines(npc);
}
