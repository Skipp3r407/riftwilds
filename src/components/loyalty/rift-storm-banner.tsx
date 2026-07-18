"use client";

type StormProps = {
  active?: boolean;
  phase?: string;
  intensity?: string | null;
  worldMessage?: string | null;
  warningMessage?: string | null;
  warningRemainingMs?: number;
  timeRemainingMs?: number;
  tierBoostPercent?: number;
  communityPersonal?: number;
  communityTotal?: number;
  communityTarget?: number;
  participationRequirements?: string[];
  rewardCategories?: string[];
  publicHighlights?: string[];
  privacyNote?: string;
};

type Props = {
  storm?: StormProps | null;
  busy: string | null;
  onParticipate: () => void;
  onRoll: () => void;
  onTriggerDev: () => void;
};

function fmtMs(ms?: number) {
  if (!ms || ms <= 0) return "—";
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

export function RiftStormBanner({
  storm,
  busy,
  onParticipate,
  onRoll,
  onTriggerDev,
}: Props) {
  const warning = storm?.phase === "WARNING";
  const active = storm?.phase === "ACTIVE" || storm?.active;

  return (
    <section
      className="panel relative overflow-hidden p-5"
      aria-live="polite"
      data-reduced-motion="respect"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            active || warning
              ? "radial-gradient(ellipse at top, rgba(251,191,36,0.35), transparent 55%)"
              : "transparent",
        }}
      />
      <div className="relative space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="page-kicker">Rift Storm</p>
            <h2 className="font-display text-xl text-white">
              {warning
                ? "A strange energy is gathering…"
                : active
                  ? `${storm?.intensity ?? "Storm"} live`
                  : "No storm active"}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
              {warning
                ? storm?.warningMessage
                : active
                  ? storm?.worldMessage
                  : "Admin/dev can trigger a storm. Random active-hour scheduling stub available."}
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            disabled={busy !== null}
            onClick={onTriggerDev}
          >
            Trigger (dev)
          </button>
        </div>

        {(warning || active) && (
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Timer</p>
              <p className="text-white">
                {warning ? fmtMs(storm?.warningRemainingMs) : fmtMs(storm?.timeRemainingMs)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Your tier boost</p>
              <p className="text-white">+{storm?.tierBoostPercent ?? 0}% reward weight</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Community</p>
              <p className="text-white">
                {Math.round(storm?.communityTotal ?? 0)} / {storm?.communityTarget ?? "—"}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                You: {Math.round(storm?.communityPersonal ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Privacy</p>
              <p className="text-xs text-[var(--text-muted)]">
                {storm?.privacyNote ?? "Winners stay private unless they share."}
              </p>
            </div>
          </div>
        )}

        {active ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary focus-ring text-sm"
              disabled={busy !== null}
              onClick={onParticipate}
            >
              Score quest objective
            </button>
            <button
              type="button"
              className="btn-primary focus-ring text-sm"
              disabled={busy !== null}
              onClick={onRoll}
            >
              Roll current wave
            </button>
          </div>
        ) : null}

        {storm?.rewardCategories?.length ? (
          <p className="text-xs text-[var(--text-muted)]">
            Rewards: {storm.rewardCategories.slice(0, 5).join(" · ")}…
          </p>
        ) : null}

        {storm?.publicHighlights?.length ? (
          <ul className="text-xs text-[var(--text-muted)]">
            {storm.publicHighlights.slice(-3).map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
