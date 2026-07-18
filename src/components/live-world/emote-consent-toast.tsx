"use client";

import { useEffect, useState } from "react";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import { getEmoteDef } from "@/game/live-world/systems/emotes/catalog";
import type { ConsentRequest } from "@/game/live-world/systems/emotes/types";
import { playSfx } from "@/hooks/use-sfx";

type Props = {
  bridge: LiveWorldBridge;
};

export function LiveWorldEmoteConsentToast({ bridge }: Props) {
  const [req, setReq] = useState<ConsentRequest | null>(null);

  useEffect(() => {
    return bridge.consentPrompt.subscribe(setReq);
  }, [bridge]);

  if (!req || req.status !== "pending") return null;
  const def = getEmoteDef(req.emoteKey);

  return (
    <div className="pointer-events-auto absolute bottom-28 left-1/2 z-50 w-[min(100%-1.5rem,360px)] -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[#0c1420]/95 p-3 shadow-xl">
      <p className="text-sm text-white">
        {req.fromLabel} wants to {def?.label ?? req.emoteKey}
      </p>
      <p className="mt-1 text-[11px] text-[var(--text-dim)]">
        Synchronized social emotes require consent. Cosmetic only — no rewards.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="btn-primary focus-ring text-xs"
          onClick={() => {
            const result = bridge.emotes.resolveConsent(req.id, "accepted");
            bridge.consentPrompt.set(null);
            if (!result.ok) {
              bridge.chat.send("system", result.reason, { from: "System" });
              bridge.bumpChat();
              playSfx("ui.error");
            } else {
              playSfx("ui.click");
            }
          }}
        >
          Accept
        </button>
        <button
          type="button"
          className="btn-secondary focus-ring text-xs"
          onClick={() => {
            bridge.emotes.resolveConsent(req.id, "declined");
            bridge.consentPrompt.set(null);
            playSfx("ui.click");
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
