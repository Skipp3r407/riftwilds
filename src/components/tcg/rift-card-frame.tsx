"use client";

/**
 * Legacy frame API — thin adapter over MasterCardTemplate so every surface
 * (collection, deck builder, pack open, Codex) uses the premium layout.
 */

import type { ReactNode } from "react";
import {
  MasterCardTemplate,
  type CardTemplateSize,
} from "@/components/tcg/master-card-template";

export type RiftCardFrameProps = {
  name: string;
  riftCost: number;
  typeLine: string;
  rarity: string;
  affinity?: string;
  rulesText?: string;
  attack?: number | null;
  defense?: number | null;
  health?: number | null;
  speed?: number | null;
  /** Prefer creature/source art for full-bleed; falls back to card face. */
  artSrc?: string | null;
  cardFaceSrc?: string | null;
  ownedCount?: number | null;
  finish?: "standard" | "foil" | "gold" | "crystal" | "animated";
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  exhausted?: boolean;
  dimmed?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
  footerSlot?: ReactNode;
  /** Optional richer fields when callers have them. */
  keywords?: string[];
  role?: string | null;
  familyId?: string | null;
  evolutionStage?: string | null;
  collectionNumber?: number | null;
  expansionSet?: string | null;
  contentType?: string;
  element?: string;
};

function sizeMap(size: "sm" | "md" | "lg"): CardTemplateSize {
  if (size === "sm") return "thumb";
  if (size === "lg") return "inspect";
  return "collection";
}

function parseTypeLine(typeLine: string): { type: string; element: string } {
  const parts = typeLine.split("·").map((p) => p.trim());
  const type = parts[0] || "card";
  const element = parts[1] || "neutral";
  return { type, element };
}

/**
 * AAA Riftwilds card chrome — delegates to MasterCardTemplate.
 */
export function RiftCardFrame({
  name,
  riftCost,
  typeLine,
  rarity,
  affinity,
  rulesText,
  attack,
  defense,
  health,
  speed,
  artSrc,
  cardFaceSrc,
  ownedCount,
  finish = "standard",
  size = "md",
  selected,
  exhausted,
  dimmed,
  interactive = true,
  className,
  onClick,
  footerSlot,
  keywords,
  role,
  familyId,
  evolutionStage,
  collectionNumber,
  expansionSet,
  contentType,
  element,
}: RiftCardFrameProps) {
  const parsed = parseTypeLine(typeLine);
  const type = contentType || parsed.type;
  const el =
    element ||
    (affinity ? affinity.toLowerCase() : parsed.element.toLowerCase());

  return (
    <MasterCardTemplate
      name={name}
      energyCost={riftCost}
      type={type}
      element={el}
      rarity={rarity}
      role={role}
      attack={attack}
      defense={defense}
      health={health}
      speed={speed}
      keywords={keywords}
      rulesText={rulesText}
      artSrc={artSrc}
      legacyFaceSrc={cardFaceSrc}
      finish={finish}
      size={sizeMap(size)}
      selected={selected}
      exhausted={exhausted}
      dimmed={dimmed}
      interactive={interactive}
      className={className}
      onClick={onClick}
      footerSlot={footerSlot}
      ownedCount={ownedCount}
      familyId={familyId}
      evolutionStage={evolutionStage}
      collectionNumber={collectionNumber}
      expansionSet={expansionSet}
      attackMod={
        ["equipment", "relic", "artifact"].includes(type.toLowerCase())
          ? attack
          : undefined
      }
      defenseMod={
        ["equipment", "relic", "artifact"].includes(type.toLowerCase())
          ? defense
          : undefined
      }
      durability={
        ["equipment", "relic", "artifact"].includes(type.toLowerCase())
          ? 3
          : undefined
      }
      eligibleTarget={
        ["equipment", "relic", "artifact"].includes(type.toLowerCase())
          ? "friendly unit"
          : undefined
      }
      spellSpeed={type.toLowerCase() === "spell" ? "instant" : undefined}
      targetType={
        type.toLowerCase() === "spell" || type.toLowerCase() === "trap"
          ? "enemy / board"
          : undefined
      }
      duration={
        ["location", "weather", "terrain"].includes(type.toLowerCase())
          ? "1 turn"
          : undefined
      }
      globalEffect={
        ["location", "weather", "terrain"].includes(type.toLowerCase())
          ? "+1 Defense allies"
          : undefined
      }
    />
  );
}
