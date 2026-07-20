"use client";

import { useEffect, useState } from "react";
import {
  ensureDevMockState,
  patchDevMockState,
  resetDevMockState,
  type DevMockWorldState,
} from "@/lib/auth/dev-mock-store";
import { isDevOverrideUiEnabled } from "@/lib/auth/dev-override";

type ToolAction = {
  id: string;
  label: string;
  run: (state: DevMockWorldState) => DevMockWorldState | void;
};

const TOOLS: ToolAction[] = [
  {
    id: "spawn-card",
    label: "Spawn test card",
    run: (s) =>
      patchDevMockState({
        cards: [
          ...s.cards,
          {
            id: `card-${Date.now()}`,
            cardKey: "dev_spawned",
            qty: 1,
          },
        ],
      }),
  },
  {
    id: "spawn-egg",
    label: "Spawn egg",
    run: (s) =>
      patchDevMockState({
        inventory: [
          ...s.inventory,
          { id: `inv-${Date.now()}`, itemKey: "starter_egg", qty: 1 },
        ],
      }),
  },
  {
    id: "unlock-all",
    label: "Unlock all",
    run: (s) =>
      patchDevMockState({
        profile: {
          ...s.profile,
          unlocks: {
            cards: true,
            companions: true,
            comics: true,
            areas: true,
            quests: true,
            marketplace: true,
            guild: true,
            housing: true,
          },
        },
      }),
  },
  {
    id: "teleport",
    label: "Teleport Commons",
    run: (s) =>
      patchDevMockState({
        world: { ...s.world, region: "riftwild_commons", x: 512, y: 384 },
      }),
  },
  {
    id: "reset-quests",
    label: "Reset quests",
    run: () =>
      patchDevMockState({
        quests: [{ id: "q-reset", key: "tutorial_welcome", status: "active" }],
      }),
  },
  {
    id: "max-currency",
    label: "Max gold / shards",
    run: (s) =>
      patchDevMockState({
        profile: {
          ...s.profile,
          softCurrency: 9_999_999,
          shards: 9_999_999,
        },
      }),
  },
  {
    id: "sol-test",
    label: "SOL test balance",
    run: (s) =>
      patchDevMockState({
        profile: { ...s.profile, solTestBalance: 100 },
      }),
  },
  {
    id: "weather",
    label: "Cycle weather / time",
    run: (s) => {
      const weathers = ["clear", "rain", "riftstorm", "fog"];
      const times = ["dawn", "day", "dusk", "night"];
      const wi = (weathers.indexOf(s.world.weather) + 1) % weathers.length;
      const ti = (times.indexOf(s.world.timeOfDay) + 1) % times.length;
      return patchDevMockState({
        world: {
          ...s.world,
          weather: weathers[wi]!,
          timeOfDay: times[ti]!,
        },
      });
    },
  },
  {
    id: "collision",
    label: "Toggle collision",
    run: (s) => patchDevMockState({ collisionDisabled: !s.collisionDisabled }),
  },
  {
    id: "god",
    label: "Toggle god mode",
    run: (s) => patchDevMockState({ godMode: !s.godMode }),
  },
  {
    id: "reset-tutorial",
    label: "Reset tutorial",
    run: () => patchDevMockState({ tutorialReset: true }),
  },
  {
    id: "reset-account",
    label: "Reset mock account",
    run: () => resetDevMockState(),
  },
  {
    id: "comics",
    label: "Open comics",
    run: () => {
      window.location.href = "/comics";
    },
  },
  {
    id: "companions",
    label: "Unlock companions",
    run: (s) =>
      patchDevMockState({
        companions: [
          ...s.companions,
          {
            id: `comp-${Date.now()}`,
            species: "riftling_dev",
            name: "Spawned Companion",
            level: 1,
          },
        ],
      }),
  },
  {
    id: "live-world",
    label: "Enter Live World",
    run: () => {
      window.location.href = "/live-world";
    },
  },
  {
    id: "restoration",
    label: "Open Restoration",
    run: () => {
      window.location.href = "/restoration";
    },
  },
];

/**
 * Hidden Dev Tools panel — `Ctrl+Shift+D` (or `Cmd+Shift+D`).
 * Never renders when production / override UI disabled.
 */
export function DevToolsPanel() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const enabled = isDevOverrideUiEnabled();

  useEffect(() => {
    if (!enabled) return;
    ensureDevMockState();
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  if (!enabled || !open) return null;

  return (
    <aside
      className="fixed bottom-16 right-3 z-[9999] w-[min(22rem,calc(100vw-1.5rem))] rounded-lg border border-[rgba(255,160,40,0.45)] bg-[rgba(10,12,18,0.96)] p-3 shadow-xl backdrop-blur-md md:bottom-4 md:right-4"
      aria-label="Developer tools"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(255,176,72)]">
          Dev Tools
        </h2>
        <button
          type="button"
          className="text-xs text-[var(--text-muted)] hover:text-white"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
      </div>
      <p className="mb-2 text-[0.7rem] text-[var(--text-dim)]">
        Local only · Ctrl/Cmd+Shift+D · NPCs/bosses use Live World stubs
      </p>
      <div className="grid max-h-72 grid-cols-2 gap-1.5 overflow-y-auto">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className="rounded border border-[var(--stroke)] bg-[rgba(255,255,255,0.03)] px-2 py-1.5 text-left text-[0.7rem] text-white hover:border-[rgba(255,160,40,0.5)]"
            onClick={() => {
              const state = ensureDevMockState();
              tool.run(state);
              setNote(tool.label);
            }}
          >
            {tool.label}
          </button>
        ))}
      </div>
      {note ? (
        <p className="mt-2 text-[0.7rem] text-[var(--amber)]">Ran: {note}</p>
      ) : null}
    </aside>
  );
}
