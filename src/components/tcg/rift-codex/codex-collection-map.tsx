"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { CodexRegionNode } from "@/game/tcg/codex-stats";
import { cn } from "@/lib/utils/cn";

type Props = {
  regions: CodexRegionNode[];
  onOpenFamily?: (familyId: string) => void;
};

function speciesStatus(f: CodexRegionNode["families"][number]): {
  label: string;
  kind: "sealed" | "partial" | "locked";
} {
  if (f.rewardReady) return { label: "Sealed", kind: "sealed" };
  if (f.discovered) {
    return {
      label: `${f.ownedStages}/${f.releasedStages} · ${f.percent}%`,
      kind: "partial",
    };
  }
  return { label: "Undiscovered", kind: "locked" };
}

export function CodexCollectionMap({ regions, onOpenFamily }: Props) {
  const reduceMotion = useReducedMotion();
  const totalFamilies = regions.reduce((s, r) => s + r.families.length, 0);
  const sealed = regions.reduce((s, r) => s + r.sealedCount, 0);

  return (
    <div className="codex-map" data-audio-cue="codex.section.map">
      <header className="codex-map__header">
        <p className="rift-codex__eyebrow">Atlas · Collection map</p>
        <h2>Habitats of the Riftwilds</h2>
        <p>
          {regions.length} affinity ranges · {sealed}/{totalFamilies} lines
          sealed. Open a species plate to study lore and variants — finishes
          stay cosmetic.
        </p>
      </header>

      <ul className="codex-map__regions">
        {regions.map((region, i) => (
          <motion.li
            key={region.regionId}
            className={cn(
              "codex-map__region",
              `codex-map__region--${region.affinity.toLowerCase()}`,
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 6) * 0.05 }}
          >
            <div
              className="codex-map__hero"
              style={{ backgroundImage: `url(${region.habitatArtPath})` }}
            >
              <div className="codex-map__hero-veil" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="codex-map__element"
                src={region.elementIconPath}
                alt=""
                width={28}
                height={28}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="codex-map__region-head">
                <div>
                  <p className="codex-map__affinity">{region.affinity}</p>
                  <h3>{region.regionLabel}</h3>
                </div>
                <strong>{region.percent}%</strong>
              </div>
            </div>

            <p className="codex-map__blurb">{region.blurb}</p>

            <div className="codex-map__meta">
              <span>
                {region.sealedCount}/{region.families.length} sealed
              </span>
              <span>{region.discoveredCount} discovered</span>
            </div>

            <div className="codex-map__bar" aria-hidden>
              <i style={{ width: `${region.percent}%` }} />
            </div>

            <ul className="codex-map__species">
              {region.families.map((f) => {
                const st = speciesStatus(f);
                const open = () => {
                  if (onOpenFamily) onOpenFamily(f.familyId);
                };
                return (
                  <li key={f.familyId}>
                    {onOpenFamily ? (
                      <button
                        type="button"
                        className={cn(
                          "codex-map__species-row",
                          `is-${st.kind}`,
                        )}
                        onClick={open}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={f.portraitArtPath}
                          alt=""
                          loading="lazy"
                          className={cn(!f.discovered && "is-sil")}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity = "0";
                          }}
                        />
                        <span>{f.name}</span>
                        <em>{st.label}</em>
                      </button>
                    ) : (
                      <Link
                        href={`/tcg/codex/${f.familyId}`}
                        className={cn(
                          "codex-map__species-row",
                          `is-${st.kind}`,
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={f.portraitArtPath}
                          alt=""
                          loading="lazy"
                          className={cn(!f.discovered && "is-sil")}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity = "0";
                          }}
                        />
                        <span>{f.name}</span>
                        <em>{st.label}</em>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="codex-map__footer">
              <Link href={`/world#region-${region.regionId}`}>World map</Link>
              <Link href="/codex/world">World Codex</Link>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
