"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type AccountSessionSnapshot = {
  userId: string;
  displayName?: string | null;
  username?: string | null;
  email?: string | null;
};

export type AccountSessionState = {
  loading: boolean;
  authenticated: boolean;
  session: AccountSessionSnapshot | null;
};

/**
 * Lightweight client probe of GET /api/auth/session.
 * Re-checks on route changes and window focus.
 */
export function useAccountSession(): AccountSessionState {
  const pathname = usePathname();
  const [state, setState] = useState<AccountSessionState>({
    loading: true,
    authenticated: false,
    session: null,
  });

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void fetch("/api/auth/session", {
        credentials: "same-origin",
        cache: "no-store",
      })
        .then((r) => r.json())
        .then(
          (json: {
            authenticated?: boolean;
            session?: AccountSessionSnapshot | null;
          }) => {
            if (cancelled) return;
            setState({
              loading: false,
              authenticated: Boolean(json.authenticated),
              session: json.session ?? null,
            });
          },
        )
        .catch(() => {
          if (!cancelled) {
            setState({ loading: false, authenticated: false, session: null });
          }
        });
    };
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname]);

  return state;
}

export function accountMenuLabel(session: AccountSessionSnapshot | null): string {
  const name =
    session?.displayName?.trim() ||
    session?.username?.trim() ||
    session?.email?.split("@")[0]?.trim();
  if (name && name.length <= 18) return name;
  if (name) return `${name.slice(0, 16)}…`;
  return "Keeper";
}
