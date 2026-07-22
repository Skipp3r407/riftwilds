"use client";

/**
 * Master dynamic card template — stats/labels composed from gameplay data.
 * Source art stays clean (no baked ATK/HP). Progressive disclosure by size.
 */

import { useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ROLE_DISPLAY } from "@/content/tcg/framework/roles";
import { cn } from "@/lib/utils/cn";

export type CardTemplateSize =
  | "thumb"
  | "hand"
  | "field"
  | "collection"
  | "inspect";

export type MasterCardTemplateProps = {
  name: string;
  energyCost: number;
  type: string;
  element: string;
  rarity: string;
  role?: string | null;
  attack?: number | null;
  defense?: number | null;
  health?: number | null;
  speed?: number | null;
  keywords?: string[];
  rulesText?: string | null;
  abilitySummary?: string | null;
  /** Clean art only — never a baked-stat face when avoidable. */
  artSrc?: string | null;
  /** Legacy baked face fallback. */
  legacyFaceSrc?: string | null;
  finish?: "standard" | "foil" | "gold" | "crystal" | "animated";
  /** Founder/Champion finishes are cosmetic-only. */
  cosmeticOnly?: boolean;
  size?: CardTemplateSize;
  selected?: boolean;
  exhausted?: boolean;
  dimmed?: boolean;
  playable?: boolean;
  /** Live board overlays */
  liveAttack?: number | null;
  liveDefense?: number | null;
  liveHealth?: number | null;
  liveMaxHealth?: number | null;
  liveSpeed?: number | null;
  statuses?: string[];
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
  footerSlot?: ReactNode;
  /** Identity / set metadata */
  familyId?: string | null;
  evolutionStage?: string | null;
  collectionNumber?: number | null;
  expansionSet?: string | null;
  artist?: string | null;
  ownedCount?: number | null;
  /** Spell layout */
  spellSpeed?: string | null;
  targetType?: string | null;
  /** Equipment layout */
  attackMod?: number | null;
  defenseMod?: number | null;
  durability?: number | null;
  eligibleTarget?: string | null;
  /** Terrain layout */
  duration?: string | null;
  globalEffect?: string | null;
  /** Commander layout */
  leaderAbility?: string | null;
  ultimate?: string | null;
};

const RARITY_GLOW: Record<string, string> = {
  common: "rgba(180,180,190,0.35)",
  uncommon: "rgba(90,200,120,0.45)",
  rare: "rgba(61,155,255,0.55)",
  epic: "rgba(180,120,255,0.55)",
  legendary: "rgba(255,184,77,0.65)",
  mythic: "rgba(255,100,80,0.7)",
  founder: "rgba(255,230,120,0.55)",
  champion: "rgba(255,200,90,0.55)",
};

const ELEMENT_CSS: Record<string, string> = {
  fire: "var(--ember, #ff6b3d)",
  water: "var(--tide, #3db8ff)",
  nature: "var(--grove, #5dcc7a)",
  earth: "#c4a574",
  storm: "var(--storm, #7eb6ff)",
  crystal: "#7fd4ff",
  shadow: "#8b6cff",
  light: "#ffe08a",
  spirit: "var(--cyan, #3de7ff)",
  arcane: "#b388ff",
  poison: "#8fd94a",
  metal: "#a8b0bc",
  celestial: "#ffd6a0",
  void: "#6a5acd",
  neutral: "#9aa3b2",
};

function rarityKey(r: string) {
  return r.toLowerCase();
}

function sizeClass(size: CardTemplateSize): string {
  switch (size) {
    case "thumb":
      return "rift-card--sm master-card--thumb";
    case "hand":
      return "rift-card--md master-card--hand";
    case "field":
      return "rift-card--sm master-card--field";
    case "collection":
      return "rift-card--md master-card--collection";
    case "inspect":
      return "rift-card--lg master-card--inspect";
    default:
      return "rift-card--md";
  }
}

