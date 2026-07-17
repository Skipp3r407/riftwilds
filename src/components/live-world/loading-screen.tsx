"use client";

type Props = {
  progress: number;
  visible: boolean;
};

export function LiveWorldLoadingScreen({ progress, visible }: Props) {
  if (!visible) return null;
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[rgba(6,10,18,0.92)] px-6 text-center">
      <p className="font-display text-2xl tracking-wide text-white md:text-3xl">
        Entering Riftwild Commons
      </p>
      <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
        Loading habitat shell… Phase 1 runs locally until the Live World service is online.
      </p>
      <div className="mt-8 h-2 w-full max-w-sm overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
        <div
          className="h-full rounded-full bg-[var(--cyan)] transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs tabular-nums text-[var(--text-dim)]">{pct}%</p>
    </div>
  );
}
