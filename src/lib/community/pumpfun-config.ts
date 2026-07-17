/**
 * Pump.fun / token public config.
 * Never invent mint addresses or market metrics when unset.
 */

import { isPlaceholderAddress } from "@/lib/config/env";
import { projectConfig } from "@/lib/config/project";

export type PumpfunPublicConfig = {
  mint: string | null;
  pumpFunUrl: string | null;
  chartEmbedUrl: string | null;
  chartExternalUrl: string | null;
  configured: boolean;
  status: "live_config" | "awaiting_mint";
};

function clean(value: string | undefined | null): string | null {
  if (!value || isPlaceholderAddress(value)) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Resolve mint + Pump.fun URLs from public env, falling back to projectConfig.
 */
export function getPumpfunPublicConfig(): PumpfunPublicConfig {
  const mint =
    clean(process.env.NEXT_PUBLIC_PUMPFUN_MINT) ??
    clean(process.env.NEXT_PUBLIC_TOKEN_MINT) ??
    clean(process.env.TOKEN_MINT_ADDRESS) ??
    clean(projectConfig.TOKEN_MINT_ADDRESS);

  const pumpFunUrl =
    clean(process.env.NEXT_PUBLIC_PUMPFUN_URL) ??
    clean(projectConfig.PUMP_FUN_URL) ??
    (mint ? `https://pump.fun/coin/${mint}` : null);

  const chartExternalUrl =
    pumpFunUrl ?? (mint ? `https://dexscreener.com/solana/${mint}` : null);

  // DexScreener provides a documented embed; Pump.fun pages are often frame-blocked.
  const chartEmbedUrl = mint
    ? `https://dexscreener.com/solana/${mint}?embed=1&theme=dark&trades=0&info=0`
    : null;

  return {
    mint,
    pumpFunUrl,
    chartEmbedUrl,
    chartExternalUrl,
    configured: Boolean(mint),
    status: mint ? "live_config" : "awaiting_mint",
  };
}
