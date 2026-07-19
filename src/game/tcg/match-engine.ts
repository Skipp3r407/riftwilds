import type { AffinityName } from "@prisma/client";
import { getCommanderById, getFactionById } from "@/content/tcg";
import {
  applyBloomTick,
  applyEquipmentToUnit,
  applySpellDamageToUnit,
  applySummonKeywords,
  compareCombatSpeed,
  computeStrikeDamage,
  deriveEquipmentMods,
  isEquipmentContentType,
  isTerrainContentType,
  onStrikeApplyKeywords,
  pickCombatTarget,
  poisonDawnDamage,
  tickStatuses,
  unitHasKeyword,
} from "@/game/tcg/combat";
import { addStatus } from "@/game/tcg/combat/status";
import { getCardById } from "@/content/tcg";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import {
  buildStarterDeckInstances,
  secureRandom,
  shuffleDeck,
} from "@/game/tcg/deck";
import { ensurePracticeOpeningHandPlayable } from "@/game/tcg/practice-loadout";
import {
  canAffordRiftCost,
  refillRiftEnergy,
  spendRiftEnergy,
} from "@/game/tcg/rift-energy";
import {
  TCG_DEFAULTS,
  type TcgBoardUnit,
  type TcgCardInstance,
  type TcgCommanderState,
  type TcgMatchMode,
  type TcgMatchState,
  type TcgPlayAction,
  type TcgPlayerSide,
  type TcgPowerMode,
} from "@/game/tcg/types";

function resolveCommander(heroId?: string | null): TcgCommanderState | null {
  if (!heroId) return null;
  const hero = getCommanderById(heroId);
  if (!hero) return null;
  const factionId = (
    ["ember-forge", "tideward-coast", "grove-circle", "stormspire"] as const
  ).find((id) => getFactionById(id)?.commanderHeroIds.includes(hero.id));
  return {
    heroId: hero.id,
    name: hero.name,
    title: hero.title,
    factionId,
  };
}

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

function removeDeadUnits(
  state: TcgMatchState,
  side: TcgPlayerSide,
): void {
  const dead = side.board.filter((u) => u.health <= 0);
  if (dead.length === 0) return;
  side.board = side.board.filter((u) => u.health > 0);
  for (const u of dead) {
    side.discard.push({ instanceId: u.instanceId, defId: u.defId });
    pushEvent(state, "UNIT_DEATH", side.id, {
      defId: u.defId,
      instanceId: u.instanceId,
    });
  }
}

/** Awaken: units that survived until the owner's next turn transform once. */
function applyAwakenTransforms(state: TcgMatchState, side: TcgPlayerSide): void {
  for (const u of side.board) {
    if (!unitHasKeyword(u.keywords, "awaken")) continue;
    if (u.statuses.some((s) => s.id === "awakened")) continue;
    const summoned = u.summonedOnTurn ?? state.turn;
    if (summoned >= state.turn) continue;

    u.attack += 2;
    u.power = u.attack;
    u.maxHealth += 2;
    u.health += 2;
    u.defense += 1;
    u.keywords = u.keywords.filter(
      (k) => k.toLowerCase() !== "awaken",
    );
    u.statuses = addStatus(u.statuses, {
      id: "awakened",
      stacks: 1,
      duration: null,
    });
    pushEvent(state, "AWAKEN", side.id, {
      instanceId: u.instanceId,
      defId: u.defId,
      attack: u.attack,
      health: u.health,
      defense: u.defense,
    });
  }
}

