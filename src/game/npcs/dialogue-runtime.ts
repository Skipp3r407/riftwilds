import { getNpcById } from "@/game/npcs/catalog";
import type { DialogueChoice, DialogueNode, NpcDef } from "@/game/npcs/types";
import {
  acceptQuest,
  buyShopItem,
  craftTrainingClaw,
  loadLiveProgress,
  markBondProgress,
  markFlag,
  markHatchProgress,
  markTalked,
  placeMapMarker,
  type LiveProgressState,
} from "@/game/npcs/player-progress";
import { NPC_SHOP_BY_ID } from "@/content/npcs/shops";
import { STARTER_QUEST_BY_KEY } from "@/game/npcs/starter-quests";

export type BranchDialoguePayload = {
  speaker: string;
  npcId: string;
  portrait?: string;
  lines: string[];
  lineIndex: number;
  nodeId: string;
  choices: { id: string; label: string }[];
  mode: "dialogue" | "shop" | "service";
  shopId?: string;
  shopItems?: {
    itemId: string;
    name: string;
    price: number;
    stock?: number;
  }[];
  credits?: number;
  serviceId?: string;
};

function visibleChoices(npc: NpcDef, node: DialogueNode, state: LiveProgressState): DialogueChoice[] {
  return (node.choices ?? []).filter((c) => {
    if (c.requiresFlags?.some((f) => !state.flags.includes(f))) return false;
    if (c.requiresQuestStatus) {
      const q = state.quests[c.requiresQuestStatus.questId];
      if (!q || q.status !== c.requiresQuestStatus.status) return false;
    }
    return Boolean(c.label && c.label.trim());
  });
}

export function openNpcDialogue(npcId: string): BranchDialoguePayload | null {
  const npc = getNpcById(npcId);
  if (!npc || !npc.active) return null;
  let state = markTalked(loadLiveProgress(), npcId);
  const start = npc.dialogueNodes.find((n) => n.id === "greeting") ?? npc.dialogueNodes[0];
  if (!start || !start.lines.length) {
    const lines = npc.greetingDialogue.filter(Boolean);
    if (!lines.length) return null;
    return {
      speaker: npc.displayName,
      npcId: npc.id,
      portrait: npc.portraitAsset,
      lines,
      lineIndex: 0,
      nodeId: "fallback",
      choices: [{ id: "close", label: "Goodbye" }],
      mode: "dialogue",
      credits: state.credits,
    };
  }
  const choices = visibleChoices(npc, start, state);
  return {
    speaker: npc.displayName,
    npcId: npc.id,
    portrait: npc.portraitAsset,
    lines: start.lines.filter(Boolean),
    lineIndex: 0,
    nodeId: start.id,
    choices: choices.map((c) => ({ id: c.id, label: c.label })),
    mode: "dialogue",
    credits: state.credits,
  };
}

export type DialogueActionResult = {
  dialogue: BranchDialoguePayload | null;
  toast?: string;
  progress: LiveProgressState;
};

function shopPayload(npc: NpcDef, shopId: string, state: LiveProgressState): BranchDialoguePayload {
  const shop = NPC_SHOP_BY_ID[shopId];
  return {
    speaker: npc.displayName,
    npcId: npc.id,
    portrait: npc.portraitAsset,
    lines: npc.shopDialogue.length
      ? npc.shopDialogue
      : [`${shop?.title ?? "Shop"} — spend demo credits wisely.`],
    lineIndex: 0,
    nodeId: "shop",
    choices: [
      ...(shop?.buy.map((i) => ({
        id: `buy:${i.itemId}`,
        label: `Buy ${i.name} (${i.price} cr)`,
      })) ?? []),
      { id: "back-greeting", label: "Back" },
      { id: "close", label: "Close" },
    ],
    mode: "shop",
    shopId,
    shopItems: shop?.buy.map((i) => ({
      itemId: i.itemId,
      name: i.name,
      price: i.price,
      stock: i.stock,
    })),
    credits: state.credits,
  };
}

