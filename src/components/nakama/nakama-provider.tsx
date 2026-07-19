"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { readStoredGuestToken, storeGuestToken } from "@/lib/auth/guest-client";
import {
  authenticateEmailAccount,
  authenticateGuestDevice,
  logoutNakama,
  restoreOrRefreshSession,
} from "@/lib/nakama/auth";
import { getNakamaPublicConfig, nakamaFeatureMatrix } from "@/lib/nakama/config";
import { bridgeGuestToNakama } from "@/lib/nakama/bridges/guest-auth-bridge";
import type {
  AuthenticatedNakama,
  NakamaAuthMethod,
  NakamaConnectionState,
  NakamaSessionSnapshot,
} from "@/lib/nakama/types";

export type NakamaContextValue = {
  enabled: boolean;
  state: NakamaConnectionState;
  session: NakamaSessionSnapshot | null;
  method: NakamaAuthMethod | null;
  error: string | null;
  features: ReturnType<typeof nakamaFeatureMatrix>;
  connectGuest: (guestToken?: string) => Promise<boolean>;
  connectEmail: (email: string, password: string, create?: boolean) => Promise<boolean>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const NakamaContext = createContext<NakamaContextValue | null>(null);

export function NakamaProvider({ children }: { children: ReactNode }) {
  const cfg = getNakamaPublicConfig();
  const features = nakamaFeatureMatrix();
  const [state, setState] = useState<NakamaConnectionState>(
    cfg.enabled ? "idle" : "disabled",
  );
  const [session, setSession] = useState<NakamaSessionSnapshot | null>(null);
  const [method, setMethod] = useState<NakamaAuthMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyAuth = useCallback((auth: AuthenticatedNakama) => {
    setSession(auth.snapshot);
    setMethod(auth.method);
    setState("authenticated");
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!cfg.enabled) {
      setState("disabled");
      return;
    }
    setState("connecting");
    try {
      const restored = await restoreOrRefreshSession();
      if (restored) {
        applyAuth(restored);
        return;
      }
      setSession(null);
      setMethod(null);
      setState("idle");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "REFRESH_FAILED");
    }
  }, [applyAuth, cfg.enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const connectGuest = useCallback(
    async (guestToken?: string) => {
      if (!cfg.enabled || !features.auth) {
        setError("NAKAMA_AUTH_DISABLED");
        return false;
      }
      setState("connecting");
      setError(null);
      try {
        const token = guestToken ?? readStoredGuestToken();
        if (!token) {
          // Mint a local guest token so hatchery + Nakama share an id.
          const minted = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
          storeGuestToken(minted);
          const auth = await authenticateGuestDevice(minted);
          applyAuth(auth);
          return true;
        }
        const bridged = await bridgeGuestToNakama({ guestToken: token });
        if (bridged.nakama?.ok && bridged.nakama.payload) {
          setSession(bridged.nakama.payload as NakamaSessionSnapshot);
          setMethod("guest_device");
          setState("authenticated");
          return true;
        }
        const auth = await authenticateGuestDevice(token);
        applyAuth(auth);
        return true;
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "GUEST_CONNECT_FAILED");
        return false;
      }
    },
    [applyAuth, cfg.enabled, features.auth],
  );

  const connectEmail = useCallback(
    async (email: string, password: string, create = true) => {
      if (!cfg.enabled || !features.auth) {
        setError("NAKAMA_AUTH_DISABLED");
        return false;
      }
      setState("connecting");
      setError(null);
      try {
        const auth = await authenticateEmailAccount(email, password, { create });
        applyAuth(auth);
        return true;
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "EMAIL_CONNECT_FAILED");
        return false;
      }
    },
    [applyAuth, cfg.enabled, features.auth],
  );

  const disconnect = useCallback(async () => {
    await logoutNakama();
    setSession(null);
    setMethod(null);
    setState(cfg.enabled ? "idle" : "disabled");
    setError(null);
  }, [cfg.enabled]);

  const value = useMemo<NakamaContextValue>(
    () => ({
      enabled: cfg.enabled,
      state,
      session,
      method,
      error,
      features,
      connectGuest,
      connectEmail,
      disconnect,
      refresh,
    }),
    [
      cfg.enabled,
      connectEmail,
      connectGuest,
      disconnect,
      error,
      features,
      method,
      refresh,
      session,
      state,
    ],
  );

  return <NakamaContext.Provider value={value}>{children}</NakamaContext.Provider>;
}