export function layoutForType(type: string): string {
  const t = type.toLowerCase();
  // Canonical categories
  if (t === "companion" || t === "unit") return "companion";
  if (t === "evolution") return "evolution";
  if (t === "commander" || t === "hero") return "commander";
  if (t === "spell") return "spell";
  if (t === "item") return "item";
  if (t === "equipment") return "equipment";
  if (t === "relic" || t === "artifact") return "relic";
  if (t === "terrain" || t === "location" || t === "weather") return "terrain";
  if (t === "trap") return "trap";
  // Legacy aliases
  if (["creature", "legendary", "token"].includes(t)) return "companion";
  return "other";
}

function familyLabel(familyId?: string | null): string | null {
  if (!familyId) return null;
  return familyId.replace(/^family-/, "").replace(/-/g, " ");
}

function SpecializedStatBar(props: {
  layout: string;
  size: CardTemplateSize;
  atk: number | null | undefined;
  def: number | null | undefined;
  hp: number | null | undefined;
  maxHp: number | null | undefined;
  spd: number | null | undefined;
  showSpeed: boolean;
  spellSpeed?: string | null;
  targetType?: string | null;
  attackMod?: number | null;
  defenseMod?: number | null;
  durability?: number | null;
  eligibleTarget?: string | null;
  duration?: string | null;
  globalEffect?: string | null;
  leaderAbility?: string | null;
  ultimate?: string | null;
}) {
  const {
    layout,
    size,
    atk,
    def,
    hp,
    maxHp,
    spd,
    showSpeed,
    spellSpeed,
    targetType,
    attackMod,
    defenseMod,
    durability,
    eligibleTarget,
    duration,
    globalEffect,
    leaderAbility,
    ultimate,
  } = props;

  if (layout === "companion" || layout === "evolution" || layout === "creature") {
    return (
      <div className="rift-card__stats master-card__stats">
        <span className="rift-card__stat rift-card__stat--atk" title="Attack">
          <i aria-hidden />
          {atk ?? "—"}
        </span>
        <span className="rift-card__stat rift-card__stat--def" title="Defense">
          <i aria-hidden />
          {def ?? "—"}
        </span>
        <span className="rift-card__stat rift-card__stat--hp" title="Health">
          <i aria-hidden />
          {hp ?? "—"}
          {size === "field" && maxHp != null && hp != null && hp !== maxHp
            ? `/${maxHp}`
            : ""}
        </span>
        {showSpeed ? (
          <span className="rift-card__stat rift-card__stat--spd" title="Speed">
            <i aria-hidden />
            {spd ?? "—"}
          </span>
        ) : null}
        {layout === "evolution" ? (
          <span className="master-card__spell-tag master-card__spell-tag--evo">
            evo
          </span>
        ) : null}
      </div>
    );
  }

  if (layout === "commander") {
    return (
      <div className="rift-card__stats master-card__stats master-card__stats--commander">
        <span className="rift-card__stat rift-card__stat--hp" title="Commander Health">
          <i aria-hidden />
          {hp ?? atk ?? "—"}
        </span>
        {showSpeed ? (
          <span className="master-card__meta-chip" title="Leader">
            {leaderAbility || "Leader"}
          </span>
        ) : null}
        {size === "inspect" && ultimate ? (
          <span className="master-card__meta-chip" title="Ultimate">
            {ultimate}
          </span>
        ) : null}
      </div>
    );
  }

  if (layout === "spell") {
    return (
      <div className="rift-card__stats rift-card__stats--spell master-card__stats--spell">
        <span className="master-card__spell-tag">spell</span>
        {spellSpeed ? (
          <span className="master-card__meta-chip">{spellSpeed}</span>
        ) : null}
        {targetType ? (
          <span className="master-card__meta-chip">{targetType}</span>
        ) : null}
        {typeof atk === "number" && atk > 0 ? (
          <span className="rift-card__stat rift-card__stat--atk" title="Effect power">
            <i aria-hidden />
            {atk}
          </span>
        ) : null}
      </div>
    );
  }

  if (layout === "item") {
    return (
      <div className="rift-card__stats master-card__stats master-card__stats--item">
        <span className="master-card__spell-tag master-card__spell-tag--item">
          item
        </span>
        <span className="master-card__meta-chip" title="Consumable">
          consume
        </span>
        {targetType ? (
          <span className="master-card__meta-chip">{targetType}</span>
        ) : null}
        {typeof atk === "number" && atk > 0 ? (
          <span className="rift-card__stat rift-card__stat--hp" title="Heal / effect">
            <i aria-hidden />
            {atk}
          </span>
        ) : null}
      </div>
    );
  }

  if (layout === "trap") {
    return (
      <div className="rift-card__stats rift-card__stats--spell master-card__stats--trap">
        <span className="master-card__spell-tag master-card__spell-tag--trap">
          trap
        </span>
        <span className="master-card__meta-chip" title="Set face-down">
          face-down
        </span>
        {spellSpeed ? (
          <span className="master-card__meta-chip">{spellSpeed}</span>
        ) : null}
        {typeof atk === "number" && atk > 0 ? (
          <span className="rift-card__stat rift-card__stat--atk" title="Trigger power">
            <i aria-hidden />
            {atk}
          </span>
        ) : null}
      </div>
    );
  }

  if (layout === "equipment") {
    const aMod = attackMod ?? (typeof atk === "number" ? atk : null);
    const dMod = defenseMod ?? (typeof def === "number" ? def : null);
    return (
      <div className="rift-card__stats master-card__stats master-card__stats--equip">
        <span className="master-card__spell-tag">equip</span>
        {aMod != null ? (
          <span className="rift-card__stat rift-card__stat--atk" title="Attack modifier">
            <i aria-hidden />
            {aMod >= 0 ? `+${aMod}` : aMod}
          </span>
        ) : null}
        {dMod != null ? (
          <span className="rift-card__stat rift-card__stat--def" title="Defense modifier">
            <i aria-hidden />
            {dMod >= 0 ? `+${dMod}` : dMod}
          </span>
        ) : null}
        {durability != null ? (
          <span className="master-card__meta-chip" title="Durability">
            D{durability}
          </span>
        ) : null}
        {eligibleTarget && size !== "thumb" ? (
          <span className="master-card__meta-chip">{eligibleTarget}</span>
        ) : null}
      </div>
    );
  }

  if (layout === "relic") {
    return (
      <div className="rift-card__stats master-card__stats master-card__stats--relic">
        <span className="master-card__spell-tag master-card__spell-tag--relic">
          relic
        </span>
        <span className="master-card__meta-chip" title="Persists on board">
          permanent
        </span>
        {globalEffect && (size === "inspect" || size === "collection") ? (
          <span className="master-card__meta-chip">{globalEffect}</span>
        ) : null}
      </div>
    );
  }

  if (layout === "terrain") {
    return (
      <div className="rift-card__stats rift-card__stats--spell master-card__stats--terrain">
        <span className="master-card__spell-tag">terrain</span>
        {duration ? (
          <span className="master-card__meta-chip">{duration}</span>
        ) : null}
        {globalEffect && (size === "inspect" || size === "collection") ? (
          <span className="master-card__meta-chip">{globalEffect}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rift-card__stats rift-card__stats--spell">
      <span className="master-card__spell-tag">{layout}</span>
    </div>
  );
}

/**
 * AAA master card chrome — dynamic stats from data; clean art plane.
 */
export function MasterCardTemplate({
  name,
  energyCost,
  type,
  element,
  rarity,
  role,
  attack,
  defense,
  health,
  speed,
  keywords = [],
  rulesText,
  abilitySummary,
  artSrc,
  legacyFaceSrc,
  finish = "standard",
  cosmeticOnly,
  size = "collection",
  selected,
  exhausted,
  dimmed,
  playable,
  liveAttack,
  liveDefense,
  liveHealth,
  liveMaxHealth,
  liveSpeed,
  statuses = [],
  interactive = true,
  className,
  onClick,
  footerSlot,
  familyId,
  evolutionStage,
  collectionNumber,
  expansionSet,
  artist,
  ownedCount,
  spellSpeed,
  targetType,
  attackMod,
  defenseMod,
  durability,
  eligibleTarget,
  duration,
  globalEffect,
  leaderAbility,
  ultimate,
}: MasterCardTemplateProps) {
  const reduceMotion = useReducedMotion();
  const [artFailed, setArtFailed] = useState(false);
  const [faceFailed, setFaceFailed] = useState(false);
  const glow = RARITY_GLOW[rarityKey(rarity)] ?? RARITY_GLOW.common;
  const elementColor = ELEMENT_CSS[element.toLowerCase()] ?? ELEMENT_CSS.neutral;
  const showArt = Boolean(artSrc && !artFailed);
  const showFace = !showArt && Boolean(legacyFaceSrc && !faceFailed);
  const layout = layoutForType(type);
  const showRules = size === "inspect" || size === "collection" || size === "hand";
  const showSpeed = size === "inspect" || size === "field" || size === "collection";
  const showRole = size !== "thumb" && Boolean(role);
  const showKeywords =
    (size === "inspect" || size === "collection") && keywords.length > 0;
  const fam = familyLabel(familyId);

  const atk = liveAttack ?? attack;
  const def = liveDefense ?? defense;
  const hp = liveHealth ?? health;
  const maxHp = liveMaxHealth ?? health;
  const spd = liveSpeed ?? speed;

  const typeLine = [
    type,
    element,
    showRole ? ROLE_DISPLAY[role!] ?? role : null,
    size !== "thumb" && evolutionStage ? evolutionStage : null,
    size !== "thumb" && fam ? fam : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const setFooter =
    size === "inspect" || size === "collection"
      ? [
          expansionSet ? expansionSet.replace(/-/g, " ") : null,
          collectionNumber != null ? `#${collectionNumber}` : null,
          artist ? artist : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  const body = (
    <>
      <div className="rift-card__bevel" aria-hidden />
      <div className="rift-card__shine" aria-hidden />

      <div className="rift-card__art">
        {showArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artSrc!}
            alt=""
            className="rift-card__art-img"
            loading="lazy"
            decoding="async"
            onError={() => setArtFailed(true)}
          />
        ) : showFace ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={legacyFaceSrc!}
            alt=""
            className="rift-card__art-img rift-card__art-img--face"
            loading="lazy"
            decoding="async"
            onError={() => setFaceFailed(true)}
          />
        ) : (
          <div className="rift-card__art-fallback">{name}</div>
        )}
        <div className="rift-card__art-vignette" aria-hidden />
      </div>

      <header className="rift-card__header">
        <h3 className="rift-card__name">{name}</h3>
        <span
          className="rift-card__cost"
          aria-label={`Rift Energy ${energyCost}`}
        >
          {energyCost}
        </span>
      </header>

      <div className="rift-card__info">
        <div className="rift-card__typebar">
          <span>{typeLine}</span>
          <span
            className="rift-card__affinity"
            style={{ "--aff": elementColor } as CSSProperties}
            aria-hidden
          />
        </div>

        {showRules && (abilitySummary || rulesText) ? (
          <p className="rift-card__rules">{abilitySummary || rulesText}</p>
        ) : null}

        {showKeywords ? (
          <p className="master-card__keywords" aria-label="Keywords">
            {keywords.slice(0, size === "inspect" ? 8 : 4).join(" · ")}
          </p>
        ) : null}

        <footer className="rift-card__footer">
          <SpecializedStatBar
            layout={layout}
            size={size}
            atk={atk}
            def={def}
            hp={hp}
            maxHp={maxHp}
            spd={spd}
            showSpeed={showSpeed}
            spellSpeed={spellSpeed}
            targetType={targetType}
            attackMod={attackMod}
            defenseMod={defenseMod}
            durability={durability}
            eligibleTarget={eligibleTarget}
            duration={duration}
            globalEffect={globalEffect}
            leaderAbility={leaderAbility}
            ultimate={ultimate}
          />
          <p className="rift-card__rarity">
            {rarity}
            {cosmeticOnly ? " · cosmetic" : ""}
            {setFooter ? ` · ${setFooter}` : ""}
          </p>
          {footerSlot}
        </footer>
      </div>

      {exhausted ? (
        <span className="master-card__badge master-card__badge--exhausted">
          Resting
        </span>
      ) : null}
      {playable === false && !exhausted ? (
        <span className="master-card__badge master-card__badge--locked">
          Unplayable
        </span>
      ) : null}
      {statuses.length > 0 && size !== "thumb" ? (
        <ul className="master-card__statuses" aria-label="Statuses">
          {statuses.slice(0, 4).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ) : null}
      {typeof ownedCount === "number" ? (
        <span
          className="rift-card__owned"
          title={`Copies owned: ${ownedCount}`}
          aria-label={`Copies owned: ${ownedCount}`}
        >
          <em className="rift-card__owned-label">Copies owned</em>
          <strong>{ownedCount}</strong>
        </span>
      ) : null}
    </>
  );

  const classes = cn(
    "rift-card",
    "master-card",
    sizeClass(size),
    `master-card--layout-${layout}`,
    `master-card--element-${element.toLowerCase()}`,
    `rift-card--finish-${finish}`,
    `rift-card--rarity-${rarityKey(rarity)}`,
    selected && "rift-card--selected",
    exhausted && "rift-card--exhausted",
    dimmed && "rift-card--dimmed",
    playable === false && "master-card--unplayable",
    className,
  );

  const style = {
    "--rift-rarity-glow": glow,
    "--master-element": elementColor,
  } as CSSProperties;

  const ariaSummary = [
    name,
    `${energyCost} energy`,
    type,
    element,
    layout === "creature" || layout === "commander"
      ? `${atk ?? "—"} attack, ${def ?? "—"} defense, ${hp ?? "—"} health`
      : null,
    abilitySummary || rulesText,
  ]
    .filter(Boolean)
    .join(". ");

  if (!interactive) {
    return (
      <div className={classes} style={style} role="img" aria-label={ariaSummary}>
        {body}
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      className={classes}
      style={style}
      onClick={onClick}
      aria-label={ariaSummary}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -6, rotateX: 4, rotateY: -3, scale: 1.02 }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
    >
      {body}
    </motion.button>
  );
}

/** Convenience: build template props from an engine card def. */
export function propsFromCardDef(
  def: {
    name: string;
    riftCost: number;
    contentType?: string;
    type: string;
    element?: string;
    rarity: string;
    role?: string;
    attack?: number;
    defense?: number;
    health?: number;
    speed?: number;
    keywords?: string[];
    description?: string;
    passive?: string | null;
    activeSummary?: string | null;
    cleanArtPath?: string;
    artPath?: string;
    cardImagePath?: string;
    familyId?: string;
    ultimateSummary?: string | null;
  },
  size: CardTemplateSize = "collection",
  extra?: Partial<MasterCardTemplateProps>,
): MasterCardTemplateProps {
  const contentType = def.contentType ?? def.type;
  const layout = layoutForType(contentType);
  return {
    name: def.name,
    energyCost: def.riftCost,
    type: contentType,
    element: def.element ?? "neutral",
    rarity: def.rarity,
    role: def.role,
    attack: def.attack,
    defense: def.defense,
    health: def.health,
    speed: def.speed,
    keywords: def.keywords ?? [],
    rulesText: def.description,
    abilitySummary: def.activeSummary ?? def.passive,
    artSrc: def.cleanArtPath ?? def.artPath,
    legacyFaceSrc: def.cardImagePath,
    familyId: def.familyId,
    leaderAbility: layout === "commander" ? def.passive : undefined,
    ultimate: layout === "commander" ? def.ultimateSummary : undefined,
    spellSpeed: layout === "spell" || layout === "trap" ? "instant" : undefined,
    targetType:
      layout === "spell" || layout === "trap" ? "enemy / board" : undefined,
    attackMod: layout === "equipment" ? def.attack : undefined,
    defenseMod: layout === "equipment" ? def.defense : undefined,
    durability: layout === "equipment" ? 3 : undefined,
    eligibleTarget: layout === "equipment" ? "friendly unit" : undefined,
    duration: layout === "terrain" ? "1 turn" : undefined,
    globalEffect: layout === "terrain" ? "+1 Defense allies" : undefined,
    size,
    ...extra,
  };
}
