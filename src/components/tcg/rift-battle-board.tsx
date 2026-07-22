"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Eye,
  Heart,
  History,
  Layers,
  LogOut,
  MoreHorizontal,
  Settings,
  UserPlus,
  Zap,
} from "lucide-react";
import { isEquipmentContentType } from "@/game/tcg/combat";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import { resolvePlayCost, playCostContextFromSide } from "@/game/tcg/play-cost";
import { MulliganPanel } from "@/components/tcg/mulligan-panel";
import { TCG_DEFAULTS, type TcgCardDef } from "@/game/tcg/types";
import { recordQuestMetric } from "@/game/quests/quest-demo-store";
import { TcgCardDetailModal } from "@/components/tcg/tcg-card-detail-modal";
import {
  BattleVfxLayer,
  BoardUnitShell,
  sideHasBoardPulse,
  sideHasMeterPulse,
  useBattleVfx,
} from "@/components/tcg/battle-vfx";
import { BattleEventFeed } from "@/components/tcg/battle-event-feed";
import {
  BattleLayoutSettings,
  BattleModeMenu,
} from "@/components/tcg/battle-mode-menu";
import { useBattleLayoutOptional } from "@/components/tcg/battle-layout-context";
import { FullscreenToggleButton } from "@/components/live-world/fullscreen-toggle-button";
import { useLiveWorldFullscreen } from "@/hooks/use-live-world-fullscreen";
import { playSfx } from "@/hooks/use-sfx";
import {
  adaptiveAudio,
  enterSoundscape,
} from "@/lib/audio/adaptive-engine";
import { playElementSfx } from "@/lib/audio/sfx";
import { speakVoice } from "@/lib/audio/voice-bus";
import {
  guestFetch,
  rememberGuestTokenFromPayload,
} from "@/lib/auth/guest-client";
import {
  readBattleFeedCollapsed,
  readBattleFeedWidth,
  readBattleIntelCollapsed,
  writeBattleFeedCollapsed,
  writeBattleFeedWidth,
  writeBattleIntelCollapsed,
} from "@/lib/tcg/battle-layout-prefs";
import { cn } from "@/lib/utils/cn";

const HAND_DRAG_MIME = "application/x-rift-hand-card";
const LONG_PRESS_MS = 420;
const DOUBLE_TAP_MS = 320;
const BOARD_CARD_SIZE_KEY = "riftwilds.battle.board-card-size";

type BoardCardSize = "s" | "m" | "l" | "xl";

const BOARD_CARD_SIZES: { id: BoardCardSize; label: string }[] = [
  { id: "s", label: "S" },
  { id: "m", label: "M" },
  { id: "l", label: "L" },
  { id: "xl", label: "XL" },
];

/** Default M is larger than the prior fixed board size so field cards fill the lanes. */
const DEFAULT_BOARD_CARD_SIZE: BoardCardSize = "m";

function readBoardCardSize(): BoardCardSize {
  if (typeof window === "undefined") return DEFAULT_BOARD_CARD_SIZE;
  try {
    const raw = localStorage.getItem(BOARD_CARD_SIZE_KEY);
    if (BOARD_CARD_SIZES.some((s) => s.id === raw)) {
      return raw as BoardCardSize;
    }
  } catch {
    /* ignore quota / private mode */
  }
  return DEFAULT_BOARD_CARD_SIZE;
}

function writeBoardCardSize(size: BoardCardSize) {
  try {
    localStorage.setItem(BOARD_CARD_SIZE_KEY, size);
  } catch {
    /* ignore quota / private mode */
  }
}

function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Fixed portal preview — escapes sidebar overflow / console frame mask. */
function HandCardHoverPreview({
  faceSrc,
  name,
  playCost,
  unaffordable,
  blockReason,
  anchorRef,
  reduceMotion,
}: {
  faceSrc: string | null;
  name: string;
  playCost?: number | null;
  unaffordable?: boolean;
  blockReason?: string | null;
  anchorRef: RefObject<HTMLElement | null>;
  reduceMotion: boolean;
}) {
  const [box, setBox] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pad = 12;
      const width = reduceMotion
        ? clamp(Math.round(rect.width * 1.2), 132, Math.min(168, vw - pad * 2))
        : clamp(Math.round(rect.width * 1.85), 168, Math.min(236, vw - pad * 2));
      const height = Math.round(width * (700 / 500));
      // Anchor near the hand card, floating up into the board safe area.
      let left = rect.left + rect.width / 2 - width / 2;
      let top = rect.bottom - height - Math.round(rect.height * 0.08);
      left = clamp(left, pad, vw - width - pad);
      top = clamp(top, pad, vh - height - pad);
      setBox({
        position: "fixed",
        left,
        top,
        width,
        height,
        // Above expanded battle chrome (80); below lore journal modal (100).
        zIndex: 90,
        // Never intercept hand drag / field drops.
        pointerEvents: "none",
      });
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [anchorRef, reduceMotion]);

  if (typeof document === "undefined" || !box) return null;

  return createPortal(
    <div
      className={cn(
        "battle-hand-card-preview",
        unaffordable && "battle-hand-card-preview--unaffordable",
      )}
      style={box}
      aria-hidden
      data-testid="battle-hand-card-preview"
    >
      <div className="battle-hand-card-preview__face">
        {faceSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={faceSrc} alt="" draggable={false} />
        ) : (
          <span className="battle-hand-card-preview__fallback">{name}</span>
        )}
        {playCost != null ? (
          <span
            className={cn(
              "battle-hand-card__cost battle-hand-card-preview__cost",
              unaffordable && "battle-hand-card__cost--blocked",
            )}
            aria-hidden
          >
            {playCost}
          </span>
        ) : null}
        {unaffordable && blockReason ? (
          <span className="battle-hand-card-preview__block" aria-hidden>
            {blockReason}
          </span>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

type ClientCard = { instanceId: string; defId: string };

type ClientUnit = {
  instanceId: string;
  defId: string;
  power: number;
  attack?: number;
  health?: number;
  maxHealth?: number;
  defense?: number;
  speed?: number;
  affinity: string;
  element?: string;
  keywords?: string[];
  statuses?: { id: string; stacks: number }[];
  exhausted: boolean;
  lane?: "front" | "back";
  cannotStrikeKeeper?: boolean;
};

type ClientCommander = {
  heroId: string;
  name: string;
  title?: string;
  factionId?: string;
} | null;

type ClientSide = {
  id: string;
  name: string;
  keeperHp: number;
  maxKeeperHp: number;
  riftEnergy: number;
  riftEnergyMax: number;
  tempEnergy?: number;
  energySpentThisTurn?: number;
  firstCompanionDiscountUsed?: boolean;
  temporaryPlayCostModifier?: number;
  playCostReduction?: number;
  hand: ClientCard[];
  handCount: number;
  deckCount: number;
  board: ClientUnit[];
  defeatedCount?: number;
  exileCount?: number;
  riftBurnCount?: number;
  isAi: boolean;
  commander?: ClientCommander;
  frontline?: ClientUnit[];
  backline?: ClientUnit[];
};

type Snapshot = {
  publicId: string;
  turn: number;
  status: "ACTIVE" | "COMPLETED";
  phase: string;
  activeSideId: string;
  winnerId: string | null;
  mode?: string;
  turnTimerSeconds?: number;
  rulesVersion?: string;
  fieldSlots?: {
    frontline: number;
    backline: number;
    terrain: number;
    maxCreatures: number;
  };
  yourSideId?: string;
  players: ClientSide[];
  events: { type: string; actorId: string; payload: Record<string, unknown> }[];
  encounter: {
    enemyId: string;
    regionSlug: string;
    returnTo: string;
  } | null;
};

type LobbyInfo = {
  code: string;
  status: string;
  inviteUrl?: string;
  invitePath?: string;
  hostName?: string;
  guestName?: string | null;
  youAre?: string;
};

const NOT_ENOUGH_RIFT_ENERGY = "Not enough Rift Energy.";

function isBattleDevMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.get("battleDev") === "1" || q.get("dev") === "1") return true;
    return window.localStorage.getItem("riftwilds.battleDev") === "1";
  } catch {
    return process.env.NODE_ENV === "development";
  }
}

function logClientRejectedPlay(
  reason: string,
  detail: Record<string, unknown>,
): void {
  if (isBattleDevMode() || process.env.NODE_ENV === "development") {
    console.info("[tcg] rejected play (client)", reason, detail);
  }
}

function handPlayCost(
  def: TcgCardDef,
  player: ClientSide,
): number {
  return resolvePlayCost(def, playCostContextFromSide(player)).cost;
}

function playBlockReason(
  def: TcgCardDef | null | undefined,
  player: ClientSide | null | undefined,
  snap: Snapshot | null | undefined,
  busy: boolean,
): string | null {
  if (!def || !player || !snap) return "No card selected";
  if (snap.status !== "ACTIVE") return "Match finished";
  if (snap.activeSideId !== player.id) return "Not your turn";
  if (snap.phase !== "MAIN" && snap.phase !== "SECOND_MAIN") {
    return "Can't play right now";
  }
  if (busy) return "Busy…";
  const ct = def.contentType ?? "";
  if (ct === "commander" || ct === "hero") {
    return "Commander sits in the hero slot — not playable from hand";
  }
  // Affordance must use engine play cost (riftCost + discounts), never power/attack.
  const playCost = handPlayCost(def, player);
  if (player.riftEnergy < playCost) {
    return NOT_ENOUGH_RIFT_ENERGY;
  }
  if (def.type === "UNIT" && player.board.length >= TCG_DEFAULTS.maxBoardUnits) {
    return `Board full (${TCG_DEFAULTS.maxBoardUnits}/${TCG_DEFAULTS.maxBoardUnits}) — End Turn to attack`;
  }
  if (
    isEquipmentContentType(def.contentType ?? "") &&
    player.board.length === 0
  ) {
    return "Needs a friendly unit to equip";
  }
  return null;
}

/** Banner under unaffordable hand cards — includes numeric cost for clarity. */
function unaffordableBanner(
  def: TcgCardDef,
  player: ClientSide,
): string {
  const playCost = handPlayCost(def, player);
  return `Costs ${playCost} · have ${player.riftEnergy}`;
}

/** True when the hand has at least one card the engine would accept right now. */
function hasLegalHandPlay(
  player: ClientSide | null | undefined,
  snap: Snapshot | null | undefined,
  busy: boolean,
): boolean {
  if (!player || !snap || busy) return false;
  if (snap.status !== "ACTIVE" || snap.activeSideId !== player.id) return false;
  if (snap.phase !== "MAIN" && snap.phase !== "SECOND_MAIN") return false;
  return player.hand.some((c) => {
    const def = getTcgCardDef(c.defId);
    return !playBlockReason(def, player, snap, busy);
  });
}

