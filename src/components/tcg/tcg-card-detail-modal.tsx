"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getTcgCardDetail, type TcgCardDetailView } from "@/lib/tcg/card-detail";
import type { TcgBioSection } from "@/lib/tcg/bio-sections";
import { getCardById, resolveCardImagePath } from "@/content/tcg";
import { MasterCardTemplate } from "@/components/tcg/master-card-template";
import { RiftButton } from "@/components/ui/rift-button";
import { cn } from "@/lib/utils/cn";
import {
  riftModalBackdrop,
  riftModalPanel,
} from "@/components/ui/rift-motion";

type BattlePlayProps = {
  canPlay: boolean;
  playDisabledReason?: string | null;
  /** Current pool, e.g. "1/1" — shown next to disabled reason. */
  energyLabel?: string | null;
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
    <div className="lore-journal__stat">
      <p>{label}</p>
      <p>{value}</p>
    </div>
  );
}

function BioSectionImage({ section }: { section: TcgBioSection }) {
  // Height-driven wells + object-contain — avoid w-full + max-h + aspect-ratio
  // which flattens into a short strip and chops heads with object-cover.
  const variant =
    section.imageLayout === "hero"
      ? "hero"
      : section.imageLayout === "scenic"
        ? "scenic"
        : section.id === "affinity"
          ? "medallion"
          : "plate";

  return (
    <div
      className={cn("lore-journal__media", `lore-journal__media--${variant}`)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={section.imageSrc}
        alt={section.imageAlt}
        className="lore-journal__media-img"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          if (!section.imageFallback || img.dataset.fallbackApplied === "1") {
            return;
          }
          img.dataset.fallbackApplied = "1";
          img.src = section.imageFallback;
        }}
      />
    </div>
  );
}

