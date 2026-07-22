/**
 * Anti-farming — deny AFK / surrender farm / bots; diminish repeat wins vs same opponent.
 */

export type AntiFarmInput = {
  afk?: boolean;
  surrendered?: boolean;
  botMatch?: boolean;
  /** Prior wins against this opponent (before this match). */
  priorWinsVsOpponent?: number;
  isBattleSource?: boolean;
};

export type AntiFarmResult = {
  allowed: boolean;
  multiplier: number;
  reason: string | null;
};

/** Win #1 = 100%, #2 = 70%, #3 = 40%, #4+ = 15%. */
export function repeatOpponentMultiplier(priorWins: number): number {
  const n = Math.max(0, Math.floor(priorWins));
  if (n <= 0) return 1;
  if (n === 1) return 0.7;
  if (n === 2) return 0.4;
  return 0.15;
}

export function evaluateAntiFarm(input: AntiFarmInput): AntiFarmResult {
  if (input.afk) {
    return { allowed: false, multiplier: 0, reason: "AFK_NO_XP" };
  }
  if (input.botMatch) {
    return { allowed: false, multiplier: 0, reason: "BOT_MATCH_NO_XP" };
  }
  if (input.surrendered && input.isBattleSource) {
    // Intentional surrender farming — no XP for the surrendering / farm pattern.
    return { allowed: false, multiplier: 0, reason: "SURRENDER_FARM_NO_XP" };
  }
  let multiplier = 1;
  if (input.isBattleSource && (input.priorWinsVsOpponent ?? 0) > 0) {
    multiplier = repeatOpponentMultiplier(input.priorWinsVsOpponent ?? 0);
  }
  return { allowed: true, multiplier, reason: null };
}

export function applyAntiFarmMultiplier(amount: number, multiplier: number): number {
  if (multiplier <= 0) return 0;
  return Math.max(0, Math.floor(amount * multiplier));
}