function turnGuidance(input: {
  isPlayerTurn: boolean;
  player: ClientSide | null | undefined;
  canPlaySelected: boolean;
  playDisabledReason: string | null;
  legalHandPlay: boolean;
  selectedName: string | null;
}): string {
  const { isPlayerTurn, player, canPlaySelected, playDisabledReason, legalHandPlay, selectedName } =
    input;
  if (!isPlayerTurn) return "Waiting for your turn";
  if (!player) return "Hover to read · click for bio · drag or Play to deploy";

  const boardFull = player.board.length >= TCG_DEFAULTS.maxBoardUnits;
  const resting = player.board.filter((u) => u.exhausted).length;
  const ready = player.board.filter((u) => !u.exhausted).length;

  if (selectedName) {
    if (canPlaySelected) return `Selected: ${selectedName} · ready to play`;
    return `Selected: ${selectedName} · ${playDisabledReason ?? "can't play"}`;
  }
  if (!legalHandPlay) {
    if (boardFull && ready > 0) {
      return `Board full · ${ready} ready to strike — End Turn to attack`;
    }
    if (boardFull && resting > 0) {
      return `Board full · units resting — End Turn (they strike next turn)`;
    }
    if (ready > 0) {
      return `${ready} ready to strike — End Turn to attack`;
    }
    return "No plays left — End Turn to continue";
  }
  if (boardFull) {
    return "Board full — select a spell, or End Turn to attack";
  }
  return "Select a card · drag or Play to deploy · End Turn to attack";
}

function CombatCommandActions({
  canPlaySelected,
  playDisabledReason,
  preferEndTurn,
  endTurnHint,
  onPlay,
  onEndTurn,
  onSurrender,
  onRematch,
  busy,
  matchStatus,
  placement = "bar",
}: {
  canPlaySelected: boolean;
  playDisabledReason: string | null;
  /** When no legal hand plays remain, spotlight End Turn. */
  preferEndTurn?: boolean;
  endTurnHint?: string;
  onPlay: () => void;
  onEndTurn: () => void;
  onSurrender: () => void;
  onRematch: () => void;
  busy: boolean;
  matchStatus: Snapshot["status"];
  placement?: "bar" | "header";
}) {
  const endTurnPrimary = Boolean(preferEndTurn) && matchStatus === "ACTIVE";
  return (
    <div
      className={cn(
        "battle-console__actions",
        placement === "header" && "battle-console__actions--header",
        endTurnPrimary && "battle-console__actions--end-turn-focus",
      )}
      aria-label="Combat actions"
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        disabled={!canPlaySelected}
        onClick={onPlay}
        className={cn(
          "battle-console__action focus-ring",
          !endTurnPrimary && "battle-console__action--primary",
        )}
        title={playDisabledReason ?? "Play selected card"}
      >
        Play card
        <small>{playDisabledReason ?? "Deploy to board"}</small>
      </motion.button>
      <button
        type="button"
        disabled={busy || matchStatus !== "ACTIVE"}
        onClick={onEndTurn}
        className={cn(
          "battle-console__action focus-ring",
          endTurnPrimary && "battle-console__action--primary",
        )}
        title={endTurnHint ?? "End turn and resolve attacks"}
      >
        End turn
        <small>{endTurnHint ?? "Resolve attacks"}</small>
      </button>
      <button
        type="button"
        disabled={busy || matchStatus !== "ACTIVE"}
        onClick={onSurrender}
        className="battle-console__action battle-console__action--danger focus-ring"
      >
        Surrender
        <small>Abort match</small>
      </button>
      {matchStatus === "COMPLETED" && (
        <button
          type="button"
          disabled={busy}
          onClick={onRematch}
          className="battle-console__action battle-console__action--primary focus-ring"
        >
          Rematch
          <small>Open new board</small>
        </button>
      )}
    </div>
  );
}

function CardFace({
  defId,
  selected,
  disabled,
  unaffordable,
  blockReason,
  playCost,
  shake,
  size = "hand",
  previewPinned,
  enableHoverZoom,
  onOpenDetail,
  onSelectForPlay,
  onPlay,
  draggable,
  onDragStart,
  onDragEnd,
}: {
  defId: string;
  selected?: boolean;
  disabled?: boolean;
  /** Dim + cost hint — still selectable so players see why it won't play. */
  unaffordable?: boolean;
  blockReason?: string | null;
  /** Engine play cost (printed ± discounts). Overlay corrects baked art. */
  playCost?: number | null;
  /** Illegal-play shake on this specific card. */
  shake?: boolean;
  size?: "hand" | "board";
  /** Touch: keep enlarged preview after tap / long-press. */
  previewPinned?: boolean;
  enableHoverZoom?: boolean;
  /** Single click / detail path — Lore Journal modal. */
  onOpenDetail?: () => void;
  /** Select for drag-target / Play button / field tap (no modal). */
  onSelectForPlay?: () => void;
  /** Double-tap / double-click play affordance. */
  onPlay?: () => void;
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLElement>) => void;
  onDragEnd?: (e: DragEvent<HTMLElement>) => void;
}) {
  const def = getTcgCardDef(defId);
  const reduceMotion = useReducedMotion();
  const [imgFailed, setImgFailed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const hoverLeaveTimer = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const lastTapAt = useRef(0);
  const sizeClass =
    size === "hand"
      ? "aspect-[500/700] w-[7.75rem] sm:w-[9rem] md:w-[10.25rem]"
      : "battle-board-card aspect-[500/700]";
  const isHand = size === "hand";
  // Never keep the hover portal up while dragging — but also never toggle
  // layout on pointerdown (that cancels HTML5 DnD mid-gesture).
  const zoomed =
    isHand &&
    enableHoverZoom &&
    !dragging &&
    (Boolean(previewPinned) || hovered);

  const clearLongPress = () => {
    if (longPressTimer.current != null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const clearHoverLeave = () => {
    if (hoverLeaveTimer.current != null) {
      window.clearTimeout(hoverLeaveTimer.current);
      hoverLeaveTimer.current = null;
    }
  };

  useEffect(() => () => {
    clearLongPress();
    clearHoverLeave();
  }, []);

  if (!def) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md bg-black/40 text-xs text-white/50",
          sizeClass,
        )}
      >
        ?
      </div>
    );
  }

  const face = def.cardImagePath && !imgFailed ? def.cardImagePath : null;

  const beginHandDrag = (e: DragEvent<HTMLElement>) => {
    if (!draggable) {
      e.preventDefault();
      return;
    }
    clearLongPress();
    clearHoverLeave();
    suppressClick.current = true;
    setDragging(true);
    setHovered(false);
    onDragStart?.(e);
  };

  const endHandDrag = (e: DragEvent<HTMLElement>) => {
    setDragging(false);
    onDragEnd?.(e);
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative touch-manipulation",
        sizeClass,
        isHand && "battle-hand-card",
        isHand && selected && "battle-hand-card--selected",
        isHand && zoomed && "battle-hand-card--zoomed",
        isHand && reduceMotion && "battle-hand-card--reduced-motion",
        isHand && draggable && "battle-hand-card--draggable",
        isHand && dragging && "battle-hand-card--dragging",
        isHand && unaffordable && "battle-hand-card--unaffordable",
        isHand && shake && "battle-hand-card--illegal-shake",
      )}
      data-unaffordable={isHand && unaffordable ? "true" : undefined}
      // Drag lives on the face control — Chromium will not start HTML5 DnD from a
      // parent when a full-size <button> child receives the pointer.
      onMouseEnter={() => {
        if (!isHand || !enableHoverZoom || isCoarsePointer() || dragging) return;
        clearHoverLeave();
        setHovered(true);
      }}
      onMouseLeave={() => {
        // Delay un-hover so moving toward the portaled preview doesn't flicker,
        // without using a huge padding hit-box that covers the field.
        clearHoverLeave();
        hoverLeaveTimer.current = window.setTimeout(() => {
          setHovered(false);
          hoverLeaveTimer.current = null;
        }, 160);
      }}
    >
      {/*
        div + role=button (not <button>): Chromium ignores HTML5 `draggable` on
        button/input/a, so a full-size button face made hand → field drag impossible.
      */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        draggable={Boolean(draggable)}
        onDragStart={beginHandDrag}
        onDragEnd={endHandDrag}
        onClick={() => {
          if (disabled) return;
          if (suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          const now = Date.now();
          if (onPlay && now - lastTapAt.current < DOUBLE_TAP_MS) {
            lastTapAt.current = 0;
            onPlay();
            return;
          }
          lastTapAt.current = now;

          if (!isHand) {
            onOpenDetail?.();
            return;
          }

          if (isCoarsePointer()) {
            if (previewPinned || selected) {
              onOpenDetail?.();
            } else {
              onSelectForPlay?.();
            }
            return;
          }

          // Desktop: click opens detail + bio; also selects for Play / field.
          onSelectForPlay?.();
          onOpenDetail?.();
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            (e.currentTarget as HTMLElement).click();
          }
        }}
        onPointerDown={(e: ReactPointerEvent<HTMLDivElement>) => {
          if (!isHand || e.button !== 0) return;
          suppressClick.current = false;
          clearLongPress();
          // Do NOT setHovered(false) here — collapsing the zoom layout on
          // pointerdown cancels the native drag gesture in Chromium.
          // Fine pointer: skip long-press timer so HTML5 drag can start cleanly.
          if (!isCoarsePointer()) return;
          // Touch long-press pins a readable zoom preview (hover substitute).
          longPressTimer.current = window.setTimeout(() => {
            suppressClick.current = true;
            onSelectForPlay?.();
          }, LONG_PRESS_MS);
        }}
        onPointerUp={clearLongPress}
        onPointerLeave={clearLongPress}
        onPointerCancel={clearLongPress}
        aria-label={
          isHand
            ? `${def.name}${unaffordable && blockReason ? ` — ${blockReason}` : ""}. Hover to enlarge, click for bio, drag or Play to deploy.`
            : `Inspect ${def.name}`
        }
        title={
          isHand
            ? unaffordable && blockReason
              ? blockReason
              : "Hover to enlarge · click for bio · drag / Play to field"
            : `Inspect ${def.name}`
        }
        className={cn(
          "battle-hand-card__face relative h-full w-full overflow-hidden rounded-lg border border-amber-400/50 bg-[#0c0a10] shadow-[0_8px_20px_rgba(0,0,0,0.4)] focus-ring",
          !isHand && "hover:border-amber-300/70 hover:shadow-[0_10px_28px_rgba(255,184,77,0.18)]",
          selected &&
            "ring-2 ring-amber-300 shadow-[0_0_22px_rgba(255,184,77,0.42)]",
          unaffordable && "battle-hand-card__face--unaffordable",
          disabled && "pointer-events-none opacity-50",
          draggable && "cursor-grab active:cursor-grabbing",
        )}
      >
        {face ? (
          // Face bitmap may bake an outdated cost — engine cost badge overlays truth.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={face}
            alt={def.name}
            className="pointer-events-none h-full w-full object-contain"
            draggable={false}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="flex h-full items-center justify-center px-1 text-center text-[10px] text-white/50">
            {def.name}
          </span>
        )}
        {isHand && playCost != null ? (
          <span
            className={cn(
              "battle-hand-card__cost pointer-events-none absolute left-1.5 top-1.5 z-[4]",
              unaffordable && "battle-hand-card__cost--blocked",
            )}
            aria-label={`Rift Energy ${playCost}`}
          >
            {playCost}
          </span>
        ) : null}
        {unaffordable && blockReason ? (
          <span className="battle-hand-card__block pointer-events-none absolute inset-x-1 bottom-1 z-[4] rounded bg-black/80 px-1 py-0.5 text-center text-[9px] font-medium leading-tight text-amber-100/95">
            {blockReason}
          </span>
        ) : null}
      </div>
      {isHand && onOpenDetail ? (
        <button
          type="button"
          draggable={false}
          className="absolute right-1 top-1 z-[5] flex h-6 w-6 items-center justify-center rounded-md border border-amber-300/40 bg-black/70 text-amber-100/90 shadow-sm backdrop-blur-sm transition hover:border-amber-200/70 hover:bg-black/85 focus-ring"
          aria-label={`Open ${def.name} bio`}
          title="Detail + bio"
          onClick={(e) => {
            e.stopPropagation();
            clearLongPress();
            onSelectForPlay?.();
            onOpenDetail();
          }}
          onPointerDown={(e) => {
            // Keep bio tap from starting a card drag.
            e.stopPropagation();
          }}
        >
          <Eye className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}
      {zoomed ? (
        <HandCardHoverPreview
          faceSrc={face}
          name={def.name}
          playCost={playCost}
          unaffordable={unaffordable}
          blockReason={blockReason}
          anchorRef={cardRef}
          reduceMotion={Boolean(reduceMotion)}
        />
      ) : null}
    </div>
  );
}

