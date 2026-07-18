"use client";

type Props = {
  progress: number;
  visible: boolean;
};

export function LiveWorldLoadingScreen({ progress, visible }: Props) {
  if (!visible) return null;
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[rgba(12,14,16,0.94)] px-6 text-center">
      <p className="font-display text-2xl tracking-wide text-[var(--text)] md:text-3xl">
        Entering Riftwild Commons
      </p>
      <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
        Warming the meadows and lanterns… habitat shell loads locally until the Live World service is online.
      </p>
      <div className="mt-8 h-2 w-full max-w-sm overflow-hidden rounded-full border border-[var(--stroke-bronze)] bg-[rgba(42,33,24,0.65)]">
        <div
          className="h-full rounded-full transition-[width] duration-200"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--grove), var(--cyan) 55%, var(--amber))",
          }}
        />
      </div>
      <p className="mt-2 text-xs tabular-nums text-[var(--text-dim)]">{pct}%</p>
    </div>
  );
}
