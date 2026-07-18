"use client";

import { useMemo, useState } from "react";
import {
  ACTION_DEFS,
  type ActionId,
  type KeyChord,
  type KeybindMap,
  defaultKeybinds,
  findKeyConflicts,
  formatChord,
  loadKeybinds,
  resetKeybinds,
  saveKeybinds,
} from "@/game/live-world/input/keybinds";
import { getInputManager } from "@/game/live-world/input/input-manager";

type Props = {
  compact?: boolean;
};

export function KeybindsPanel({ compact }: Props) {
  const [binds, setBinds] = useState<KeybindMap>(() => loadKeybinds());
  const [listening, setListening] = useState<ActionId | null>(null);
  const conflicts = useMemo(() => findKeyConflicts(binds), [binds]);

  const apply = (next: KeybindMap) => {
    setBinds(next);
    saveKeybinds(next);
    getInputManager().setKeybinds(next);
  };

  const onCapture = (action: ActionId, e: React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.code === "Escape") {
      setListening(null);
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      // Never bind protected browser chords
      if (["KeyC", "KeyV", "KeyR", "KeyL", "KeyT", "KeyW"].includes(e.code)) {
        setListening(null);
        return;
      }
    }
    const chord: KeyChord = {
      code: e.code,
      ctrl: e.ctrlKey || e.metaKey,
      shift: e.shiftKey,
      alt: e.altKey,
    };
    const next = { ...binds, [action]: [chord] };
    apply(next);
    setListening(null);
  };

  const categories = ["movement", "ui", "chat", "social", "combat", "debug"] as const;

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--text-muted)]">
          Remap Live World controls. Conflicts highlighted. Ctrl+C/V/R/L/T/W and F5 stay with the
          browser.
        </p>
        <button
          type="button"
          className="btn-secondary focus-ring text-xs"
          onClick={() => apply(resetKeybinds())}
        >
          Reset defaults
        </button>
      </div>
      {conflicts.length > 0 ? (
        <p className="rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          {conflicts.length} conflict(s) — e.g. {conflicts[0]!.actionA} vs {conflicts[0]!.actionB} (
          {formatChord(conflicts[0]!.chord)})
        </p>
      ) : null}
      {categories.map((cat) => {
        const rows = ACTION_DEFS.filter((d) => d.category === cat);
        if (!rows.length) return null;
        return (
          <section key={cat}>
            <h3 className="mb-2 font-display text-sm capitalize text-white">{cat}</h3>
            <ul className="space-y-1">
              {rows.map((def) => {
                const chords = binds[def.id] ?? defaultKeybinds()[def.id];
                const hasConflict = conflicts.some(
                  (c) => c.actionA === def.id || c.actionB === def.id,
                );
                return (
                  <li
                    key={def.id}
                    className={`flex items-center justify-between gap-2 rounded border px-3 py-2 text-sm ${
                      hasConflict
                        ? "border-amber-500/50 bg-amber-500/5"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <span className="text-[var(--text-muted)]">{def.label}</span>
                    <button
                      type="button"
                      className="focus-ring min-w-[7rem] rounded bg-black/40 px-2 py-1 font-mono text-xs text-[var(--cyan)]"
                      onClick={() => setListening(def.id)}
                      onKeyDown={(e) => {
                        if (listening === def.id) onCapture(def.id, e);
                      }}
                    >
                      {listening === def.id
                        ? "Press key…"
                        : chords.map(formatChord).join(" / ")}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
