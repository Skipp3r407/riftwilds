"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { isValidSolanaAddress, normalizeSolanaAddress } from "@/lib/solana/address";

const STORAGE_KEY = "riftwilds-view-only-wallet";

type ViewOnlyWalletContextValue = {
  /** Pasted base58 address, or null when none. */
  address: string | null;
  /** True when a view-only address is active (no signer). */
  isViewOnly: boolean;
  connectViewOnly: (raw: string) => { ok: true } | { ok: false; error: string };
  disconnectViewOnly: () => void;
};

const ViewOnlyWalletContext = createContext<ViewOnlyWalletContextValue | null>(null);

type Listener = () => void;

let memoryAddress: string | null = null;
let hydrated = false;
const listeners = new Set<Listener>();

function readStored(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const address = normalizeSolanaAddress(raw);
    return isValidSolanaAddress(address) ? address : null;
  } catch {
    return null;
  }
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  memoryAddress = readStored();
  hydrated = true;
}

function getSnapshot(): string | null {
  ensureHydrated();
  return memoryAddress;
}

function getServerSnapshot(): string | null {
  return null;
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

function persist(address: string | null) {
  memoryAddress = address;
  try {
    if (address) window.localStorage.setItem(STORAGE_KEY, address);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
  emit();
}

export function ViewOnlyWalletProvider({ children }: { children: ReactNode }) {
  const address = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const connectViewOnly = useCallback((raw: string) => {
    const normalized = normalizeSolanaAddress(raw);
    if (!isValidSolanaAddress(normalized)) {
      return { ok: false as const, error: "Enter a valid Solana wallet address (base58)." };
    }
    persist(normalized);
    return { ok: true as const };
  }, []);

  const disconnectViewOnly = useCallback(() => {
    persist(null);
  }, []);

  const value = useMemo<ViewOnlyWalletContextValue>(
    () => ({
      address,
      isViewOnly: Boolean(address),
      connectViewOnly,
      disconnectViewOnly,
    }),
    [address, connectViewOnly, disconnectViewOnly],
  );

  return (
    <ViewOnlyWalletContext.Provider value={value}>{children}</ViewOnlyWalletContext.Provider>
  );
}

export function useViewOnlyWallet(): ViewOnlyWalletContextValue {
  const ctx = useContext(ViewOnlyWalletContext);
  if (!ctx) {
    throw new Error("useViewOnlyWallet must be used within ViewOnlyWalletProvider");
  }
  return ctx;
}
