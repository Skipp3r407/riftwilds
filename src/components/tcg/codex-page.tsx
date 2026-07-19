"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { FamilyProgress } from "@/game/tcg/card-families";
import { RiftCardFrame } from "@/components/tcg/rift-card-frame";
import { getCardById, resolveCardImagePath } from "@/content/tcg";
import { cn } from "@/lib/utils/cn";

type Props = {
  progress: FamilyProgress;
  onInspectCard: (defId: string) => void;
};

export function CodexPageView({ progress, onInspectCard }: Props) {
  const { family, stages, loreUnlocked, finishes, percent, rewardReady } =
    progress;

  return (
    <div className="codex-page">
      <div className="codex-page__aura" aria-hidden />

      <header className="codex-page__header">
        <div>
          <p className="codex-page__eyebrow">
            Riftwilds Codex · {family.affinity}
          </p>
          <h1 className="codex-page__title">{family.title}</h1>
          <p className="codex-page__identity">{family.identity}</p>
        </div>
        <div className="codex-page__score">
          <strong>{percent}%</strong>
          <span>line progress</span>
        </div>
      </header>

      <section className="codex-page__panel">
        <h2>Signature</h2>
        <p>{family.signatureMechanic}</p>
        <div className="codex-page__tags">
          {family.strengths.map((s) => (
            <span key={s} className="is-strength">
              {s}
            </span>
          ))}
          {family.weaknesses.map((w) => (
            <span key={w} className="is-weak">
              {w}
            </span>
          ))}
        </div>
      </section>

      <section className="codex-page__tree">
        <h2>Bond-line tree</h2>
        <p className="codex-page__hint">
          Shellseed → Softling → Companion → Keeper → Riftmarked → Awakened →
          Ascendant. Branches open after Awakened.
        </p>
        <ol className="codex-tree">
          {stages.map((sp, idx) => {
            const card = sp.stage.cardId
              ? getCardById(sp.stage.cardId)
              : null;
            const art =
              card?.art.assetPath ||
              (card ? resolveCardImagePath(card) : family.portraitArtPath);
            return (
              <li
                key={sp.stage.stageId}
                className={cn(
                  "codex-tree__node",
                  sp.unlocked && "is-unlocked",
                  sp.stage.status === "planned" && "is-planned",
                )}
              >
                {idx > 0 ? <div className="codex-tree__link" aria-hidden /> : null}
                <div className="codex-tree__card-wrap">
                  {sp.stage.status === "released" && card ? (
                    <RiftCardFrame
                      size="sm"
                      name={sp.stage.displayName}
                      riftCost={card.energyCost}
                      typeLine={`${card.type} · ${family.affinity}`}
                      rarity={card.rarity}
                      affinity={family.affinity}
                      rulesText={card.localization.rulesText}
                      attack={card.attack}
                      health={card.health}
                      artSrc={resolveCardImagePath(card) || art}
                      cardFaceSrc={resolveCardImagePath(card)}
                      ownedCount={sp.owned}
                      finish={sp.finishesOwned.includes("foil") ? "foil" : "standard"}
                      onClick={() => onInspectCard(card.id)}
                    />
                  ) : (
                    <div className="codex-tree__locked">
                      <p className="codex-tree__stage-label">{sp.stage.label}</p>
                      <p>{sp.stage.displayName}</p>
                      <p className="codex-tree__planned">Planned chapter</p>
                    </div>
                  )}
                </div>
                <div className="codex-tree__meta">
                  <p className="codex-tree__stage-label">{sp.stage.label}</p>
                  <p className="codex-tree__flavor">{sp.stage.flavorText}</p>
                  {sp.finishesOwned.length > 0 ? (
                    <p className="codex-tree__finishes">
                      Finishes: {sp.finishesOwned.join(" · ")}
                    </p>
                  ) : null}
                  {sp.stage.branchIds.length > 0 ? (
                    <ul className="codex-tree__branches">
                      {sp.stage.branchIds.map((bid) => {
                        const br = family.branches.find((b) => b.id === bid);
                        if (!br) return null;
                        return (
                          <li key={bid}>
                            <strong>{br.name}</strong>
                            <span>{br.description}</span>
                            <em>{br.status}</em>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="codex-page__panel">
        <h2>Alternate paths</h2>
        <ul className="codex-branches">
          {family.branches.map((br) => (
            <li key={br.id}>
              <motion.div
                initial={{ opacity: 0.6 }}
                whileHover={{ opacity: 1, x: 4 }}
              >
                <h3>{br.name}</h3>
                <p>{br.description}</p>
                <p className="codex-branches__status">
                  {br.status === "planned"
                    ? "Planned alternate awaken path"
                    : "Released"}
                  {br.cosmeticOnly ? " · cosmetic branch" : ""}
                </p>
              </motion.div>
            </li>
          ))}
        </ul>
      </section>

      <section className="codex-page__panel">
        <h2>Finishes (cosmetic)</h2>
        <p className="codex-page__hint">
          Foil / Goldleaf / Crystal / Animated never grant competitive power.
        </p>
        <ul className="codex-finishes">
          {finishes.map((f) => (
            <li key={f.id} className={cn(f.ownedAny && "is-owned")}>
              <span>{f.label}</span>
              <em>{f.ownedAny ? "Seen" : "Locked"}</em>
            </li>
          ))}
        </ul>
      </section>

      <section className="codex-page__panel">
        <h2>Lore unlocks</h2>
        {loreUnlocked.length === 0 ? (
          <p className="codex-page__hint">Collect a Bond Companion to open Origin.</p>
        ) : (
          <ul className="codex-lore">
            {loreUnlocked.map((ch) => (
              <li key={ch.id}>
                <h3>{ch.title}</h3>
                <p>{ch.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="codex-page__panel">
        <h2>Completion</h2>
        <p>
          {rewardReady
            ? `Ready: ${family.completionReward.label} — ${family.completionReward.notes}`
            : `Collect all released stages to earn ${family.completionReward.label}.`}
        </p>
      </section>

      <div className="codex-page__nav">
        <Link href="/tcg/collection">← Collection Book</Link>
        <Link href="/tcg/deck-builder">Deck Atelier</Link>
        <Link href="/tcg/battle">Practice Board</Link>
      </div>
    </div>
  );
}
