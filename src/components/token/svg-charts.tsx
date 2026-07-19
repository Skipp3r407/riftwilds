"use client";

import type { CandlePoint, ChartPoint } from "@/lib/ecosystem/token-live-analytics";

const W = 640;
const H = 220;
const PAD = { t: 16, r: 48, b: 28, l: 48 };

function bounds(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return { min: 0, max: 1 };
  }
  const pad = (max - min) * 0.08;
  return { min: min - pad, max: max + pad };
}

function xScale(i: number, n: number) {
  const inner = W - PAD.l - PAD.r;
  return PAD.l + (n <= 1 ? inner / 2 : (i / (n - 1)) * inner);
}

function yScale(v: number, min: number, max: number) {
  const inner = H - PAD.t - PAD.b;
  return PAD.t + (1 - (v - min) / (max - min)) * inner;
}

function pathFromSeries(series: ChartPoint[], min: number, max: number) {
  return series
    .map((p, i) => {
      const x = xScale(i, series.length);
      const y = yScale(p.v, min, max);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function areaFromSeries(series: ChartPoint[], min: number, max: number) {
  if (series.length === 0) return "";
  const line = pathFromSeries(series, min, max);
  const x0 = xScale(0, series.length);
  const x1 = xScale(series.length - 1, series.length);
  const yBase = H - PAD.b;
  return `${line} L${x1.toFixed(1)},${yBase} L${x0.toFixed(1)},${yBase} Z`;
}

type DualAreaProps = {
  primary: ChartPoint[];
  secondary: ChartPoint[];
  primaryLabel?: string;
  secondaryLabel?: string;
  emptyLabel?: string;
};

export function DualAreaChart({
  primary,
  secondary,
  primaryLabel = "Cumulative USD",
  secondaryLabel = "Secondary",
  emptyLabel = "Awaiting data",
}: DualAreaProps) {
  if (primary.length === 0) {
    return <ChartEmpty label={emptyLabel} />;
  }
  const all = [...primary.map((p) => p.v), ...secondary.map((p) => p.v)];
  const { min, max } = bounds(all);
  const area = areaFromSeries(primary, min, max);
  const line = pathFromSeries(secondary.length ? secondary : primary, min, max);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cumulative chart">
      <defs>
        <linearGradient id="riftCumFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,184,77,0.45)" />
          <stop offset="100%" stopColor="rgba(255,184,77,0.02)" />
        </linearGradient>
      </defs>
      <GridLines />
      <path d={area} fill="url(#riftCumFill)" />
      <path
        d={pathFromSeries(primary, min, max)}
        fill="none"
        stroke="rgba(255,184,77,0.95)"
        strokeWidth="2"
      />
      <path d={line} fill="none" stroke="rgba(61,231,255,0.85)" strokeWidth="1.75" />
      <LegendDot color="#ffb84d" label={primaryLabel} x={PAD.l} y={10} />
      <LegendDot color="#3de7ff" label={secondaryLabel} x={PAD.l + 140} y={10} />
    </svg>
  );
}

type BarProps = {
  series: ChartPoint[];
  emptyLabel?: string;
};

export function BarSparkChart({ series, emptyLabel = "Awaiting data" }: BarProps) {
  if (series.length === 0) return <ChartEmpty label={emptyLabel} />;
  const { min, max } = bounds(series.map((p) => p.v));
  const barW = Math.max(1.2, (W - PAD.l - PAD.r) / series.length - 0.6);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Daily bars">
      <GridLines />
      {series.map((p, i) => {
        const x = xScale(i, series.length) - barW / 2;
        const y = yScale(p.v, min, max);
        const h = H - PAD.b - y;
        return (
          <rect
            key={p.t}
            x={x}
            y={y}
            width={barW}
            height={Math.max(1, h)}
            fill="rgba(255,184,77,0.78)"
            rx={0.5}
          />
        );
      })}
    </svg>
  );
}

type LineProps = {
  series: ChartPoint[];
  target?: number;
  emptyLabel?: string;
};

export function PercentLineChart({
  series,
  target,
  emptyLabel = "Awaiting data",
}: LineProps) {
  if (series.length === 0) return <ChartEmpty label={emptyLabel} />;
  const values = series.map((p) => p.v);
  if (target != null) values.push(target);
  const { min, max } = bounds(values);
  const line = pathFromSeries(series, min, max);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Allocation %">
      <GridLines />
      {target != null ? (
        <line
          x1={PAD.l}
          x2={W - PAD.r}
          y1={yScale(target, min, max)}
          y2={yScale(target, min, max)}
          stroke="rgba(61,231,255,0.35)"
          strokeDasharray="4 4"
        />
      ) : null}
      <path d={line} fill="none" stroke="rgba(61,231,255,0.95)" strokeWidth="2" />
    </svg>
  );
}

