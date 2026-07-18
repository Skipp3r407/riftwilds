"use client";

import { useEffect, useId, useRef, useState } from "react";
import { getTcgCardDetail, type TcgCardDetailView } from "@/lib/tcg/card-detail";
import { cn } from "@/lib/utils/cn";

type BattlePlayProps = {
  canPlay: boolean;
  playDisabledReason?: string | null;
  onPlay: () => void;
};

type Props = {
  defId: string | null;
  open: boolean;
  onClose: () => void;
  /** When set, show a Play action inside the inspect modal (battle hand). */
  battlePlay?: BattlePlayProps | null;
};

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/35 px-2.5 py-1.5">
      <p className="text-[10px] uppercase tracking-wider text-white/45">{label}</p>
      <p className="text-sm font-medium text-[var(--text-primary,#f4efe6)]">{value}</p>
    </div>
  );
}

export function TcgCardDetailModal({ defId, open, onClose, battlePlay }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const detail: TcgCardDetailView | null =
    open && defId ? getTcgCardDetail(defId) : null;

  useEffect(() => {
    setImgFailed(false);
  }, [defId]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open || !defId) return null;

  const showFace = Boolean(detail?.cardImagePath && !imgFailed);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(4,8,14,0.72)] p-3 backdrop-blur-[3px] sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-amber-300/25 bg-[rgba(10,16,24,0.94)] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[rgba(10,16,24,0.96)] px-4 py-3 backdrop-blur-sm">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200/70">
              Card detail
            </p>
            <h2
              id={titleId}
              className="truncate font-[family-name:var(--font-display)] text-xl text-[var(--text-primary,#f4efe6)]"
            >
              {detail?.name ?? defId}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/85 hover:bg-white/5 focus-ring"
          >
            Close
          </button>
        </div>

        {!detail ? (
          <p className="p-6 text-sm text-red-200">Card data unavailable.</p>
        ) : (
          <div className="grid gap-5 p-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:p-6">
            <div className="mx-auto w-full max-w-[220px]">
              <div className="relative aspect-[500/700] overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-[0_0_28px_rgba(61,231,255,0.08)]">
                {showFace ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={detail.cardImagePath}
                    alt={detail.name}
                    className="h-full w-full object-cover"
                    onError={() => setImgFailed(true)}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-center text-sm text-white/50">
                    {detail.name}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <StatChip label="Type" value={detail.type} />
                <StatChip label="Element" value={detail.element} />
                <StatChip label="Rarity" value={detail.rarity} />
                <StatChip label="Rift Energy" value={detail.energyCost} />
                <StatChip
                  label="ATK"
                  value={detail.attack == null ? "—" : detail.attack}
                />
                <StatChip
                  label="HP"
                  value={detail.health == null ? "—" : detail.health}
                />
              </div>

              {detail.keywords.length > 0 && (
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-white/45">
                    Keywords
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.keywords.map((k) => (
                      <span
                        key={k}
                        className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2 py-0.5 text-xs text-cyan-100"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {detail.rulesText ? (
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-white/45">
                    Rules
                  </p>
                  <p className="leading-relaxed text-[var(--text-primary,#f4efe6)]">
                    {detail.rulesText}
                  </p>
                </div>
              ) : null}

              {detail.flavorText ? (
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-white/45">
                    Flavor
                  </p>
                  <p className="italic leading-relaxed text-white/65">
                    {detail.flavorText}
                  </p>
                </div>
              ) : null}

              {detail.loreBlurb && !detail.creatureBio ? (
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-white/45">
                    Notes
                  </p>
                  <p className="leading-relaxed text-white/70">{detail.loreBlurb}</p>
                </div>
              ) : null}

              {detail.creatureBio ? (
                <section className="rounded-xl border border-amber-300/20 bg-amber-400/5 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/80">
                    Creature bio
                  </p>
                  <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg text-amber-50">
                    {detail.creatureBio.name}
                    {detail.creatureBio.title ? (
                      <span className="text-sm font-normal text-amber-100/70">
                        {" "}
                        · {detail.creatureBio.title}
                      </span>
                    ) : null}
                  </h3>
                  <p className="mt-1 text-xs text-white/50">
                    {detail.creatureBio.nativeRegion} · {detail.creatureBio.affinity}
                  </p>
                  <p className="mt-2 leading-relaxed text-white/80">
                    {detail.creatureBio.shortBio}
                  </p>
                  {detail.creatureBio.standardBio ? (
                    <p className="mt-2 max-h-40 overflow-y-auto text-xs leading-relaxed text-white/60">
                      {detail.creatureBio.standardBio}
                    </p>
                  ) : null}
                  {detail.creatureBio.favoriteFoods.length > 0 ? (
                    <p className="mt-2 text-xs text-amber-100/75">
                      Favorite foods: {detail.creatureBio.favoriteFoods.join(", ")}
                    </p>
                  ) : null}
                </section>
              ) : null}

              {battlePlay ? (
                <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    disabled={!battlePlay.canPlay}
                    onClick={() => {
                      battlePlay.onPlay();
                      onClose();
                    }}
                    className={cn(
                      "rounded-md bg-amber-500/90 px-4 py-2 text-sm font-medium text-stone-950 disabled:opacity-40",
                    )}
                  >
                    Play card
                  </button>
                  {battlePlay.playDisabledReason ? (
                    <p className="text-xs text-white/50">{battlePlay.playDisabledReason}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
