import { logoutNakama } from "@/lib/nakama/auth";

export type LogoutClientResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Clears the Riftwilds account session (cookies) via POST /api/auth/logout.
 * Also best-effort clears any local Nakama snapshot.
 */
export async function logoutAccountSession(): Promise<LogoutClientResult> {
  try {
    await logoutNakama().catch(() => undefined);
  } catch {
    // Nakama may be disabled — ignore.
  }

  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        ok: false,
        message: `Logout failed (${res.status}).`,
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "Logout failed — network error." };
  }
}
