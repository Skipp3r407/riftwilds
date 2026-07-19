"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { FamilyProgress } from "@/game/tcg/card-families";
import { habitatArtForAffinity } from "@/game/tcg/codex-stats";
import { cn } from "@/lib/utils/cn";

type Props = {
  families: FamilyProgress[];
  visits: number;
  onOpenFamily?: (familyId: string) => void;
};

type Wing = {
  id: string;
  title: string;
  blurb: string;
  pick: (families: FamilyProgress[]) => FamilyProgress[];
  badge: string;
};

const WINGS: Wing[] = [
  {
    id: "hall-origins",
    title: "Hall of Origins",
    blurb: "Bond-lines with Origin lore unlocked — shellseed memories on display.",
    pick: (families) =>
      families.filter((f) => f.loreUnlocked.length > 0).slice(0, 4),
    badge: "Lore open",
  },
  {
    id: "wing-affinity",
    title: "Affinity Wing",
    blurb: "Highest-completion lines from each affinity, arranged for quiet study.",
    pick: (families) => {
      const seen = new Set<string>();
      const out: FamilyProgress[] = [];
      for (const fp of [...families].sort((a, b) => b.percent - a.percent)) {
        if (seen.has(fp.family.affinity)) continue;
        seen.add(fp.family.affinity);
        out.push(fp);
        if (out.length >= 4) break;
      }
      return out;
    },
    badge: "Affinity lead",
  },
  {
    id: "vault-finishes",
    title: "Finish Vault",
    blurb: "Lines where cosmetic foils have been seen. No competitive power.",
    pick: (families) =>
      families
        .filter((f) => f.finishes.some((x) => x.ownedAny && x.id !== "standard"))
        .slice(0, 4),
    badge: "Cosmetic",
  },
  {
    id: "rotunda-ascendant",
    title: "Ascendant Rotunda",
    blurb: "Fully sealed bond-lines — centerpiece plates of the museum.",
    pick: (families) => families.filter((f) => f.rewardReady).slice(0, 6),
    badge: "Sealed",
  },
];

/**
 * Museum Mode — showcase plates powered by real collection progress.
 */
export function MuseumHall({ families, visits, onOpenFamily }: Props) {
  const reduceMotion = useReducedMotion();
  const sealed = families.filter((f) => f.rewardReady);
  const featured = [...families]
    .sort((a, b) => {
      if (a.rewardReady !== b.rewardReady) return a.rewardReady ? -1 : 1;
      return b.percent - a.percent;
    })
    .slice(0, 8);

  return (
    <div className="museum-hall" data-audio-cue="codex.museum.enter">
      <header className="museum-hall__hero">
        <p className="rift-codex__eyebrow">Museum Mode</p>
        <h1>Rift Codex Museum</h1>
        <p>
          Quiet halls for sealed lines, lore plates, and cosmetic finishes. A
          full spatial walkthrough is still phased — today&apos;s exhibits are
          live from your binder.
        </p>
        <p className="museum-hall__meta">
          {sealed.length} sealed exhibits · {visits} local visit
          {visits === 1 ? "" : "s"} recorded
        </p>
      </header>

      <ul className="museum-hall__exhibits">
        {WINGS.map((wing, i) => {
          const plates = wing.pick(families);
          return (
            <motion.li
              key={wing.id}
              className="museum-hall__exhibit"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 4) * 0.06 }}
            >
              <div className="museum-hall__plinth" aria-hidden />
              <h2>{wing.title}</h2>
              <p>{wing.blurb}</p>
              <span className="museum-hall__badge">
                {plates.length > 0
                  ? `${plates.length} on display`
                  : wing.badge}
              </span>
              {plates.length > 0 ? (
                <ul className="museum-hall__mini">
                  {plates.slice(0, 3).map((fp) => (
                    <li key={fp.family.id}>
                      {onOpenFamily ? (
                        <button
                          type="button"
                          onClick={() => onOpenFamily(fp.family.id)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={fp.family.portraitArtPath}
                            alt=""
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                          <span>{fp.family.name}</span>
                        </button>
                      ) : (
                        <Link href={`/tcg/codex/${fp.family.id}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={fp.family.portraitArtPath}
                            alt=""
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                          <span>{fp.family.name}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="museum-hall__empty-wing">
                  Nothing curated here yet — keep collecting to fill the wing.
                </p>
              )}
            </motion.li>
          );
        })}
      </ul>

      <section className="museum-hall__featured">
        <h2>Featured specimens</h2>
        <ul className="museum-hall__plates">
          {featured.map((fp, i) => (
            <motion.li
              key={fp.family.id}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i, 8) * 0.04 }}
            >
              {(() => {
                const plateStyle = {
                  "--museum-habitat": `url(${habitatArtForAffinity(fp.family.affinity)})`,
                } as CSSProperties;
                const body = (
                  <>
                    <span className="museum-hall__plate-bg" aria-hidden />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fp.family.portraitArtPath}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span>
                      <strong>{fp.family.name}</strong>
                      <em>
                        {fp.rewardReady
                          ? "On display · sealed"
                          : `${fp.percent}% curated`}
                      </em>
                    </span>
                  </>
                );
                return onOpenFamily ? (
                  <button
                    type="button"
                    className={cn(
                      "museum-hall__plate",
                      fp.rewardReady && "is-sealed",
                    )}
                    onClick={() => onOpenFamily(fp.family.id)}
                    style={plateStyle}
                  >
                    {body}
                  </button>
                ) : (
                  <Link
                    href={`/tcg/codex/${fp.family.id}`}
                    className={cn(
                      "museum-hall__plate",
                      fp.rewardReady && "is-sealed",
                    )}
                    style={plateStyle}
                  >
                    {body}
                  </Link>
                );
              })()}
            </motion.li>
          ))}
        </ul>
      </section>

      <section className="museum-hall__market">
        <h2>List from exhibit</h2>
        <p>
          Showcase sealed lines or list eligible cosmetic finishes on the Player
          Marketplace. Competitive card power cannot be listed for advantage.
        </p>
        <div className="museum-hall__market-actions">
          <Link
            href="/marketplace?category=COLLECTIBLES"
            className="btn-primary focus-ring text-sm"
          >
            List collectible
          </Link>
          <Link
            href="/marketplace?category=EQUIPMENT"
            className="btn-secondary focus-ring text-sm"
          >
            List cosmetic
          </Link>
          <Link href="/exchange" className="btn-secondary focus-ring text-sm">
            Rift Exchange
          </Link>
        </div>
      </section>

      <div className="museum-hall__nav">
        <Link href="/tcg/codex">← Back to Rift Codex</Link>
        <Link href="/tcg/collection">Collection Book</Link>
        <Link href="/codex/riftlings">Riftling Codex</Link>
        <Link href="/marketplace">Player Marketplace</Link>
      </div>
    </div>
  );
}
