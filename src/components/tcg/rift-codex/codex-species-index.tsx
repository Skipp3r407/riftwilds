"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { FamilyProgress } from "@/game/tcg/card-families";
import type { CodexStatsSummary } from "@/game/tcg/codex-stats";
import { habitatArtForAffinity } from "@/game/tcg/codex-stats";
import { cn } from "@/lib/utils/cn";

type Props = {
  families: FamilyProgress[];
  stats: CodexStatsSummary;
  query: string;
  affinity: string;
  onQueryChange: (q: string) => void;
  onAffinityChange: (a: string) => void;
  onOpenFamily: (familyId: string) => void;
};

function statusLabel(fp: FamilyProgress): { label: string; kind: string } {
  if (fp.rewardReady) return { label: "Sealed", kind: "sealed" };
  if (fp.stages.some((s) => s.unlocked)) {
    return { label: `${fp.percent}% bonded`, kind: "partial" };
  }
  return { label: "Undiscovered", kind: "locked" };
}

/**
 * Species tab — searchable bond-line catalog with richer tiles.
 */
export function CodexSpeciesIndex({
  families,
  stats,
  query,
  affinity,
  onQueryChange,
  onAffinityChange,
  onOpenFamily,
}: Props) {
  const reduceMotion = useReducedMotion();
  const affinities = [
    "ALL",
    ...stats.byAffinity.map((b) => b.affinity),
  ];
  const q = query.trim().toLowerCase();
  const filtered = families.filter((fp) => {
    if (affinity !== "ALL" && fp.family.affinity !== affinity) return false;
    if (!q) return true;
    return (
      fp.family.name.toLowerCase().includes(q) ||
      fp.family.title.toLowerCase().includes(q) ||
      fp.family.signatureMechanic.toLowerCase().includes(q) ||
      fp.family.speciesSlug.includes(q) ||
      fp.family.identity.toLowerCase().includes(q)
    );
  });

  return (
    <div className="codex-species" data-audio-cue="codex.section.species">
      <header className="codex-species__header">
        <p className="rift-codex__eyebrow">Field guide · Species</p>
        <h2>Bond-line index</h2>
        <p>
          Art, lore snippets, evolution progress, and unlock status for every
          catalogued line. Open a spread to study the full page.
        </p>
      </header>

      <div className="codex-species__filters">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search species, mechanics, lore…"
          className="codex-species__search"
          data-audio-cue="codex.ui.search"
        />
        <div
          className="codex-species__chips"
          role="group"
          aria-label="Affinity filter"
        >
          {affinities.map((a) => (
            <button
              key={a}
              type="button"
              className={cn(affinity === a && "is-active")}
              onClick={() => onAffinityChange(a)}
            >
              {a === "ALL" ? "All" : a}
            </button>
          ))}
        </div>
      </div>

      <ul className="codex-species__grid">
        {filtered.map((fp, i) => {
          const status = statusLabel(fp);
          const lore = fp.loreUnlocked[0] ?? fp.family.loreChapters[0];
          const released = fp.stages.filter((s) => s.stage.status === "released");
          const habitat = habitatArtForAffinity(fp.family.affinity);

          return (
            <motion.li
              key={fp.family.id}
              className={cn(
                "codex-species__card",
                `codex-species__card--${status.kind}`,
              )}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 10) * 0.03 }}
            >
              <button
                type="button"
                className="codex-species__hit"
                onClick={() => onOpenFamily(fp.family.id)}
                data-audio-cue="codex.page.turn"
              >
                <div
                  className="codex-species__habitat"
                  style={{ backgroundImage: `url(${habitat})` }}
                  aria-hidden
                />
                <div className="codex-species__art">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fp.family.portraitArtPath}
                    alt=""
                    loading="lazy"
                    className={cn(!fp.stages.some((s) => s.unlocked) && "is-sil")}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0";
                    }}
                  />
                  <span className="codex-species__pct">{fp.percent}%</span>
                </div>
                <div className="codex-species__body">
                  <p className="codex-species__aff">{fp.family.affinity}</p>
                  <h3>{fp.family.title}</h3>
                  <p className="codex-species__sig">
                    {fp.family.signatureMechanic}
                  </p>
                  <p className="codex-species__lore">
                    {lore
                      ? lore.body.slice(0, 110) +
                        (lore.body.length > 110 ? "…" : "")
                      : fp.family.identity}
                  </p>
                  <div className="codex-species__stages" aria-hidden>
                    {released.map((s) => (
                      <i
                        key={s.stage.stageId}
                        className={cn(s.unlocked && "is-owned")}
                        title={s.stage.label}
                      />
                    ))}
                  </div>
                  <span
                    className={cn(
                      "codex-species__badge",
                      `is-${status.kind}`,
                    )}
                  >
                    {status.label}
                  </span>
                </div>
              </button>
              <div className="codex-species__links">
                <Link href={`/tcg/codex/${fp.family.id}`}>Open spread</Link>
                <Link href={`/codex/riftlings/${fp.family.speciesSlug}`}>
                  Riftling Codex
                </Link>
              </div>
            </motion.li>
          );
        })}
      </ul>

      {filtered.length === 0 ? (
        <p className="codex-species__empty">No bond-lines match this search.</p>
      ) : null}
    </div>
  );
}
