/**
 * Equipment attach helpers — ATK/DEF mods + keyword grants from content abilities.
 * Cosmetics never flow through here.
 */

import { getCardById } from "@/content/tcg";
import { addStatus, type TcgStatusInstance } from "@/game/tcg/combat/status";
import {
  canonicalizeKeyword,
  normalizeKeywordList,
} from "@/game/tcg/combat/keywords";

export type EquipmentMods = {
  attackMod: number;
  defenseMod: number;
  durability: number;
  grantedKeywords: string[];
  rulesSummary: string;
};

const KEYWORD_FROM_TEXT: Array<[RegExp, string]> = [
  [/\bbloom\b/i, "bloom"],
  [/\bward\b/i, "ward"],
  [/\bguardian\b|\btaunt\b|\bguard\b/i, "guardian"],
  [/\bcharge\b/i, "charge"],
  [/\bflying\b/i, "flying"],
  [/\bpoison\b/i, "poison"],
];

export function isEquipmentContentType(type: string | undefined): boolean {
  const t = (type ?? "").toLowerCase();
  // Relics are board artifacts — not attach equipment.
  return t === "equipment";
}

export function isRelicContentType(type: string | undefined): boolean {
  const t = (type ?? "").toLowerCase();
  return t === "relic" || t === "artifact";
}

export function isTerrainContentType(type: string | undefined): boolean {
  const t = (type ?? "").toLowerCase();
  return t === "location" || t === "weather" || t === "terrain";
}

export function isItemContentType(type: string | undefined): boolean {
  return (type ?? "").toLowerCase() === "item";
}

export function isTrapContentType(type: string | undefined): boolean {
  return (type ?? "").toLowerCase() === "trap";
}

/** Derive attach mods from content card (or engine def fields). */
export function deriveEquipmentMods(input: {
  defId: string;
  riftCost: number;
  description?: string;
  attack?: number;
  defense?: number;
  keywords?: string[];
}): EquipmentMods {
  const raw = getCardById(input.defId);
  let attackMod = 0;
  let defenseMod = 0;
  let durability = Math.max(1, Math.min(5, 3 - Math.floor((input.riftCost - 1) / 3)));
  const granted = new Set<string>();

  if (raw) {
    for (const ab of raw.abilities ?? []) {
      for (const fx of ab.effects ?? []) {
        if (fx.op === "buff_atk" && typeof fx.value === "number") {
          attackMod += fx.value;
        }
        if (fx.op === "buff_hp" && typeof fx.value === "number") {
          // HP buff on equip → defense-ish toughness for board units
          defenseMod += Math.max(0, Math.floor(fx.value / 2));
        }
        if (fx.op === "apply_keyword" && fx.keyword) {
          granted.add(canonicalizeKeyword(fx.keyword));
        }
        const text = `${ab.text ?? ""} ${fx.notes ?? ""}`;
        for (const [re, kw] of KEYWORD_FROM_TEXT) {
          if (re.test(text)) granted.add(kw);
        }
      }
      for (const [re, kw] of KEYWORD_FROM_TEXT) {
        if (re.test(ab.text ?? "")) granted.add(kw);
      }
    }
    for (const [re, kw] of KEYWORD_FROM_TEXT) {
      if (re.test(raw.localization?.rulesText ?? "")) granted.add(kw);
    }
  }

  // Soft curve from cost when abilities don't specify mods
  if (attackMod === 0 && defenseMod === 0 && granted.size === 0) {
    const cost = Math.max(0, input.riftCost);
    attackMod = Math.max(0, Math.floor((cost + 1) / 2));
    defenseMod = Math.max(0, Math.floor(cost / 2));
  }

  // Explicit overlay-ish fields from engine def
  if (typeof input.attack === "number" && input.attack > 0 && attackMod === 0) {
    attackMod = input.attack;
  }
  if (typeof input.defense === "number" && input.defense > 0 && defenseMod === 0) {
    defenseMod = input.defense;
  }
  for (const k of input.keywords ?? []) {
    granted.add(canonicalizeKeyword(k));
  }

  const rulesSummary =
    raw?.localization?.rulesText ||
    input.description ||
    `+${attackMod}/+${defenseMod}`;

  return {
    attackMod,
    defenseMod,
    durability,
    grantedKeywords: normalizeKeywordList([...granted]),
    rulesSummary,
  };
}

export function applyEquipmentToUnit(input: {
  attack: number;
  defense: number;
  health: number;
  maxHealth: number;
  keywords: string[];
  statuses: TcgStatusInstance[];
  equipmentIds: string[];
  mods: EquipmentMods;
  equipmentDefId: string;
}): {
  attack: number;
  defense: number;
  health: number;
  maxHealth: number;
  keywords: string[];
  statuses: TcgStatusInstance[];
  equipmentIds: string[];
} {
  const keywords = normalizeKeywordList([
    ...input.keywords,
    ...input.mods.grantedKeywords,
  ]);
  let statuses = addStatus(input.statuses, {
    id: "equipped",
    stacks: 1,
    duration: null,
    sourceInstanceId: input.equipmentDefId,
  });
  if (input.mods.grantedKeywords.includes("ward")) {
    statuses = addStatus(statuses, { id: "ward", stacks: 1, duration: null });
  }
  if (input.mods.grantedKeywords.includes("guardian")) {
    statuses = addStatus(statuses, { id: "taunt", stacks: 1, duration: null });
  }
  const maxHealth = input.maxHealth + Math.max(0, input.mods.defenseMod);
  return {
    attack: input.attack + input.mods.attackMod,
    defense: input.defense + input.mods.defenseMod,
    health: Math.min(input.health + Math.max(0, input.mods.defenseMod), maxHealth),
    maxHealth,
    keywords,
    statuses,
    equipmentIds: [...input.equipmentIds, input.equipmentDefId],
  };
}
