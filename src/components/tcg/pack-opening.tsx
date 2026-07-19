"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { RiftCardFrame } from "@/components/tcg/rift-card-frame";
import { RiftButton } from "@/components/ui/rift-button";
import {
  TCG_STARTER_SET_20,
  getCardById,
  normalizeCard,
  resolveCardImagePath,
} from "@/content/tcg";

/**
 * Cinematic pack-opening shell for Credits packs.
 * Reveals are demo picks from Showcase Twenty — not a paid RNG power sink.
 */
export function PackOpeningShell({
  packName = "Ember Spark Pack",
}: {
  packName?: string;
}) {
  const [phase, setPhase] = useState<"idle" | "opening" | "reveal">("idle");
  const [reveals, setReveals] = useState<string[]>([]);
  const reduce = useReducedMotion();

  function openPack() {
    setPhase("opening");
    const pool = [...TCG_STARTER_SET_20.cardIds];
    const picks: string[] = [];
    for (let i = 0; i < 3 && pool.length > 0; i += 1) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool.splice(idx, 1)[0]!);
    }
    window.setTimeout(
      () => {
        setReveals(picks);
        setPhase("reveal");
      },
      reduce ? 120 : 900,
    );
  }

  return (
    <section className="pack-open rift-material-gold rift-panel--filigree">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--amber)]">
            Pack ritual
          </p>
          <h2 className="font-display text-xl text-[var(--text)]">{packName}</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Demo reveal — Credits path. Foil finishes cosmetic only. No
            pay-to-win.
          </p>
        </div>
        {phase !== "opening" ? (
          <RiftButton tone="gold" size="sm" onClick={openPack}>
            {phase === "reveal" ? "Open another" : "Tear seal"}
          </RiftButton>
        ) : null}
      </header>

      <div className="pack-open__stage">
        <AnimatePresence mode="wait">
          {phase !== "reveal" ? (
            <motion.div
              key="pack"
              className="pack-open__pack"
              initial={reduce ? false : { scale: 0.92, opacity: 0.7 }}
              animate={
                reduce
                  ? { opacity: phase === "opening" ? 0.5 : 1 }
                  : phase === "opening"
                    ? {
                        scale: [1, 1.08, 0.4],
                        rotate: [0, -6, 12],
                        opacity: [1, 1, 0],
                      }
                    : { scale: 1, opacity: 1 }
              }
              transition={{ duration: phase === "opening" ? 0.85 : 0.35 }}
            >
              Rift Pack
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {phase === "reveal" ? (
        <ul className="pack-open__reveals">
          {reveals.map((id, i) => {
            const raw = getCardById(id);
            if (!raw) return null;
            const card = normalizeCard(raw);
            return (
              <motion.li
                key={id}
                initial={reduce ? false : { y: 40, opacity: 0, rotateY: -20 }}
                animate={{ y: 0, opacity: 1, rotateY: 0 }}
                transition={
                  reduce
                    ? { duration: 0.01 }
                    : { delay: i * 0.12, type: "spring", stiffness: 260 }
                }
              >
                <RiftCardFrame
                  name={card.localization.name}
                  riftCost={card.energyCost}
                  typeLine={`${card.type} · ${card.element}`}
                  rarity={card.rarity}
                  affinity={card.element}
                  contentType={card.type}
                  element={card.element}
                  rulesText={card.localization.rulesText}
                  attack={card.attack}
                  defense={card.defense}
                  health={card.health}
                  speed={card.speed}
                  keywords={card.keywords}
                  familyId={card.familyId}
                  evolutionStage={card.evolutionStage}
                  collectionNumber={card.collectorNumber}
                  expansionSet={card.expansionId}
                  artSrc={card.cleanArtPath || resolveCardImagePath(card)}
                  cardFaceSrc={resolveCardImagePath(card)}
                  finish={i === 0 ? "foil" : "standard"}
                  interactive={false}
                />
              </motion.li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