export function applyDialogueChoice(
  current: BranchDialoguePayload,
  choiceId: string,
): DialogueActionResult {
  let state = loadLiveProgress();
  const npc = getNpcById(current.npcId);
  if (!npc) return { dialogue: null, progress: state };

  if (choiceId === "close") return { dialogue: null, progress: state };

  if (choiceId === "back-greeting") {
    return { dialogue: openNpcDialogue(npc.id), progress: state };
  }

  if (choiceId.startsWith("buy:") && current.shopId) {
    const itemId = choiceId.slice(4);
    const result = buyShopItem(state, current.shopId, itemId);
    if (!result.ok) {
      return {
        dialogue: {
          ...shopPayload(npc, current.shopId, state),
          lines: [result.reason],
        },
        toast: result.reason,
        progress: state,
      };
    }
    state = result.state;
    return {
      dialogue: shopPayload(npc, current.shopId, state),
      toast: "Purchase complete",
      progress: state,
    };
  }

  // Find choice on current node
  const node = npc.dialogueNodes.find((n) => n.id === current.nodeId);
  const choice = node?.choices?.find((c) => c.id === choiceId);

  // Shop mode synthetic choices already handled
  if (current.mode === "shop" && !choice) {
    return { dialogue: current, progress: state };
  }

  if (!choice && current.nodeId === "fallback") {
    return { dialogue: null, progress: state };
  }

  if (!choice) return { dialogue: current, progress: state };

  if (choice.action === "close") return { dialogue: null, progress: state };

  if (choice.action === "accept_quest" && choice.questId) {
    state = acceptQuest(state, choice.questId);
    const q = STARTER_QUEST_BY_KEY[choice.questId];
    const lines = [
      q ? `Quest accepted: ${q.name}` : "Quest accepted.",
      q?.description ?? "Check your objectives and return when ready.",
    ];
    return {
      dialogue: {
        speaker: npc.displayName,
        npcId: npc.id,
        portrait: npc.portraitAsset,
        lines,
        lineIndex: 0,
        nodeId: "quest-accepted",
        choices: [{ id: "close", label: "On my way" }],
        mode: "dialogue",
        credits: state.credits,
      },
      toast: lines[0],
      progress: state,
    };
  }

  if (choice.action === "open_shop" && choice.shopId) {
    return { dialogue: shopPayload(npc, choice.shopId, state), progress: state };
  }

  if (choice.action === "open_service" && choice.serviceId) {
    return runService(npc, choice.serviceId, state);
  }

  // Story flags from specific nodes
  if (choice.next === "fracture" || current.nodeId === "fracture") {
    state = markFlag(state, "heard-fracture");
  }
  if (choice.id === "story" || choice.next === "fracture") {
    state = markFlag(state, "heard-fracture");
  }

  if (choice.next) {
    const nextNode = npc.dialogueNodes.find((n) => n.id === choice.next);
    if (!nextNode) return { dialogue: null, progress: state };
    if (nextNode.id === "fracture") state = markFlag(state, "heard-fracture");
    const choices = visibleChoices(npc, nextNode, state);
    return {
      dialogue: {
        speaker: npc.displayName,
        npcId: npc.id,
        portrait: npc.portraitAsset,
        lines: nextNode.lines.filter(Boolean),
        lineIndex: 0,
        nodeId: nextNode.id,
        choices: choices.map((c) => ({ id: c.id, label: c.label })),
        mode: "dialogue",
        credits: state.credits,
      },
      progress: state,
    };
  }

  return { dialogue: null, progress: state };
}

