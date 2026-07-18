"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { InteractiveStep } from "@/game/academy/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  steps: InteractiveStep[];
  onComplete: () => void;
  practiceMode?: boolean;
};

const REGIONS = [
  { id: "waypoint-plaza", label: "Commons Plaza" },
  { id: "academy", label: "Player Academy" },
  { id: "ember-crater", label: "Ember Crater" },
  { id: "moonwater-coast", label: "Moonwater Coast" },
];

const NPCS = [
  { id: "archivist-solen", label: "Archivist Solen" },
  { id: "elara-venn", label: "Elara Venn" },
  { id: "tessa-windmere", label: "Tessa Windmere" },
];

export function InteractiveLesson({ steps, onComplete, practiceMode }: Props) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "a" || k === "s" || k === "d") {
        setKeys((prev) => ({ ...prev, [k]: true }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    for (const step of steps) {
      if (step.kind !== "wasd-gate" || done[step.id]) continue;
      const required = step.requiredKeys ?? ["w", "a", "s", "d"];
      if (required.every((k) => keys[k])) {
        setDone((d) => ({ ...d, [step.id]: true }));
      }
    }
  }, [keys, steps, done]);

  useEffect(() => {
    if (steps.length === 0) return;
    if (steps.every((s) => done[s.id] || s.kind === "quiz")) {
      onComplete();
    }
  }, [done, steps, onComplete]);

  if (steps.length === 0) return null;

  return (
    <div
      className={cn(
        "mt-4 space-y-3 rounded-lg border border-[var(--cyan)]/25 bg-[rgba(61,231,255,0.04)] p-4",
        practiceMode && "ring-1 ring-[var(--amber)]/40",
      )}
    >
      <p className="font-display text-xs uppercase tracking-[0.18em] text-[var(--cyan)]">
        Interactive practice
      </p>
      {steps.map((step) => {
        const complete = Boolean(done[step.id]);
        return (
          <div
            key={step.id}
            className={cn(
              "rounded border border-[var(--stroke)] bg-[rgba(8,8,14,0.45)] p-3",
              complete && "border-[var(--emerald,#4adf7a)]/40",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-white">{step.instruction}</p>
              <span className="shrink-0 text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                {complete ? "Done" : step.kind}
              </span>
            </div>

            {step.kind === "wasd-gate" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {(step.requiredKeys ?? ["w", "a", "s", "d"]).map((k) => (
                  <kbd
                    key={k}
                    className={cn(
                      "rounded border px-3 py-2 font-display text-sm uppercase",
                      keys[k]
                        ? "border-[var(--cyan)] bg-[rgba(61,231,255,0.15)] text-[var(--cyan)]"
                        : "border-[var(--stroke)] text-[var(--text-dim)]",
                    )}
                  >
                    {k}
                  </kbd>
                ))}
                <p className="w-full text-[11px] text-[var(--text-muted)]">
                  Press each key on your keyboard. Stub complete — try the same in{" "}
                  <Link href={step.practiceHref ?? "/live-world"} className="text-[var(--cyan)] underline">
                    Live World
                  </Link>
                  .
                </p>
              </div>
            ) : null}

            {step.kind === "click-target" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {step.targetId === "demo-prompt" ? (
                  <button
                    type="button"
                    className="focus-ring animate-pulse rounded border border-[var(--cyan)] bg-[rgba(61,231,255,0.12)] px-4 py-2 text-sm text-[var(--cyan)]"
                    onClick={() => setDone((d) => ({ ...d, [step.id]: true }))}
                  >
                    Inspect plaque (E)
                  </button>
                ) : null}
                {step.targetId === "demo-affinity" ? (
                  <button
                    type="button"
                    className="focus-ring rounded-full border border-[var(--amber)]/50 bg-[rgba(255,184,77,0.12)] px-3 py-1 text-xs text-[var(--amber)]"
                    onClick={() => setDone((d) => ({ ...d, [step.id]: true }))}
                  >
                    Ember affinity
                  </button>
                ) : null}
                {step.targetId === "demo-strike" || step.targetId === "demo-guard" ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={cn(
                        "focus-ring rounded border px-3 py-2 text-sm",
                        step.targetId === "demo-strike"
                          ? "border-[var(--cyan)] text-[var(--cyan)]"
                          : "border-[var(--stroke)] text-[var(--text-muted)]",
                      )}
                      onClick={() => {
                        if (step.targetId === "demo-strike") {
                          setDone((d) => ({ ...d, [step.id]: true }));
                        }
                      }}
                    >
                      Strike
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "focus-ring rounded border px-3 py-2 text-sm",
                        step.targetId === "demo-guard"
                          ? "border-[var(--cyan)] text-[var(--cyan)]"
                          : "border-[var(--stroke)] text-[var(--text-muted)]",
                      )}
                      onClick={() => {
                        if (step.targetId === "demo-guard") {
                          setDone((d) => ({ ...d, [step.id]: true }));
                        }
                      }}
                    >
                      Guard
                    </button>
                  </div>
                ) : null}
                {!["demo-prompt", "demo-affinity", "demo-strike", "demo-guard"].includes(
                  step.targetId ?? "",
                ) ? (
                  <button
                    type="button"
                    className="btn-secondary focus-ring text-xs"
                    onClick={() => setDone((d) => ({ ...d, [step.id]: true }))}
                  >
                    Complete click drill
                  </button>
                ) : null}
              </div>
            ) : null}

            {step.kind === "map-waypoint" ? (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {REGIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={cn(
                      "focus-ring rounded border px-2 py-3 text-left text-xs",
                      r.id === step.targetId
                        ? "border-[var(--cyan)]/50 text-white"
                        : "border-[var(--stroke)] text-[var(--text-dim)]",
                      done[step.id] && r.id === step.targetId && "bg-[rgba(61,231,255,0.12)]",
                    )}
                    onClick={() => {
                      if (r.id === step.targetId) {
                        setDone((d) => ({ ...d, [step.id]: true }));
                      }
                    }}
                  >
                    <span className="block font-display text-[10px] uppercase tracking-wider text-[var(--cyan)]">
                      Waypoint
                    </span>
                    {r.label}
                  </button>
                ))}
              </div>
            ) : null}

            {step.kind === "npc-click" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {NPCS.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={cn(
                      "focus-ring rounded border px-3 py-2 text-sm",
                      n.id === step.targetId
                        ? "border-[var(--amber)]/50 text-[var(--amber)]"
                        : "border-[var(--stroke)] text-[var(--text-muted)]",
                    )}
                    onClick={() => {
                      if (n.id === step.targetId) {
                        setDone((d) => ({ ...d, [step.id]: true }));
                      }
                    }}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            ) : null}

            {step.kind === "menu-navigate" || step.kind === "practice-stub" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {step.practiceHref ? (
                  <Link
                    href={step.practiceHref}
                    className="btn-primary focus-ring text-xs"
                    onClick={() => setDone((d) => ({ ...d, [step.id]: true }))}
                  >
                    {step.kind === "practice-stub" ? "Open practice" : "Open page"}
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="btn-secondary focus-ring text-xs"
                  onClick={() => setDone((d) => ({ ...d, [step.id]: true }))}
                >
                  Mark stub complete
                </button>
              </div>
            ) : null}

            {step.kind === "checklist" && step.checklist ? (
              <ul className="mt-3 space-y-2">
                {step.checklist.map((item) => {
                  const key = `${step.id}:${item}`;
                  return (
                    <li key={key}>
                      <label className="flex cursor-pointer items-start gap-2 text-sm text-[var(--text-muted)]">
                        <input
                          type="checkbox"
                          className="mt-1 accent-[var(--cyan)]"
                          checked={Boolean(checks[key])}
                          onChange={(e) => {
                            const next = { ...checks, [key]: e.target.checked };
                            setChecks(next);
                            const all = step.checklist!.every(
                              (c) => next[`${step.id}:${c}`],
                            );
                            if (all) setDone((d) => ({ ...d, [step.id]: true }));
                          }}
                        />
                        <span>{item}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {step.kind === "quiz" ? (
              <p className="mt-2 text-xs text-[var(--text-dim)]">
                Complete the quiz section below this interactive block.
              </p>
            ) : null}

            {step.kind === "drag-drop" ? (
              <button
                type="button"
                className="btn-secondary focus-ring mt-2 text-xs"
                onClick={() => setDone((d) => ({ ...d, [step.id]: true }))}
              >
                Complete drag-drop stub
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
