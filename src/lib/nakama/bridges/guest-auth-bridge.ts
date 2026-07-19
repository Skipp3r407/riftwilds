/**
 * Bridge: Riftwilds guest identity → Nakama device auth.
 * Existing `rift_guest` / owner-key paths remain authoritative for hatchery/Credits.
 */

import { readStoredGuestToken } from "@/lib/auth/guest-client";
import { authenticateGuestDevice, restoreOrRefreshSession } from "@/lib/nakama/auth";
import { isNakamaSliceEnabled } from "@/lib/nakama/config";
import type { AuthenticatedNakama, NakamaBridgeResult } from "@/lib/nakama/types";

export type GuestIdentityLocal = {
  guestToken: string | null;
  ownerKeyHint: string | null;
};

export async function bridgeGuestToNakama(opts?: {
  guestToken?: string | null;
  username?: string;
}): Promise<NakamaBridgeResult<GuestIdentityLocal>> {
  const guestToken = opts?.guestToken ?? readStoredGuestToken();
  const local: GuestIdentityLocal = {
    guestToken,
    ownerKeyHint: guestToken ? `guest_${guestToken}` : null,
  };

  if (!isNakamaSliceEnabled("NAKAMA_AUTH_BRIDGE_ENABLED")) {
    return { local, mode: "local_only" };
  }
  if (!guestToken) {
    return {
      local,
      mode: "bridged",
      nakama: { ok: false, detail: "NO_GUEST_TOKEN" },
    };
  }

  try {
    const existing = await restoreOrRefreshSession();
    if (existing) {
      return {
        local,
        mode: "bridged",
        nakama: { ok: true, detail: "RESTORED", payload: existing.snapshot },
      };
    }
    const auth: AuthenticatedNakama = await authenticateGuestDevice(guestToken, {
      username: opts?.username,
      create: true,
    });
    return {
      local,
      mode: "bridged",
      nakama: { ok: true, detail: "AUTHENTICATED", payload: auth.snapshot },
    };
  } catch (err) {
    return {
      local,
      mode: "bridged",
      nakama: {
        ok: false,
        detail: err instanceof Error ? err.message : "GUEST_BRIDGE_FAILED",
      },
    };
  }
}
