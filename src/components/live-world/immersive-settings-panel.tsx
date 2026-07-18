"use client";

import type { ImmersiveSettings } from "@/game/live-world/systems/immersive/types";
import { listImmersiveControllerStubs } from "@/game/live-world/systems/immersive/controller-stubs";
import { CAMERA_FEATURE_STUBS } from "@/game/live-world/systems/immersive/camera-enhancements";
import {
  resetHudPanelLayoutSettings,
  suggestedChromeCollapseForHudMode,
} from "@/game/live-world/systems/immersive/settings";
import { playSfx } from "@/hooks/use-sfx";

type Props = {
  settings: ImmersiveSettings;
  onChange: (
    patch:
      | Partial<ImmersiveSettings>
      | ((prev: ImmersiveSettings) => Partial<ImmersiveSettings>),
  ) => void;
  fullscreenActive: boolean;
  onToggleFullscreen: () => void;
  onClose: () => void;
  /** Replace full settings (used by Reset layout). */
  onReplace?: (next: ImmersiveSettings) => void;
};

const HUD_MODES: ImmersiveSettings["hudMode"][] = [
  "standard",
  "minimal",
  "immersive",
  "cinematic",
];
const CHAT_MODES: ImmersiveSettings["chatMode"][] = [
  "pinned",
  "auto-hide",
  "transparent",
  "collapsed",
];
const WINDOW_MODES: ImmersiveSettings["windowModePreference"][] = [
  "windowed",
  "browser-fullscreen",
  "viewport-expand",
];

