"use client";

import { useEffect, useRef, useState } from "react";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import { getEmoteDef } from "@/game/live-world/systems/emotes/catalog";
import { getInputManager } from "@/game/live-world/input/input-manager";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { playSfx } from "@/hooks/use-sfx";

type Props = {
  bridge: LiveWorldBridge;
};

const SLOT_ANGLES = [270, 315, 0, 45, 90, 135, 180, 225]; // degrees, slot 0 at top

function angleToIndex(angleDeg: number): number {
  // 0° = right; convert so 270 (top) is index 0
  const normalized = ((angleDeg % 360) + 360) % 360;
  const fromTop = (normalized + 90) % 360;
  return Math.round(fromTop / 45) % 8;
}

export function LiveWorldEmoteWheel({ bridge }: Props) {
  const [mode, setMode] = useState(bridge.emoteUi.get().mode);
  const [highlight, setHighlight] = useState(0);
  const [rev, setRev] = useState(0);
  const heldRef = useRef(false);

  useEffect(() => {
    const unsubs = [
      bridge.emoteUi.subscribe((ui) => {
        setMode(ui.mode);
        setHighlight(ui.highlightIndex);
      }),
      bridge.emoteRevision.subscribe(setRev),
    ];
    return () => unsubs.forEach((u) => u());
  }, [bridge]);

  useEffect(() => {
    if (!featureFlagDefaults.LIVE_WORLD_EMOTES_ENABLED) return;
    const input = getInputManager();

    const onMove = (e: PointerEvent | MouseEvent) => {
      if (bridge.emoteUi.get().mode !== "wheel") return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if (Math.hypot(dx, dy) < 24) return;
      const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
      const idx = angleToIndex(deg);
      setHighlight(idx);
      bridge.emoteUi.set({ ...bridge.emoteUi.get(), highlightIndex: idx });
    };

    const unsub = input.subscribe(() => {
      if (input.isTypingFocused()) return;

      if (input.wasJustPressed("openEmotePanel")) {
        bridge.openEmotePanel();
        playSfx("ui.click");
        return;
      }

      if (input.wasJustPressed("openEmoteWheel")) {
        heldRef.current = true;
        bridge.openEmoteWheel();
        playSfx("ui.click");
      }

      // Release detection via held state
      if (heldRef.current && !input.isActionHeld("openEmoteWheel")) {
        heldRef.current = false;
        const ui = bridge.emoteUi.get();
        if (ui.mode === "wheel") {
          const slots = bridge.emotes.getFavorites().wheelSlots;
          const key = slots[ui.highlightIndex];
          bridge.closeEmoteUi();
          if (key) {
            const result = bridge.playEmote(key, "wheel");
            if (!result.ok) {
              bridge.chat.send("system", result.reason, { from: "System" });
              bridge.bumpChat();
              playSfx("ui.error");
            } else {
              playSfx("ui.click");
            }
          }
        }
      }

      if (input.wasJustPressed("escape") && bridge.emoteUi.get().mode !== "closed") {
        heldRef.current = false;
        bridge.closeEmoteUi();
      }
    });

    window.addEventListener("pointermove", onMove);
    return () => {
      unsub();
      window.removeEventListener("pointermove", onMove);
    };
  }, [bridge]);

  void rev;
  if (!featureFlagDefaults.LIVE_WORLD_EMOTES_ENABLED) return null;
  if (mode !== "wheel") return null;

  const slots = bridge.emotes.getFavorites().wheelSlots;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
      aria-label="Emote wheel"
    >
      <div className="relative h-64 w-64">
        <div className="absolute inset-0 rounded-full border border-[rgba(61,231,255,0.35)] bg-[rgba(8,12,22,0.72)] backdrop-blur-md" />
        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[10px] text-[var(--text-dim)]">
          Release to play
          <br />
          Esc cancel
        </p>
        {slots.map((key, i) => {
          const rad = ((SLOT_ANGLES[i] ?? 0) * Math.PI) / 180;
          const r = 92;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;
          const def = key ? getEmoteDef(key) : null;
          const active = i === highlight;
          return (
            <button
              key={`slot-${i}`}
              type="button"
              className={`pointer-events-auto absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border text-[10px] ${
                active
                  ? "border-[var(--cyan)] bg-[rgba(61,231,255,0.25)] text-white"
                  : "border-[var(--border)] bg-black/50 text-[var(--text-muted)]"
              }`}
              style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
              onMouseEnter={() => {
                setHighlight(i);
                bridge.emoteUi.set({ ...bridge.emoteUi.get(), highlightIndex: i });
              }}
              onClick={() => {
                bridge.closeEmoteUi();
                if (key) {
                  const result = bridge.playEmote(key, "wheel");
                  if (!result.ok) {
                    bridge.chat.send("system", result.reason, { from: "System" });
                    bridge.bumpChat();
                  }
                }
              }}
            >
              {def ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={def.iconPath}
                  alt={def.label}
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <span className={def ? "hidden text-base" : "text-base"}>{def?.glyph ?? "·"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
