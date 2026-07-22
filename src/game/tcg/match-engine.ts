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
  isItemContentType,
  isRelicContentType,
  isTerrainContentType,
  isTrapContentType,
  onStrikeApplyKeywords,
  pickCombatTarget,
  poisonDawnDamage,
  tickStatuses,
  unitHasKeyword,
} from "@/game/tcg/combat";
import { addStatus } from "@/game/tcg/combat/status";
import { getCardById } from "@/content/tcg";
import {
  INVENTORY_DECK_REJECT_MESSAGE,
  isInventoryOnlyCard,
} from "@/content/tcg/framework/combat-eligibility";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import {
  buildStarterDeckInstances,
  secureRandom,
  shuffleDeck,
} from "@/game/tcg/deck";
import { ensurePracticeOpeningHandPlayable } from "@/game/tcg/practice-loadout";
import {
  canAffordRiftCost,
  grantTempEnergy,
  refillRiftEnergy,
  spendRiftEnergy,
} from "@/game/tcg/rift-energy";
import {
  isCommanderPlayDef,
  playCostContextFromSide,
  resolvePlayCost,
} from "@/game/tcg/play-cost";

function logRejectedPlay(
  reason: string,
  detail: Record<string, unknown>,
): void {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.TCG_BATTLE_DEV === "1"
  ) {
    console.info("[tcg] rejected play", reason, detail);
  }
}
import {
  getBattleRules,
  matchModeToBattleMode,
  riftCollapseDamage,
  type BattleRulesConfig,
  type FieldLane,
} from "@/game/tcg/rules/battle-rules-config";
import {
  RIFT_SPARK_TOKEN,
  isRiftSparkToken,
} from "@/game/tcg/rules/rift-spark";
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
    powerUsedThisTurn: false,
  };
}

function rulesOf(state: TcgMatchState): BattleRulesConfig {
  return getBattleRules(matchModeToBattleMode(state.mode));
}

function resolveEventCardName(defId: unknown): string | null {
  if (typeof defId !== "string" || !defId) return null;
  const def = resolveCardDef(defId);
  return def?.name ?? defId;
}

