"use client";

import type { ReactNode } from "react";
import { AppWalletProvider } from "@/components/wallet/wallet-provider";

/**
 * Root wallet boundary. Always provides WalletProvider so SSR/prerender
 * never throws "publicKey on a WalletContext without providing one".
 */
export function WalletProviderDynamic({ children }: { children: ReactNode }) {
  return <AppWalletProvider>{children}</AppWalletProvider>;
}