export function ImmersiveSettingsPanel({
  settings,
  onChange,
  fullscreenActive,
  onToggleFullscreen,
  onClose,
  onReplace,
}: Props) {
  const customPanelCount = Object.keys(settings.hudPanelLayout ?? {}).length;

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Display and HUD settings"
        data-testid="immersive-settings-panel"
        className="max-h-[90%] w-full max-w-lg overflow-auto rounded-lg border border-[var(--border)] bg-[#0c1420] p-4"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-display text-lg text-white">Display & HUD</h3>
          <button type="button" className="btn-secondary focus-ring text-xs" onClick={onClose}>
            Close
          </button>
        </div>

        <section className="space-y-3 text-sm">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              Window
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary focus-ring text-xs"
                data-testid="settings-fullscreen-toggle"
                onClick={() => {
                  playSfx("ui.click");
                  onToggleFullscreen();
                }}
              >
                {fullscreenActive ? "Exit fullscreen" : "Enter fullscreen"}
              </button>
              {WINDOW_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`focus-ring rounded px-2 py-1 text-[10px] ${
                    settings.windowModePreference === m
                      ? "bg-[var(--cyan)]/20 text-[var(--cyan)]"
                      : "bg-black/40 text-[var(--text-dim)]"
                  }`}
                  onClick={() => onChange({ windowModePreference: m })}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              HUD mode
            </span>
            <select
              className="mt-1 w-full rounded border border-[var(--border)] bg-black/40 px-2 py-1.5 text-xs text-white"
              value={settings.hudMode}
              onChange={(e) => {
                const hudMode = e.target.value as ImmersiveSettings["hudMode"];
                onChange({
                  hudMode,
                  ...suggestedChromeCollapseForHudMode(hudMode),
                });
              }}
            >
              {HUD_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-[var(--text-dim)]">
              Changing mode applies a matching chrome layout (peek tabs in Immersive /
              Cinematic). Individual collapse toggles still persist.
            </p>
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              HUD opacity ({Math.round(settings.hudOpacity * 100)}%)
            </span>
            <input
              type="range"
              min={0.15}
              max={1}
              step={0.05}
              value={settings.hudOpacity}
              className="mt-1 w-full"
              onChange={(e) => onChange({ hudOpacity: Number(e.target.value) })}
            />
          </label>

          <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <input
              type="checkbox"
              checked={settings.autoHideHud}
              onChange={(e) => onChange({ autoHideHud: e.target.checked })}
            />
            Auto-hide HUD (also forced in Immersive / Cinematic)
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              Auto-hide delay ({settings.autoHideDelayMs}ms)
            </span>
            <input
              type="range"
              min={800}
              max={8000}
              step={200}
              value={settings.autoHideDelayMs}
              className="mt-1 w-full"
              onChange={(e) => onChange({ autoHideDelayMs: Number(e.target.value) })}
            />
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              Chat mode
            </span>
            <select
              className="mt-1 w-full rounded border border-[var(--border)] bg-black/40 px-2 py-1.5 text-xs text-white"
              value={settings.chatMode}
              onChange={(e) =>
                onChange({ chatMode: e.target.value as ImmersiveSettings["chatMode"] })
              }
            >
              {CHAT_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              Collapsible HUD chrome
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={settings.toolbarCollapsed}
                  onChange={(e) => onChange({ toolbarCollapsed: e.target.checked })}
                />
                Collapse toolbar
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={settings.presenceHudCollapsed}
                  onChange={(e) => onChange({ presenceHudCollapsed: e.target.checked })}
                />
                Collapse presence
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={settings.townActivityCollapsed}
                  onChange={(e) => onChange({ townActivityCollapsed: e.target.checked })}
                />
                Collapse world pulse
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={settings.statusChromeCollapsed}
                  onChange={(e) => onChange({ statusChromeCollapsed: e.target.checked })}
                />
                Collapse status
              </label>
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              Panel layout
            </p>
            <p className="mb-2 text-[10px] text-[var(--text-dim)]">
              Drag panel headers (grip) to reposition. Positions save for this browser.
              {customPanelCount > 0
                ? ` ${customPanelCount} custom position${customPanelCount === 1 ? "" : "s"} saved.`
                : " Using default docked layout."}
            </p>
            <button
              type="button"
              className="btn-secondary focus-ring text-xs"
              data-testid="settings-reset-hud-layout"
              onClick={() => {
                playSfx("ui.click");
                const next = resetHudPanelLayoutSettings(settings);
                if (onReplace) onReplace(next);
                else onChange({ hudPanelLayout: {}, minimapCorner: "top-right" });
              }}
            >
              Reset layout
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={settings.minimapHidden}
                onChange={(e) => onChange({ minimapHidden: e.target.checked })}
              />
              Hide minimap
            </label>
            <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={settings.minimapCollapsed}
                onChange={(e) => onChange({ minimapCollapsed: e.target.checked })}
              />
              Collapse minimap
            </label>
            <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={settings.minimapLocked}
                onChange={(e) => onChange({ minimapLocked: e.target.checked })}
              />
              Lock minimap
            </label>
            <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={settings.smoothZoom}
                onChange={(e) => onChange({ smoothZoom: e.target.checked })}
              />
              Smooth zoom preference
            </label>
          </div>

          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              Minimap opacity ({Math.round(settings.minimapOpacity * 100)}%)
            </span>
            <input
              type="range"
              min={0.2}
              max={1}
              step={0.05}
              value={settings.minimapOpacity}
              className="mt-1 w-full"
              onChange={(e) => onChange({ minimapOpacity: Number(e.target.value) })}
            />
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              Minimap size ({settings.minimapSize}px)
            </span>
            <input
              type="range"
              min={96}
              max={220}
              step={4}
              value={settings.minimapSize}
              className="mt-1 w-full"
              onChange={(e) => onChange({ minimapSize: Number(e.target.value) })}
            />
          </label>

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              Accessibility
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => onChange({ reducedMotion: e.target.checked })}
                />
                Reduced motion
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.largeUi}
                  onChange={(e) => onChange({ largeUi: e.target.checked })}
                />
                Large UI
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => onChange({ highContrast: e.target.checked })}
                />
                High contrast
              </label>
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              Performance
            </p>
            <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={settings.performanceCull}
                onChange={(e) => onChange({ performanceCull: e.target.checked })}
              />
              Cull distant FX (stub)
            </label>
            <select
              className="mt-2 w-full rounded border border-[var(--border)] bg-black/40 px-2 py-1.5 text-xs text-white"
              value={settings.particleBudget}
              onChange={(e) =>
                onChange({
                  particleBudget: e.target.value as ImmersiveSettings["particleBudget"],
                })
              }
            >
              <option value="full">Particles: full</option>
              <option value="reduced">Particles: reduced</option>
              <option value="minimal">Particles: minimal</option>
            </select>
          </div>

          <details className="rounded border border-[var(--border)]/60 p-2 text-[10px] text-[var(--text-dim)]">
            <summary className="cursor-pointer text-[var(--text-muted)]">
              Camera & controller stubs
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {CAMERA_FEATURE_STUBS.map((s) => (
                <li key={s.id}>
                  {s.id} ({s.status}): {s.note}
                </li>
              ))}
              {listImmersiveControllerStubs().map((b) => (
                <li key={b.action}>
                  {b.button} → {b.action}
                </li>
              ))}
            </ul>
          </details>
        </section>
      </div>
    </div>
  );
}
