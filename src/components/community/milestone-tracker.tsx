import type { MilestoneProgress } from "@/lib/community";

type Props = {
  milestones: MilestoneProgress[];
};

export function MilestoneTracker({ milestones }: Props) {
  return (
    <section className="panel space-y-4 p-5" aria-labelledby="milestones-heading">
      <div>
        <h2 id="milestones-heading" className="font-display text-xl text-white">
          Community milestones
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Content unlocks tied to community progress — not automatic SOL from token purchases.
        </p>
      </div>
      <ul className="space-y-3">
        {milestones.map((m) => (
          <li
            key={m.id}
            className="rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-display text-white">{m.title}</p>
                <p className="mt-0.5 text-xs text-[var(--cyan)]">{m.rewardLabel}</p>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {m.metricAvailable && m.current !== null
                  ? `${m.current.toLocaleString()} / ${m.threshold.toLocaleString()}`
                  : `— / ${m.threshold.toLocaleString()}`}
              </p>
            </div>
            <p className="mt-2 text-xs text-[var(--text-muted)]">{m.description}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[rgba(7,11,22,0.65)]">
              <div
                className="h-full rounded-full bg-[var(--cyan)] transition-all duration-700"
                style={{ width: `${m.progressPercent}%` }}
              />
            </div>
            {m.reached ? (
              <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--emerald)]">
                Reached
              </p>
            ) : !m.metricAvailable ? (
              <p className="mt-1 text-[10px] text-[var(--amber)]">
                Metric pending (holders indexer or game counter)
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
