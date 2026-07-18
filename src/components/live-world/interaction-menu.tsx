"use client";

import { useEffect, useState } from "react";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import type { InteractionMenuPayload } from "@/game/live-world/types";
import { getInputManager } from "@/game/live-world/input/input-manager";

type Props = {
  bridge: LiveWorldBridge;
};

export function LiveWorldInteractionMenu({ bridge }: Props) {
  const [menu, setMenu] = useState<InteractionMenuPayload | null>(null);

  useEffect(() => bridge.interactionMenu.subscribe(setMenu), [bridge]);

  if (!menu) return null;

  return (
    <div className="pointer-events-auto absolute inset-0 z-[35] flex items-end justify-center bg-black/30 p-6 md:items-center">
      <div className="w-full max-w-xs rounded-lg border border-[var(--border)] bg-[#0c1420] p-3 shadow-xl">
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
          {menu.targetKind}
        </p>
        <h3 className="font-display text-base text-white">{menu.title}</h3>
        <ul className="mt-3 space-y-1">
          {menu.options.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                className="focus-ring w-full rounded border border-[var(--border)] px-3 py-2 text-left text-sm text-[var(--text-muted)] hover:border-[var(--cyan)]/40 hover:text-white"
                onClick={() => {
                  bridge.resolveInteraction(opt.id);
                  getInputManager().closePanel();
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
