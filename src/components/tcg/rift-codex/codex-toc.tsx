"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { FamilyProgress } from "@/game/tcg/card-families";
import type { CodexStatsSummary } from "@/game/tcg/codex-stats";

export type CodexTocCategory =
  | "families"
  | "stats"
  | "map"
  | "museum"
  | "binder";

type Props = {
  families: FamilyProgress[];
  stats: CodexStatsSummary;
  onOpenCategory: (cat: CodexTocCategory) => void;
  onOpenFamily: (familyId: string) => void;
};

const CHAPTERS: {
  id: CodexTocCategory;
  roman: string;
  title: string;
  blurb: string;
  detail: (s: CodexStatsSummary) => string;
  percent: (s: CodexStatsSummary) => number;
}[] = [
  {
    id: "families",
    roman: "I",
    title: "Species lines",
    blurb: "Bond-line spreads with art, lore, and evolution trees.",
    detail: (s) => `${s.familyCount} families · ${s.discoveredLines} discovered`,
    percent: (s) => s.averagePercent,
  },
  {
    id: "stats",
    roman: "II",
    title: "Collection ledger",
    blurb: "Completion, affinity, and rarity tallies across the book.",
    detail: (s) =>
      `${s.releasedStagesOwned}/${s.releasedStagesTotal} released stages`,
    percent: (s) =>
      s.releasedStagesTotal === 0
        ? 0
        : Math.round((s.releasedStagesOwned / s.releasedStagesTotal) * 100),
  },
  {
    id: "map",
    roman: "III",
    title: "Atlas of habitats",
    blurb: "Regions and affinity ranges where each line thrives.",
    detail: (s) => `${s.byAffinity.length} affinity ranges charted`,
    percent: (s) => s.averagePercent,
  },
  {
    id: "museum",
    roman: "IV",
    title: "Museum hall",
    blurb: "Showcase plates for sealed lines and featured specimens.",
    detail: (s) => `${s.sealedLines} sealed exhibits ready`,
    percent: (s) =>
      s.familyCount === 0
        ? 0
        : Math.round((s.sealedLines / s.familyCount) * 100),
  },
  {
    id: "binder",
    roman: "V",
    title: "Flat binder",
    blurb: "Hatchery-linked ownership and Credits pack routes — never SOL.",
    detail: () => "Cards · hatchlings · pack shop",
    percent: () => 100,
  },
];

/**
 * Contents chapter navigation — premium TOC, not the species index.
 */
export function CodexToc({
  families,
  stats,
  onOpenCategory,
  onOpenFamily,
}: Props) {
  const reduceMotion = useReducedMotion();
  const featured = [...families]
    .filter((f) => f.stages.some((s) => s.unlocked))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 4);
  const sealedPreview = families.filter((f) => f.rewardReady).slice(0, 3);

  return (
    <div className="codex-toc" data-audio-cue="codex.section.toc">
      <header className="codex-toc__hero">
        <p className="rift-codex__eyebrow">Riftwilds Library · Contents</p>
        <h1>Rift Codex</h1>
        <p>
          A living collection book of bond-lines, lore, and variants across{" "}
          {stats.familyCount} species lines.{" "}
          {stats.sealedLines}/{stats.familyCount} sealed ·{" "}
          {stats.averagePercent}% average completion. Finishes are cosmetic —
          never required for play.
        </p>
      </header>

      <nav className="codex-toc__chapters" aria-label="Codex chapters">
        {CHAPTERS.map((ch, i) => (
          <motion.button
            key={ch.id}
            type="button"
            className="codex-toc__chapter"
            onClick={() => onOpenCategory(ch.id)}
            data-audio-cue="codex.page.turn"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 6) * 0.05 }}
          >
            <span className="codex-toc__roman" aria-hidden>
              {ch.roman}
            </span>
            <span className="codex-toc__chapter-body">
              <strong>{ch.title}</strong>
              <em>{ch.detail(stats)}</em>
              <span>{ch.blurb}</span>
            </span>
            <b>{ch.percent(stats)}%</b>
          </motion.button>
        ))}
      </nav>

      <section className="codex-toc__plate">
        <div className="codex-toc__plate-head">
          <h2>Quick open</h2>
          <p>Jump into a discovered line or browse the full species index.</p>
        </div>
        {featured.length > 0 ? (
          <ul className="codex-toc__quick">
            {featured.map((fp) => (
              <li key={fp.family.id}>
                <button
                  type="button"
                  onClick={() => onOpenFamily(fp.family.id)}
                  data-audio-cue="codex.page.turn"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fp.family.portraitArtPath}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0";
                    }}
                  />
                  <span>
                    <strong>{fp.family.name}</strong>
                    <em>
                      {fp.rewardReady ? "Sealed" : `${fp.percent}% · open`}
                    </em>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="codex-toc__empty">
            No lines discovered yet — hatch a companion or open a Credits pack
            to start filling the book.
          </p>
        )}
        <div className="codex-toc__quick-actions">
          <button
            type="button"
            className="codex-toc__cta"
            onClick={() => onOpenCategory("families")}
          >
            Browse all species
          </button>
          {sealedPreview.length > 0 ? (
            <button
              type="button"
              className="codex-toc__cta codex-toc__cta--ghost"
              onClick={() => onOpenCategory("museum")}
            >
              Visit museum ({stats.sealedLines} sealed)
            </button>
          ) : null}
        </div>
      </section>

      <nav className="codex-toc__crosslinks" aria-label="Related codices">
        <Link href="/codex/world">World Codex</Link>
        <Link href="/codex/riftlings">Riftling Codex</Link>
        <Link href="/hatchery">Hatchery</Link>
        <Link href="/shop/packs">Credits packs</Link>
        <Link href="/tcg/deck-builder">Deck Atelier</Link>
      </nav>
    </div>
  );
}
