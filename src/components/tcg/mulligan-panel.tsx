"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import { TCG_DEFAULTS } from "@/game/tcg/types";

type HandCard = {
  instanceId: string;
  defId: string;
};

type Props = {
  hand: HandCard[];
  turn1Energy?: number;
  busy?: boolean;
  onKeep: () => void;
  onMulligan: (replaceInstanceIds: string[]) => void;
};

/**
 * Mulligan once: Keep / Partial (selected) / Full.
 * Engine action: KEEP_HAND or MULLIGAN { replaceInstanceIds }.
 */
export function MulliganPanel({
  hand,
  turn1Energy = TCG_DEFAULTS.riftEnergyStartMax,
  busy,
  onKeep,
  onMulligan,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const rows = useMemo(
    () =>
      hand.map((c) => {
        const def = getTcgCardDef(c.defId);
        return {
          ...c,
          name: def?.name ?? c.defId,
          cost: def?.riftCost ?? 99,
          playable: (def?.riftCost ?? 99) <= turn1Energy,
          art: def?.cardImagePath,
        };
      }),
    [hand, turn1Energy],
  );

  const playableCount = rows.filter((r) => r.playable).length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div
      className="pointer-events-auto fixed inset-x-0 top-[14%] z-[60] mx-auto w-[min(42rem,94%)] rounded-xl border border-cyan-400/35 bg-[rgba(6,14,28,0.94)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-md"
      role="dialog"
      aria-label="Mulligan"
    >
      <p className="font-display text-xs uppercase tracking-[0.22em] text-cyan-300/90">
        Opening hand · Mulligan once
      </p>
      <h2 className="mt-1 font-display text-xl text-white">Keep, Partial, or Full</h2>
      <p className="mt-1 text-xs text-white/65">
        Turn 1 Energy is {turn1Energy}.{" "}
        {playableCount > 0
          ? `${playableCount} card${playableCount === 1 ? "" : "s"} playable now.`
          : "No turn-1 plays — consider a Partial or Full mulligan."}{" "}
        Select cards to replace, or Full to redraw all.
      </p>

      <ul className="mt-4 flex flex-wrap justify-center gap-2">
        {rows.map((r) => {
          const on = selected.has(r.instanceId);
          return (
            <li key={r.instanceId}>
              <button
                type="button"
                disabled={busy}
                onClick={() => toggle(r.instanceId)}
                className={cn(
                  "w-[4.6rem] rounded-md border bg-black/40 p-1 text-left transition focus-ring",
                  on
                    ? "border-amber-400/70 ring-1 ring-amber-300/40"
                    : "border-white/15 hover:border-cyan-300/40",
                  r.playable && "shadow-[0_0_12px_rgba(61,231,255,0.12)]",
                )}
                aria-pressed={on}
                title={on ? "Will replace" : "Keep (click to replace)"}
              >
                <span className="relative block aspect-[3/4] overflow-hidden rounded-sm bg-black/50">
                  {r.art ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.art}
                      alt=""
                      className="h-full w-full object-cover object-top"
                    />
                  ) : null}
                  <span className="absolute left-0.5 top-0.5 rounded bg-black/70 px-1 text-[9px] tabular-nums text-cyan-100">
                    {r.cost}
                  </span>
                </span>
                <span className="mt-1 block truncate text-[10px] text-white/85">
                  {r.name}
                </span>
                <span
                  className={cn(
                    "text-[9px]",
                    r.playable ? "text-emerald-300/90" : "text-white/40",
                  )}
                >
                  {r.playable ? "T1 OK" : `>${turn1Energy}`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          className="btn-secondary focus-ring text-sm"
          disabled={busy}
          onClick={onKeep}
        >
          Keep
        </button>
        <button
          type="button"
          className="btn-secondary focus-ring text-sm"
          disabled={busy || selected.size === 0}
          onClick={() => onMulligan([...selected])}
        >
          Partial ({selected.size})
        </button>
        <button
          type="button"
          className="btn-primary focus-ring text-sm"
          disabled={busy}
          onClick={() => onMulligan(hand.map((c) => c.instanceId))}
        >
          Full
        </button>
      </div>
    </div>
  );
}
