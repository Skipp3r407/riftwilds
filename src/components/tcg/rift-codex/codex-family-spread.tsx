"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { FamilyProgress } from "@/game/tcg/card-families";
import { getFactionById, getCardById, resolveCardImagePath } from "@/content/tcg";
import { habitatArtForAffinity } from "@/game/tcg/codex-stats";
import { RiftCardFrame } from "@/components/tcg/rift-card-frame";
import { CodexCardViewer } from "@/components/tcg/rift-codex/codex-card-viewer";
import { playSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils/cn";

type Props = {
  progress: FamilyProgress;
  rewardClaimed?: boolean;
  onClaimReward?: () => void;
  onInspectCard: (defId: string) => void;
};

/**
 * Two-page family spread: left lore/habitat/tree, right variants/progress.
 */
export function CodexFamilySpread({
  progress,
  rewardClaimed,
  onClaimReward,
  onInspectCard,
}: Props) {
  const reduceMotion = useReducedMotion();
  const { family, stages, loreUnlocked, finishes, percent, rewardReady } =
    progress;
  const faction = getFactionById(family.factionId);
  const habitat = faction?.regionHints?.[0] ?? "riftwild-commons";
  const habitatArt = habitatArtForAffinity(family.affinity);
  const [focusDefId, setFocusDefId] = useState<string | null>(null);
  const status =
    rewardReady ? "Sealed line"
    : stages.some((s) => s.unlocked) ? `${percent}% bonded`
    : "Undiscovered";

  const focusFinish = useMemo(() => {
    if (!focusDefId) return "standard" as const;
    const stage = stages.find((s) => s.stage.cardId === focusDefId);
    if (stage?.finishesOwned.includes("foil")) return "foil" as const;
    return "standard" as const;
  }, [focusDefId, stages]);

  return (
    <div
      className="codex-spread"
      data-audio-cue="codex.spread.open"
      data-family={family.id}
    >
      <div className="codex-spread__pages">
        {/* LEFT PAGE — lore / habitat / tree */}
        <article className="codex-spread__page codex-spread__page--left">
          <div
            className="codex-spread__banner"
            style={{ backgroundImage: `url(${habitatArt})` }}
            aria-hidden
          />
          <p className="rift-codex__eyebrow">
            {family.affinity} · {faction?.shortName ?? "Bond-line"} · {status}
          </p>
          <h1>{family.title}</h1>
          <p className="codex-spread__identity">{family.identity}</p>

          <section className="codex-spread__block">
            <h2>Habitat</h2>
            <div className="codex-spread__habitat">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={habitatArt} alt="" loading="lazy" />
              <p>
                Thrives near{" "}
                <strong>
                  {habitat
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </strong>
                {faction ? ` — ${faction.lore}` : "."}
              </p>
            </div>
          </section>

          <section className="codex-spread__block">
            <h2>Signature</h2>
            <p>{family.signatureMechanic}</p>
            <div className="codex-spread__tags">
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

          <section className="codex-spread__block">
            <h2>Bond-line tree</h2>
            <ol className="codex-spread__tree">
              {stages.map((sp) => {
                const locked =
                  sp.stage.status === "planned" ||
                  !sp.unlocked ||
                  !sp.stage.cardId;
                return (
                  <li
                    key={sp.stage.stageId}
                    className={cn(
                      "codex-spread__tree-node",
                      sp.unlocked && "is-unlocked",
                      locked && "is-locked",
                    )}
                  >
                    <span className="codex-spread__pip" aria-hidden />
                    <div>
                      <em>{sp.stage.label}</em>
                      <strong>
                        {locked && !sp.unlocked
                          ? "??????"
                          : sp.stage.displayName}
                      </strong>
                      <p>
                        {sp.unlocked
                          ? sp.stage.flavorText
                          : sp.stage.status === "planned"
                            ? "Planned chapter — silhouette only."
                            : "Undiscovered — collect to reveal."}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="codex-spread__block">
            <h2>Lore</h2>
            {loreUnlocked.length === 0 ? (
              <p className="codex-spread__muted">
                Collect a Bond Companion to open Origin.
              </p>
            ) : (
              <ul className="codex-spread__lore">
                {loreUnlocked.map((ch) => (
                  <li key={ch.id}>
                    <h3>{ch.title}</h3>
                    <p>{ch.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>

        {/* RIGHT PAGE — variants / progress / viewer */}
        <article className="codex-spread__page codex-spread__page--right">
          <div className="codex-spread__score">
            <strong>{percent}%</strong>
            <span>line progress</span>
          </div>

          <section className="codex-spread__block">
            <h2>Variants</h2>
            <ul className="codex-spread__variants">
              {stages.map((sp, idx) => {
                const card =
                  sp.stage.cardId ? getCardById(sp.stage.cardId) : null;
                const art =
                  card?.art.assetPath ||
                  (card ? resolveCardImagePath(card) : family.portraitArtPath);
                const showCard =
                  sp.stage.status === "released" && card && sp.unlocked;

                return (
                  <motion.li
                    key={sp.stage.stageId}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx, 6) * 0.05 }}
                  >
                    {showCard ? (
                      <RiftCardFrame
                        size="sm"
                        name={sp.stage.displayName}
                        riftCost={card.energyCost}
                        typeLine={`${card.type} · ${family.affinity}`}
                        rarity={card.rarity}
                        affinity={family.affinity}
                        rulesText={card.localization.rulesText}
                        attack={card.attack}
                        defense={card.defense}
                        speed={card.speed}
                        health={card.health}
                        artSrc={resolveCardImagePath(card) || art}
                        cardFaceSrc={resolveCardImagePath(card)}
                        ownedCount={sp.owned}
                        finish={
                          sp.finishesOwned.includes("foil") ? "foil" : "standard"
                        }
                        onClick={() => {
                          playSfx("codex.inspect");
                          setFocusDefId(card.id);
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="codex-spread__silhouette"
                        title={sp.stage.label}
                        data-audio-cue="codex.silhouette.locked"
                        onClick={() => playSfx("codex.locked")}
                      >
                        <span />
                        <p>{sp.stage.label}</p>
                        <em>
                          {sp.stage.status === "planned"
                            ? "Planned"
                            : "Locked"}
                        </em>
                      </button>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </section>

          <section className="codex-spread__block">
            <h2>Finishes</h2>
            <p className="codex-spread__muted">
              Foil / Goldleaf / Crystal / Animated never grant competitive power.
            </p>
            <ul className="codex-spread__finishes">
              {finishes.map((f) => (
                <li key={f.id} className={cn(f.ownedAny && "is-owned")}>
                  <span>{f.label}</span>
                  <em>{f.ownedAny ? "Seen" : "Locked"}</em>
                </li>
              ))}
            </ul>
          </section>

          <section className="codex-spread__block">
            <h2>Completion reward</h2>
            <p>
              {rewardReady
                ? `${family.completionReward.label} — ${family.completionReward.notes}`
                : `Collect all released stages to earn ${family.completionReward.label}.`}
            </p>
            {rewardReady && onClaimReward ? (
              <button
                type="button"
                className="codex-spread__claim"
                disabled={rewardClaimed}
                onClick={() => {
                  playSfx("codex.reward");
                  onClaimReward();
                }}
                data-audio-cue="codex.reward.claim"
              >
                {rewardClaimed
                  ? "Title claimed (cosmetic)"
                  : "Claim cosmetic title"}
              </button>
            ) : null}
          </section>

          {focusDefId ? (
            <div className="codex-spread__viewer-wrap">
              <CodexCardViewer
                defId={focusDefId}
                finish={focusFinish}
                onClose={() => setFocusDefId(null)}
              />
              <button
                type="button"
                className="codex-spread__claim"
                onClick={() => onInspectCard(focusDefId)}
                data-audio-cue="codex.lore.open"
              >
                Open lore journal
              </button>
            </div>
          ) : null}

          <div className="codex-spread__nav">
            <Link href="/tcg/codex">← Codex contents</Link>
            <Link href={`/codex/riftlings/${family.speciesSlug}`}>
              Riftling Codex
            </Link>
            <Link href="/hatchery">Hatchery</Link>
            <Link href="/tcg/museum">Museum hall</Link>
            <Link href="/tcg/collection">Collection Book</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
