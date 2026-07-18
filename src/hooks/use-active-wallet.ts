"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useViewOnlyWallet } from "@/components/wallet/view-only-wallet-context";

export type ActiveWalletMode = "adapter" | "view_only" | "none";

export type ActiveWallet = {
  /** Effective address for read-only lookups (adapter wins over paste). */
  address: string | null;
  /** True when either a real wallet or a pasted view-only address is present. */
  connected: boolean;
  /** Adapter connected with a signer-capable session. */
  canSign: boolean;
  /** Pasted address only — no signer; cannot send txs. */
  viewOnly: boolean;
  mode: ActiveWalletMode;
};

/**
 * Unified identity for UI: wallet-adapter (signing) or pasted view-only address.
 * Privileged writes must still require SIWS / adapter signatures server-side.
 */
export function useActiveWallet(): ActiveWallet {
  const { publicKey, connected } = useWallet();
  const { address: viewOnlyAddress } = useViewOnlyWallet();

  if (connected && publicKey) {
    return {
      address: publicKey.toBase58(),
      connected: true,
      canSign: true,
      viewOnly: false,
      mode: "adapter",
    };
  }

  if (viewOnlyAddress) {
    return {
      address: viewOnlyAddress,
      connected: true,
      canSign: false,
      viewOnly: true,
      mode: "view_only",
    };
  }

  return {
    address: null,
    connected: false,
    canSign: false,
    viewOnly: false,
    mode: "none",
  };
}
