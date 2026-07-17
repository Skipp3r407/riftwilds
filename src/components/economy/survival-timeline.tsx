import { CARE_SURVIVAL_STAGES } from "@/lib/config/treasury-policy";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { cn } from "@/lib/utils/cn";

const STAGE_ACCENT: Record<string, string> = {
  HEALTHY: "var(--emerald)",
  HUNGRY: "var(--amber)",
  UNHAPPY: "var(--amber)",
  SICK: "var(--coral)",
  DORMANT: "var(--violet)",
  CRITICAL: "var(--coral)",
  DECEASED: "var(--text-muted)",
};

type SurvivalTimelineProps = {
  className?: string;
};

export function SurvivalTimeline({ className }: SurvivalTimelineProps) {
  const permanentDeathEnabled = featureFlagDefaults.PERMANENT_DEATH_ENABLED;

  return (
    <section
      className={cn("space-y-4", className)}
      aria-labelledby="survival-timeline-heading"
    >
      <div>
        <h2 id="survival-timeline-heading" className="font-display text-xl text-white">
          Care & survival stages
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Neglect can suspend rewards and gameplay access long before any memorial state.
          Permanent death is{" "}
          <strong className="text-white">
            {permanentDeathEnabled ? "enabled" : "disabled by default"}
          </strong>
          {permanentDeathEnabled
            ? " — review current rules before listing pets."
            : " — dormant recovery is the default failure path."}
        </p>
      </div>

      <ol className="relative space-y-0">
        {CARE_SURVIVAL_STAGES.map((stage, index) => {
          const accent = STAGE_ACCENT[stage.id] ?? "var(--cyan)";
          const isDeceased = stage.id === "DECEASED";

          return (
            <li
              key={stage.id}
              className={cn(
                "panel relative ml-4 border-l-0 p-4 pl-6",
                isDeceased && !permanentDeathEnabled && "opacity-60",
              )}
              style={{ borderLeft: `3px solid ${accent}` }}
            >
              <div className="absolute -left-[9px] top-5 h-4 w-4 rounded-full border-2 border-[var(--bg-panel)] bg-[var(--bg-elevated)]" style={{ backgroundColor: accent }} />

              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-sm text-white">{stage.label}</h3>
                {isDeceased && !permanentDeathEnabled ? (
                  <span className="rounded-full border border-[var(--stroke)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Disabled
                  </span>
                ) : null}
              </div>

              {"timing" in stage && stage.timing ? (
                <p className="mt-1 text-xs text-[var(--amber)]">{stage.timing}</p>
              ) : null}

              <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                {stage.effects.map((effect) => (
                  <li key={effect} className="flex gap-2">
                    <span className="text-[var(--cyan)]" aria-hidden>
                      •
                    </span>
                    <span>{effect}</span>
                  </li>
                ))}
              </ul>

              {index < CARE_SURVIVAL_STAGES.length - 1 ? (
                <div
                  className="absolute -bottom-2 left-0 h-4 w-px bg-[var(--stroke)]"
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
