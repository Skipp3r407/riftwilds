import type {
  StoryArcDef,
  StoryChoice,
  StoryNode,
  StoryProgressState,
} from "@/game/story/types";

export function getNode(arc: StoryArcDef, nodeId: string): StoryNode | undefined {
  return arc.nodes.find((n) => n.id === nodeId);
}

export function startArc(arc: StoryArcDef): StoryProgressState {
  return {
    arcKey: arc.key,
    currentNodeId: arc.startNodeId,
    flags: [],
    reputation: {},
    completed: false,
    history: [{ nodeId: arc.startNodeId, at: new Date().toISOString() }],
  };
}

export function applyChoice(
  arc: StoryArcDef,
  state: StoryProgressState,
  choiceId: string,
): StoryProgressState {
  if (state.completed) return state;
  const node = getNode(arc, state.currentNodeId);
  if (!node) return state;
  const choice = node.choices.find((c) => c.id === choiceId);
  if (!choice) return state;

  const reputation = { ...state.reputation };
  if (choice.reputationDelta) {
    for (const [k, v] of Object.entries(choice.reputationDelta)) {
      reputation[k] = (reputation[k] ?? 0) + v;
    }
  }

  const flags = new Set(state.flags);
  for (const f of choice.flagsSet ?? []) flags.add(f);

  const nextId = choice.nextNodeId;
  const completed = nextId === null;
  const currentNodeId = nextId ?? state.currentNodeId;

  return {
    ...state,
    currentNodeId,
    flags: [...flags],
    reputation,
    completed,
    history: [
      ...state.history,
      {
        nodeId: currentNodeId,
        choiceId: choice.id,
        at: new Date().toISOString(),
      },
    ],
  };
}

export function availableChoices(
  arc: StoryArcDef,
  state: StoryProgressState,
): StoryChoice[] {
  if (state.completed) return [];
  return getNode(arc, state.currentNodeId)?.choices ?? [];
}

export function summarizeReputation(state: StoryProgressState): string[] {
  return Object.entries(state.reputation)
    .filter(([, v]) => v !== 0)
    .map(([k, v]) => `${k}: ${v > 0 ? "+" : ""}${v}`);
}
