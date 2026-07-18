/**
 * Anti-fraud risk score stubs — signals only; no automated bans from this module alone.
 */

export type FraudSignal =
  | "NEW_ACCOUNT"
  | "RAPID_LISTINGS"
  | "PRICE_OUTLIER"
  | "WASH_TRADE_SUSPECT"
  | "VELOCITY_SPEND"
  | "REGION_MISMATCH"
  | "FAILED_SIGNATURES"
  | "DUPLICATE_REQUEST";

export type RiskAssessment = {
  score: number;
  band: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  signals: FraudSignal[];
  recommendManualReview: boolean;
};

const WEIGHTS: Record<FraudSignal, number> = {
  NEW_ACCOUNT: 10,
  RAPID_LISTINGS: 15,
  PRICE_OUTLIER: 20,
  WASH_TRADE_SUSPECT: 35,
  VELOCITY_SPEND: 25,
  REGION_MISMATCH: 15,
  FAILED_SIGNATURES: 30,
  DUPLICATE_REQUEST: 40,
};

export function assessFraudRisk(signals: FraudSignal[]): RiskAssessment {
  const unique = [...new Set(signals)];
  const score = unique.reduce((s, sig) => s + WEIGHTS[sig], 0);
  let band: RiskAssessment["band"] = "LOW";
  if (score >= 70) band = "CRITICAL";
  else if (score >= 45) band = "HIGH";
  else if (score >= 20) band = "MEDIUM";
  return {
    score,
    band,
    signals: unique,
    recommendManualReview: band === "HIGH" || band === "CRITICAL",
  };
}
