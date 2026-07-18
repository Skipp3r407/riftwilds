"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import type { Adapter } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { projectConfig } from "@/lib/config/project";
import { ViewOnlyWalletProvider } from "@/components/wallet/view-only-wallet-context";

/**
 * Always wraps children so useWallet() is safe during SSR/prerender.
 * Wallet adapters that touch `window` are attached after mount.
 */
export function AppWalletProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => {
    if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    }
    const network = projectConfig.SOLANA_NETWORK;
    return clusterApiUrl(network);
  }, []);

  const [wallets, setWallets] = useState<Adapter[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [{ PhantomWalletAdapter }, { SolflareWalletAdapter }] = await Promise.all([
        import("@solana/wallet-adapter-phantom"),
        import("@solana/wallet-adapter-solflare"),
      ]);
      if (cancelled) return;
      setWallets([new PhantomWalletAdapter(), new SolflareWalletAdapter()]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ViewOnlyWalletProvider>{children}</ViewOnlyWalletProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
