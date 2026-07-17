"use client";

import { useRef } from "react";
import type { LiveWorldBridge } from "@/game/live-world/bridge";

type Props = {
  bridge: LiveWorldBridge;
  enabled: boolean;
};

type Point = { x: number; y: number };

function directionFromDelta(dx: number, dy: number, deadzone: number) {
  const dist = Math.hypot(dx, dy);
  if (dist < deadzone) {
    return { up: false, down: false, left: false, right: false };
  }
  const nx = dx / dist;
  const ny = dy / dist;
  const threshold = 0.35;
  return {
    left: nx < -threshold,
    right: nx > threshold,
    up: ny < -threshold,
    down: ny > threshold,
  };
}

export function LiveWorldMobileControls({ bridge, enabled }: Props) {
  const originRef = useRef<Point | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[25] md:hidden">
      <div
        className="pointer-events-auto absolute bottom-24 left-4 h-36 w-36 touch-none select-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          pointerIdRef.current = e.pointerId;
          const rect = e.currentTarget.getBoundingClientRect();
          originRef.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }}
        onPointerMove={(e) => {
          if (pointerIdRef.current !== e.pointerId || !originRef.current) return;
          const dx = e.clientX - originRef.current.x;
          const dy = e.clientY - originRef.current.y;
          bridge.setVirtualInput(directionFromDelta(dx, dy, 18));
        }}
        onPointerUp={(e) => {
          if (pointerIdRef.current !== e.pointerId) return;
          pointerIdRef.current = null;
          originRef.current = null;
          bridge.setVirtualInput({
            up: false,
            down: false,
            left: false,
            right: false,
          });
        }}
        onPointerCancel={() => {
          pointerIdRef.current = null;
          originRef.current = null;
          bridge.setVirtualInput({
            up: false,
            down: false,
            left: false,
            right: false,
          });
        }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full border border-[rgba(61,231,255,0.35)] bg-[rgba(8,12,22,0.55)] backdrop-blur-md">
          <div className="h-14 w-14 rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(61,231,255,0.18)]" />
        </div>
        <p className="mt-1 text-center text-[10px] text-[var(--text-dim)]">Move</p>
      </div>

      <div className="pointer-events-auto absolute bottom-24 right-4 flex flex-col gap-3">
        <button
          type="button"
          className="focus-ring h-14 w-14 rounded-full border border-[rgba(255,184,77,0.45)] bg-[rgba(255,184,77,0.18)] text-xs font-semibold text-white backdrop-blur-md"
          onPointerDown={(e) => {
            e.preventDefault();
            bridge.setVirtualInput({ run: true });
          }}
          onPointerUp={() => bridge.setVirtualInput({ run: false })}
          onPointerLeave={() => bridge.setVirtualInput({ run: false })}
          onPointerCancel={() => bridge.setVirtualInput({ run: false })}
        >
          Run
        </button>
        <button
          type="button"
          className="focus-ring h-14 w-14 rounded-full border border-[rgba(61,231,255,0.45)] bg-[rgba(61,231,255,0.18)] text-xs font-semibold text-white backdrop-blur-md"
          onClick={() => bridge.queueInteract()}
        >
          Talk
        </button>
      </div>
    </div>
  );
}
