/**
 * Bridge: modular email login scaffolding → Nakama email accounts.
 * Does not replace SIWS; AUTH_EMAIL_ENABLED can stay false while Nakama email is used for MP.
 */

import { authenticateEmailAccount } from "@/lib/nakama/auth";
import { isNakamaSliceEnabled } from "@/lib/nakama/config";
import type { NakamaBridgeResult } from "@/lib/nakama/types";

export type EmailLoginLocal = {
  email: string;
  /** Always false here — wallet link remains a separate SIWS step. */
  walletRequired: false;
};

export async function bridgeEmailToNakama(input: {
  email: string;
  password: string;
  username?: string;
  create?: boolean;
}): Promise<NakamaBridgeResult<EmailLoginLocal>> {
  const local: EmailLoginLocal = {
    email: input.email.trim().toLowerCase(),
    walletRequired: false,
  };

  if (!isNakamaSliceEnabled("NAKAMA_AUTH_BRIDGE_ENABLED")) {
    return { local, mode: "local_only" };
  }

  try {
    const auth = await authenticateEmailAccount(local.email, input.password, {
      username: input.username,
      create: input.create ?? true,
    });
    return {
      local,
      mode: "bridged",
      nakama: { ok: true, detail: "EMAIL_AUTHENTICATED", payload: auth.snapshot },
    };
  } catch (err) {
    return {
      local,
      mode: "bridged",
      nakama: {
        ok: false,
        detail: err instanceof Error ? err.message : "EMAIL_BRIDGE_FAILED",
      },
    };
  }
}
