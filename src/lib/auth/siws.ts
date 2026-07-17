import { createHash, randomBytes } from "crypto";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { authDefaults, projectConfig } from "@/lib/config/project";

export type SiwsMessageParams = {
  domain: string;
  wallet: string;
  nonce: string;
  issuedAt: Date;
  expirationTime: Date;
  requestId: string;
  chain: string;
};

export function buildSiwsMessage(params: SiwsMessageParams): string {
  return [
    `${params.domain} wants you to sign in with your Solana account:`,
    params.wallet,
    "",
    `Sign in to ${projectConfig.PROJECT_NAME} to verify wallet ownership. This request will not trigger a blockchain transaction or cost any fees.`,
    "",
    `URI: https://${params.domain}`,
    `Version: 1`,
    `Chain ID: ${params.chain}`,
    `Nonce: ${params.nonce}`,
    `Issued At: ${params.issuedAt.toISOString()}`,
    `Expiration Time: ${params.expirationTime.toISOString()}`,
    `Request ID: ${params.requestId}`,
  ].join("\n");
}

export function createNonce(): string {
  return randomBytes(24).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function verifyEd25519Signature(params: {
  message: string;
  signatureBase58: string;
  walletAddress: string;
}): boolean {
  try {
    const messageBytes = new TextEncoder().encode(params.message);
    const signature = bs58.decode(params.signatureBase58);
    const publicKey = bs58.decode(params.walletAddress);
    if (signature.length !== 64 || publicKey.length !== 32) return false;
    return nacl.sign.detached.verify(messageBytes, signature, publicKey);
  } catch {
    return false;
  }
}

export function normalizeWalletAddress(address: string): string {
  return address.trim();
}

export function getNonceExpiry(from = new Date()): Date {
  return new Date(from.getTime() + authDefaults.NONCE_TTL_SECONDS * 1000);
}

export function getSessionExpiry(from = new Date()): Date {
  return new Date(from.getTime() + authDefaults.SESSION_TTL_SECONDS * 1000);
}