function beginTurn(state: TcgMatchState, side: TcgPlayerSide): void {
  const { riftEnergy, riftEnergyMax } = refillRiftEnergy(state.turn);
  side.riftEnergy = riftEnergy;
  side.riftEnergyMax = riftEnergyMax;
  side.energySpentThisTurn = 0;
  side.echoReady = false;
  side.echoResolving = false;

  applyAwakenTransforms(state, side);

  for (const u of side.board) {
    u.exhausted = false;
    // Bloom
    const bloomed = applyBloomTick({
      keywords: u.keywords,
      attack: u.attack,
      health: u.health,
      maxHealth: u.maxHealth,
      statuses: u.statuses,
    });
    u.attack = bloomed.attack;
    u.power = bloomed.attack;
    u.health = bloomed.health;
    u.maxHealth = bloomed.maxHealth;
    u.statuses = bloomed.statuses;

    // Poison dawn
    const poisonDmg = poisonDawnDamage(u.statuses);
    if (poisonDmg > 0) {
      u.health -= poisonDmg;
      pushEvent(state, "POISON_TICK", side.id, {
        instanceId: u.instanceId,
        damage: poisonDmg,
        health: u.health,
      });
    }
    u.statuses = tickStatuses(u.statuses);
  }
  removeDeadUnits(state, side);

  drawOne(side, state);
  state.phase = "MAIN";
  pushEvent(state, "TURN_START", side.id, {
    turn: state.turn,
    riftEnergy: side.riftEnergy,
  });
  checkWinner(state);
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

function strikeUnit(
  state: TcgMatchState,
  attackerSide: TcgPlayerSide,
  attacker: TcgBoardUnit,
  target: TcgBoardUnit,
  defenderSide: TcgPlayerSide,
): void {
  const dmg = computeStrikeDamage({
    attack: attacker.attack,
    defense: target.defense,
    attackerElement: attacker.element,
    defenderElement: target.element,
  });
  target.health -= dmg;
  target.statuses = onStrikeApplyKeywords({
    attackerKeywords: attacker.keywords,
    targetStatuses: target.statuses,
  });
  attacker.exhausted = true;
  pushEvent(state, "UNIT_STRIKE", attackerSide.id, {
    attackerId: attacker.instanceId,
    attackerDefId: attacker.defId,
    targetId: target.instanceId,
    targetDefId: target.defId,
    damage: dmg,
    targetHealth: target.health,
  });
  removeDeadUnits(state, defenderSide);
}

function strikeFace(
  state: TcgMatchState,
  attackerSide: TcgPlayerSide,
  attacker: TcgBoardUnit,
  defender: TcgPlayerSide,
): void {
  const dmg = computeStrikeDamage({
    attack: attacker.attack,
    defense: 0,
    attackerElement: attacker.element,
    defenderElement: defender.board[0]?.element ?? "neutral",
  });
  defender.keeperHp = Math.max(0, defender.keeperHp - dmg);
  attacker.exhausted = true;
  pushEvent(state, "FACE_STRIKE", attackerSide.id, {
    attackerId: attacker.instanceId,
    attackerDefId: attacker.defId,
    damage: dmg,
    defenderHp: defender.keeperHp,
  });
}

function resolveCombat(state: TcgMatchState, attacker: TcgPlayerSide): void {
  state.phase = "COMBAT";
  const defender = opposite(state, attacker.id);

  const ready = attacker.board
    .filter((u) => !u.exhausted && u.health > 0 && u.attack > 0)
    .sort(compareCombatSpeed);

  for (const unit of ready) {
    if (state.status !== "ACTIVE") break;
    // Re-read defender board each strike (deaths may change guardians).
    const target = pickCombatTarget({
      attackerKeywords: unit.keywords,
      enemyUnits: defender.board.map((u) => ({
        instanceId: u.instanceId,
        health: u.health,
        keywords: u.keywords,
        statuses: u.statuses,
      })),
    });

    if (target.kind === "face") {
      strikeFace(state, attacker, unit, defender);
    } else {
      const foe = defender.board.find((u) => u.instanceId === target.instanceId);
      if (!foe) {
        strikeFace(state, attacker, unit, defender);
      } else {
        strikeUnit(state, attacker, unit, foe, defender);
      }
    }
  }

  checkWinner(state);
}

function resolveSpellEffect(
  state: TcgMatchState,
  side: TcgPlayerSide,
  def: NonNullable<ReturnType<typeof getTcgCardDef>>,
  opts?: { echoed?: boolean },
): void {
  const foe = opposite(state, side.id);
  const content = getCardById(def.id);
  const grantsEcho =
    unitHasKeyword(def.keywords, "echo") ||
    (content?.abilities ?? []).some((a) =>
      a.effects.some((e) => e.op === "echo_replay"),
    );

  if (grantsEcho && !opts?.echoed) {
    side.echoReady = true;
    pushEvent(state, "ECHO_ARMED", side.id, { defId: def.id });
  }

  if (unitHasKeyword(def.keywords, "heal") || def.role === "healer") {
    const heal = Math.max(1, def.power);
    side.keeperHp = Math.min(side.maxKeeperHp, side.keeperHp + heal);
    pushEvent(state, opts?.echoed ? "ECHO_SPELL_HEAL" : "PLAY_SPELL_HEAL", side.id, {
      defId: def.id,
      heal,
      keeperHp: side.keeperHp,
      cost: def.riftCost,
      echoed: Boolean(opts?.echoed),
    });
    return;
  }

  // Pure Echo arming spells (no damage) — Spirit Echo etc.
  const onlyEcho =
    grantsEcho &&
    !(typeof content?.attack === "number" && content.attack > 0) &&
    !(content?.abilities ?? []).some((a) =>
      a.effects.some((e) => e.op === "deal_damage" || e.op === "heal"),
    );
  if (onlyEcho) {
    pushEvent(state, "PLAY_SPELL_ECHO_SETUP", side.id, {
      defId: def.id,
      cost: def.riftCost,
    });
    return;
  }

  let dmg = computeStrikeDamage({
    attack: def.power,
    defense: 0,
    attackerElement: def.element,
    defenderElement: foe.board[0]?.element ?? "neutral",
  });
  if (unitHasKeyword(def.keywords, "shatter")) {
    dmg = Math.max(dmg, 2);
  }
  const wardUnit = foe.board.find((u) =>
    u.statuses.some((s) => s.id === "ward"),
  );
  if (wardUnit) {
    const applied = applySpellDamageToUnit({
      damage: dmg,
      statuses: wardUnit.statuses,
    });
    wardUnit.statuses = applied.statuses;
    if (applied.blocked) {
      dmg = 0;
      pushEvent(state, "WARD_BLOCK", foe.id, {
        instanceId: wardUnit.instanceId,
        defId: wardUnit.defId,
      });
    }
  }
  if (dmg > 0) {
    foe.keeperHp = Math.max(0, foe.keeperHp - dmg);
  }
  pushEvent(state, opts?.echoed ? "ECHO_SPELL" : "PLAY_SPELL", side.id, {
    defId: def.id,
    damage: dmg,
    defenderHp: foe.keeperHp,
    cost: def.riftCost,
    echoed: Boolean(opts?.echoed),
  });
  checkWinner(state);
}

function tryEchoReplay(
  state: TcgMatchState,
  side: TcgPlayerSide,
  def: NonNullable<ReturnType<typeof getTcgCardDef>>,
): void {
  if (!side.echoReady || side.echoResolving) return;
  if (def.riftCost > 2) return;
  // Pure setup / zero-power arming spells are not replay targets.
  if (def.power <= 0 && unitHasKeyword(def.keywords, "echo")) return;
  // Echo surcharge: +1 Rift Energy (base cost already paid).
  if (!canAffordRiftCost(side.riftEnergy, 1)) return;
  side.riftEnergy = spendRiftEnergy(side.riftEnergy, 1);
  side.energySpentThisTurn += 1;
  side.echoReady = false;
  side.echoResolving = true;
  resolveSpellEffect(state, side, def, { echoed: true });
  side.echoResolving = false;
  pushEvent(state, "ECHO_RESOLVED", side.id, { defId: def.id });
}

function playEquipment(
  state: TcgMatchState,
  side: TcgPlayerSide,
  def: NonNullable<ReturnType<typeof getTcgCardDef>>,
  inst: TcgCardInstance,
  targetInstanceId?: string,
): void {
  // Caller must gate empty board (playCard throws EQUIP_NO_TARGET before spend).
  if (side.board.length === 0) {
    throw new Error("EQUIP_NO_TARGET");
  }
  let target =
    (targetInstanceId
      ? side.board.find((u) => u.instanceId === targetInstanceId)
      : undefined) ??
    [...side.board].sort((a, b) => a.health - b.health)[0]!;

  const mods = deriveEquipmentMods({
    defId: def.id,
    riftCost: def.riftCost,
    description: def.description,
    attack: def.attack,
    defense: def.defense,
    keywords: def.keywords,
  });
  const applied = applyEquipmentToUnit({
    attack: target.attack,
    defense: target.defense,
    health: target.health,
    maxHealth: target.maxHealth,
    keywords: target.keywords,
    statuses: target.statuses,
    equipmentIds: target.equipmentIds ?? [],
    mods,
    equipmentDefId: def.id,
  });
  target.attack = applied.attack;
  target.power = applied.attack;
  target.defense = applied.defense;
  target.health = applied.health;
  target.maxHealth = applied.maxHealth;
  target.keywords = applied.keywords;
  target.statuses = applied.statuses;
  target.equipmentIds = applied.equipmentIds;

  side.discard.push(inst);
  pushEvent(state, "PLAY_EQUIPMENT", side.id, {
    defId: def.id,
    targetInstanceId: target.instanceId,
    targetDefId: target.defId,
    attackMod: mods.attackMod,
    defenseMod: mods.defenseMod,
    durability: mods.durability,
    grantedKeywords: mods.grantedKeywords,
    cost: def.riftCost,
  });
}

function playTerrain(
  state: TcgMatchState,
  side: TcgPlayerSide,
  def: NonNullable<ReturnType<typeof getTcgCardDef>>,
  inst: TcgCardInstance,
): void {
  // Soft global: +1 defense to all friendly units this turn via status
  for (const u of side.board) {
    u.defense += 1;
    u.statuses = addStatus(u.statuses, {
      id: "terrain_ward",
      stacks: 1,
      duration: 1,
    });
  }
  side.discard.push(inst);
  pushEvent(state, "PLAY_TERRAIN", side.id, {
    defId: def.id,
    cost: def.riftCost,
    affected: side.board.length,
  });
}

function playCard(
  state: TcgMatchState,
  side: TcgPlayerSide,
  handInstanceId: string,
  targetInstanceId?: string,
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
  const contentType = def.contentType ?? "";
  // Refuse before spending — empty-field equip used to burn energy + discard.
  if (isEquipmentContentType(contentType) && side.board.length === 0) {
    throw new Error("EQUIP_NO_TARGET");
  }

  const paid = def.riftCost;
  side.riftEnergy = spendRiftEnergy(side.riftEnergy, paid);
  side.energySpentThisTurn += paid;
  side.hand.splice(idx, 1);

  if (def.type === "UNIT") {
    const summon = applySummonKeywords({
      keywords: def.keywords,
      statuses: [],
    });
    const unit: TcgBoardUnit = {
      instanceId: inst.instanceId,
      defId: def.id,
      power: def.attack,
      attack: def.attack,
      health: def.health,
      maxHealth: def.health,
      defense: def.defense,
      speed: def.speed,
      affinity: def.affinity,
      element: def.element ?? "neutral",
      keywords: [...def.keywords],
      statuses: summon.statuses,
      exhausted: summon.exhausted,
      equipmentIds: [],
      summonedOnTurn: state.turn,
    };
    side.board.push(unit);

    pushEvent(state, "PLAY_UNIT", side.id, {
      defId: def.id,
      attack: def.attack,
      health: def.health,
      defense: def.defense,
      speed: def.speed,
      cost: def.riftCost,
      keywords: def.keywords,
      exhausted: unit.exhausted,
      role: def.role ?? null,
    });
  } else if (isEquipmentContentType(contentType)) {
    playEquipment(state, side, def, inst, targetInstanceId);
  } else if (isTerrainContentType(contentType) || def.type === "AURA") {
    playTerrain(state, side, def, inst);
  } else if (def.type === "SPELL") {
    side.discard.push(inst);
    resolveSpellEffect(state, side, def);
    tryEchoReplay(state, side, def);
  } else {
    side.discard.push(inst);
    pushEvent(state, "PLAY_SUPPORT", side.id, {
      defId: def.id,
      cost: def.riftCost,
      contentType,
    });
  }
}

function endTurn(state: TcgMatchState, side: TcgPlayerSide): void {
  if (state.status !== "ACTIVE") return;
  resolveCombat(state, side);
  if (state.status !== "ACTIVE") return;

  state.phase = "END";
  const next = opposite(state, side.id);
  state.activeSideId = next.id;

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

  let guard = 0;
  while (guard < 8 && state.status === "ACTIVE") {
    guard += 1;
    const playable = ai.hand
      .map((c) => ({ c, def: getTcgCardDef(c.defId) }))
      .filter((x) => {
        if (!x.def) return false;
        if (!canAffordRiftCost(ai.riftEnergy, x.def.riftCost)) return false;
        if (
          x.def.type === "UNIT" &&
          ai.board.length >= TCG_DEFAULTS.maxBoardUnits
        ) {
          return false;
        }
        if (
          isEquipmentContentType(x.def.contentType ?? "") &&
          ai.board.length === 0
        ) {
          return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          a.def!.riftCost - b.def!.riftCost ||
          b.def!.attack - a.def!.attack,
      );
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
  commander?: TcgCommanderState | null,
  opts?: { practiceSoftMulligan?: boolean },
): TcgPlayerSide {
  let shuffled = shuffleDeck(deck, secureRandom);
  if (opts?.practiceSoftMulligan) {
    shuffled = ensurePracticeOpeningHandPlayable(shuffled);
  }
  const hand = shuffled.splice(0, TCG_DEFAULTS.openingHand);
  const energy = refillRiftEnergy(1);
  return {
    id,
    name,
    keeperHp: TCG_DEFAULTS.keeperHp,
    maxKeeperHp: TCG_DEFAULTS.keeperHp,
    riftEnergy: energy.riftEnergy,
    riftEnergyMax: energy.riftEnergyMax,
    energySpentThisTurn: 0,
    deck: shuffled,
    hand,
    board: [],
    discard: [],
    isAi,
    commander: commander ?? null,
  };
}

export type CreateMatchOpponentInput = {
  name: string;
  deck?: TcgCardInstance[];
  commanderHeroId?: string | null;
  /** When false, both sides are human (private / invite). Default AI. */
  isAi?: boolean;
};

export type CreateMatchInput = {
  publicId: string;
  playerName?: string;
  playerDeck?: TcgCardInstance[];
  commanderHeroId?: string | null;
  aiCommanderHeroId?: string | null;
  mode?: TcgMatchMode;
  powerMode?: TcgPowerMode;
  encounter?: TcgMatchState["encounter"];
  /** Optional second seat — human for private invites, AI otherwise. */
  opponent?: CreateMatchOpponentInput;
};

export function createTcgMatch(input: CreateMatchInput): TcgMatchState {
  const mode = input.mode ?? "practice";
  const practiceSoftMulligan = mode === "practice";
  const powerMode: TcgPowerMode =
    input.powerMode ??
    (mode === "ranked" ? "competitive" : TCG_DEFAULTS.rankedPowerMode);
  const playerCommander = resolveCommander(
    input.commanderHeroId ?? "hero-elara-venn",
  );
  const opponentIsAi = input.opponent?.isAi !== false;
  const foeCommander = resolveCommander(
    input.opponent?.commanderHeroId ??
      input.aiCommanderHeroId ??
      "hero-kael-forge",
  );
  const player = makeSide(
    "player",
    input.playerName ?? "Keeper",
    false,
    input.playerDeck ?? buildStarterDeckInstances(),
    playerCommander,
    { practiceSoftMulligan },
  );
  const foe = makeSide(
    opponentIsAi ? "ai" : "opponent",
    input.opponent?.name ??
      (foeCommander?.name ? `${foeCommander.name}` : "Rift Challenger"),
    opponentIsAi,
    input.opponent?.deck ?? buildStarterDeckInstances(),
    foeCommander,
    { practiceSoftMulligan },
  );

  const state: TcgMatchState = {
    publicId: input.publicId,
    turn: 1,
    status: "ACTIVE",
    phase: "MAIN",
    activeSideId: player.id,
    winnerId: null,
    players: [player, foe],
    events: [],
    mode,
    turnTimerSeconds: TCG_DEFAULTS.turnTimerSeconds,
    powerMode,
    encounter: input.encounter,
  };

  pushEvent(state, "MATCH_START", player.id, {
    encounter: input.encounter?.enemyId ?? null,
    commanderHeroId: playerCommander?.heroId ?? null,
    mode: state.mode,
    powerMode: state.powerMode,
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
    playCard(
      state,
      side,
      action.handInstanceId,
      action.targetInstanceId,
    );
    return state;
  }

  if (action.kind === "END_TURN") {
    endTurn(state, side);
    return state;
  }

  throw new Error("UNKNOWN_ACTION");
}

/** Client-safe snapshot — hide non-viewer hands (AI or opposing human). */
export function toTcgClientSnapshot(
  state: TcgMatchState,
  viewerSideId: string = "player",
) {
  const mapSide = (p: TcgPlayerSide) => {
    const hideHand = p.id !== viewerSideId;
    return {
      id: p.id,
      name: p.name,
      keeperHp: p.keeperHp,
      maxKeeperHp: p.maxKeeperHp,
      riftEnergy: p.riftEnergy,
      riftEnergyMax: p.riftEnergyMax,
      energySpentThisTurn: p.energySpentThisTurn,
      hand: hideHand
        ? p.hand.map((c) => ({ instanceId: c.instanceId, defId: "hidden" }))
        : p.hand,
      handCount: p.hand.length,
      deckCount: p.deck.length,
      board: p.board,
      discardCount: p.discard.length,
      isAi: p.isAi,
      commander: p.commander ?? null,
    };
  };

  return {
    publicId: state.publicId,
    turn: state.turn,
    status: state.status,
    phase: state.phase,
    activeSideId: state.activeSideId,
    winnerId: state.winnerId,
    mode: state.mode,
    powerMode: state.powerMode,
    turnTimerSeconds: state.turnTimerSeconds,
    yourSideId: viewerSideId,
    players: state.players.map(mapSide),
    events: state.events.slice(-24),
    encounter: state.encounter ?? null,
  };
}

export type TcgClientSnapshot = ReturnType<typeof toTcgClientSnapshot>;
