"use client";

import Link from "next/link";
import {
  BookOpen,
  History,
  Layers,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import { useBattleLayoutOptional } from "@/components/tcg/battle-layout-context";
import {
  BATTLE_LAYOUT_PRESETS,
  BATTLE_SIDEBAR_MODES,
  type BattleLayoutPreset,
  type BattleSidebarMode,
} from "@/lib/tcg/battle-layout-prefs";
import { cn } from "@/lib/utils/cn";
import { playSfx } from "@/hooks/use-sfx";

/**
 * ESC Battle Menu — in-battle destinations only:
 * Deck, Codex, Settings, Match History, Exit Match.
 */
export function BattleModeMenu({
  open,
  onClose,
  exitHref,
  settingsOpen,
  onOpenSettings,
}: {
  open: boolean;
  onClose: () => void;
  exitHref: string;
  settingsOpen: boolean;
  onOpenSettings: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="battle-mode-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Battle menu"
    >
      <button
        type="button"
        className="battle-mode-menu__backdrop"
        aria-label="Close battle menu"
        onClick={onClose}
      />
      <div className="battle-mode-menu__panel">
        <div className="battle-mode-menu__head">
          <p className="battle-mode-menu__title">Battle Menu</p>
          <button
            type="button"
            className="battle-mode-menu__close focus-ring"
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <p className="battle-mode-menu__hint">Esc closes · Tab toggles sidebar</p>
        <nav className="battle-mode-menu__nav" aria-label="In-battle navigation">
          <Link
            href="/tcg/deck-builder"
            className="battle-mode-menu__link focus-ring"
            onClick={() => playSfx("ui.nav")}
          >
            <Layers aria-hidden />
            Deck
          </Link>
          <Link
            href="/tcg/codex"
            className="battle-mode-menu__link focus-ring"
            onClick={() => playSfx("ui.nav")}
          >
            <BookOpen aria-hidden />
            Codex
          </Link>
          <button
            type="button"
            className="battle-mode-menu__link focus-ring"
            onClick={() => {
              playSfx("ui.nav");
              onOpenSettings();
            }}
          >
            <Settings aria-hidden />
            Settings
          </button>
          <Link
            href="/arena"
            className="battle-mode-menu__link focus-ring"
            onClick={() => playSfx("ui.nav")}
          >
            <History aria-hidden />
            Match History
          </Link>
          <Link
            href={exitHref}
            className="battle-mode-menu__link battle-mode-menu__link--exit focus-ring"
            onClick={() => playSfx("ui.nav")}
          >
            <LogOut aria-hidden />
            Exit Match
          </Link>
        </nav>
        {settingsOpen ? <BattleLayoutSettings inline onClose={onClose} /> : null}
      </div>
    </div>
  );
}

export function BattleLayoutSettings({
  inline,
  onClose,
}: {
  inline?: boolean;
  onClose?: () => void;
}) {
  const layout = useBattleLayoutOptional();
  if (!layout) return null;

  return (
    <div
      className={cn(
        "battle-layout-settings",
        inline && "battle-layout-settings--inline",
      )}
    >
      <div className="battle-layout-settings__head">
        <p className="battle-layout-settings__title">Battle Layout</p>
        {onClose && !inline ? (
          <button type="button" className="battle-mode-menu__close focus-ring" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden />
            <span className="sr-only">Close settings</span>
          </button>
        ) : null}
      </div>

      <fieldset className="battle-layout-settings__fieldset">
        <legend>Layout preset</legend>
        <div className="battle-layout-settings__options">
          {BATTLE_LAYOUT_PRESETS.map((p) => (
            <label
              key={p.id}
              className={cn(
                "battle-layout-settings__option",
                layout.layoutPreset === p.id && "is-active",
              )}
            >
              <input
                type="radio"
                name="battle-layout-preset"
                value={p.id}
                checked={layout.layoutPreset === p.id}
                onChange={() => layout.setLayoutPreset(p.id as BattleLayoutPreset)}
              />
              <span>
                <strong>{p.label}</strong>
                <small>{p.description}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="battle-layout-settings__fieldset">
        <legend>Sidebar</legend>
        <div className="battle-layout-settings__options">
          {BATTLE_SIDEBAR_MODES.map((m) => (
            <label
              key={m.id}
              className={cn(
                "battle-layout-settings__option",
                layout.sidebarMode === m.id && "is-active",
              )}
            >
              <input
                type="radio"
                name="battle-sidebar-mode"
                value={m.id}
                checked={layout.sidebarMode === m.id}
                onChange={() => layout.setSidebarMode(m.id as BattleSidebarMode)}
              />
              <span>
                <strong>{m.label}</strong>
                <small>{m.description}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="battle-layout-settings__fieldset">
        <legend>Focus Mode</legend>
        <label className="battle-layout-settings__toggle">
          <input
            type="checkbox"
            checked={layout.focusMode}
            onChange={(e) => layout.setFocusMode(e.target.checked)}
          />
          <span>
            Focus Mode hides the site header and expands the battlefield.
            Auto-enabled when you enter an active match. Wallet returns after
            Exit Match or when you turn Focus Mode off.
          </span>
        </label>
      </fieldset>

      <fieldset className="battle-layout-settings__fieldset">
        <legend>Mobile &amp; accessibility</legend>
        <label className="battle-layout-settings__toggle">
          <input
            type="checkbox"
            checked={layout.a11y.largeCard}
            onChange={(e) => layout.setA11y({ largeCard: e.target.checked })}
          />
          <span>Large cards — bigger hand and field hit targets (48×48 min).</span>
        </label>
        <label className="battle-layout-settings__toggle">
          <input
            type="checkbox"
            checked={layout.a11y.oneHand}
            onChange={(e) => layout.setA11y({ oneHand: e.target.checked })}
          />
          <span>One-hand — bias the action dock toward the thumb edge.</span>
        </label>
        <label className="battle-layout-settings__toggle">
          <input
            type="checkbox"
            checked={layout.a11y.highContrast}
            onChange={(e) => layout.setA11y({ highContrast: e.target.checked })}
          />
          <span>High contrast — stronger borders and meter contrast.</span>
        </label>
      </fieldset>

      <fieldset className="battle-layout-settings__fieldset">
        <legend>Performance profile</legend>
        <div className="battle-layout-settings__options">
          {(
            [
              ["auto", "Auto", "Balanced on phone/tablet; high on desktop."],
              ["high", "High", "Full VFX and hand fan motion."],
              ["balanced", "Balanced", "Softer motion; adaptive graphics scaffolding."],
              ["battery", "Battery", "Minimal motion; lowest GPU use."],
            ] as const
          ).map(([id, label, desc]) => (
            <label
              key={id}
              className={cn(
                "battle-layout-settings__option",
                layout.perfProfile === id && "is-active",
              )}
            >
              <input
                type="radio"
                name="battle-perf-profile"
                value={id}
                checked={layout.perfProfile === id}
                onChange={() => layout.setPerfProfile(id)}
              />
              <span>
                <strong>{label}</strong>
                <small>{desc}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="battle-layout-settings__keys">
        Shortcuts: <kbd>Tab</kbd> sidebar · <kbd>F11</kbd> fullscreen ·{" "}
        <kbd>Esc</kbd> menu · <kbd>Space</kbd> end turn
        {layout.compactViewport ? (
          <>
            {" "}
            · Touch: swipe L feed · R intel · up hand · down collapse
          </>
        ) : null}
      </p>
      {layout.compactViewport ? (
        <p className="battle-layout-settings__keys">
          Viewport: <strong>{layout.viewport}</strong> (DevTools device mode to preview)
        </p>
      ) : null}
    </div>
  );
}
