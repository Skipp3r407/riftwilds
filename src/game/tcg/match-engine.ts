import type { AffinityName } from "@prisma/client";
import { getAffinityModifier } from "@/game/creatures/affinity";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import {
  buildStarterDeckInstances,
  shuffleDeck,
} from "@/game/tcg/deck";
import {
  canAffordRiftCost,
  refillRiftEnergy,
  spendRiftEnergy,
} from "@/game/tcg/rift-energy";
import {
  TCG_DEFAULTS,
  type TcgBoardUnit,
  type TcgCardInstance,
  type TcgMatchEvent,
  type TcgMatchState,
  type TcgPlayAction,
  type TcgPlayerSide,
} from "@/game/tcg/types";

function pushEvent(
  state: TcgMatchState,
  type: string,
  actorId: string,
  payload: Record<string, unknown> = {},
): void {
  state.events.push({ type, actorId, payload });
  if (state.events.length > 80) {
    state.events.splice(0, state.events.length - 80);
  }
}

function opposite(state: TcgMatchState, sideId: string): TcgPlayerSide {
  return state.players[0].id === sideId ? state.players[1] : state.players[0];
}

function sideById(state: TcgMatchState, sideId: string): TcgPlayerSide {
  const s = state.players.find((p) => p.id === sideId);
  if (!s) throw new Error("SIDE_NOT_FOUND");
  return s;
}

function drawOne(side: TcgPlayerSide, state: TcgMatchState): void {
  if (side.deck.length === 0) {
    side.keeperHp = Math.max(0, side.keeperHp - 1);
    pushEvent(state, "FATIGUE", side.id, { keeperHp: side.keeperHp });
    return;
  }
  if (side.hand.length >= TCG_DEFAULTS.maxHandSize) {
    const burned = side.deck.shift()!;
    side.discard.push(burned);
    pushEvent(state, "HAND_FULL_BURN", side.id, { defId: burned.defId });
    return;
  }
  const card = side.deck.shift()!;
  side.hand.push(card);
  pushEvent(state, "DRAW", side.id, { defId: card.defId });
}

function beginTurn(state: TcgMatchState, side: TcgPlayerSide): void {
  const { riftEnergy, riftEnergyMax } = refillRiftEnergy(state.turn);
  side.riftEnergy = riftEnergy;
  side.riftEnergyMax = riftEnergyMax;
  for (const u of side.board) u.exhausted = false;
  drawOne(side, state);
  state.phase = "MAIN";
  pushEvent(state, "TURN_START", side.id, {
    turn: state.turn,
    riftEnergy: side.riftEnergy,
  });
}

function checkWinner(state: TcgMatchState): void {
  for (const p of state.players) {
    if (p.keeperHp <= 0) {
      state.status = "COMPLETED";
      state.phase = "FINISHED";
      state.winnerId = opposite(state, p.id).id;
      pushEvent(state, "MATCH_END", state.winnerId, { reason: "KEEPER_DOWN" });
      return;
    }
  }
  if (state.turn > TCG_DEFAULTS.maxTurns) {
    state.status = "COMPLETED";
    state.phase = "FINISHED";
    const [a, b] = state.players;
    state.winnerId =
      a.keeperHp === b.keeperHp
        ? null
        : a.keeperHp > b.keeperHp
          ? a.id
          : b.id;
    pushEvent(state, "MATCH_END", state.winnerId ?? "draw", {
      reason: "TURN_CAP",
    });
  }
}

function resolveCombat(state: TcgMatchState, attacker: TcgPlayerSide): void {
  state.phase = "COMBAT";
  const defender = opposite(state, attacker.id);
  let total = 0;
  for (const unit of attacker.board) {
    if (unit.exhausted) continue;
    const mod = getAffinityModifier(unit.affinity, defenderAffinity(defender));
    const dmg = Math.max(1, Math.round(unit.power * mod));
    total += dmg;
    unit.exhausted = true;
  }
  if (total > 0) {
    defender.keeperHp = Math.max(0, defender.keeperHp - total);
    pushEvent(state, "BOARD_ATTACK", attacker.id, {
      damage: total,
      defenderHp: defender.keeperHp,
    });
  }
  checkWinner(state);
}

