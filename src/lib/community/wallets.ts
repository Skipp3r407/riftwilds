/** Anonymize a Solana wallet for public leaderboards. */
export function anonymizeWallet(address: string): string {
  const a = address.trim();
  if (a.length < 8) return "••••";
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}
