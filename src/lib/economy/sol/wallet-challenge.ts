/**
 * Wallet ownership challenges for SOL economy actions.
 * Extends existing SIWS helpers — never trusts client-provided address alone.
 */

import {
  buildSiwsMessage,
  createNonce,
  getNonceExpiry,
  normalizeWalletAddress,
  verifyEd25519Signature,
} from "@/lib/auth/siws";
import { projectConfig, type SolanaNetwork } from "@/lib/config/project";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { appendEconomyLedgerEvent } from "@/lib/economy/sol/ledger";

export type WalletChallenge = {
  challengeId: string;
  wallet: string;
  nonce: string;
  message: string;
  issuedAt: string;
  expiresAt: string;
  purpose: string;
  used: boolean;
};

type Store = { challenges: Map<string, WalletChallenge> };

function store(): Store {
  const g = globalThis as unknown as { __riftwildsWalletChallenges?: Store };
  if (!g.__riftwildsWalletChallenges) {
    g.__riftwildsWalletChallenges = { challenges: new Map() };
  }
  return g.__riftwildsWalletChallenges;
}

export function resetWalletChallengesForTests(): void {
  const g = globalThis as unknown as { __riftwildsWalletChallenges?: Store };
  g.__riftwildsWalletChallenges = { challenges: new Map() };
}

export function isWalletSolUxEnabled(): boolean {
  return isFeatureEnabled("SOL_WALLET_ENABLED");
}

/**
 * Issue a signed-nonce challenge for a SOL-related action.
 * Identity SIWS routes remain authoritative for login; this is for economy intents.
 */
export function issueWalletChallenge(params: {
  wallet: string;
  purpose: string;
  domain?: string;
}): { ok: true; challenge: WalletChallenge } | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("AUTH_WALLET_SIWS_ENABLED") && !isWalletSolUxEnabled()) {
    return {
      ok: false,
      error: "wallet_disabled",
      message: "Wallet challenges disabled (AUTH_WALLET_SIWS / SOL_WALLET).",
    };
  }

  const wallet = normalizeWalletAddress(params.wallet);
  if (!wallet || wallet.length < 32) {
    return { ok: false, error: "invalid_wallet", message: "Invalid wallet address" };
  }

  const issuedAt = new Date();
  const expiresAt = getNonceExpiry(issuedAt);
  const nonce = createNonce();
  const requestId = `wch_${nonce}`;
  const domain = params.domain ?? "riftwilds.game";
  const message = buildSiwsMessage({
    domain,
    wallet,
    nonce,
    issuedAt,
    expirationTime: expiresAt,
    requestId,
    chain: projectConfig.SOLANA_NETWORK,
  });

  const challenge: WalletChallenge = {
    challengeId: requestId,
    wallet,
    nonce,
    message,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    purpose: params.purpose.slice(0, 120),
    used: false,
  };
  store().challenges.set(challenge.challengeId, challenge);
  return { ok: true, challenge };
}

export function verifyWalletChallenge(params: {
  challengeId: string;
  wallet: string;
  signatureBase58: string;
  now?: Date;
}):
  | { ok: true; wallet: string }
  | { ok: false; error: string; message: string } {
  const challenge = store().challenges.get(params.challengeId);
  if (!challenge) {
    return { ok: false, error: "unknown_challenge", message: "Challenge not found" };
  }
  if (challenge.used) {
    return { ok: false, error: "replay", message: "Challenge already used" };
  }
  const now = params.now ?? new Date();
  if (now.getTime() > new Date(challenge.expiresAt).getTime()) {
    return { ok: false, error: "expired", message: "Challenge expired" };
  }
  const wallet = normalizeWalletAddress(params.wallet);
  if (wallet !== challenge.wallet) {
    return { ok: false, error: "wrong_wallet", message: "Wallet does not match challenge" };
  }
  const valid = verifyEd25519Signature({
    message: challenge.message,
    signatureBase58: params.signatureBase58,
    walletAddress: wallet,
  });
  if (!valid) {
    return { ok: false, error: "bad_signature", message: "Signature verification failed" };
  }

  challenge.used = true;
  store().challenges.set(challenge.challengeId, challenge);

  appendEconomyLedgerEvent({
    userId: null,
    eventType: "SOL_VERIFY",
    requestId: `verify:${challenge.challengeId}`,
    metadata: { wallet, purpose: challenge.purpose },
  });

  return { ok: true, wallet };
}

/** Dev network guard — never default to mainnet for economy scaffolding. */
export function getSolEconomyNetwork(): "devnet" | "localnet" {
  const n = projectConfig.SOLANA_NETWORK as SolanaNetwork;
  if (n === "localnet") return "localnet";
  // mainnet-beta / testnet / unknown → force devnet for economy scaffolds
  return "devnet";
}