function ConsoleShell({
  children,
  shellRef,
  className,
  displayMode,
  boardCardSize,
  layoutPreset,
  enterAnim,
}: {
  children: ReactNode;
  shellRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  displayMode?: string;
  boardCardSize?: BoardCardSize;
  layoutPreset?: string;
  enterAnim?: boolean;
}) {
  return (
    <div
      ref={shellRef}
      className={cn(
        "battle-console",
        enterAnim && "battle-console--enter",
        className,
      )}
      data-testid="rift-battle-console"
      data-display-mode={displayMode}
      data-board-card-size={boardCardSize ?? DEFAULT_BOARD_CARD_SIZE}
      data-layout-preset={layoutPreset ?? "immersive"}
    >
      <div className="battle-console__corners" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="battle-console__inner">{children}</div>
    </div>
  );
}

export function RiftBattleBoard({
  encounterEnemyId,
  regionSlug,
  returnTo,
  inviteCode,
}: {
  encounterEnemyId?: string | null;
  regionSlug?: string | null;
  returnTo?: string | null;
  /** Join / host private lobby via `?invite=CODE` */
  inviteCode?: string | null;
}) {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [previewHand, setPreviewHand] = useState<string | null>(null);
  const [draggingHand, setDraggingHand] = useState<string | null>(null);
  const [fieldDropHover, setFieldDropHover] = useState(false);
  const [playHint, setPlayHint] = useState<string | null>(null);
  const [illegalToken, setIllegalToken] = useState(0);
  const [illegalHandId, setIllegalHandId] = useState<string | null>(null);
  const [energyDenyPulse, setEnergyDenyPulse] = useState(0);
  const illegalHandTimer = useRef<number | null>(null);
  const energyDenyTimer = useRef<number | null>(null);

  const [feedHighlightIds, setFeedHighlightIds] = useState<string[]>([]);
  const feedHighlightTimer = useRef<number | null>(null);
  const [inspectDefId, setInspectDefId] = useState<string | null>(null);
  const [inspectFromHand, setInspectFromHand] = useState(false);
  const [turnSecondsLeft, setTurnSecondsLeft] = useState<number | null>(null);
  const [lobby, setLobby] = useState<LobbyInfo | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState(inviteCode?.toUpperCase() ?? "");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [boardCardSize, setBoardCardSize] = useState<BoardCardSize>(
    DEFAULT_BOARD_CARD_SIZE,
  );
  const [utilsMenuOpen, setUtilsMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feedCollapsed, setFeedCollapsed] = useState(false);
  const [intelCollapsed, setIntelCollapsed] = useState(false);
  const [feedWidth, setFeedWidth] = useState(200);
  const [enterAnim, setEnterAnim] = useState(true);
  const consoleRef = useRef<HTMLDivElement>(null);
  const fullscreen = useLiveWorldFullscreen({ targetRef: consoleRef });
  const arenaExpanded = fullscreen.active;
  const exitFullscreenRef = useRef(fullscreen.exit);
  exitFullscreenRef.current = fullscreen.exit;
  const reduceMotion = useReducedMotion();
  const battleLayout = useBattleLayoutOptional();
  const layoutPreset = battleLayout?.layoutPreset ?? "immersive";
  const focusMode = battleLayout?.focusMode ?? true;

  useEffect(() => {
    setBoardCardSize(readBoardCardSize());
    setFeedCollapsed(readBattleFeedCollapsed());
    setIntelCollapsed(readBattleIntelCollapsed());
    setFeedWidth(readBattleFeedWidth());
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setEnterAnim(false);
      return;
    }
    const t = window.setTimeout(() => setEnterAnim(false), 700);
    return () => window.clearTimeout(t);
  }, [reduceMotion]);

  useEffect(() => {
    return () => {
      // Exit native/viewport expand when leaving the board — never trap the user.
      void exitFullscreenRef.current();
      if (illegalHandTimer.current != null) {
        window.clearTimeout(illegalHandTimer.current);
      }
      if (energyDenyTimer.current != null) {
        window.clearTimeout(energyDenyTimer.current);
      }
    };
  }, []);

  const signalIllegalPlay = useCallback(
    (opts: {
      hint: string;
      handInstanceId?: string | null;
      energyDeny?: boolean;
      defId?: string;
      cost?: number;
      energy?: number;
    }) => {
      setIllegalToken((n) => n + 1);
      setPlayHint(opts.hint);
      playSfx("ui.error");
      if (opts.handInstanceId) {
        setSelectedHand(opts.handInstanceId);
        setIllegalHandId(opts.handInstanceId);
        if (illegalHandTimer.current != null) {
          window.clearTimeout(illegalHandTimer.current);
        }
        illegalHandTimer.current = window.setTimeout(() => {
          setIllegalHandId(null);
          illegalHandTimer.current = null;
        }, 450);
      }
      if (opts.energyDeny) {
        setEnergyDenyPulse((n) => n + 1);
        if (energyDenyTimer.current != null) {
          window.clearTimeout(energyDenyTimer.current);
        }
        energyDenyTimer.current = window.setTimeout(() => {
          setEnergyDenyPulse(0);
          energyDenyTimer.current = null;
        }, 700);
      }
      logClientRejectedPlay(opts.hint, {
        handInstanceId: opts.handInstanceId ?? null,
        defId: opts.defId ?? null,
        cost: opts.cost ?? null,
        energy: opts.energy ?? null,
      });
    },
    [],
  );

  // Wire global Focus Mode shortcuts dispatched from BattleLayoutProvider.
  useEffect(() => {
    const onFs = () => {
      void fullscreen.toggle();
    };
    window.addEventListener("riftwilds:battle-toggle-fullscreen", onFs);
    return () =>
      window.removeEventListener("riftwilds:battle-toggle-fullscreen", onFs);
  }, [fullscreen]);

  const endTurnShortcutRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const onEndTurn = () => endTurnShortcutRef.current?.();
    window.addEventListener("riftwilds:battle-end-turn", onEndTurn);
    return () =>
      window.removeEventListener("riftwilds:battle-end-turn", onEndTurn);
  }, []);

  const backHref = returnTo || snap?.encounter?.returnTo || "/tcg/battle";
  const isPrivateFlow = Boolean(inviteCode || lobby);
  const deskTitle = encounterEnemyId
    ? encounterEnemyId.replace(/-/g, " ")
    : isPrivateFlow
      ? "Private Match"
      : "Practice Board";
  const deskMode = encounterEnemyId
    ? "Battle Desk"
    : isPrivateFlow
      ? "Private Lobby"
      : "Practice Board";

  const start = useCallback(async (signal?: AbortSignal) => {
    setBusy(true);
    setError(null);
    setLobby(null);
    // Rematch / Open new board — drop prior snap so a fresh practice shuffle is obvious.
    setSnap(null);
    setSelectedHand(null);
    setPreviewHand(null);
    setInspectDefId(null);
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener("abort", onAbort, { once: true });
    }
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    try {
      const body: Record<string, unknown> = { playerName: "Keeper" };
      if (encounterEnemyId) {
        body.encounter = {
          enemyId: encounterEnemyId,
          regionSlug: regionSlug || "riftwild-commons",
          returnTo: returnTo || "/tcg/collection",
        };
      }
      // One silent retry covers cookie settle / preview-seat race after Dev bypass.
      let lastError = "START_FAILED";
      for (let attempt = 0; attempt < 2; attempt++) {
        if (signal?.aborted || controller.signal.aborted) return;
        if (attempt > 0) {
          await new Promise((r) => window.setTimeout(r, 200));
        }
        const res = await guestFetch("/api/tcg/match/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
          cache: "no-store",
        });
        const data = (await res.json()) as {
          error?: string;
          reason?: string;
          guestToken?: string;
        } & Partial<Snapshot>;
        rememberGuestTokenFromPayload(data);
        if (signal?.aborted) return;
        if (res.ok) {
          setSnap(data as Snapshot);
          return;
        }
        const detail = data.reason
          ? `${data.error}: ${data.reason}`
          : data.error;
        lastError = detail || "START_FAILED";
        if (data.error !== "NO_SESSION" || attempt === 1) break;
      }
      throw new Error(lastError);
    } catch (e) {
      if (signal?.aborted) return;
      if (e instanceof DOMException && e.name === "AbortError") {
        // Strict Mode remount / superseded start — not a user-facing failure.
        if (signal) return;
        setError("Match start timed out — try opening the board again.");
      } else {
        setError(e instanceof Error ? e.message : "START_FAILED");
      }
    } finally {
      window.clearTimeout(timeout);
      if (signal) signal.removeEventListener("abort", onAbort);
      if (!signal?.aborted) setBusy(false);
    }
  }, [encounterEnemyId, regionSlug, returnTo]);

  const createInvite = useCallback(async () => {
    setInviteBusy(true);
    setError(null);
    setSnap(null);
    try {
      const res = await guestFetch("/api/tcg/match/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: "Keeper" }),
      });
      const data = await res.json();
      rememberGuestTokenFromPayload(data);
      if (!res.ok) throw new Error(data.error || "INVITE_FAILED");
      setLobby({
        code: data.code,
        status: data.status,
        inviteUrl: data.inviteUrl,
        invitePath: data.invitePath,
        hostName: data.hostName,
        guestName: data.guestName,
        youAre: data.youAre,
      });
      setJoinCodeInput(data.code);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", data.invitePath || `/tcg/battle?invite=${data.code}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "INVITE_FAILED");
    } finally {
      setInviteBusy(false);
    }
  }, []);

  const joinInvite = useCallback(async (code: string, signal?: AbortSignal) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    setInviteBusy(true);
    setError(null);
    try {
      const res = await guestFetch("/api/tcg/match/invite/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalized, guestName: "Keeper" }),
        signal,
      });
      const data = await res.json();
      rememberGuestTokenFromPayload(data);
      if (signal?.aborted) return;
      if (!res.ok) throw new Error(data.error || "JOIN_FAILED");
      setLobby({
        code: data.code,
        status: data.status,
        inviteUrl: data.inviteUrl,
        invitePath: data.invitePath,
        hostName: data.hostName,
        guestName: data.guestName,
        youAre: data.youAre,
      });
      if (data.match) {
        setSnap(data.match as Snapshot);
      }
    } catch (e) {
      if (signal?.aborted) return;
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "JOIN_FAILED");
    } finally {
      if (!signal?.aborted) setInviteBusy(false);
    }
  }, []);

  const pollLobby = useCallback(async (code: string) => {
    try {
      const res = await guestFetch(
        `/api/tcg/match/invite?code=${encodeURIComponent(code)}`,
      );
      const data = await res.json();
      rememberGuestTokenFromPayload(data);
      if (!res.ok) return;
      setLobby({
        code: data.code,
        status: data.status,
        inviteUrl: data.inviteUrl,
        invitePath: data.invitePath,
        hostName: data.hostName,
        guestName: data.guestName,
        youAre: data.youAre,
      });
      if (data.match) setSnap(data.match as Snapshot);
    } catch {
      /* ignore poll blips */
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (inviteCode) {
      void joinInvite(inviteCode, controller.signal);
    } else {
      void start(controller.signal);
    }
    return () => controller.abort();
  }, [inviteCode, joinInvite, start]);

  /** Host waits for guest — poll until private match starts. */
  useEffect(() => {
    if (!lobby?.code || snap || lobby.status === "STARTED") return;
    const id = window.setInterval(() => {
      void pollLobby(lobby.code);
    }, 2000);
    return () => window.clearInterval(id);
  }, [lobby?.code, lobby?.status, snap, pollLobby]);

  /** Soft turn timer cue (client-only; not server-enforced in Phase 1). */
  useEffect(() => {
    if (!snap || snap.status !== "ACTIVE") {
      setTurnSecondsLeft(null);
      return;
    }
    const budget = snap.turnTimerSeconds ?? 90;
    setTurnSecondsLeft(budget);
    const id = window.setInterval(() => {
      setTurnSecondsLeft((prev) => {
        if (prev == null) return prev;
        return Math.max(0, prev - 1);
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [snap?.publicId, snap?.turn, snap?.activeSideId, snap?.status, snap?.turnTimerSeconds]);

  const questMatchLogged = useRef<string | null>(null);

  /** Quest board hooks — practice matches advance TCG objectives. */
  useEffect(() => {
    if (!snap || snap.status !== "COMPLETED") return;
    if (questMatchLogged.current === snap.publicId) return;
    questMatchLogged.current = snap.publicId;
    const playerSide = snap.players.find((p) => !p.isAi);
    recordQuestMetric("tcg_match_play", 1);
    if (playerSide && snap.winnerId === playerSide.id) {
      recordQuestMetric("tcg_match_win", 1);
      void enterSoundscape("victory");
      adaptiveAudio.playCue("combat.win", { priority: "critical" });
      speakVoice({ slot: "announcer.victory", priority: "high" });
    } else if (snap.winnerId) {
      void enterSoundscape("defeat");
      adaptiveAudio.playCue("combat.lose", { priority: "critical" });
      speakVoice({ slot: "announcer.defeat", priority: "high" });
    }
  }, [snap]);

  /** Battle soundscape when a live match is on the board. */
  useEffect(() => {
    if (!snap || snap.status !== "ACTIVE") return;
    void enterSoundscape("battle", { fadeMs: 1100 });
    adaptiveAudio.playCue("tcg.match_start", { priority: "high" });
    speakVoice({ slot: "announcer.ready", priority: "normal" });
    adaptiveAudio.setIntensity(0.72);
  }, [snap?.publicId, snap?.status]);

  const act = useCallback(
    async (action: Record<string, unknown>) => {
      if (!snap || snap.status !== "ACTIVE") return;
      setBusy(true);
      setError(null);
      setPlayHint(null);
      try {
        const res = await guestFetch("/api/tcg/match/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: snap.publicId, action }),
        });
        const data = await res.json();
        rememberGuestTokenFromPayload(data);
        if (!res.ok) throw new Error(data.error || "TURN_FAILED");
        setSnap(data);
        setSelectedHand(null);
        setPreviewHand(null);
        setDraggingHand(null);
        setFieldDropHover(false);
        setInspectDefId(null);
        if (action.kind === "PLAY_CARD") {
          recordQuestMetric("tcg_card_play", 1);
          recordQuestMetric("tcg_energy_spend", 1);
          adaptiveAudio.playCue("tcg.card_play", { priority: "high" });
          const playedType =
            typeof action.cardType === "string" ? action.cardType : null;
          if (playedType === "SPELL") {
            adaptiveAudio.playCue("tcg.attack", { priority: "normal" });
            playSfx("tcg.damage");
          } else {
            adaptiveAudio.playCue("tcg.summon", { priority: "normal" });
          }
          const aff =
            typeof action.affinity === "string"
              ? action.affinity
              : typeof action.cardAffinity === "string"
                ? action.cardAffinity
                : null;
          playElementSfx(aff);
          adaptiveAudio.setIntensity(0.8);
        } else if (action.kind === "END_TURN") {
          adaptiveAudio.playCue("tcg.end_turn", { priority: "normal" });
          const events = (data?.events ?? []) as {
            type: string;
          }[];
          if (events.some((ev) => ev.type === "BOARD_ATTACK")) {
            adaptiveAudio.playCue("tcg.attack", { priority: "high" });
            playSfx("tcg.damage");
          }
          adaptiveAudio.setIntensity(0.55);
        } else if (action.kind === "ATTACK" || action.kind === "STRIKE") {
          adaptiveAudio.playCue("tcg.attack", { priority: "high" });
          playSfx("companion.attack");
        } else if (action.kind === "SURRENDER") {
          adaptiveAudio.playCue("combat.lose", { priority: "high" });
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "TURN_FAILED";
        if (
          message === "INSUFFICIENT_RIFT_ENERGY" ||
          message === "BOARD_FULL" ||
          message === "EQUIP_NO_TARGET" ||
          message === "NOT_YOUR_TURN" ||
          message === "WRONG_PHASE" ||
          message === "CARD_NOT_IN_HAND" ||
          message === "COMMANDER_NOT_PLAYABLE"
        ) {
          const handId =
            typeof action.handInstanceId === "string"
              ? action.handInstanceId
              : selectedHand;
          signalIllegalPlay({
            hint:
              message === "INSUFFICIENT_RIFT_ENERGY"
                ? NOT_ENOUGH_RIFT_ENERGY
                : message === "BOARD_FULL"
                  ? "Board full"
                  : message === "EQUIP_NO_TARGET"
                    ? "Needs a friendly unit to equip"
                    : message === "COMMANDER_NOT_PLAYABLE"
                      ? "Commander isn't playable from hand"
                      : message === "NOT_YOUR_TURN"
                        ? "Not your turn"
                        : message === "WRONG_PHASE"
                          ? "Can't play right now"
                          : "Card not in hand",
            handInstanceId: handId,
            energyDeny: message === "INSUFFICIENT_RIFT_ENERGY",
          });
        } else if (message === "MATCH_NOT_FOUND" || message === "NO_SESSION") {
          // Drop zombie snap so Retry starts a clean board (or rejoin invite).
          playSfx("ui.error");
          setSnap(null);
          setSelectedHand(null);
          setError(message);
        } else {
          playSfx("ui.error");
          setError(message);
        }
      } finally {
        setBusy(false);
      }
    },
    [selectedHand, signalIllegalPlay, snap],
  );

  endTurnShortcutRef.current = () => {
    if (!snap || snap.status !== "ACTIVE" || busy) return;
    const me =
      snap.players.find((p) => p.id === (snap.yourSideId ?? "player")) ??
      snap.players.find((p) => !p.isAi);
    if (!me || snap.activeSideId !== me.id) return;
    void act({ kind: "END_TURN" });
  };

  const yourSideId = snap?.yourSideId ?? "player";
  const player = snap?.players.find((p) => p.id === yourSideId) ?? snap?.players.find((p) => !p.isAi);
  const foe = snap?.players.find((p) => p.id !== player?.id);

  const sideNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of snap?.players ?? []) map[p.id] = p.name;
    return map;
  }, [snap?.players]);

  const onFeedHighlight = useCallback((ids: string[]) => {
    setFeedHighlightIds(ids);
    if (feedHighlightTimer.current) {
      window.clearTimeout(feedHighlightTimer.current);
    }
    feedHighlightTimer.current = window.setTimeout(() => {
      setFeedHighlightIds([]);
    }, 1400);
  }, []);

  const selectedCard = player?.hand.find((c) => c.instanceId === selectedHand);
  const selectedDef = selectedCard ? getTcgCardDef(selectedCard.defId) : null;
  const draggingCard = player?.hand.find((c) => c.instanceId === draggingHand);
  const draggingDef = draggingCard ? getTcgCardDef(draggingCard.defId) : null;
  const isPlayerTurn =
    !!snap && !!player && snap.status === "ACTIVE" && snap.activeSideId === player.id;

  const playDisabledReason = playBlockReason(selectedDef, player, snap, busy);
  const canPlaySelected = !!selectedHand && !playDisabledReason;
  const legalHandPlay = hasLegalHandPlay(player, snap, busy);
  const boardFull =
    (player?.board.length ?? 0) >= TCG_DEFAULTS.maxBoardUnits;
  // Spotlight End Turn when Play can't fire — board-full soft-locks feel stuck
  // if the amber CTA stays on a disabled Play button.
  const preferEndTurn =
    !!snap &&
    snap.status === "ACTIVE" &&
    isPlayerTurn &&
    !canPlaySelected &&
    (!legalHandPlay || boardFull);
  const readyStrikers =
    player?.board.filter((u) => !u.exhausted && (u.attack ?? u.power) > 0)
      .length ?? 0;
  const endTurnHint = preferEndTurn
    ? readyStrikers > 0
      ? "Attack now"
      : "Continue"
    : "Resolve attacks";
  const guidance = turnGuidance({
    isPlayerTurn,
    player,
    canPlaySelected,
    playDisabledReason,
    legalHandPlay,
    selectedName: selectedDef?.name ?? null,
  });

  const targetingInstanceId = draggingHand ?? selectedHand;
  const targetingDef = draggingHand ? draggingDef : selectedDef;
  const targetingBlockReason = targetingInstanceId
    ? playBlockReason(targetingDef, player, snap, busy)
    : null;
  const fieldAcceptsPlay =
    isPlayerTurn && !!targetingInstanceId && !targetingBlockReason;
  const fieldShowsInvalid =
    isPlayerTurn && !!targetingInstanceId && !!targetingBlockReason;

  const tryPlayCard = useCallback(
    (handInstanceId: string) => {
      if (!snap || !player) return;
      const card = player.hand.find((c) => c.instanceId === handInstanceId);
      if (!card) {
        signalIllegalPlay({
          hint: "Card not in hand",
          handInstanceId,
        });
        return;
      }
      const def = getTcgCardDef(card.defId);
      const reason = playBlockReason(def, player, snap, busy);
      if (reason) {
        const energyDeny = reason === NOT_ENOUGH_RIFT_ENERGY;
        signalIllegalPlay({
          hint: reason,
          handInstanceId,
          energyDeny,
          defId: def?.id,
          cost: def ? handPlayCost(def, player) : undefined,
          energy: player.riftEnergy,
        });
        return;
      }
      void act({
        kind: "PLAY_CARD",
        handInstanceId,
        affinity: def?.affinity,
        cardType: def?.type,
      });
    },
    [act, busy, player, signalIllegalPlay, snap],
  );

  const battleVfx = useBattleVfx({
    events: snap?.events,
    yourSideId: player?.id,
    matchStatus: snap?.status,
    winnerId: snap?.winnerId,
    reduceMotion,
    illegalToken,
  });

  const illegalShake = battleVfx.fx.some((f) => f.kind === "illegal");

  // Combat Mode: fade intel/feed while attack/spell/summon VFX play.
  useEffect(() => {
    const combatFx = battleVfx.fx.some(
      (f) =>
        f.kind === "attack" ||
        f.kind === "spell" ||
        f.kind === "summon" ||
        f.kind === "cardReveal",
    );
    battleLayout?.setCombatAnimating(combatFx);
    // Intentionally omit battleLayout object identity — only sync VFX → chrome.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleVfx.fx]);

  const openInspect = useCallback((defId: string, fromHand: boolean) => {
    setInspectFromHand(fromHand);
    setInspectDefId(defId);
    setPreviewHand(null);
  }, []);

  const selectHandForPlay = useCallback((instanceId: string) => {
    setSelectedHand(instanceId);
    setPreviewHand(instanceId);
    setPlayHint(null);
    playSfx("tcg.card_select");
  }, []);

  const outcomeLabel =
    snap?.status === "COMPLETED"
      ? snap.winnerId === player?.id
        ? "Victory"
        : snap.winnerId
          ? "Defeat"
          : "Draw"
      : null;

  return (
    <div
      className={cn(
        "battle-mode-root mx-auto w-full px-0 py-2 sm:py-3",
        focusMode ? "max-w-none" : "max-w-6xl",
        layoutPreset === "ultra-wide" && "battle-mode-root--ultra-wide",
        arenaExpanded && "max-w-none py-0",
      )}
    >
        <ConsoleShell
        shellRef={consoleRef}
        displayMode={fullscreen.displayMode}
        boardCardSize={boardCardSize}
        layoutPreset={layoutPreset}
        enterAnim={enterAnim && !reduceMotion}
        className={cn(
          arenaExpanded && "battle-console--expanded",
          focusMode && "battle-console--focus",
          battleLayout?.combatAnimating && "battle-console--combat",
        )}
      >
        {snap?.phase === "MULLIGAN" && player ? (
          <MulliganPanel
            hand={player.hand}
            turn1Energy={TCG_DEFAULTS.riftEnergyStartMax}
            busy={busy}
            onKeep={() => void act({ kind: "KEEP_HAND" })}
            onMulligan={(replaceInstanceIds) =>
              void act({ kind: "MULLIGAN", replaceInstanceIds })
            }
          />
        ) : null}
        <header className="battle-console__header battle-console__header--compact">
          <div className="battle-console__header-main">
            <div>
              <p className="battle-console__brand">RIFTWILDS</p>
              <p className="battle-console__brand-sub">
                {deskMode}
                {encounterEnemyId ? ` · ${deskTitle}` : ""}
              </p>
              {!focusMode ? (
                <p className="battle-console__lede">
                  Hover a hand card to enlarge it, click for detail + bio, then drag to Your Field
                  or hit Play. Spend Rift Energy, then end your turn. SOL is never required.
                </p>
              ) : null}
            </div>
            <div className="battle-console__header-right">
              <div className="battle-console__utils">
                <div
                  className="battle-console__size"
                  role="group"
                  aria-label="Field card size"
                >
                  <span className="battle-console__size-label">Cards</span>
                  <div className="battle-console__size-btns">
                    {BOARD_CARD_SIZES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={cn(
                          "battle-console__size-btn focus-ring",
                          boardCardSize === s.id && "is-active",
                        )}
                        aria-pressed={boardCardSize === s.id}
                        title={`Field cards ${s.label}`}
                        onClick={() => {
                          setBoardCardSize(s.id);
                          writeBoardCardSize(s.id);
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <FullscreenToggleButton
                  active={arenaExpanded}
                  onToggle={() => void fullscreen.toggle()}
                  compact
                  className="battle-console__util focus-ring"
                />
                <button
                  type="button"
                  className="battle-console__util focus-ring"
                  title="Battle settings"
                  onClick={() => {
                    setSettingsOpen(true);
                    battleLayout?.setBattleMenuOpen(true);
                  }}
                >
                  <Settings aria-hidden />
                  <span className="max-sm:sr-only">Settings</span>
                </button>
                <div className="battle-console__overflow">
                  <button
                    type="button"
                    className="battle-console__util focus-ring"
                    aria-expanded={utilsMenuOpen}
                    aria-haspopup="menu"
                    title="More actions"
                    onClick={() => setUtilsMenuOpen((v) => !v)}
                  >
                    <MoreHorizontal aria-hidden />
                    <span className="max-sm:sr-only">More</span>
                    <ChevronDown className="h-3 w-3 opacity-70" aria-hidden />
                  </button>
                  {utilsMenuOpen ? (
                    <div className="battle-console__overflow-menu" role="menu">
                      <Link
                        href="/tcg/deck-builder"
                        className="battle-console__overflow-item"
                        role="menuitem"
                        onClick={() => setUtilsMenuOpen(false)}
                      >
                        <Layers aria-hidden />
                        Deck
                      </Link>
                      <Link
                        href="/tcg/codex"
                        className="battle-console__overflow-item"
                        role="menuitem"
                        onClick={() => setUtilsMenuOpen(false)}
                      >
                        <BookOpen aria-hidden />
                        Codex
                      </Link>
                      <Link
                        href="/arena"
                        className="battle-console__overflow-item"
                        role="menuitem"
                        onClick={() => setUtilsMenuOpen(false)}
                      >
                        <History aria-hidden />
                        Match History
                      </Link>
                      <Link
                        href={backHref}
                        className="battle-console__overflow-item"
                        role="menuitem"
                        onClick={() => setUtilsMenuOpen(false)}
                      >
                        <LogOut aria-hidden />
                        Exit Match
                      </Link>
                    </div>
                  ) : null}
                </div>
                <Link href={backHref} className="battle-console__util focus-ring">
                  <ArrowLeft aria-hidden />
                  {backHref.includes("live-world") ? "Return" : "Exit"}
                </Link>
              </div>
              {snap ? (
                <CombatCommandActions
                  placement="header"
                  canPlaySelected={canPlaySelected}
                  playDisabledReason={playDisabledReason}
                  preferEndTurn={preferEndTurn}
                  endTurnHint={endTurnHint}
                  busy={busy}
                  matchStatus={snap.status}
                  onPlay={() => selectedHand && tryPlayCard(selectedHand)}
                  onEndTurn={() => void act({ kind: "END_TURN" })}
                  onSurrender={() => void act({ kind: "SURRENDER" })}
                  onRematch={() => void start()}
                />
              ) : null}
            </div>
          </div>
        </header>

        {error && (
          <div className="battle-console__alert" role="alert">
            <p>
              {error === "MATCH_NOT_FOUND"
                ? "Match not found — open a new practice board or rejoin the invite."
                : error === "NO_SESSION"
                  ? "Session lost — retry to restore your seat (or sign in again)."
                  : error}
            </p>
            <button
              type="button"
              disabled={busy || inviteBusy}
              onClick={() => {
                setError(null);
                if (inviteCode || lobby?.code) {
                  void joinInvite(inviteCode || lobby!.code);
                } else {
                  void start();
                }
              }}
              className="battle-console__action battle-console__action--primary !min-w-0 !px-3 !py-1.5 !text-[0.62rem]"
            >
              Retry
            </button>
          </div>
        )}

        {!snap && !encounterEnemyId && (
          <div className="battle-console__invite">
            <div className="min-w-[10rem] flex-1">
              <p className="battle-console__invite-title">Invite a Keeper</p>
              <p className="mt-0.5 text-xs text-[var(--text-dim)]">
                Share a room code or link. Local private match — SOL never required.
              </p>
            </div>
            <button
              type="button"
              disabled={inviteBusy || busy}
              onClick={() => void createInvite()}
              className="battle-console__action battle-console__action--primary !min-w-0 !flex-row !gap-1.5 !px-3.5 !py-2 !text-[0.62rem]"
            >
              <UserPlus className="h-3.5 w-3.5" aria-hidden />
              Create invite
            </button>
            <label className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
              <span className="sr-only">Join code</span>
              <input
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                maxLength={8}
                placeholder="CODE"
                className="battle-console__invite-input focus-ring"
              />
            </label>
            <button
              type="button"
              disabled={inviteBusy || busy || !joinCodeInput.trim()}
              onClick={() => void joinInvite(joinCodeInput)}
              className="battle-console__action !min-w-0 !px-3.5 !py-2 !text-[0.62rem]"
            >
              Join
            </button>
            {lobby && (
              <div className="flex w-full flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                <span>
                  Lobby <strong className="font-mono text-amber-200">{lobby.code}</strong>
                  {lobby.status === "WAITING" ? " · waiting for guest…" : ` · ${lobby.status}`}
                </span>
                {lobby.inviteUrl && (
                  <button
                    type="button"
                    className="underline decoration-amber-500/50 underline-offset-2 hover:text-amber-200"
                    onClick={() => {
                      void navigator.clipboard.writeText(lobby.inviteUrl!);
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? "Copied link" : "Copy invite link"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {!snap && (
          <div className="battle-console__body">
            <aside className="battle-console__panel hidden md:flex">
              <p className="battle-console__panel-title">Match Intel</p>
              <div className="battle-console__panel-body">
                <p className="text-xs text-[var(--text-dim)]">
                  {busy ? "Summoning the battlefield…" : "Waiting for the rift to open."}
                </p>
              </div>
            </aside>
            <section className="battle-console__stage">
              <div className="battle-console__lane">
                <div className="battle-console__lane-empty">
                  <div className="battle-console__lane-slots" aria-hidden>
                    <span className="battle-console__lane-slot" />
                    <span className="battle-console__lane-slot" />
                    <span className="battle-console__lane-slot" />
                    <span className="battle-console__lane-slot" />
                  </div>
                  Challenger lane
                </div>
              </div>
              {busy ? (
                <div className="battle-console__loading" role="status" aria-live="polite">
                  <div className="battle-console__loading-ring" aria-hidden />
                  <p className="battle-console__loading-copy">Summoning the Rift…</p>
                </div>
              ) : (
                <div className="battle-console__phase">
                  {error
                    ? "Board ready when the rift reconnects"
                    : "Preparing duel…"}
                </div>
              )}
              <div className="battle-console__lane battle-console__lane--you">
                <div className="battle-console__lane-empty">
                  <div className="battle-console__lane-slots" aria-hidden>
                    <span className="battle-console__lane-slot" />
                    <span className="battle-console__lane-slot" />
                    <span className="battle-console__lane-slot" />
                    <span className="battle-console__lane-slot" />
                  </div>
                  Your lane
                </div>
              </div>
              {!busy && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => void start()}
                    className="battle-console__action battle-console__action--primary"
                  >
                    Enter the arena
                    <small>Start practice</small>
                  </button>
                </div>
              )}
            </section>
            <aside className="battle-console__panel hidden md:flex">
              <p className="battle-console__panel-title">Battle Log</p>
              <div className="battle-console__panel-body">
                <p className="battle-console__feed-item">Quiet before the clash…</p>
              </div>
            </aside>
          </div>
        )}

        {snap && player && foe && (
          <>
            <div
              className={cn(
                "battle-console__body",
                intelCollapsed && "battle-console__body--intel-collapsed",
                feedCollapsed && "battle-console__body--feed-collapsed",
              )}
              style={
                {
                  ["--battle-feed-col" as string]: `${feedWidth}px`,
                } as CSSProperties
              }
            >
              <aside
                className={cn(
                  "battle-console__panel battle-console__panel--intel order-2 lg:order-none max-lg:max-h-48",
                  intelCollapsed && "battle-console__panel--collapsed",
                  battleLayout?.combatAnimating && "battle-console__panel--combat-fade",
                )}
              >
                <div className="battle-console__panel-head">
                  <p className="battle-console__panel-title">Match Intel</p>
                  <button
                    type="button"
                    className="battle-console__panel-toggle focus-ring"
                    aria-pressed={intelCollapsed}
                    title={intelCollapsed ? "Expand Match Intel" : "Collapse Match Intel"}
                    onClick={() => {
                      setIntelCollapsed((v) => {
                        const next = !v;
                        writeBattleIntelCollapsed(next);
                        return next;
                      });
                    }}
                  >
                    {intelCollapsed ? "«" : "»"}
                  </button>
                </div>
                {!intelCollapsed ? (
                <div className="battle-console__panel-body">
                  <div className="battle-console__intel-block">
                    <p className="battle-console__intel-label">Duel status</p>
                    <div className="battle-console__intel-row">
                      <span>Turn</span>
                      <strong>{snap.turn}</strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Phase</span>
                      <strong>{snap.phase.replaceAll("_", " ")}</strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Rules</span>
                      <strong>v{snap.rulesVersion ?? TCG_DEFAULTS.rulesVersion}</strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Active</span>
                      <strong>
                        {snap.activeSideId === player.id ? "You" : "Challenger"}
                      </strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Status</span>
                      <strong>
                        {snap.status === "ACTIVE" ? "LIVE" : outcomeLabel ?? "DONE"}
                      </strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Mode</span>
                      <strong>{(snap.mode ?? "practice").toUpperCase()}</strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Turn clock</span>
                      <strong
                        className={
                          turnSecondsLeft != null && turnSecondsLeft <= 15
                            ? "text-amber-300"
                            : undefined
                        }
                      >
                        {turnSecondsLeft != null ? `${turnSecondsLeft}s` : "—"}
                      </strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Your commander</span>
                      <strong>{player.commander?.name ?? "Keeper"}</strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Foe commander</span>
                      <strong>{foe.commander?.name ?? foe.name}</strong>
                    </div>
                  </div>
                  <div className="battle-console__intel-block">
                    <p className="battle-console__intel-label">Field pressure</p>
                    <div className="battle-console__intel-row">
                      <span>Front / Back</span>
                      <strong>
                        {
                          player.board.filter((u) => (u.lane ?? "front") === "front")
                            .length
                        }
                        /{TCG_DEFAULTS.frontlineSlots} ·{" "}
                        {
                          player.board.filter((u) => u.lane === "back").length
                        }
                        /{TCG_DEFAULTS.backlineSlots}
                      </strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Your units</span>
                      <strong>
                        {player.board.length}/{TCG_DEFAULTS.maxBoardUnits}
                      </strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Foe units</span>
                      <strong>{foe.board.length}</strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Hand</span>
                      <strong>
                        {player.hand.length}/{TCG_DEFAULTS.maxHandSize}
                      </strong>
                    </div>
                    <div className="battle-console__intel-row">
                      <span>Defeated / Exile</span>
                      <strong>
                        {player.defeatedCount ?? 0} / {player.exileCount ?? 0}
                      </strong>
                    </div>
                    <button
                      type="button"
                      className="battle-console__rules-btn mt-2 w-full rounded border border-white/15 bg-white/5 px-2 py-1.5 text-left text-xs text-[var(--cyan)] hover:bg-white/10"
                      onClick={() => setRulesOpen((v) => !v)}
                    >
                      <BookOpen className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                      {rulesOpen ? "Hide rules" : "Battle rules"}
                    </button>
                    {rulesOpen ? (
                      <div className="battle-console__rules-panel mt-2 space-y-1 text-[11px] leading-snug text-[var(--text-muted)]">
                        <p>
                          Keeper {TCG_DEFAULTS.keeperHp} HP · Energy{" "}
                          {TCG_DEFAULTS.riftEnergyStartMax}→
                          {TCG_DEFAULTS.riftEnergyCap} · Hand{" "}
                          {TCG_DEFAULTS.openingHand}/{TCG_DEFAULTS.maxHandSize}
                        </p>
                        <p>
                          Field {TCG_DEFAULTS.frontlineSlots} Front +{" "}
                          {TCG_DEFAULTS.backlineSlots} Back · Deck{" "}
                          {TCG_DEFAULTS.minDeckSize}+Commander
                        </p>
                        <p>
                          Phases: Start → Main → Combat → Second Main → End
                        </p>
                        <p>
                          Frontline protects Keeper (Flying / Pierce exceptions).
                          Empty deck = Rift Collapse damage.
                        </p>
                        <Link
                          href="/tcg/rules"
                          className="text-[var(--cyan)] underline-offset-2 hover:underline"
                        >
                          Full rules reference
                        </Link>
                      </div>
                    ) : null}
                  </div>
                  <div className="battle-console__intel-block">
                    <p className="battle-console__intel-label">Legend</p>
                    <div className="battle-console__legend">
                      <div className="battle-console__legend-item">
                        <span
                          className="battle-console__legend-swatch"
                          style={{ background: "var(--amber)" }}
                        />
                        Rift Energy — play cost
                      </div>
                      <div className="battle-console__legend-item">
                        <span
                          className="battle-console__legend-swatch"
                          style={{ background: "#ff5c7a" }}
                        />
                        Keeper HP — lose at 0
                      </div>
                      <div className="battle-console__legend-item">
                        <span
                          className="battle-console__legend-swatch"
                          style={{ background: "var(--cyan)" }}
                        />
                        Units — board attackers
                      </div>
                      <div className="battle-console__legend-item">
                        <span
                          className="battle-console__legend-swatch"
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.35)",
                          }}
                        />
                        Exhausted — already acted
                      </div>
                    </div>
                  </div>
                </div>
                ) : (
                  <p className="battle-console__panel-collapsed-hint">Intel</p>
                )}
              </aside>

              <section
                className={cn(
                  "battle-console__stage order-1 lg:order-none",
                  battleVfx.banner?.tone === "victory" &&
                    "battle-console__stage--victory",
                  battleVfx.banner?.tone === "defeat" &&
                    "battle-console__stage--defeat",
                  illegalShake && "battle-console__stage--illegal",
                )}
                aria-label="Battle lanes"
              >
                <BattleVfxLayer
                  vfx={battleVfx}
                  yourSideId={player.id}
                  foeSideId={foe.id}
                />
                <StatusStrip
                  side={foe}
                  role="Challenger"
                  damagePulse={Boolean(
                    sideHasMeterPulse(battleVfx.meterPulses, "foe", "damage") ||
                      sideHasMeterPulse(battleVfx.meterPulses, foe.id, "damage"),
                  )}
                  energyPulse={Boolean(
                    sideHasMeterPulse(battleVfx.meterPulses, foe.id, "energy"),
                  )}
                  energySpendPulse={Boolean(
                    sideHasMeterPulse(
                      battleVfx.meterPulses,
                      foe.id,
                      "energySpend",
                    ),
                  )}
                />
                <BoardRow
                  units={foe.board}
                  emptyLabel="Challenger field"
                  sideId={foe.id}
                  spawnToken={battleVfx.spawnTokenBySide[foe.id] ?? 0}
                  boardPulse={sideHasBoardPulse(battleVfx.boardPulses, foe.id)}
                  reduceMotion={Boolean(reduceMotion)}
                  showLanes
                  highlightIds={feedHighlightIds}
                  mood={
                    outcomeLabel === "Victory"
                      ? "sad"
                      : outcomeLabel === "Defeat"
                        ? "celebrate"
                        : null
                  }
                  onInspect={(defId) => openInspect(defId, false)}
                />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${snap.turn}-${snap.phase}-${snap.activeSideId}-${outcomeLabel ?? "live"}`}
                    initial={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.96, y: 4 }
                    }
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 1.02, y: -2 }
                    }
                    transition={{
                      duration: reduceMotion ? 0.12 : 0.28,
                      ease: "easeOut",
                    }}
                    className={cn(
                      "battle-console__phase",
                      isPlayerTurn && "battle-console__phase--active",
                      outcomeLabel === "Victory" &&
                        "battle-console__phase--victory",
                      outcomeLabel === "Defeat" &&
                        "battle-console__phase--defeat",
                    )}
                  >
                    <span>
                      Turn {snap.turn} · {snap.phase}
                    </span>
                    {outcomeLabel && (
                      <span className="battle-console__phase-badge">{outcomeLabel}</span>
                    )}
                    {!outcomeLabel && isPlayerTurn && (
                      <span className="battle-console__phase-badge">Your move</span>
                    )}
                  </motion.div>
                </AnimatePresence>
                <BoardRow
                  units={player.board}
                  emptyLabel="Your field"
                  yours
                  sideId={player.id}
                  spawnToken={battleVfx.spawnTokenBySide[player.id] ?? 0}
                  boardPulse={sideHasBoardPulse(
                    battleVfx.boardPulses,
                    player.id,
                  )}
                  reduceMotion={Boolean(reduceMotion)}
                  showLanes
                  highlightIds={feedHighlightIds}
                  mood={
                    outcomeLabel === "Victory"
                      ? "celebrate"
                      : outcomeLabel === "Defeat"
                        ? "sad"
                        : null
                  }
                  dropReady={fieldAcceptsPlay}
                  dropInvalid={fieldShowsInvalid}
                  dropHover={fieldDropHover}
                  dropHint={
                    fieldAcceptsPlay
                      ? draggingHand
                        ? "Drop to play"
                        : "Tap field to play"
                      : targetingBlockReason
                  }
                  onInspect={(defId) => openInspect(defId, false)}
                  onFieldActivate={() => {
                    if (targetingInstanceId) tryPlayCard(targetingInstanceId);
                  }}
                  onDragOverField={(e) => {
                    if (!isPlayerTurn || !draggingHand) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = fieldAcceptsPlay ? "move" : "none";
                    setFieldDropHover(true);
                  }}
                  onDragLeaveField={() => setFieldDropHover(false)}
                  onDropField={(e) => {
                    e.preventDefault();
                    setFieldDropHover(false);
                    const id =
                      e.dataTransfer.getData(HAND_DRAG_MIME) ||
                      e.dataTransfer.getData("text/plain") ||
                      draggingHand;
                    setDraggingHand(null);
                    if (id) tryPlayCard(id);
                  }}
                />
                <StatusStrip
                  side={player}
                  role="You"
                  emphasizeEnergy
                  damagePulse={Boolean(
                    sideHasMeterPulse(
                      battleVfx.meterPulses,
                      player.id,
                      "damage",
                    ),
                  )}
                  energyPulse={Boolean(
                    sideHasMeterPulse(
                      battleVfx.meterPulses,
                      player.id,
                      "energy",
                    ),
                  )}
                  energySpendPulse={Boolean(
                    sideHasMeterPulse(
                      battleVfx.meterPulses,
                      player.id,
                      "energySpend",
                    ),
                  )}
                  energyDeny={energyDenyPulse > 0}
                />
              </section>

              <aside
                className={cn(
                  "battle-console__panel battle-console__panel--feed order-3 lg:order-none max-lg:max-h-64",
                  feedCollapsed && "battle-console__panel--collapsed",
                  battleLayout?.combatAnimating && "battle-console__panel--combat-fade",
                )}
              >
                <BattleEventFeed
                  events={snap.events}
                  yourSideId={player.id}
                  sideNames={sideNames}
                  matchStatus={snap.status}
                  onHighlight={onFeedHighlight}
                  compact
                  collapsed={feedCollapsed}
                  autoHidden={Boolean(battleLayout?.combatAnimating)}
                  widthPx={feedWidth}
                  onToggleCollapsed={() => {
                    setFeedCollapsed((v) => {
                      const next = !v;
                      writeBattleFeedCollapsed(next);
                      return next;
                    });
                  }}
                  onResizeWidth={(px) => {
                    setFeedWidth(px);
                    writeBattleFeedWidth(px);
                  }}
                />
              </aside>
            </div>

            <section
              className={cn(
                "battle-console__hand-dock battle-console__hand-dock--fan",
                illegalShake && "battle-console__hand-dock--illegal",
                outcomeLabel === "Victory" && "battle-console__hand-dock--victory",
                outcomeLabel === "Defeat" && "battle-console__hand-dock--defeat",
              )}
              aria-label="Hand"
            >
              <p className="battle-console__hand-label">
                Hand · hover to enlarge · click for bio · drag / Play to field
                {player ? (
                  <span
                    className={cn(
                      "battle-console__hand-energy",
                      energyDenyPulse > 0 && "battle-console__hand-energy--deny",
                    )}
                  >
                    {" "}
                    · Energy {player.riftEnergy}/{player.riftEnergyMax}
                  </span>
                ) : null}
              </p>
              {playHint ? (
                <p
                  className={cn(
                    "battle-console__play-hint",
                    illegalShake && "battle-console__play-hint--shake",
                  )}
                  role="status"
                >
                  {playHint}
                </p>
              ) : null}
              <div className="battle-console__hand-row battle-console__hand-row--fan">
                {player.hand.map((c, handIndex) => {
                  const def = getTcgCardDef(c.defId);
                  const block = playBlockReason(def, player, snap, busy);
                  const cost = def ? handPlayCost(def, player) : null;
                  const energyBlocked =
                    !!def &&
                    cost != null &&
                    player.riftEnergy < cost;
                  // Dim when energy (or board / commander) blocks play —
                  // never confuse power with riftCost.
                  const costBlocked =
                    !!def &&
                    isPlayerTurn &&
                    !!block &&
                    (energyBlocked ||
                      block.startsWith("Board full") ||
                      block.startsWith("Commander sits"));
                  const banner =
                    costBlocked && energyBlocked && def
                      ? unaffordableBanner(def, player)
                      : costBlocked
                        ? block
                        : null;
                  const fanCount = Math.max(player.hand.length, 1);
                  const fanT = fanCount <= 1 ? 0 : handIndex / (fanCount - 1);
                  const fanAngle = (fanT - 0.5) * Math.min(28, 4.5 * fanCount);
                  const fanY = Math.abs(fanT - 0.5) * 18;
                  return (
                    <div
                      key={c.instanceId}
                      className="battle-hand-fan-slot"
                      style={
                        {
                          ["--hand-fan-angle" as string]: `${fanAngle}deg`,
                          ["--hand-fan-y" as string]: `${fanY}px`,
                          ["--hand-fan-z" as string]: String(handIndex),
                        } as CSSProperties
                      }
                    >
                    <CardFace
                      defId={c.defId}
                      size="hand"
                      enableHoverZoom
                      previewPinned={previewHand === c.instanceId}
                      selected={
                        selectedHand === c.instanceId || draggingHand === c.instanceId
                      }
                      unaffordable={costBlocked}
                      blockReason={banner}
                      playCost={cost}
                      shake={illegalHandId === c.instanceId}
                      draggable={isPlayerTurn && !busy && !costBlocked}
                      onSelectForPlay={() => selectHandForPlay(c.instanceId)}
                      onOpenDetail={() => {
                        setSelectedHand(c.instanceId);
                        openInspect(c.defId, true);
                      }}
                      onPlay={
                        isPlayerTurn && !costBlocked
                          ? () => tryPlayCard(c.instanceId)
                          : undefined
                      }
                      onDragStart={(e) => {
                        setSelectedHand(c.instanceId);
                        setPreviewHand(null);
                        setDraggingHand(c.instanceId);
                        setPlayHint(null);
                        e.dataTransfer.setData(HAND_DRAG_MIME, c.instanceId);
                        e.dataTransfer.setData("text/plain", c.instanceId);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDraggingHand(null);
                        setFieldDropHover(false);
                      }}
                    />
                    </div>
                  );
                })}
                {player.hand.length === 0 && (
                  <p className="text-xs text-[var(--text-dim)]">No cards in hand.</p>
                )}
              </div>
            </section>

            <footer className="battle-console__command-bar">
              <div className="battle-console__command-meta">
                <strong>ARENA</strong> · {deskMode}
                <br />
                {guidance}
              </div>
              <CombatCommandActions
                canPlaySelected={canPlaySelected}
                playDisabledReason={playDisabledReason}
                preferEndTurn={preferEndTurn}
                endTurnHint={endTurnHint}
                busy={busy}
                matchStatus={snap.status}
                onPlay={() => selectedHand && tryPlayCard(selectedHand)}
                onEndTurn={() => void act({ kind: "END_TURN" })}
                onSurrender={() => void act({ kind: "SURRENDER" })}
                onRematch={() => void start()}
              />
              <div
                className={cn(
                  "battle-console__command-meta battle-console__command-energy text-right max-md:text-left",
                  sideHasMeterPulse(
                    battleVfx.meterPulses,
                    player.id,
                    "energySpend",
                  ) && "battle-console__command-energy--spend",
                  sideHasMeterPulse(
                    battleVfx.meterPulses,
                    player.id,
                    "energy",
                  ) && "battle-console__command-energy--gain",
                  energyDenyPulse > 0 && "battle-console__command-energy--deny",
                )}
              >
                <strong>RIFT ENERGY</strong>{" "}
                <span className="battle-console__command-energy-pool">
                  {player.riftEnergy}/{player.riftEnergyMax}
                </span>
                <br />
                HP {player.keeperHp}/{player.maxKeeperHp} · Deck {player.deckCount}
              </div>
            </footer>
          </>
        )}
      </ConsoleShell>

      <BattleModeMenu
        open={Boolean(battleLayout?.battleMenuOpen)}
        onClose={() => {
          battleLayout?.setBattleMenuOpen(false);
          setSettingsOpen(false);
        }}
        exitHref={backHref}
        settingsOpen={settingsOpen}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {settingsOpen && !battleLayout?.battleMenuOpen ? (
        <div className="battle-mode-menu" role="dialog" aria-modal="true" aria-label="Battle settings">
          <button
            type="button"
            className="battle-mode-menu__backdrop"
            aria-label="Close settings"
            onClick={() => setSettingsOpen(false)}
          />
          <div className="battle-mode-menu__panel">
            <BattleLayoutSettings onClose={() => setSettingsOpen(false)} />
          </div>
        </div>
      ) : null}

      <TcgCardDetailModal
        open={!!inspectDefId}
        defId={inspectDefId}
        onClose={() => {
          setInspectDefId(null);
          setInspectFromHand(false);
        }}
        battlePlay={
          inspectFromHand && selectedHand
            ? {
                canPlay: canPlaySelected,
                playDisabledReason,
                energyLabel: player
                  ? `${player.riftEnergy}/${player.riftEnergyMax}`
                  : null,
                onPlay: () => {
                  if (selectedHand) tryPlayCard(selectedHand);
                },
              }
            : null
        }
      />
    </div>
  );
}

function StatusStrip({
  side,
  role,
  emphasizeEnergy,
  damagePulse,
  energyPulse,
  energySpendPulse,
  energyDeny,
}: {
  side: ClientSide;
  role: string;
  emphasizeEnergy?: boolean;
  damagePulse?: boolean;
  energyPulse?: boolean;
  energySpendPulse?: boolean;
  energyDeny?: boolean;
}) {
  const hpPct = Math.max(
    0,
    Math.min(100, (side.keeperHp / Math.max(1, side.maxKeeperHp)) * 100),
  );
  const energyPct = Math.max(
    0,
    Math.min(100, (side.riftEnergy / Math.max(1, side.riftEnergyMax)) * 100),
  );

  return (
    <div
      className={cn(
        "battle-console__status",
        emphasizeEnergy && "battle-console__status--you",
        damagePulse && "battle-console__status--hit",
        energyPulse && "battle-console__status--energy-gain",
        energySpendPulse && "battle-console__status--energy-spend",
        energyDeny && "battle-console__status--energy-deny",
      )}
    >
      <div className="battle-console__status-name">
        <span className="battle-console__status-role">{role}</span>
        <span className="battle-console__status-keeper">{side.name}</span>
      </div>
      <div className="battle-console__meters">
        <div
          className={cn(
            "battle-console__meter",
            damagePulse && "battle-console__meter--hit",
          )}
        >
          <span className="battle-console__meter-label">
            <Heart aria-hidden />
            Keeper HP
          </span>
          <span className="battle-console__meter-value battle-console__meter-value--hp">
            {side.keeperHp}/{side.maxKeeperHp}
          </span>
          <div className="battle-console__bar battle-console__bar--hp" aria-hidden>
            <i style={{ width: `${hpPct}%` }} />
          </div>
        </div>
        <div
          className={cn(
            "battle-console__meter",
            emphasizeEnergy && "battle-console__meter--energy-hero",
            energyPulse && "battle-console__meter--energy-pulse",
            energySpendPulse && "battle-console__meter--energy-spend",
            energyDeny && "battle-console__meter--energy-deny",
          )}
          aria-label={`Rift Energy ${side.riftEnergy} of ${side.riftEnergyMax}`}
        >
          <span className="battle-console__meter-label">
            <Zap aria-hidden />
            Rift Energy
          </span>
          <span
            className={cn(
              "battle-console__meter-value battle-console__meter-value--energy",
              emphasizeEnergy && "battle-console__meter-value--energy-hero",
              energyDeny && "battle-console__meter-value--energy-deny",
            )}
          >
            {side.riftEnergy}
            <small>/{side.riftEnergyMax}</small>
          </span>
          <div
            className={cn(
              "battle-console__bar battle-console__bar--energy",
              energyPulse && "battle-console__bar--energy-refill",
              energySpendPulse && "battle-console__bar--energy-spend",
              energyDeny && "battle-console__bar--energy-deny",
            )}
            aria-hidden
          >
            <i style={{ width: `${energyPct}%` }} />
          </div>
        </div>
        <div className="battle-console__meter">
          <span className="battle-console__meter-label">
            <Layers aria-hidden />
            Deck
          </span>
          <span className="battle-console__meter-value battle-console__meter-value--deck">
            {side.deckCount}
          </span>
        </div>
      </div>
    </div>
  );
}

function FieldCombatOverlay({ unit }: { unit: ClientUnit }) {
  const atk = unit.attack ?? unit.power;
  const def = unit.defense ?? 0;
  const hp = unit.health;
  const maxHp = unit.maxHealth ?? hp;
  const spd = unit.speed;
  const statusIds = (unit.statuses ?? []).map((s) => s.id);
  if (hp == null && spd == null) return null;
  return (
    <div className="battle-field-overlay" aria-label="Live combat stats">
      <span className="battle-field-overlay__stat" title="Attack">
        {atk}
      </span>
      <span className="battle-field-overlay__stat" title="Defense">
        {def}
      </span>
      <span className="battle-field-overlay__stat" title="Health">
        {hp ?? "—"}
        {maxHp != null && hp != null && hp !== maxHp ? `/${maxHp}` : ""}
      </span>
      {spd != null ? (
        <span className="battle-field-overlay__stat" title="Speed">
          {spd}
        </span>
      ) : null}
      {unit.exhausted ? (
        <span className="battle-field-overlay__ex" title="Resting — strikes on a later turn">
          Rest
        </span>
      ) : (
        <span className="battle-field-overlay__ex" title="Ready to strike">
          Ready
        </span>
      )}
      {statusIds.length > 0 ? (
        <span className="battle-field-overlay__status">
          {statusIds.slice(0, 2).join("·")}
        </span>
      ) : null}
    </div>
  );
}

function BoardRow({
  units,
  emptyLabel,
  yours,
  sideId,
  spawnToken = 0,
  boardPulse,
  reduceMotion,
  mood = null,
  showLanes,
  highlightIds,
  dropReady,
  dropInvalid,
  dropHover,
  dropHint,
  onInspect,
  onFieldActivate,
  onDragOverField,
  onDragLeaveField,
  onDropField,
}: {
  units: ClientUnit[];
  emptyLabel: string;
  yours?: boolean;
  sideId?: string;
  spawnToken?: number;
  boardPulse?: { kind: "summon" | "attack" | "spell"; affinity?: string } | undefined;
  reduceMotion?: boolean;
  /** End-of-match card emotion on this lane. */
  mood?: "celebrate" | "sad" | null;
  showLanes?: boolean;
  highlightIds?: string[];
  dropReady?: boolean;
  dropInvalid?: boolean;
  dropHover?: boolean;
  dropHint?: string | null;
  onInspect: (defId: string) => void;
  onFieldActivate?: () => void;
  onDragOverField?: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeaveField?: () => void;
  onDropField?: (e: DragEvent<HTMLDivElement>) => void;
}) {
  const emptySlots = Math.max(0, TCG_DEFAULTS.maxBoardUnits - units.length);
  const front = units.filter((u) => (u.lane ?? "front") === "front");
  const back = units.filter((u) => u.lane === "back");
  const interactive = Boolean(yours && (dropReady || dropInvalid));
  const lastUnitId = units[units.length - 1]?.instanceId;
  const spawnSeen = useRef<Record<string, number>>({});

  // Mark newest unit(s) as spawning when spawnToken bumps for this side.
  const [spawnIds, setSpawnIds] = useState<Record<string, true>>({});
  useEffect(() => {
    if (!sideId || !spawnToken || units.length === 0) return;
    const prevToken = spawnSeen.current[sideId] ?? 0;
    if (prevToken >= spawnToken) return;
    const delta = Math.min(units.length, spawnToken - prevToken);
    spawnSeen.current[sideId] = spawnToken;
    const fresh = units.slice(-delta).map((u) => u.instanceId);
    setSpawnIds((prev) => {
      const next = { ...prev };
      for (const id of fresh) next[id] = true;
      return next;
    });
    const t = window.setTimeout(
      () => {
        setSpawnIds((prev) => {
          const next = { ...prev };
          for (const id of fresh) delete next[id];
          return next;
        });
      },
      reduceMotion ? 280 : 720,
    );
    return () => window.clearTimeout(t);
  }, [sideId, spawnToken, units, reduceMotion]);

  return (
    <div
      className={cn(
        "battle-console__lane relative",
        yours && "battle-console__lane--you",
        mood === "celebrate" && "battle-console__lane--celebrate",
        mood === "sad" && "battle-console__lane--sad",
        dropReady && "battle-console__lane--drop-ready",
        dropInvalid && "battle-console__lane--drop-invalid",
        dropHover && dropReady && "battle-console__lane--drop-hover",
        boardPulse?.kind === "attack" && "battle-console__lane--striking",
        boardPulse?.kind === "spell" && "battle-console__lane--casting",
        boardPulse?.kind === "summon" && "battle-console__lane--summoning",
      )}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={
        yours
          ? dropReady
            ? `${emptyLabel} — drop or tap to play`
            : dropInvalid && dropHint
              ? `${emptyLabel} — ${dropHint}`
              : emptyLabel
          : emptyLabel
      }
      onClick={(e) => {
        if (!yours || !onFieldActivate) return;
        const target = e.target as HTMLElement | null;
        if (target?.closest("button")) return;
        onFieldActivate();
      }}
      onKeyDown={(e) => {
        if (!yours || !onFieldActivate) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onFieldActivate();
        }
      }}
      onDragOver={yours ? onDragOverField : undefined}
      onDragLeave={yours ? onDragLeaveField : undefined}
      onDrop={yours ? onDropField : undefined}
    >
      {showLanes && units.length > 0 ? (
        <div className="battle-console__lane-tags pointer-events-none absolute left-2 top-1 z-[1] flex gap-2 text-[10px] uppercase tracking-wider text-white/50">
          <span>Front {front.length}/{TCG_DEFAULTS.frontlineSlots}</span>
          <span>Back {back.length}/{TCG_DEFAULTS.backlineSlots}</span>
        </div>
      ) : null}
      {units.map((u) => (
        <BoardUnitShell
          key={u.instanceId}
          affinity={u.affinity}
          exhausted={u.exhausted}
          spawn={Boolean(spawnIds[u.instanceId])}
          attackPulse={boardPulse?.kind === "attack"}
          summonPulse={
            boardPulse?.kind === "summon" &&
            Boolean(spawnIds[u.instanceId] || u.instanceId === lastUnitId)
          }
          highlight={Boolean(highlightIds?.includes(u.instanceId))}
          reduceMotion={reduceMotion}
        >
          <div
            className="battle-console__unit-wrap"
            data-lane={u.lane ?? "front"}
            title={
              (u.lane ?? "front") === "front"
                ? "Frontline — protects Keeper"
                : "Backline — support"
            }
          >
            <CardFace
              defId={u.defId}
              size="board"
              onOpenDetail={() => onInspect(u.defId)}
            />
            <FieldCombatOverlay unit={u} />
            {showLanes ? (
              <span className="battle-field-overlay__lane absolute bottom-0 right-0 rounded bg-black/55 px-1 text-[9px] uppercase text-white/70">
                {(u.lane ?? "front") === "front" ? "F" : "B"}
                {u.exhausted ? "" : u.cannotStrikeKeeper ? "·R" : "·"}
              </span>
            ) : null}
          </div>
        </BoardUnitShell>
      ))}
      {emptySlots > 0 && (
        <div
          className={cn(
            "battle-console__lane-empty",
            units.length > 0 && "battle-console__lane-empty--partial",
          )}
        >
          <div className="battle-console__lane-slots" aria-hidden>
            {Array.from({ length: emptySlots }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "battle-console__lane-slot",
                  dropReady && "battle-console__lane-slot--ready",
                  dropInvalid && "battle-console__lane-slot--blocked",
                )}
              />
            ))}
          </div>
          <span>
            {dropHint && (dropReady || dropInvalid) ? dropHint : emptyLabel}
          </span>
        </div>
      )}
      {units.length > 0 && emptySlots === 0 && dropHint && (dropReady || dropInvalid) ? (
        <span className="battle-console__lane-drop-label">{dropHint}</span>
      ) : null}
    </div>
  );
}
