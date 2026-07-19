"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RiftCardFrame } from "@/components/tcg/rift-card-frame";
import { getCardById, resolveCardImagePath } from "@/content/tcg";
import { playSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils/cn";

type Props = {
  defId: string;
  ownedCount?: number;
  finish?: "standard" | "foil" | "gold" | "crystal" | "animated";
  className?: string;
  onClose?: () => void;
};

/**
 * Premium inspect surface — pointer tilt + foil, respects reduced motion.
 */
export function CodexCardViewer({
  defId,
  ownedCount,
  finish = "standard",
  className,
  onClose,
}: Props) {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const card = getCardById(defId);

  useEffect(() => {
    playSfx("codex.inspect");
  }, [defId]);

  if (!card) {
    return (
      <div className={cn("codex-viewer", className)}>
        <p className="codex-viewer__missing">Card not in catalog.</p>
      </div>
    );
  }

  const art = resolveCardImagePath(card) || card.art.assetPath;

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (0.5 - py) * 14,
      y: (px - 0.5) * 18,
    });
  }

  function onLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div
      className={cn("codex-viewer", className)}
      data-audio-cue="codex.card.inspect"
      data-finish={finish}
    >
      {onClose ? (
        <button
          type="button"
          className="codex-viewer__close"
          aria-label="Close card viewer"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          Close
        </button>
      ) : null}
      <div
        ref={wrapRef}
        className="codex-viewer__stage"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <motion.div
          className="codex-viewer__tilt"
          style={{
            transformStyle: "preserve-3d",
            perspective: 900,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  rotateX: tilt.x,
                  rotateY: tilt.y,
                }
          }
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <RiftCardFrame
            size="lg"
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
            collectionNumber={card.collectorNumber}
            expansionSet={card.expansionId}
            artSrc={art}
            cardFaceSrc={resolveCardImagePath(card)}
            ownedCount={ownedCount}
            finish={finish}
            interactive={false}
          />
          <div className="codex-viewer__glare" aria-hidden />
        </motion.div>
      </div>
      <p className="codex-viewer__flavor">{card.localization.flavorText}</p>
    </div>
  );
}
