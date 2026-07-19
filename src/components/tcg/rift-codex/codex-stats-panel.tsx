"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { CodexStatsSummary } from "@/game/tcg/codex-stats";
import { elementIconForAffinity } from "@/game/tcg/codex-stats";

type Props = {
  stats: CodexStatsSummary;
  onOpenFamily?: (familyId: string) => void;
};

export function CodexStatsPanel({ stats, onOpenFamily }: Props) {
  const reduceMotion = useReducedMotion();
  const stagePct =
    stats.releasedStagesTotal === 0
      ? 0
      : Math.round(
          (stats.releasedStagesOwned / stats.releasedStagesTotal) * 100,
        );
  const lorePct =
    stats.loreChaptersTotal === 0
      ? 0
      : Math.round(
          (stats.loreChaptersUnlocked / stats.loreChaptersTotal) * 100,
        );
  const finishPct =
    stats.finishesTotal === 0
      ? 0
      : Math.round((stats.finishesSeen / stats.finishesTotal) * 100);

  return (
    <div className="codex-stats" data-audio-cue="codex.section.stats">
      <header className="codex-stats__header">
        <p className="rift-codex__eyebrow">Ledger · Statistics</p>
        <h2>Collection statistics</h2>
        <p>
          Progress across bond-lines. Finishes and titles are cosmetic — never
          required for play. Competitive decks craft with Gold, Rift Shards, and
          Ancient Fragments — never SOL.
        </p>
      </header>

      <div className="codex-stats__grid">
        <StatCard
          label="Lines sealed"
          value={`${stats.sealedLines}/${stats.familyCount}`}
          hint={`${stats.discoveredLines} discovered`}
        />
        <StatCard
          label="Average completion"
          value={`${stats.averagePercent}%`}
          hint="Across all bond-lines"
        />
        <StatCard
          label="Released stages"
          value={`${stats.releasedStagesOwned}/${stats.releasedStagesTotal}`}
          hint={`${stagePct}% of catalog`}
        />
        <StatCard
          label="Lore chapters"
          value={`${stats.loreChaptersUnlocked}/${stats.loreChaptersTotal}`}
          hint={`${lorePct}% opened`}
        />
        <StatCard
          label="Finishes seen"
          value={`${stats.finishesSeen}/${stats.finishesTotal}`}
          hint={`${finishPct}% cosmetic`}
        />
      </div>

      <section className="codex-stats__affinity">
        <h3>By affinity</h3>
        <ul>
          {stats.byAffinity.map((b, i) => (
            <motion.li
              key={b.affinity}
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i, 6) * 0.04 }}
            >
              <div className="codex-stats__aff-row">
                <strong>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={elementIconForAffinity(b.affinity)}
                    alt=""
                    width={16}
                    height={16}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {b.affinity}
                </strong>
                <span>
                  {b.complete}/{b.families} sealed · {b.ownedStages}/
                  {b.releasedStages} stages · {b.percent}%
                </span>
              </div>
              <div className="codex-stats__bar" aria-hidden>
                <i style={{ width: `${b.percent}%` }} />
              </div>
            </motion.li>
          ))}
        </ul>
      </section>

      {stats.byRarity.length > 0 ? (
        <section className="codex-stats__rarity">
          <h3>By rarity (released stages)</h3>
          <ul className="codex-stats__rarity-grid">
            {stats.byRarity.map((r) => {
              const pct =
                r.total === 0 ? 0 : Math.round((r.owned / r.total) * 100);
              return (
                <li key={r.rarity} className="codex-stats__rarity-card">
                  <p>{r.rarity}</p>
                  <strong>
                    {r.owned}/{r.total}
                  </strong>
                  <div className="codex-stats__bar" aria-hidden>
                    <i style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {stats.nearComplete.length > 0 ? (
        <section className="codex-stats__missing">
          <h3>Nearly sealed</h3>
          <ul>
            {stats.nearComplete.map((m) => (
              <li key={m.familyId}>
                {onOpenFamily ? (
                  <button type="button" onClick={() => onOpenFamily(m.familyId)}>
                    {m.title}
                  </button>
                ) : (
                  <Link href={`/tcg/codex/${m.familyId}`}>{m.title}</Link>
                )}
                <span>{m.percent}%</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {stats.missingMost.length > 0 ? (
        <section className="codex-stats__missing">
          <h3>Widest gaps</h3>
          <ul>
            {stats.missingMost.map((m) => (
              <li key={m.familyId}>
                {onOpenFamily ? (
                  <button type="button" onClick={() => onOpenFamily(m.familyId)}>
                    {m.title}
                  </button>
                ) : (
                  <Link href={`/tcg/codex/${m.familyId}`}>{m.title}</Link>
                )}
                <span>{m.missing} missing released</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <nav className="codex-stats__links" aria-label="Related">
        <Link href="/hatchery">Hatchery ownership</Link>
        <Link href="/shop/packs">Credits packs</Link>
        <Link href="/codex/riftlings">Riftling Codex</Link>
      </nav>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="codex-stats__card">
      <p>{label}</p>
      <strong>{value}</strong>
      {hint ? <em>{hint}</em> : null}
    </div>
  );
}
