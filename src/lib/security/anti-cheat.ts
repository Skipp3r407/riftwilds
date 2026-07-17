/**
 * Anti-cheat signal stubs — ranked / economy paths can attach these later.
 */

export type AntiCheatSignal =
  | "impossible_travel"
  | "action_spam"
  | "stat_anomaly"
  | "duplicate_claim"
  | "timing_bot"
  | "wash_trade_risk";

export type AntiCheatFinding = {
  signal: AntiCheatSignal;
  severity: "low" | "medium" | "high";
  detail: string;
  at: string;
};

export function evaluateActionSpam(input: {
  actionCount: number;
  windowMs: number;
  limit: number;
}): AntiCheatFinding | null {
  if (input.actionCount <= input.limit) return null;
  return {
    signal: "action_spam",
    severity: input.actionCount > input.limit * 2 ? "high" : "medium",
    detail: `${input.actionCount} actions in ${input.windowMs}ms (limit ${input.limit})`,
    at: new Date().toISOString(),
  };
}

export function evaluateDuplicateClaim(input: {
  claimKey: string;
  seenKeys: Set<string>;
}): AntiCheatFinding | null {
  if (!input.seenKeys.has(input.claimKey)) return null;
  return {
    signal: "duplicate_claim",
    severity: "high",
    detail: `Duplicate claim key ${input.claimKey}`,
    at: new Date().toISOString(),
  };
}
