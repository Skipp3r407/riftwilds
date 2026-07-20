"use client";

import { useCallback, useEffect, useState } from "react";

export type HudFxKind = "damage" | "heal" | "quest" | "loot" | "happy";

export type HudFxEvent = {
  id: string;
  kind: HudFxKind;
  text: string;
  x: number;
  y: number;
};

type Props = {
  /** Optional external push — also listens for `riftwilds-hud-fx` CustomEvent. */
  events?: HudFxEvent[];
};

/**
 * Lightweight floating FX — damage/heal numbers, quest complete, rare loot, companion happiness.
 * Dispatched via `window.dispatchEvent(new CustomEvent("riftwilds-hud-fx", { detail }))`.
 */
export function HudFxLayer({ events: external }: Props) {
  const [items, setItems] = useState<HudFxEvent[]>([]);

  const push = useCallback((ev: HudFxEvent) => {
    setItems((prev) => [...prev.slice(-12), ev]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((p) => p.id !== ev.id));
    }, 1200);
  }, []);

  useEffect(() => {
    if (!external?.length) return;
    for (const e of external) push(e);
  }, [external, push]);

  useEffect(() => {
    const onFx = (e: Event) => {
      const detail = (e as CustomEvent<Partial<HudFxEvent>>).detail;
      if (!detail?.kind || !detail?.text) return;
      push({
        id: detail.id ?? `fx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        kind: detail.kind,
        text: detail.text,
        x: detail.x ?? 48 + Math.random() * 20,
        y: detail.y ?? 42 + Math.random() * 16,
      });
    };
    window.addEventListener("riftwilds-hud-fx", onFx);
    return () => window.removeEventListener("riftwilds-hud-fx", onFx);
  }, [push]);

  return (
    <div className="lw-hud-fx" data-testid="live-world-hud-fx" aria-hidden>
      {items.map((item) => (
        <span
          key={item.id}
          className="lw-hud-fx__float font-display text-sm md:text-base"
          data-kind={item.kind}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
        >
          {item.text}
        </span>
      ))}
    </div>
  );
}

export function emitHudFx(partial: Omit<HudFxEvent, "id"> & { id?: string }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("riftwilds-hud-fx", {
      detail: {
        id: partial.id ?? `fx-${Date.now()}`,
        kind: partial.kind,
        text: partial.text,
        x: partial.x,
        y: partial.y,
      },
    }),
  );
}