function pushEvent(
  state: TcgMatchState,
  type: string,
  actorId: string,
  payload: Record<string, unknown> = {},
): void {
  const seq = (state.events.at(-1)?.payload?.seq as number | undefined) ?? 0;
  const nextSeq = typeof seq === "number" ? seq + 1 : state.events.length + 1;
  const enriched: Record<string, unknown> = {
    ...payload,
    seq: nextSeq,
    turn: state.turn,
    phase: state.phase,
  };

  // Resolve human-readable names for common id keys (player feed + tooltips).
  if (enriched.defId && !enriched.cardName) {
    enriched.cardName = resolveEventCardName(enriched.defId);
  }
  if (enriched.attackerDefId && !enriched.attackerName) {
    enriched.attackerName = resolveEventCardName(enriched.attackerDefId);
  }
  if (enriched.targetDefId && !enriched.targetName) {
    enriched.targetName = resolveEventCardName(enriched.targetDefId);
  }

  state.events.push({ type, actorId, payload: enriched });
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

function toDefeated(side: TcgPlayerSide, card: TcgCardInstance): void {
  side.defeated.push(card);
  side.discard.push(card);
}

function toExile(side: TcgPlayerSide, card: TcgCardInstance): void {
  side.exile.push(card);
}

function toRiftBurn(side: TcgPlayerSide, card: TcgCardInstance): void {
  side.riftBurn.push(card);
}

function resolveCardDef(defId: string) {
  if (isRiftSparkToken(defId)) return RIFT_SPARK_TOKEN;
  return getTcgCardDef(defId);
}

function drawOne(
  side: TcgPlayerSide,
  state: TcgMatchState,
  rules: BattleRulesConfig,
): void {
  if (side.deck.length === 0) {
    side.riftCollapseCount += 1;
    const dmg = riftCollapseDamage(side.riftCollapseCount, rules);
    side.keeperHp = Math.max(0, side.keeperHp - dmg);
    pushEvent(state, "RIFT_COLLAPSE", side.id, {
      keeperHp: side.keeperHp,
      damage: dmg,
      collapseIndex: side.riftCollapseCount,
    });
    // Legacy alias for older UI listeners / Dev console.
    pushEvent(state, "FATIGUE", side.id, {
      keeperHp: side.keeperHp,
      damage: dmg,
      hiddenFromPlayer: true,
    });
    return;
  }
  if (side.hand.length >= rules.hand.maxSize) {
    const burned = side.deck.shift()!;
    toRiftBurn(side, burned);
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
    toDefeated(side, { instanceId: u.instanceId, defId: u.defId });
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

function countLane(side: TcgPlayerSide, lane: FieldLane): number {
  return side.board.filter((u) => u.lane === lane).length;
}

function pickSummonLane(
  side: TcgPlayerSide,
  preferred: FieldLane | "any" | undefined,
  rules: BattleRulesConfig,
  requested?: FieldLane,
): FieldLane {
  const frontFree = countLane(side, "front") < rules.field.frontlineSlots;
  const backFree = countLane(side, "back") < rules.field.backlineSlots;

  if (requested === "front" && frontFree) return "front";
  if (requested === "back" && backFree) return "back";
  if (preferred === "back" && backFree) return "back";
  if (preferred === "front" && frontFree) return "front";
  if (frontFree) return "front";
  if (backFree) return "back";
  return "front";
}

function beginTurn(state: TcgMatchState, side: TcgPlayerSide): void {
  const rules = rulesOf(state);
  state.phase = "START";

  const energyBefore = side.riftEnergy;
  const previousMax = side.riftEnergyMax;
  const { riftEnergy, riftEnergyMax } = refillRiftEnergy(state.turn, {
    startMax: rules.energy.turn1Max,
    cap: rules.energy.cap,
    perTurnGain: rules.energy.perTurnGain,
  });
  side.riftEnergy = riftEnergy;
  side.riftEnergyMax = riftEnergyMax;
  side.tempEnergy = 0;
  side.energySpentThisTurn = 0;
  side.echoReady = false;
  side.echoResolving = false;
  if (side.commander) side.commander.powerUsedThisTurn = false;

  const maxGained = Math.max(0, riftEnergyMax - previousMax);
  // Player-facing "gained N" prefers the max ramp; refill always restores to max.
  const gained =
    maxGained > 0
      ? maxGained
      : Math.max(0, riftEnergy - Math.min(energyBefore, previousMax));
  pushEvent(state, "ENERGY_REFILL", side.id, {
    energyBefore: previousMax > 0 ? previousMax : energyBefore,
    energyAfter: riftEnergy,
    previousMax,
    riftEnergy,
    riftEnergyMax,
    gained,
    maxGained,
  });

  applyAwakenTransforms(state, side);

  for (const u of side.board) {
    u.exhausted = false;
    u.cannotStrikeKeeper = false;
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

  const skipDraw =
    rules.turn.firstPlayerSkipsTurn1Draw &&
    state.turn === 1 &&
    side.seatIndex === 0;

  if (!skipDraw) {
    drawOne(side, state, rules);
  } else {
    pushEvent(state, "SKIP_TURN1_DRAW", side.id, { hiddenFromPlayer: true });
  }

  if (
    state.turn === 1 &&
    side.seatIndex === 1 &&
    rules.turn.secondPlayerTurn1BonusEnergy > 0
  ) {
    const granted = grantTempEnergy(
      side.riftEnergy,
      side.riftEnergyMax,
      rules.turn.secondPlayerTurn1BonusEnergy,
    );
    side.riftEnergy = granted.riftEnergy;
    side.riftEnergyMax = granted.riftEnergyMax;
    side.tempEnergy += granted.tempGranted;
    pushEvent(state, "P2_TURN1_BONUS", side.id, {
      tempEnergy: granted.tempGranted,
      riftEnergy: side.riftEnergy,
    });
  }

  state.phase = "MAIN";
  pushEvent(state, "TURN_START", side.id, {
    turn: state.turn,
    riftEnergy: side.riftEnergy,
    phase: "MAIN",
  });
  checkWinner(state);
}

function checkWinner(state: TcgMatchState): void {
  const rules = rulesOf(state);
  for (const p of state.players) {
    if (p.keeperHp <= 0) {
      state.status = "COMPLETED";
      state.phase = "FINISHED";
      state.winnerId = opposite(state, p.id).id;
      pushEvent(state, "MATCH_END", state.winnerId, { reason: "KEEPER_DOWN" });
      return;
    }
  }
  if (state.turn > rules.turn.maxTurns) {
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
  if (!unitHasKeyword(attacker.keywords, "vigilant")) {
    attacker.exhausted = true;
  }
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
  if (!unitHasKeyword(attacker.keywords, "vigilant")) {
    attacker.exhausted = true;
  }
  pushEvent(state, "FACE_STRIKE", attackerSide.id, {
    attackerId: attacker.instanceId,
    attackerDefId: attacker.defId,
    damage: dmg,
    defenderHp: defender.keeperHp,
  });
}

function resolveCombat(state: TcgMatchState, attacker: TcgPlayerSide): void {
  state.phase = "COMBAT";
  pushEvent(state, "COMBAT_PHASE", attacker.id, { phase: "COMBAT" });
  const defender = opposite(state, attacker.id);

  const ready = attacker.board
    .filter((u) => !u.exhausted && u.health > 0 && u.attack > 0)
    .sort(compareCombatSpeed);

  for (const unit of ready) {
    if (state.status !== "ACTIVE") break;
    const target = pickCombatTarget({
      attackerKeywords: unit.keywords,
      cannotStrikeKeeper: unit.cannotStrikeKeeper,
      enemyUnits: defender.board.map((u) => ({
        instanceId: u.instanceId,
        health: u.health,
        keywords: u.keywords,
        statuses: u.statuses,
        lane: u.lane,
      })),
    });

    if (target.kind === "none") {
      pushEvent(state, "ATTACK_SKIPPED", attacker.id, {
        attackerId: unit.instanceId,
        reason: "NO_LEGAL_TARGET",
      });
      continue;
    }

    if (target.kind === "face") {
      strikeFace(state, attacker, unit, defender);
    } else {
      const foe = defender.board.find((u) => u.instanceId === target.instanceId);
      if (!foe) {
        if (!unit.cannotStrikeKeeper) {
          strikeFace(state, attacker, unit, defender);
        }
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
  def: NonNullable<ReturnType<typeof resolveCardDef>>,
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
  def: NonNullable<ReturnType<typeof resolveCardDef>>,
): void {
  if (!side.echoReady || side.echoResolving) return;
  if (def.riftCost > 2) return;
  if (def.power <= 0 && unitHasKeyword(def.keywords, "echo")) return;
  if (!canAffordRiftCost(side.riftEnergy, 1)) return;
  side.riftEnergy = spendRiftEnergy(side.riftEnergy, 1);
  side.energySpentThisTurn += 1;
  side.echoReady = false;
  side.echoResolving = true;
  resolveSpellEffect(state, side, def, { echoed: true });
  side.echoResolving = false;
  pushEvent(state, "ECHO_RESOLVED", side.id, { defId: def.id });
}

function playRiftSpark(
  state: TcgMatchState,
  side: TcgPlayerSide,
  inst: TcgCardInstance,
): void {
  const granted = grantTempEnergy(side.riftEnergy, side.riftEnergyMax, 1);
  side.riftEnergy = granted.riftEnergy;
  side.riftEnergyMax = granted.riftEnergyMax;
  side.tempEnergy += granted.tempGranted;
  toExile(side, inst);
  pushEvent(state, "RIFT_SPARK", side.id, {
    tempEnergy: granted.tempGranted,
    riftEnergy: side.riftEnergy,
  });
}

function playEquipment(
  state: TcgMatchState,
  side: TcgPlayerSide,
  def: NonNullable<ReturnType<typeof resolveCardDef>>,
  inst: TcgCardInstance,
  targetInstanceId?: string,
): void {
  if (side.board.length === 0) {
    throw new Error("EQUIP_NO_TARGET");
  }
  const target =
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

  toDefeated(side, inst);
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
  def: NonNullable<ReturnType<typeof resolveCardDef>>,
  inst: TcgCardInstance,
): void {
  if (side.terrain) {
    toDefeated(side, side.terrain);
  }
  side.terrain = inst;
  for (const u of side.board) {
    u.defense += 1;
    u.statuses = addStatus(u.statuses, {
      id: "terrain_ward",
      stacks: 1,
      duration: 1,
    });
  }
  pushEvent(state, "PLAY_TERRAIN", side.id, {
    defId: def.id,
    cost: def.riftCost,
    affected: side.board.length,
  });
}

/** Item consumable — resolve effect then discard (never stays attached). */
function playItem(
  state: TcgMatchState,
  side: TcgPlayerSide,
  def: NonNullable<ReturnType<typeof resolveCardDef>>,
  inst: TcgCardInstance,
): void {
  toDefeated(side, inst);
  resolveSpellEffect(state, side, def);
  pushEvent(state, "PLAY_ITEM", side.id, {
    defId: def.id,
    cost: def.riftCost,
    consumed: true,
    // Spell/heal narration already emitted by resolveSpellEffect.
    hiddenFromPlayer: true,
  });
}

/** Relic — permanent board artifact (does not attach to units). */
function playRelic(
  state: TcgMatchState,
  side: TcgPlayerSide,
  def: NonNullable<ReturnType<typeof resolveCardDef>>,
  inst: TcgCardInstance,
): void {
  if (!side.relics) side.relics = [];
  side.relics.push(inst);
  pushEvent(state, "PLAY_RELIC", side.id, {
    defId: def.id,
    cost: def.riftCost,
    relicCount: side.relics.length,
  });
}

/** Trap — set face-down; trigger scaffolding (auto-resolve later). */
function playTrap(
  state: TcgMatchState,
  side: TcgPlayerSide,
  def: NonNullable<ReturnType<typeof resolveCardDef>>,
  inst: TcgCardInstance,
): void {
  if (!side.traps) side.traps = [];
  side.traps.push({ ...inst, faceDown: true, armed: true });
  pushEvent(state, "SET_TRAP", side.id, {
    defId: def.id,
    cost: def.riftCost,
    faceDown: true,
    armed: true,
  });
}

function spellSpeedOf(
  def: NonNullable<ReturnType<typeof resolveCardDef>>,
): "slow" | "fast" | "reaction" {
  if (def.spellSpeed) return def.spellSpeed;
  if (isRiftSparkToken(def.id)) return "fast";
  // Cheap combat tools default Fast; others Slow.
  if (def.type === "SPELL" && def.riftCost <= 2) return "fast";
  return "slow";
}

function assertPlayPhase(
  state: TcgMatchState,
  def: NonNullable<ReturnType<typeof resolveCardDef>>,
): void {
  if (state.phase === "MAIN") return;
  if (state.phase === "SECOND_MAIN") {
    if (def.type === "UNIT") return; // Second Main may still summon
    const speed = spellSpeedOf(def);
    if (speed === "slow") throw new Error("WRONG_SPELL_SPEED");
    return;
  }
  throw new Error("WRONG_PHASE");
}

function playCard(
  state: TcgMatchState,
  side: TcgPlayerSide,
  handInstanceId: string,
  targetInstanceId?: string,
  lane?: FieldLane,
): void {
  const rules = rulesOf(state);
  const idx = side.hand.findIndex((c) => c.instanceId === handInstanceId);
  if (idx < 0) throw new Error("CARD_NOT_IN_HAND");
  const inst = side.hand[idx]!;
  const def = resolveCardDef(inst.defId);
  if (!def) throw new Error("UNKNOWN_CARD");
  // Inventory / Companion Care leftovers must never resolve in battle.
  if (isInventoryOnlyCard(def.id, def.contentType)) {
    throw new Error(`INVENTORY_NOT_COMBAT:${INVENTORY_DECK_REJECT_MESSAGE}`);
  }
  assertPlayPhase(state, def);

  if (isRiftSparkToken(def.id)) {
    side.hand.splice(idx, 1);
    playRiftSpark(state, side, inst);
    return;
  }

  // Commanders are hero-slot only — never summonable from the main deck / hand.
  if (isCommanderPlayDef(def)) {
    throw new Error("COMMANDER_NOT_PLAYABLE");
  }

  const playCost = resolvePlayCost(def, playCostContextFromSide(side));

  if (!canAffordRiftCost(side.riftEnergy, playCost.cost)) {
    logRejectedPlay("INSUFFICIENT_RIFT_ENERGY", {
      defId: def.id,
      name: def.name,
      energy: side.riftEnergy,
      cost: playCost.cost,
      printedCost: playCost.printedCost,
      sideId: side.id,
    });
    throw new Error("INSUFFICIENT_RIFT_ENERGY");
  }
  if (def.type === "UNIT" && side.board.length >= rules.field.maxCreatures) {
    throw new Error("BOARD_FULL");
  }
  if (def.type === "UNIT") {
    const frontFull = countLane(side, "front") >= rules.field.frontlineSlots;
    const backFull = countLane(side, "back") >= rules.field.backlineSlots;
    if (frontFull && backFull) throw new Error("BOARD_FULL");
  }
  const contentType = def.contentType ?? "";
  if (isEquipmentContentType(contentType) && side.board.length === 0) {
    throw new Error("EQUIP_NO_TARGET");
  }

  const paid = playCost.cost;
  side.riftEnergy = spendRiftEnergy(side.riftEnergy, paid);
  side.energySpentThisTurn += paid;
  if (playCost.usedCompanionDiscount) {
    side.firstCompanionDiscountUsed = true;
  }
  side.hand.splice(idx, 1);

  if (def.type === "UNIT") {
    const summon = applySummonKeywords({
      keywords: def.keywords,
      statuses: [],
      energyRemaining: side.riftEnergy,
    });
    const chosenLane = pickSummonLane(
      side,
      def.preferredLane,
      rules,
      lane,
    );
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
      cannotStrikeKeeper: summon.cannotStrikeKeeper,
      lane: chosenLane,
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
      cost: paid,
      printedCost: def.riftCost,
      keywords: def.keywords,
      exhausted: unit.exhausted,
      cannotStrikeKeeper: unit.cannotStrikeKeeper,
      lane: unit.lane,
      role: def.role ?? null,
    });
  } else if (isEquipmentContentType(contentType)) {
    playEquipment(state, side, def, inst, targetInstanceId);
  } else if (isTerrainContentType(contentType) || def.type === "AURA") {
    playTerrain(state, side, def, inst);
  } else if (isItemContentType(contentType)) {
    playItem(state, side, def, inst);
  } else if (isRelicContentType(contentType)) {
    playRelic(state, side, def, inst);
  } else if (isTrapContentType(contentType)) {
    playTrap(state, side, def, inst);
  } else if (def.type === "SPELL") {
    toDefeated(side, inst);
    resolveSpellEffect(state, side, def);
    tryEchoReplay(state, side, def);
  } else {
    toDefeated(side, inst);
    pushEvent(state, "PLAY_SUPPORT", side.id, {
      defId: def.id,
      cost: def.riftCost,
      contentType,
    });
  }
}

function finishEndTurn(state: TcgMatchState, side: TcgPlayerSide): void {
  if (state.status !== "ACTIVE") return;
  state.phase = "END";
  pushEvent(state, "END_PHASE", side.id, { phase: "END" });
  // Expire temporary energy
  if (side.tempEnergy > 0) {
    side.riftEnergy = Math.max(0, side.riftEnergy - side.tempEnergy);
    side.tempEnergy = 0;
  }

  const next = opposite(state, side.id);
  state.activeSideId = next.id;

  if (next.isAi) {
    applyAiTurn(state);
    return;
  }

  state.turn += 1;
  beginTurn(state, next);
}

function enterSecondMainOrFinish(
  state: TcgMatchState,
  side: TcgPlayerSide,
): void {
  const rules = rulesOf(state);
  if (state.status !== "ACTIVE") return;

  if (side.isAi || rules.turn.autoSkipSecondMain) {
    pushEvent(state, "SECOND_MAIN_SKIPPED", side.id, {
      reason: side.isAi ? "AI" : "MODE",
      hiddenFromPlayer: true,
    });
    finishEndTurn(state, side);
    return;
  }

  state.phase = "SECOND_MAIN";
  pushEvent(state, "SECOND_MAIN", side.id, { hiddenFromPlayer: true });
}

function endTurn(state: TcgMatchState, side: TcgPlayerSide): void {
  if (state.status !== "ACTIVE") return;

  if (state.phase === "SECOND_MAIN") {
    finishEndTurn(state, side);
    return;
  }

  if (state.phase !== "MAIN" && state.phase !== "COMBAT") {
    throw new Error("WRONG_PHASE");
  }

  if (state.phase === "MAIN") {
    resolveCombat(state, side);
  }
  if (state.status !== "ACTIVE") return;
  enterSecondMainOrFinish(state, side);
}

function declareCombat(state: TcgMatchState, side: TcgPlayerSide): void {
  if (state.phase !== "MAIN") throw new Error("WRONG_PHASE");
  resolveCombat(state, side);
  if (state.status !== "ACTIVE") return;
  enterSecondMainOrFinish(state, side);
}

function applyMulligan(
  state: TcgMatchState,
  side: TcgPlayerSide,
  replaceInstanceIds: string[],
): void {
  const rules = rulesOf(state);
  if (state.phase !== "MULLIGAN") throw new Error("WRONG_PHASE");
  if (side.mulliganUsed) throw new Error("MULLIGAN_ALREADY_USED");

  const unique = [...new Set(replaceInstanceIds)];
  const returning: TcgCardInstance[] = [];
  for (const id of unique) {
    const idx = side.hand.findIndex((c) => c.instanceId === id);
    if (idx < 0) continue;
    if (isRiftSparkToken(side.hand[idx]!.defId)) continue;
    returning.push(side.hand.splice(idx, 1)[0]!);
  }
  side.deck.push(...returning);
  side.deck = shuffleDeck(side.deck, secureRandom);
  for (let i = 0; i < returning.length; i += 1) {
    drawOne(side, state, rules);
  }
  side.mulliganUsed = true;
  pushEvent(state, "MULLIGAN", side.id, { replaced: returning.length });
  tryStartAfterMulligan(state);
}

function keepHand(state: TcgMatchState, side: TcgPlayerSide): void {
  if (state.phase !== "MULLIGAN") throw new Error("WRONG_PHASE");
  side.mulliganUsed = true;
  pushEvent(state, "KEEP_HAND", side.id, {});
  tryStartAfterMulligan(state);
}

function tryStartAfterMulligan(state: TcgMatchState): void {
  if (state.players.every((p) => p.mulliganUsed || p.isAi)) {
    for (const p of state.players) {
      if (p.isAi && !p.mulliganUsed) {
        p.mulliganUsed = true;
        pushEvent(state, "KEEP_HAND", p.id, { auto: true });
      }
    }
    const first = state.players[0]!;
    state.activeSideId = first.id;
    // Opening energy already dealt; enter MAIN without a second draw for P1.
    state.phase = "MAIN";
    pushEvent(state, "TURN_START", first.id, {
      turn: state.turn,
      riftEnergy: first.riftEnergy,
      phase: "MAIN",
      afterMulligan: true,
    });
  }
}

function applyAiTurn(state: TcgMatchState): void {
  const rules = rulesOf(state);
  const ai = sideById(state, state.activeSideId);
  if (!ai.isAi || state.status !== "ACTIVE") return;
  beginTurn(state, ai);
  if (state.status !== "ACTIVE") return;

  // Auto-play Rift Spark if present.
  const spark = ai.hand.find((c) => isRiftSparkToken(c.defId));
  if (spark) {
    playCard(state, ai, spark.instanceId);
  }

  let guard = 0;
  while (guard < 8 && state.status === "ACTIVE") {
    guard += 1;
    const playable = ai.hand
      .map((c) => ({ c, def: resolveCardDef(c.defId) }))
      .filter((x) => {
        if (!x.def) return false;
        if (isRiftSparkToken(x.def.id)) return true;
        if (isCommanderPlayDef(x.def)) return false;
        const cost = resolvePlayCost(
          x.def,
          playCostContextFromSide(ai),
        ).cost;
        if (!canAffordRiftCost(ai.riftEnergy, cost)) return false;
        if (
          x.def.type === "UNIT" &&
          ai.board.length >= rules.field.maxCreatures
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
      .sort((a, b) => {
        const ctx = playCostContextFromSide(ai);
        const ca = resolvePlayCost(a.def!, ctx).cost;
        const cb = resolvePlayCost(b.def!, ctx).cost;
        return ca - cb || b.def!.attack - a.def!.attack;
      });
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
  seatIndex: number,
  rules: BattleRulesConfig,
  commander?: TcgCommanderState | null,
  opts?: {
    practiceSoftMulligan?: boolean;
    grantRiftSpark?: boolean;
    /** Explicit rng for tests only — live play uses secureRandom. */
    rng?: () => number;
  },
): TcgPlayerSide {
  const rng = opts?.rng ?? secureRandom;
  // Authoritative pre-deal shuffle — remaining draws use this order via shift().
  let shuffled = shuffleDeck(deck, rng);
  if (opts?.practiceSoftMulligan) {
    shuffled = ensurePracticeOpeningHandPlayable(shuffled, {
      openingHand: rules.hand.openingSize,
    });
  }
  const hand = shuffled.splice(0, rules.hand.openingSize);
  const energy = refillRiftEnergy(1, {
    startMax: rules.energy.turn1Max,
    cap: rules.energy.cap,
    perTurnGain: rules.energy.perTurnGain,
  });

  if (opts?.grantRiftSpark) {
    hand.push({
      instanceId: `spark_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`,
      defId: RIFT_SPARK_TOKEN.id,
    });
  }

  return {
    id,
    name,
    keeperHp: rules.keeper.startingHp,
    maxKeeperHp: rules.keeper.startingHp,
    riftEnergy: energy.riftEnergy,
    riftEnergyMax: energy.riftEnergyMax,
    tempEnergy: 0,
    energySpentThisTurn: 0,
    firstCompanionDiscountUsed: false,
    temporaryPlayCostModifier: 0,
    playCostReduction: 0,
    deck: shuffled,
    hand,
    board: [],
    defeated: [],
    exile: [],
    riftBurn: [],
    discard: [],
    terrain: null,
    relics: [],
    traps: [],
    isAi,
    commander: commander ?? null,
    riftCollapseCount: 0,
    mulliganUsed: false,
    seatIndex,
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
  /** Skip mulligan phase (tests / quick start). Default: practice skips. */
  skipMulligan?: boolean;
  /**
   * Explicit RNG for tests / sims only. Omit for live play (crypto shuffle).
   * Never set a default seed in production paths.
   */
  rng?: () => number;
};

export function createTcgMatch(input: CreateMatchInput): TcgMatchState {
  const mode = input.mode ?? "practice";
  const battleMode = matchModeToBattleMode(mode);
  const rules = getBattleRules(battleMode);
  const practiceSoftMulligan = mode === "practice" || mode === "tutorial";
  const powerMode: TcgPowerMode =
    input.powerMode ??
    (mode === "ranked" ? "competitive" : TCG_DEFAULTS.rankedPowerMode);
  const rng = input.rng ?? secureRandom;
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
    0,
    rules,
    playerCommander,
    { practiceSoftMulligan, rng },
  );
  const foe = makeSide(
    opponentIsAi ? "ai" : "opponent",
    input.opponent?.name ??
      (foeCommander?.name ? `${foeCommander.name}` : "Rift Challenger"),
    opponentIsAi,
    input.opponent?.deck ?? buildStarterDeckInstances(),
    1,
    rules,
    foeCommander,
    {
      practiceSoftMulligan,
      grantRiftSpark: rules.turn.secondPlayerRiftSpark,
      rng,
    },
  );

  const skipMulligan =
    input.skipMulligan ??
    (mode === "practice" ||
      mode === "quick" ||
      mode === "tutorial" ||
      !rules.hand.mulliganOnce);

  if (skipMulligan) {
    player.mulliganUsed = true;
    foe.mulliganUsed = true;
  }

  const state: TcgMatchState = {
    publicId: input.publicId,
    turn: 1,
    status: "ACTIVE",
    phase: skipMulligan ? "MAIN" : "MULLIGAN",
    activeSideId: player.id,
    winnerId: null,
    players: [player, foe],
    events: [],
    mode,
    turnTimerSeconds: rules.turn.timerSeconds,
    powerMode,
    rulesVersion: rules.rulesVersion,
    reactionDepth: 0,
    encounter: input.encounter,
  };

  pushEvent(state, "MATCH_START", player.id, {
    encounter: input.encounter?.enemyId ?? null,
    commanderHeroId: playerCommander?.heroId ?? null,
    mode: state.mode,
    powerMode: state.powerMode,
    rulesVersion: state.rulesVersion,
    keeperHp: rules.keeper.startingHp,
    openingHand: rules.hand.openingSize,
    energy: rules.energy.turn1Max,
  });

  if (!skipMulligan) {
    pushEvent(state, "MULLIGAN_PHASE", player.id, {});
  } else {
    pushEvent(state, "TURN_START", player.id, {
      turn: 1,
      riftEnergy: player.riftEnergy,
      phase: "MAIN",
      skipDraw: true,
    });
  }

  return state;
}

export function applyTcgAction(
  state: TcgMatchState,
  actorId: string,
  action: TcgPlayAction,
): TcgMatchState {
  if (state.status !== "ACTIVE") throw new Error("MATCH_NOT_ACTIVE");

  if (action.kind === "MULLIGAN" || action.kind === "KEEP_HAND") {
    const side = sideById(state, actorId);
    if (side.isAi) throw new Error("AI_SIDE");
    if (action.kind === "MULLIGAN") {
      applyMulligan(state, side, action.replaceInstanceIds);
    } else {
      keepHand(state, side);
    }
    return state;
  }

  if (state.activeSideId !== actorId) throw new Error("NOT_YOUR_TURN");
  const side = sideById(state, actorId);
  if (side.isAi) throw new Error("AI_SIDE");

  if (action.kind === "SURRENDER") {
    state.status = "COMPLETED";
    state.phase = "FINISHED";
    state.winnerId = opposite(state, actorId).id;
    pushEvent(state, "SURRENDER", actorId, {});
    pushEvent(state, "MATCH_END", state.winnerId, { reason: "CONCEDE" });
    return state;
  }

  if (action.kind === "PLAY_CARD") {
    playCard(
      state,
      side,
      action.handInstanceId,
      action.targetInstanceId,
      action.lane,
    );
    return state;
  }

  if (action.kind === "DECLARE_COMBAT") {
    declareCombat(state, side);
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
  const rules = rulesOf(state);
  const mapSide = (p: TcgPlayerSide) => {
    const hideHand = p.id !== viewerSideId;
    return {
      id: p.id,
      name: p.name,
      keeperHp: p.keeperHp,
      maxKeeperHp: p.maxKeeperHp,
      riftEnergy: p.riftEnergy,
      riftEnergyMax: p.riftEnergyMax,
      tempEnergy: p.tempEnergy,
      energySpentThisTurn: p.energySpentThisTurn,
      firstCompanionDiscountUsed: p.firstCompanionDiscountUsed,
      temporaryPlayCostModifier: p.temporaryPlayCostModifier ?? 0,
      playCostReduction: p.playCostReduction ?? 0,
      hand: hideHand
        ? p.hand.map((c) => ({ instanceId: c.instanceId, defId: "hidden" }))
        : p.hand,
      handCount: p.hand.length,
      deckCount: p.deck.length,
      board: p.board,
      defeatedCount: p.defeated.length,
      exileCount: p.exile.length,
      riftBurnCount: p.riftBurn.length,
      discardCount: p.discard.length,
      terrain: p.terrain,
      relics: p.relics ?? [],
      traps: (p.traps ?? []).map((t) =>
        hideHand
          ? { instanceId: t.instanceId, defId: "hidden", faceDown: true, armed: t.armed }
          : t,
      ),
      isAi: p.isAi,
      commander: p.commander ?? null,
      mulliganUsed: p.mulliganUsed,
      seatIndex: p.seatIndex,
      frontline: p.board.filter((u) => u.lane === "front"),
      backline: p.board.filter((u) => u.lane === "back"),
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
    rulesVersion: state.rulesVersion,
    fieldSlots: {
      frontline: rules.field.frontlineSlots,
      backline: rules.field.backlineSlots,
      terrain: rules.field.terrainSlots,
      maxCreatures: rules.field.maxCreatures,
    },
    yourSideId: viewerSideId,
    players: state.players.map(mapSide),
    events: state.events.slice(-80),
    encounter: state.encounter ?? null,
  };
}

export type TcgClientSnapshot = ReturnType<typeof toTcgClientSnapshot>;

/** Expose for tests / UI rules panel. */
export function getMatchRules(state: TcgMatchState): BattleRulesConfig {
  return rulesOf(state);
}