function defenderAffinity(side: TcgPlayerSide): AffinityName {
  const lead = side.board[0];
  if (lead) return lead.affinity;
  return "SPIRIT";
}

function playCard(
  state: TcgMatchState,
  side: TcgPlayerSide,
  handInstanceId: string,
): void {
  const idx = side.hand.findIndex((c) => c.instanceId === handInstanceId);
  if (idx < 0) throw new Error("CARD_NOT_IN_HAND");
  const inst = side.hand[idx]!;
  const def = getTcgCardDef(inst.defId);
  if (!def) throw new Error("UNKNOWN_CARD");
  if (!canAffordRiftCost(side.riftEnergy, def.riftCost)) {
    throw new Error("INSUFFICIENT_RIFT_ENERGY");
  }
  if (def.type === "UNIT" && side.board.length >= TCG_DEFAULTS.maxBoardUnits) {
    throw new Error("BOARD_FULL");
  }

  side.riftEnergy = spendRiftEnergy(side.riftEnergy, def.riftCost);
  side.hand.splice(idx, 1);

  if (def.type === "UNIT") {
    const unit: TcgBoardUnit = {
      instanceId: inst.instanceId,
      defId: def.id,
      power: def.power,
      affinity: def.affinity,
      exhausted: true,
    };
    side.board.push(unit);
    pushEvent(state, "PLAY_UNIT", side.id, {
      defId: def.id,
      power: def.power,
      cost: def.riftCost,
    });
  } else if (def.type === "SPELL") {
    const foe = opposite(state, side.id);
    const mod = getAffinityModifier(def.affinity, defenderAffinity(foe));
    const dmg = Math.max(1, Math.round(def.power * mod));
    foe.keeperHp = Math.max(0, foe.keeperHp - dmg);
    side.discard.push(inst);
    pushEvent(state, "PLAY_SPELL", side.id, {
      defId: def.id,
      damage: dmg,
      defenderHp: foe.keeperHp,
      cost: def.riftCost,
    });
    checkWinner(state);
  } else {
    side.discard.push(inst);
    pushEvent(state, "PLAY_AURA_STUB", side.id, { defId: def.id });
  }
}

function endTurn(state: TcgMatchState, side: TcgPlayerSide): void {
  if (state.status !== "ACTIVE") return;
  resolveCombat(state, side);
  if (state.status !== "ACTIVE") return;

  state.phase = "END";
  const next = opposite(state, side.id);
  state.activeSideId = next.id;

  // PvE: AI resolves immediately, then turn counter advances for the player.
  if (next.isAi) {
    applyAiTurn(state);
    return;
  }

  state.turn += 1;
  beginTurn(state, next);
}

function applyAiTurn(state: TcgMatchState): void {
  const ai = sideById(state, state.activeSideId);
  if (!ai.isAi || state.status !== "ACTIVE") return;
  beginTurn(state, ai);
  if (state.status !== "ACTIVE") return;

  // Greedy: play cheapest affordable cards until stuck
  let guard = 0;
  while (guard < 8 && state.status === "ACTIVE") {
    guard += 1;
    const playable = ai.hand
      .map((c) => ({ c, def: getTcgCardDef(c.defId) }))
      .filter(
        (x) =>
          x.def &&
          canAffordRiftCost(ai.riftEnergy, x.def.riftCost) &&
          (x.def.type !== "UNIT" || ai.board.length < TCG_DEFAULTS.maxBoardUnits),
      )
      .sort((a, b) => (a.def!.riftCost - b.def!.riftCost) || (b.def!.power - a.def!.power));
    const pick = playable[0];
    if (!pick) break;
    playCard(state, ai, pick.c.instanceId);
  }

  if (state.status !== "ACTIVE") return;
  resolveCombat(state, ai);
  if (state.status !== "ACTIVE") return;

  const player = opposite(state, ai.id);
  state.activeSideId = player.id;
  state.turn += 1;
  beginTurn(state, player);
}