type CandleProps = {
  candles: CandlePoint[];
  emptyLabel: string;
};

export function CandleChart({ candles, emptyLabel }: CandleProps) {
  if (candles.length === 0) {
    return (
      <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-lg border border-[rgba(61,231,255,0.12)] bg-[rgba(4,8,16,0.65)]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
          aria-hidden
        >
          <GridLines />
          {/* Ghost silhouette — awaiting only */}
          {Array.from({ length: 28 }, (_, i) => {
            const x = PAD.l + i * ((W - PAD.l - PAD.r) / 27);
            const mid = H / 2;
            const h = 12 + ((i * 17) % 40);
            const up = i % 3 !== 0;
            return (
              <g key={i}>
                <line
                  x1={x}
                  x2={x}
                  y1={mid - h}
                  y2={mid + h * 0.6}
                  stroke={up ? "rgba(61,231,255,0.5)" : "rgba(255,120,100,0.45)"}
                  strokeWidth="1"
                />
                <rect
                  x={x - 3}
                  y={up ? mid - h * 0.5 : mid}
                  width="6"
                  height={h * 0.5}
                  fill={up ? "rgba(61,231,255,0.35)" : "rgba(255,120,100,0.3)"}
                />
              </g>
            );
          })}
        </svg>
        <div className="relative z-10 px-6 text-center">
          <p className="font-display text-lg text-white">Price chart awaiting mint</p>
          <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">{emptyLabel}</p>
        </div>
      </div>
    );
  }

  const highs = candles.map((c) => c.h);
  const lows = candles.map((c) => c.l);
  const { min, max } = bounds([...highs, ...lows]);
  const barW = Math.max(2, (W - PAD.l - PAD.r) / candles.length - 1.5);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Price candles">
      <GridLines />
      {candles.map((c, i) => {
        const x = xScale(i, candles.length);
        const yH = yScale(c.h, min, max);
        const yL = yScale(c.l, min, max);
        const yO = yScale(c.o, min, max);
        const yC = yScale(c.c, min, max);
        const up = c.c >= c.o;
        const color = up ? "rgba(61,231,255,0.9)" : "rgba(255,140,120,0.85)";
        const bodyTop = Math.min(yO, yC);
        const bodyH = Math.max(1.5, Math.abs(yC - yO));
        return (
          <g key={c.t}>
            <line x1={x} x2={x} y1={yH} y2={yL} stroke={color} strokeWidth="1" />
            <rect x={x - barW / 2} y={bodyTop} width={barW} height={bodyH} fill={color} rx={0.5} />
          </g>
        );
      })}
    </svg>
  );
}

function GridLines() {
  return (
    <g aria-hidden>
      {[0.2, 0.4, 0.6, 0.8].map((f) => {
        const y = PAD.t + f * (H - PAD.t - PAD.b);
        return (
          <line
            key={f}
            x1={PAD.l}
            x2={W - PAD.r}
            y1={y}
            y2={y}
            stroke="rgba(120,140,170,0.12)"
            strokeWidth="1"
          />
        );
      })}
    </g>
  );
}

function LegendDot({
  color,
  label,
  x,
  y,
}: {
  color: string;
  label: string;
  x: number;
  y: number;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r="3.5" fill={color} />
      <text x={x + 8} y={y + 3.5} fill="rgba(200,214,232,0.75)" fontSize="10">
        {label}
      </text>
    </g>
  );
}

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-[rgba(61,231,255,0.1)] bg-[rgba(4,8,16,0.5)] px-4 text-center text-sm text-[var(--text-muted)]">
      {label}
    </div>
  );
}
