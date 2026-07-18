"use client";

import Link from "next/link";
import { getInputManager } from "@/game/live-world/input/input-manager";
import { FullscreenToggleButton } from "@/components/live-world/fullscreen-toggle-button";
import { playSfx } from "@/hooks/use-sfx";

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenKeybinds: () => void;
  onOpenDisplaySettings?: () => void;
  onExitWorld: () => void;
  /** Opens safe/unsafe logout countdown flow. */
  onLogout?: () => void;
  fullscreenActive?: boolean;
  onToggleFullscreen?: () => void;
};

export function LiveWorldPauseMenu({
  open,
  onClose,
  onOpenKeybinds,
  onOpenDisplaySettings,
  onExitWorld,
  onLogout,
  fullscreenActive = false,
  onToggleFullscreen,
}: Props) {
  if (!open) return null;

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pause menu"
        className="w-full max-w-sm rounded-lg border border-[var(--stroke)] bg-[#0c1420] p-5 shadow-xl"
      >
        <p className="font-display text-[10px] uppercase tracking-[0.2em] text-[var(--cyan)]">
          System
        </p>
        <h3 className="mt-1 font-display text-xl text-white">World Menu</h3>
        <ul className="mt-4 space-y-2">
          <li>
            <button
              type="button"
              className="focus-ring w-full rounded border border-[var(--stroke)] px-3 py-2.5 text-left text-sm text-white hover:border-[var(--cyan)]/40"
              onClick={() => {
                playSfx("ui.click");
                onClose();
                getInputManager().closePanel();
              }}
            >
              Resume
            </button>
          </li>
          <li>
            <Link
              href="/help"
              className="focus-ring block w-full rounded border border-[var(--cyan)]/35 bg-[rgba(61,231,255,0.08)] px-3 py-2.5 text-left text-sm text-[var(--cyan)]"
              onClick={() => playSfx("ui.nav")}
            >
              Help
            </Link>
          </li>
          <li>
            <Link
              href="/feedback"
              className="focus-ring block w-full rounded border border-[var(--stroke)] px-3 py-2.5 text-left text-sm text-[var(--text-muted)] hover:text-white"
              onClick={() => playSfx("ui.nav")}
            >
              Feedback / Bug Report
            </Link>
          </li>
          {onToggleFullscreen ? (
            <li>
              <FullscreenToggleButton
                active={fullscreenActive}
                onToggle={onToggleFullscreen}
                className="w-full !justify-start px-3 py-2.5 text-left text-sm"
              />
            </li>
          ) : null}
          {onOpenDisplaySettings ? (
            <li>
              <button
                type="button"
                className="focus-ring w-full rounded border border-[var(--stroke)] px-3 py-2.5 text-left text-sm text-[var(--text-muted)] hover:text-white"
                onClick={() => {
                  playSfx("ui.click");
                  onClose();
                  onOpenDisplaySettings();
                }}
              >
                Display & HUD
              </button>
            </li>
          ) : null}
          <li>
            <button
              type="button"
              className="focus-ring w-full rounded border border-[var(--stroke)] px-3 py-2.5 text-left text-sm text-[var(--text-muted)] hover:text-white"
              onClick={() => {
                playSfx("ui.click");
                onClose();
                onOpenKeybinds();
              }}
            >
              Keybinds (F2)
            </button>
          </li>
          {onLogout ? (
            <li>
              <button
                type="button"
                className="focus-ring w-full rounded border border-[var(--cyan)]/40 px-3 py-2.5 text-left text-sm text-[var(--cyan)]"
                onClick={() => {
                  playSfx("ui.click");
                  onClose();
                  getInputManager().closePanel();
                  onLogout();
                }}
              >
                Rest / Log out…
              </button>
            </li>
          ) : null}
          <li>
            <button
              type="button"
              className="focus-ring w-full rounded border border-[var(--stroke)] px-3 py-2.5 text-left text-sm text-[var(--amber)]"
              onClick={() => {
                playSfx("ui.click");
                onClose();
                getInputManager().closePanel();
                onExitWorld();
              }}
            >
              Exit world
            </button>
          </li>
        </ul>
        <p className="mt-4 text-[10px] text-[var(--text-dim)]">
          Esc closes panels first, then this menu. F / Alt+Enter toggles fullscreen. F1 Academy.
        </p>
      </div>
    </div>
  );
}