function IllustratedBioPanel({
  bio,
}: {
  bio: NonNullable<TcgCardDetailView["illustratedBio"]>;
}) {
  const eyebrow =
    bio.kind === "creature"
      ? "Creature journal"
      : bio.kind === "region"
        ? "Region journal"
        : "Place lore";

  return (
    <section className="lore-journal__section">
      <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/80">
        {eyebrow}
      </p>
      <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg text-amber-50">
        {bio.title}
      </h3>
      {bio.subtitle ? (
        <p className="mt-1 text-xs text-white/50">{bio.subtitle}</p>
      ) : null}

      <div className="mt-3 max-h-[min(56vh,32rem)] space-y-3 overflow-y-auto pr-0.5">
        {bio.sections.map((section) => (
          <article
            key={section.id}
            className="rounded-lg border border-white/10 bg-black/25 p-2.5"
          >
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-amber-200/70">
              {section.label}
            </p>
            <BioSectionImage section={section} />
            <p className="mt-2 text-xs leading-relaxed text-white/70">
              {section.body}
            </p>
          </article>
        ))}

        {bio.standardBio ? (
          <article className="rounded-lg border border-white/10 bg-black/15 p-2.5">
            <p className="mb-1 text-[10px] uppercase tracking-wider text-white/45">
              Keeper notes
            </p>
            <p className="text-xs leading-relaxed text-white/55">{bio.standardBio}</p>
          </article>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Lore Journal — premium card inspect (never an empty flat popup).
 * Portaled to document.body so site overlays (dust / music / cursor) cannot
 * trap it under the game/marketing `z-[1]` stacking context.
 */
export function TcgCardDetailModal({ defId, open, onClose, battlePlay }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const detail: TcgCardDetailView | null =
    open && defId ? getTcgCardDetail(defId) : null;
  const contentCard = open && defId ? getCardById(defId) : null;

  useEffect(() => {
    setMounted(true);
  }, []);

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
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
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

  const artSrc =
    (contentCard ? resolveCardImagePath(contentCard) : undefined) ||
    detail?.cardImagePath ||
    contentCard?.art.assetPath;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && defId ? (
        <motion.div
          key="tcg-card-detail-modal"
          className="rift-modal-layer fixed inset-0 flex items-end justify-center p-3 sm:items-center sm:p-6"
          style={{
            background: "rgba(4, 8, 14, 0.78)",
            backdropFilter: "blur(5px)",
          }}
          onClick={() => onClose()}
          {...(reduceMotion ? {} : riftModalBackdrop)}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="lore-journal rift-material-marble rift-panel--filigree"
            onClick={(e) => e.stopPropagation()}
            {...(reduceMotion ? {} : riftModalPanel)}
          >
            <div className="lore-journal__chrome">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200/75">
                  Lore Journal
                </p>
                <h2
                  id={titleId}
                  className="truncate font-[family-name:var(--font-display)] text-xl text-[var(--text)]"
                >
                  {detail?.name ?? defId}
                </h2>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                className="lore-journal__close"
                aria-label="Close lore journal"
                onPointerDown={(e) => {
                  // Close on pointerdown + preventDefault so the leftover click
                  // cannot land on a card under the scrim and reopen the journal.
                  if (e.button !== 0) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                onClick={(e) => {
                  // Keyboard activation (Enter/Space) synthesizes click without pointerdown preventDefault.
                  e.stopPropagation();
                  onClose();
                }}
              >
                Close
              </button>
            </div>

            {!detail ? (
              <p className="p-6 text-sm text-red-200">Card data unavailable.</p>
            ) : (
              <div className="lore-journal__body">
                <div className="lore-journal__grid">
                  <div className="mx-auto w-full max-w-[240px]">
                    <MasterCardTemplate
                      size="inspect"
                      name={detail.name}
                      energyCost={detail.energyCost}
                      type={detail.type}
                      element={detail.element}
                      rarity={detail.rarity}
                      role={detail.role}
                      attack={detail.attack}
                      defense={detail.defense}
                      health={detail.health}
                      speed={detail.speed}
                      keywords={detail.keywords}
                      rulesText={detail.rulesText}
                      abilitySummary={
                        detail.activeSummary ?? detail.passive
                      }
                      artSrc={detail.cleanArtPath ?? artSrc}
                      legacyFaceSrc={detail.cardImagePath}
                      interactive={false}
                      finish={
                        detail.rarity.toLowerCase() === "legendary" ||
                        detail.rarity.toLowerCase() === "mythic"
                          ? "foil"
                          : "standard"
                      }
                    />
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <StatChip label="Type" value={detail.type} />
                      <StatChip label="Element" value={detail.element} />
                      <StatChip label="Rarity" value={detail.rarity} />
                      <StatChip label="Rift Energy" value={detail.energyCost} />
                      <StatChip
                        label="Role"
                        value={detail.roleLabel ?? "—"}
                      />
                      <StatChip
                        label="ATK"
                        value={detail.attack == null ? "—" : detail.attack}
                      />
                      <StatChip
                        label="DEF"
                        value={detail.defense == null ? "—" : detail.defense}
                      />
                      <StatChip
                        label="HP"
                        value={detail.health == null ? "—" : detail.health}
                      />
                      <StatChip
                        label="Speed"
                        value={detail.speed == null ? "—" : detail.speed}
                      />
                    </div>

                    {detail.keywords.length > 0 ? (
                      <div>
                        <p className="mb-1 text-[10px] uppercase tracking-wider text-white/45">
                          Keywords
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {detail.keywords.map((k) => (
                            <span
                              key={k}
                              className="rounded-md border border-cyan-300/25 bg-cyan-400/10 px-2 py-0.5 text-xs text-cyan-100"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div
                      className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
                      title={`${detail.classificationCategory} · ${detail.useLocation}`}
                    >
                      <p className="text-[10px] uppercase tracking-wider text-white/45">
                        Category · Use location
                      </p>
                      <p className="mt-0.5 text-sm text-white/90">
                        {detail.classificationCategory}
                        <span className="text-white/40"> · </span>
                        {detail.useLocation}
                      </p>
                      {!detail.combatDeckLegal ? (
                        <p className="mt-1 text-[11px] text-amber-200/90">
                          Belongs in Inventory / Companion Care — not the Combat Deck.
                        </p>
                      ) : null}
                    </div>

                    {detail.rulesText ? (
                      <div>
                        <p className="mb-1 text-[10px] uppercase tracking-wider text-white/45">
                          Rules
                        </p>
                        <p className="leading-relaxed text-[var(--text)]">
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

                    {detail.loreBlurb && !detail.illustratedBio ? (
                      <div>
                        <p className="mb-1 text-[10px] uppercase tracking-wider text-white/45">
                          Notes
                        </p>
                        <p className="leading-relaxed text-white/70">
                          {detail.loreBlurb}
                        </p>
                      </div>
                    ) : null}

                    {detail.creatureBio && !detail.illustratedBio ? (
                      <section className="lore-journal__section">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/80">
                          Species bond
                        </p>
                        <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg text-amber-50">
                          {detail.creatureBio.name}
                        </h3>
                        <p className="mt-1 text-xs text-white/55">
                          {detail.creatureBio.title} ·{" "}
                          {detail.creatureBio.nativeRegion}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-white/70">
                          {detail.creatureBio.shortBio}
                        </p>
                      </section>
                    ) : null}

                    {detail.illustratedBio ? (
                      <IllustratedBioPanel bio={detail.illustratedBio} />
                    ) : null}

                    {battlePlay ? (
                      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                        <RiftButton
                          tone="gold"
                          disabled={!battlePlay.canPlay}
                          onClick={() => {
                            battlePlay.onPlay();
                            onClose();
                          }}
                        >
                          Play card
                        </RiftButton>
                        {battlePlay.playDisabledReason ? (
                          <p className="text-xs text-white/50">
                            {battlePlay.playDisabledReason}
                            {battlePlay.energyLabel
                              ? ` · pool ${battlePlay.energyLabel}`
                              : ""}
                          </p>
                        ) : battlePlay.energyLabel ? (
                          <p className="text-xs text-amber-100/70">
                            Energy {battlePlay.energyLabel}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