function makeSide(
  id: string,
  name: string,
  isAi: boolean,
  deck: TcgCardInstance[],
): TcgPlayerSide {
  const shuffled = shuffleDeck(deck);
  const hand = shuffled.splice(0, TCG_DEFAULTS.openingHand);
  const energy = refillRiftEnergy(1);
  return {
    id,
    name,
    keeperHp: TCG_DEFAULTS.keeperHp,
    maxKeeperHp: TCG_DEFAULTS.keeperHp,
    riftEnergy: energy.riftEnergy,
    riftEnergyMax: energy.riftEnergyMax,
    deck: shuffled,
    hand,
    board: [],
    discard: [],
    isAi,
  };
}

export type CreateMatchInput = {
  publicId: string;
  playerName?: string;
  playerDeck?: TcgCardInstance[];
  encounter?: TcgMatchState["encounter"];
};

export function createTcgMatch(input: CreateMatchInput): TcgMatchState {
  const player = makeSide(
    "player",
    input.playerName ?? "Keeper",
    false,
    input.playerDeck ?? buildStarterDeckInstances(),
  );
  const ai = makeSide("ai", "Rift Challenger", true, buildStarterDeckInstances());

  const state: TcgMatchState = {
    publicId: input.publicId,
    turn: 1,
    status: "ACTIVE",
    phase: "MAIN",
    activeSideId: player.id,
    winnerId: null,
    players: [player, ai],
    events: [],
    encounter: input.encounter,
  };

  // Opening draw already in hand; refill energy for turn 1 without extra draw
  pushEvent(state, "MATCH_START", player.id, {
    encounter: input.encounter?.enemyId ?? null,
  });
  return state;
}

export function applyTcgAction(
  state: TcgMatchState,
  actorId: string,
  action: TcgPlayAction,
): TcgMatchState {
  if (state.status !== "ACTIVE") throw new Error("MATCH_NOT_ACTIVE");
  if (state.activeSideId !== actorId) throw new Error("NOT_YOUR_TURN");
  const side = sideById(state, actorId);
  if (side.isAi) throw new Error("AI_SIDE");

  if (action.kind === "SURRENDER") {
    state.status = "COMPLETED";
    state.phase = "FINISHED";
    state.winnerId = opposite(state, actorId).id;
    pushEvent(state, "SURRENDER", actorId, {});
    return state;
  }

  if (action.kind === "PLAY_CARD") {
    if (state.phase !== "MAIN") throw new Error("WRONG_PHASE");
    playCard(state, side, action.handInstanceId);
    return state;
  }

  if (action.kind === "END_TURN") {
    endTurn(state, side);
    return state;
  }

  throw new Error("UNKNOWN_ACTION");
}

/** Client-safe snapshot (hide AI deck order partially — show counts only). */
export function toTcgClientSnapshot(state: TcgMatchState) {
  const mapSide = (p: TcgPlayerSide) => ({
    id: p.id,
    name: p.name,
    keeperHp: p.keeperHp,
    maxKeeperHp: p.maxKeeperHp,
    riftEnergy: p.riftEnergy,
    riftEnergyMax: p.riftEnergyMax,
    hand: p.isAi
      ? p.hand.map((c) => ({ instanceId: c.instanceId, defId: "hidden" }))
      : p.hand,
    handCount: p.hand.length,
    deckCount: p.deck.length,
    board: p.board,
    discardCount: p.discard.length,
    isAi: p.isAi,
  });

  return {
    publicId: state.publicId,
    turn: state.turn,
    status: state.status,
    phase: state.phase,
    activeSideId: state.activeSideId,
    winnerId: state.winnerId,
    players: state.players.map(mapSide),
    events: state.events.slice(-24),
    encounter: state.encounter ?? null,
  };
}

export type TcgClientSnapshot = ReturnType<typeof toTcgClientSnapshot>;
