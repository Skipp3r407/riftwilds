import { PublicKey } from "@solana/web3.js";

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]+$/;

/**
 * Validate a Solana wallet address (base58-encoded 32-byte ed25519 pubkey).
 * Does not prove ownership — only format / decode validity.
 */
export function isValidSolanaAddress(address: string): boolean {
  const trimmed = address.trim();
  if (trimmed.length < 32 || trimmed.length > 44) return false;
  if (!BASE58_RE.test(trimmed)) return false;
  try {
    const key = new PublicKey(trimmed);
    return PublicKey.isOnCurve(key.toBytes());
  } catch {
    return false;
  }
}

export function normalizeSolanaAddress(address: string): string {
  return address.trim();
}
