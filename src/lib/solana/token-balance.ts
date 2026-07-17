import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { projectConfig, tokenTierThresholds } from "@/lib/config/project";
import { defaultRpcProvider, getFallbackConnection, type RpcProvider } from "@/lib/solana/rpc";
import type { TokenTier } from "@prisma/client";

export type TokenBalanceResult = {
  mint: string;
  wallet: string;
  amountRaw: bigint;
  decimals: number;
  uiAmount: string;
  tier: TokenTier;
  slot: number | null;
  source: string;
  fetchedAt: Date;
};

export function evaluateTokenTier(amountRaw: bigint): TokenTier {
  if (amountRaw >= tokenTierThresholds.FOUNDER) return "FOUNDER";
  if (amountRaw >= tokenTierThresholds.WARDEN) return "WARDEN";
  if (amountRaw >= tokenTierThresholds.RANGER) return "RANGER";
  if (amountRaw >= tokenTierThresholds.KEEPER) return "KEEPER";
  return "VISITOR";
}

/**
 * Server-side SPL token balance lookup.
 * Never trust a client-submitted balance for eligibility.
 */
export async function fetchTokenBalance(params: {
  walletAddress: string;
  mintAddress?: string;
  rpc?: RpcProvider;
}): Promise<TokenBalanceResult> {
  const mintAddress = params.mintAddress ?? process.env.TOKEN_MINT_ADDRESS ?? projectConfig.TOKEN_MINT_ADDRESS;
  const rpc = params.rpc ?? defaultRpcProvider;

  if (!mintAddress || mintAddress === "COMING_SOON") {
    return {
      mint: mintAddress,
      wallet: params.walletAddress,
      amountRaw: 0n,
      decimals: 6,
      uiAmount: "0",
      tier: "VISITOR",
      slot: null,
      source: "placeholder-mint",
      fetchedAt: new Date(),
    };
  }

  const wallet = new PublicKey(params.walletAddress);
  const mint = new PublicKey(mintAddress);

  async function read(connection = rpc.getConnection()) {
    const ata = await getAssociatedTokenAddress(mint, wallet);
    try {
      const account = await getAccount(connection, ata);
      const slot = await connection.getSlot("confirmed");
      const amountRaw = account.amount;
      const decimals = 6;
      return {
        mint: mintAddress,
        wallet: params.walletAddress,
        amountRaw,
        decimals,
        uiAmount: formatUiAmount(amountRaw, decimals),
        tier: evaluateTokenTier(amountRaw),
        slot,
        source: "spl-token",
        fetchedAt: new Date(),
      } satisfies TokenBalanceResult;
    } catch {
      const slot = await connection.getSlot("confirmed");
      return {
        mint: mintAddress,
        wallet: params.walletAddress,
        amountRaw: 0n,
        decimals: 6,
        uiAmount: "0",
        tier: "VISITOR" as const,
        slot,
        source: "spl-token-missing-ata",
        fetchedAt: new Date(),
      };
    }
  }

  try {
    return await read();
  } catch (primaryError) {
    const fallback = getFallbackConnection();
    if (!fallback) throw primaryError;
    return read(fallback);
  }
}

export function formatUiAmount(amountRaw: bigint, decimals: number): string {
  const base = 10n ** BigInt(decimals);
  const whole = amountRaw / base;
  const fraction = amountRaw % base;
  if (fraction === 0n) return whole.toString();
  const fracStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole}.${fracStr}`;
}
