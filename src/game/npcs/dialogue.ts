import { getNpcBySlug, npcDefaultLines } from "@/content/npcs";
import type { DialogueChoice, DialogueNode, NpcDef } from "@/game/npcs/types";
import {
  acceptQuest,
  applyService,
  completeQuest,
  loadLivePlayState,
  recordNpcTalk,
  saveLivePlayState,
  type LivePlayState,
} from "@/game/npcs/play-state";

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
  const lines = (node.lines?.length ? node.lines : npcDefaultLines(npc)).map((l) =>
    sanitizeLine(l, "The keeper greets you warmly."),
  );
  let state = loadLivePlayState();
  state = recordNpcTalk(state, npcSlug);
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
  return {
    npcSlug,
    speaker: npc.displayName,
    portraitAsset: npc.portraitAsset,
    nodeId: node.id,
    lines,
    lineIndex: 0,
    choices: filterChoices(npc, node.choices ?? [{ id: "bye", label: "Goodbye", action: "close" }], state),
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
