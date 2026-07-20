"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { FamilyProgress } from "@/game/tcg/card-families";
import type { TcgCollectionCardRow } from "@/game/tcg/types";
import { RiftCardFrame } from "@/components/tcg/rift-card-frame";
import { getCardById, resolveCardImagePath } from "@/content/tcg";
import { cn } from "@/lib/utils/cn";

type Props = {
  families: FamilyProgress[];
  flatCards: TcgCollectionCardRow[];
  onInspectCard: (defId: string) => void;
  onOpenCodex: (familyId: string) => void;
  /** When embedded in Rift Codex, show flat binder only. */
  forceView?: "book" | "flat";
}

const AFFINITY_FILTERS = ["ALL", "EMBER", "TIDE", "GROVE", "STORM"] as const;

export function CollectionBook({
  families,
  flatCards,
  onInspectCard,
  onOpenCodex,
  forceView,
}: Props) {
  const [view, setView] = useState<"book" | "flat">(forceView ?? "book");
  const [affinity, setAffinity] = useState<(typeof AFFINITY_FILTERS)[number]>(
    "ALL",
  );
  const [query, setQuery] = useState("");
  const activeView = forceView ?? view;

  const filteredFamilies = useMemo(() => {
    const q = query.trim().toLowerCase();
    return families.filter((fp) => {
      if (affinity !== "ALL" && fp.family.affinity !== affinity) return false;
      if (!q) return true;
      return (
        fp.family.name.toLowerCase().includes(q) ||
        fp.family.signatureMechanic.toLowerCase().includes(q) ||
        fp.family.speciesSlug.includes(q)
      );
    });
  }, [families, affinity, query]);

  const filteredFlat = useMemo(() => {
    const q = query.trim().toLowerCase();
    return flatCards.filter((row) => {
      if (!row.def) return false;
      if (affinity !== "ALL" && row.def.affinity !== affinity) return false;
      if (!q) return true;
      return (
        row.def.name.toLowerCase().includes(q) ||
        row.defId.toLowerCase().includes(q)
      );
    });
  }, [flatCards, affinity, query]);

  const bookComplete = families.filter((f) => f.rewardReady).length;

  return (
    <div className="collection-book">
      {!forceView ? (
        <div className="collection-book__toolbar rift-material-obsidian rift-panel--filigree">
          <div className="collection-book__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "book"}
              className={cn(activeView === "book" && "is-active")}
              onClick={() => setView("book")}
            >
              Collection Book
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "flat"}
              className={cn(activeView === "flat" && "is-active")}
              onClick={() => setView("flat")}
            >
              Flat Binder
            </button>
            <a
              href="/tcg/codex"
              className="collection-book__tabs-link"
            >
              Rift Codex
            </a>
          </div>
          <p className="collection-book__meta">
            {bookComplete}/{families.length} lines sealed · finishes are cosmetic
          </p>
        </div>
      ) : (
        <p className="collection-book__meta" style={{ marginBottom: "0.75rem" }}>
          Flat binder · {bookComplete}/{families.length} lines sealed · Credits
          only — SOL never required
        </p>
      )}

      <div className="collection-book__filters">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            activeView === "book" ? "Search species lines…" : "Search cards…"
          }
          className="collection-book__search"
        />
        <div className="collection-book__chips">
          {AFFINITY_FILTERS.map((a) => (
            <button
              key={a}
              type="button"
              className={cn(affinity === a && "is-active")}
              onClick={() => setAffinity(a)}
            >
              {a === "ALL" ? "All" : a}
            </button>
          ))}
        </div>
      </div>

      {activeView === "book" ? (
        <ul className="collection-book__grid">
          {filteredFamilies.map((fp, i) => {
            const released = fp.stages.filter(
              (s) => s.stage.status === "released",
            );
            return (
              <motion.li
                key={fp.family.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.04 }}
                className="family-tile rift-material-marble"
              >
                <button
                  type="button"
                  className="family-tile__hit"
                  onClick={() => onOpenCodex(fp.family.id)}
                >
                  <div className="family-tile__art">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fp.family.portraitArtPath}
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="family-tile__progress-ring" aria-hidden>
                      <svg viewBox="0 0 36 36">
                        <path
                          className="family-tile__ring-bg"
                          d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 0 1 0-31"
                        />
                        <path
                          className="family-tile__ring-fg"
                          strokeDasharray={`${fp.percent}, 100`}
                          d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 0 1 0-31"
                        />
                      </svg>
                      <span>{fp.percent}%</span>
                    </div>
                  </div>
                  <div className="family-tile__body">
                    <p className="family-tile__affinity">{fp.family.affinity}</p>
                    <h3>{fp.family.title}</h3>
                    <p className="family-tile__sig">{fp.family.signatureMechanic}</p>
                    <div className="family-tile__stages">
                      {released.map((s) => (
                        <span
                          key={s.stage.stageId}
                          className={cn(
                            "family-tile__pip",
                            s.unlocked && "is-owned",
                          )}
                          title={s.stage.label}
                        />
                      ))}
                    </div>
                    <p className="family-tile__missing">
                      {fp.missingCardIds.length === 0
                        ? "Released line complete"
                        : `Missing ${fp.missingCardIds.length} released · ${fp.stages.filter((s) => s.stage.status === "planned").length} planned`}
                    </p>
                    {fp.rewardReady ? (
                      <p className="family-tile__reward">
                        {fp.family.completionReward.label}
                      </p>
                    ) : null}
                  </div>
                </button>
                <div className="family-tile__actions">
                  <Link
                    href={`/tcg/codex/${fp.family.id}`}
                    className="family-tile__link"
                  >
                    Open Codex
                  </Link>
                  {released
                    .filter((s) => s.unlocked && s.stage.cardId)
                    .slice(0, 1)
                    .map((s) => (
                      <button
                        key={s.stage.cardId}
                        type="button"
                        className="family-tile__link"
                        onClick={() => onInspectCard(s.stage.cardId!)}
                      >
                        Inspect card
                      </button>
                    ))}
                </div>
              </motion.li>
            );
          })}
        </ul>
      ) : (
        <ul className="collection-book__flat">
          {filteredFlat.slice(0, 120).map((row) => {
            const content = getCardById(row.defId);
            // Prefer per-card scenic face so Base/Companion/Ascendant are not identical thumbs.
            const art =
              (content ? resolveCardImagePath(content) : undefined) ||
              row.def?.cardImagePath ||
              row.def?.artPath ||
              content?.art.assetPath;
            return (
              <li key={row.defId}>
                <RiftCardFrame
                  name={row.def?.name ?? row.defId}
                  riftCost={row.def?.riftCost ?? 0}
                  typeLine={`${content?.type ?? row.def?.type ?? "?"} · ${content?.element ?? row.def?.affinity ?? "?"}`}
                  rarity={row.def?.rarity ?? "COMMON"}
                  affinity={row.def?.affinity}
                  contentType={content?.type}
                  element={content?.element}
                  rulesText={row.def?.description}
                  attack={row.def?.attack ?? content?.attack}
                  defense={row.def?.defense ?? content?.defense}
                  health={row.def?.health ?? content?.health}
                  speed={row.def?.speed ?? content?.speed}
                  keywords={content?.keywords}
                  familyId={content?.familyId}
                  evolutionStage={content?.evolutionStage}
                  collectionNumber={content?.collectorNumber}
                  expansionSet={content?.expansionId}
                  artSrc={
                    row.def?.cleanArtPath ||
                    content?.art.assetPath ||
                    row.def?.artPath ||
                    art
                  }
                  cardFaceSrc={row.def?.cardImagePath}
                  ownedCount={row.count}
                  onClick={() => onInspectCard(row.defId)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
