/**
 * Canonical entertainment/rewards language for Rift Exchange.
 * Never use investment / guaranteed-earnings framing.
 */

export const EXCHANGE_FRAMING =
  "Rift Exchange surfaces optional entertainment rewards funded by verified game activity and community pools. Ranges are illustrative. Nothing here is a guarantee of SOL, profit, or passive income.";

export const EXCHANGE_DISCLAIMERS = [
  "No guaranteed earnings, profit, ROI, or passive income — ever.",
  "Reward ranges are entertainment estimates, not forecasts.",
  "Core play (Credits, Rift Battles, progression) works without a wallet and without SOL.",
  "Marketplace and Exchange never sell competitive power.",
  "Buying tokens or connecting a wallet does not create income.",
  "Game fun must hold even if SOL market value is zero.",
] as const;

export const FORBIDDEN_EARNINGS_LANGUAGE = [
  "guaranteed earnings",
  "guaranteed profit",
  "passive income",
  "play-to-earn grind",
  "ponzi",
  "pyramid",
  "investment return",
  "ROI guaranteed",
] as const;

export function assertEntertainmentCopy(text: string): { ok: true } | { ok: false; hit: string } {
  const lower = text.toLowerCase();
  for (const phrase of FORBIDDEN_EARNINGS_LANGUAGE) {
    if (lower.includes(phrase)) {
      return { ok: false, hit: phrase };
    }
  }
  return { ok: true };
}