function runService(
  npc: NpcDef,
  serviceId: string,
  state: LiveProgressState,
): DialogueActionResult {
  if (serviceId === "craft-basic-tool") {
    const result = craftTrainingClaw(state);
    if (!result.ok) {
      return {
        dialogue: {
          speaker: npc.displayName,
          npcId: npc.id,
          portrait: npc.portraitAsset,
          lines: [result.reason],
          lineIndex: 0,
          nodeId: "service-fail",
          choices: [{ id: "back-greeting", label: "Back" }, { id: "close", label: "Close" }],
          mode: "service",
          serviceId,
          credits: state.credits,
        },
        toast: result.reason,
        progress: state,
      };
    }
    return {
      dialogue: {
        speaker: npc.displayName,
        npcId: npc.id,
        portrait: npc.portraitAsset,
        lines: [
          "There — a Training Claw, honest work.",
          "Keep it on your companion when Arena drills open.",
        ],
        lineIndex: 0,
        nodeId: "service-ok",
        choices: [{ id: "close", label: "Thank you" }],
        mode: "service",
        serviceId,
        credits: result.state.credits,
      },
      toast: "Crafted Training Claw",
      progress: result.state,
    };
  }

  if (serviceId === "open-codex") {
    state = markFlag(state, "codex-opened");
    return {
      dialogue: {
        speaker: npc.displayName,
        npcId: npc.id,
        portrait: npc.portraitAsset,
        lines: [
          "Codex index unlocked for your Keeper profile.",
          "Record your first hatch when Mira finishes the lesson.",
        ],
        lineIndex: 0,
        nodeId: "codex",
        choices: [{ id: "close", label: "Understood" }],
        mode: "service",
        serviceId,
        credits: state.credits,
      },
      progress: state,
    };
  }

  if (serviceId === "restore-companion") {
    return {
      dialogue: {
        speaker: npc.displayName,
        npcId: npc.id,
        portrait: npc.portraitAsset,
        lines: [
          "Your companion's vitals look steady — Commons rules prevent lasting harm.",
          "Take a salve if you're heading to the outer woods.",
        ],
        lineIndex: 0,
        nodeId: "heal",
        choices: [{ id: "close", label: "Thanks, Nyla" }],
        mode: "service",
        serviceId,
        credits: state.credits,
      },
      toast: "Companion restored",
      progress: state,
    };
  }

  if (serviceId === "training-spar") {
    return {
      dialogue: {
        speaker: npc.displayName,
        npcId: npc.id,
        portrait: npc.portraitAsset,
        lines: [
          "Hit the training dummies in the yard, then try /arena/training when you're ready.",
          "No wagering. Ever.",
        ],
        lineIndex: 0,
        nodeId: "spar",
        choices: [{ id: "close", label: "Got it" }],
        mode: "service",
        serviceId,
        credits: state.credits,
      },
      progress: state,
    };
  }

  if (serviceId === "hatch-assist") {
    let next = markHatchProgress(state, "visit");
    next = markHatchProgress(next, "inspect");
    next = markHatchProgress(next, "hatch");
    next = markBondProgress(next, "name");
    next = markBondProgress(next, "profile");
    next = markBondProgress(next, "care");
    next = markBondProgress(next, "equip");
    return {
      dialogue: {
        speaker: npc.displayName,
        npcId: npc.id,
        portrait: npc.portraitAsset,
        lines: [
          "Demo assist: your starter hatch and bond steps are recorded.",
          "Visit /hatchery anytime for the full incubator UI.",
        ],
        lineIndex: 0,
        nodeId: "hatch-assist",
        choices: [{ id: "close", label: "Thank you" }],
        mode: "service",
        serviceId,
        credits: next.credits,
      },
      toast: "Hatch & bond progress recorded",
      progress: next,
    };
  }

  // Pip marker quick service via dialogue shop buy — also allow place marker
  if (serviceId === "place-marker") {
    const next = placeMapMarker(state);
    return {
      dialogue: {
        speaker: npc.displayName,
        npcId: npc.id,
        portrait: npc.portraitAsset,
        lines: ["Marker planted. Portal circle readout is green."],
        lineIndex: 0,
        nodeId: "marker",
        choices: [{ id: "close", label: "Nice" }],
        mode: "service",
        credits: next.credits,
      },
      progress: next,
    };
  }

  return {
    dialogue: {
      speaker: npc.displayName,
      npcId: npc.id,
      lines: ["That service isn't available yet."],
      lineIndex: 0,
      nodeId: "missing",
      choices: [{ id: "close", label: "Close" }],
      mode: "service",
      credits: state.credits,
    },
    progress: state,
  };
}

export function advanceBranchLine(
  current: BranchDialoguePayload,
): BranchDialoguePayload | "choices" | null {
  if (current.lineIndex < current.lines.length - 1) {
    return { ...current, lineIndex: current.lineIndex + 1 };
  }
  if (current.choices.length > 0) return "choices";
  return null;
}
