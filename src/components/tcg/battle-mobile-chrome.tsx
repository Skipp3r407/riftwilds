"use client";

import {
  Flag,
  Menu,
  Settings,
  SkipForward,
  Swords,
  Undo2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type DockProps = {
  canPlaySelected: boolean;
  playDisabledReason: string | null;
  preferEndTurn?: boolean;
  endTurnHint?: string;
  busy: boolean;
  matchActive: boolean;
  canCommanderFocus?: boolean;
  commanderFocusHint?: string;
  onPlay: () => void;
  onEndTurn: () => void;
  onCommanderFocus?: () => void;
  onSettings: () => void;
  onMenu: () => void;
  /** Scaffold — engine undo not wired yet. */
  onUndo?: () => void;
  undoAvailable?: boolean;
  className?: string;
};

/**
 * Floating mobile / tablet action dock.
 * Primary: Play · End Turn · Commander · Settings · Pass · Undo (scaffold).
 */
export function BattleMobileActionDock({
  canPlaySelected,
  playDisabledReason,
  preferEndTurn,
  endTurnHint,
  busy,
  matchActive,
  canCommanderFocus,
  commanderFocusHint,
  onPlay,
  onEndTurn,
  onCommanderFocus,
  onSettings,
  onMenu,
  onUndo,
  undoAvailable = false,
  className,
}: DockProps) {
  const endPrimary = Boolean(preferEndTurn) && matchActive;

  return (
    <nav
      className={cn("battle-mobile-dock", className)}
      aria-label="Battle actions"
    >
      <button
        type="button"
        className={cn(
          "battle-mobile-dock__btn focus-ring",
          !endPrimary && "battle-mobile-dock__btn--primary",
        )}
        disabled={!canPlaySelected}
        title={playDisabledReason ?? "Play selected card"}
        onClick={onPlay}
      >
        <Swords aria-hidden />
        <span>Play</span>
      </button>
      <button
        type="button"
        className={cn(
          "battle-mobile-dock__btn focus-ring",
          endPrimary && "battle-mobile-dock__btn--primary",
        )}
        disabled={busy || !matchActive}
        title={endTurnHint ?? "End turn"}
        onClick={onEndTurn}
      >
        <Flag aria-hidden />
        <span>End</span>
      </button>
      <button
        type="button"
        className="battle-mobile-dock__btn focus-ring"
        disabled={busy || !matchActive || !canCommanderFocus}
        title={commanderFocusHint ?? "Commander Focus"}
        onClick={onCommanderFocus}
      >
        <Zap aria-hidden />
        <span>Cmd</span>
      </button>
      <button
        type="button"
        className="battle-mobile-dock__btn focus-ring"
        title="Pass — end turn"
        disabled={busy || !matchActive}
        onClick={onEndTurn}
      >
        <SkipForward aria-hidden />
        <span>Pass</span>
      </button>
      <button
        type="button"
        className="battle-mobile-dock__btn focus-ring"
        title={undoAvailable ? "Undo last action" : "Undo unavailable"}
        disabled={!undoAvailable || busy}
        onClick={onUndo}
      >
        <Undo2 className="battle-mobile-dock__undo-icon" aria-hidden />
        <span>Undo</span>
      </button>
      <button
        type="button"
        className="battle-mobile-dock__btn focus-ring"
        title="Settings"
        onClick={onSettings}
      >
        <Settings aria-hidden />
        <span>Set</span>
      </button>
      <button
        type="button"
        className="battle-mobile-dock__btn focus-ring"
        title="Battle menu"
        onClick={onMenu}
      >
        <Menu aria-hidden />
        <span>Menu</span>
      </button>
    </nav>
  );
}

/** Compact phone top bar: HP · Energy · Deck · Menu only. */
export function BattleMobileTopBar({
  hp,
  maxHp,
  energy,
  energyMax,
  deckCount,
  onMenu,
}: {
  hp: number;
  maxHp: number;
  energy: number;
  energyMax: number;
  deckCount: number;
  onMenu: () => void;
}) {
  return (
    <div className="battle-mobile-topbar" role="status" aria-label="Match vitals">
      <span className="battle-mobile-topbar__stat" title="Keeper HP">
        HP {hp}/{maxHp}
      </span>
      <span className="battle-mobile-topbar__stat" title="Rift Energy">
        EN {energy}/{energyMax}
      </span>
      <span className="battle-mobile-topbar__stat" title="Deck">
        Deck {deckCount}
      </span>
      <button
        type="button"
        className="battle-mobile-topbar__menu focus-ring"
        title="Battle menu"
        onClick={onMenu}
      >
        <Menu className="h-4 w-4" aria-hidden />
        <span className="sr-only">Menu</span>
      </button>
    </div>
  );
}

/** Tablet FAB to toggle intel / feed drawers. */
export function BattleTabletFab({
  onIntel,
  onFeed,
  intelOpen,
  feedOpen,
}: {
  onIntel: () => void;
  onFeed: () => void;
  intelOpen: boolean;
  feedOpen: boolean;
}) {
  return (
    <div className="battle-tablet-fab" role="group" aria-label="Panel shortcuts">
      <button
        type="button"
        className={cn(
          "battle-tablet-fab__btn focus-ring",
          intelOpen && "is-active",
        )}
        aria-pressed={intelOpen}
        title="Match Intel"
        onClick={onIntel}
      >
        Intel
      </button>
      <button
        type="button"
        className={cn(
          "battle-tablet-fab__btn focus-ring",
          feedOpen && "is-active",
        )}
        aria-pressed={feedOpen}
        title="Event Feed"
        onClick={onFeed}
      >
        Feed
      </button>
    </div>
  );
}
