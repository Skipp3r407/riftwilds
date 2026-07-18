"use client";

import Image from "next/image";
import { useCallback, useId, useMemo, useState, type KeyboardEvent } from "react";
import {
  validateAllocationPercents,
  type AllocationBucket,
} from "@/lib/config/treasury-policy";
import { REVENUE_SECTION_ART } from "@/lib/revenue/revenue-art";
import { cn } from "@/lib/utils/cn";

type AllocationDonutProps = {
  allocations: AllocationBucket[];
  className?: string;
  size?: number;
};

type SliceGeometry = {
  bucket: AllocationBucket;
  startAngle: number;
  endAngle: number;
  path: string;
};

const DONUT_RADIUS = 88;
const STROKE_WIDTH = 28;

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function buildSlices(allocations: AllocationBucket[], cx: number, cy: number): SliceGeometry[] {
  let cursor = 0;
  return allocations.map((bucket) => {
    const sweep = (bucket.percent / 100) * 360;
    const startAngle = cursor;
    const endAngle = cursor + sweep;
    cursor = endAngle;
    return {
      bucket,
      startAngle,
      endAngle,
      path: describeArc(cx, cy, DONUT_RADIUS, startAngle, endAngle),
    };
  });
}

export function AllocationDonut({
  allocations,
  className,
  size = 280,
}: AllocationDonutProps) {
  const labelId = useId();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const isValid = validateAllocationPercents(allocations);
  const cx = size / 2;
  const cy = size / 2;
  const slices = useMemo(() => buildSlices(allocations, cx, cy), [allocations, cx, cy]);

  const highlightedId = hoverId ?? activeId;
  const highlighted = slices.find((s) => s.bucket.id === highlightedId)?.bucket;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent, bucketId: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveId((prev) => (prev === bucketId ? null : bucketId));
      }
    },
    [],
  );

  if (!isValid) {
    return (
      <div
        className={cn("panel p-6 text-sm text-[var(--coral)]", className)}
        role="alert"
      >
        Allocation percentages must total 100%. Current policy is misconfigured.
      </div>
    );
  }

  return (
    <div className={cn("panel relative overflow-hidden p-0", className)}>
      <Image
        src={REVENUE_SECTION_ART.allocation}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 40vw"
        className="object-cover object-center opacity-55"
        aria-hidden
        unoptimized
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(6,12,24,0.82)] via-[rgba(6,12,24,0.88)] to-[rgba(6,12,24,0.94)]"
        aria-hidden
      />
      <div className="relative z-10 p-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <div className="relative shrink-0">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              role="img"
              aria-labelledby={labelId}
              className="allocation-donut"
            >
              <title id={labelId}>Treasury revenue allocation donut chart</title>

              <circle
                cx={cx}
                cy={cy}
                r={DONUT_RADIUS}
                fill="none"
                stroke="rgba(148, 197, 255, 0.08)"
                strokeWidth={STROKE_WIDTH}
              />

              {slices.map(({ bucket, path }) => {
                const isHighlighted = highlightedId === bucket.id;
                const dimmed = highlightedId !== null && !isHighlighted;

                return (
                  <path
                    key={bucket.id}
                    d={path}
                    fill="none"
                    stroke={bucket.color}
                    strokeWidth={isHighlighted ? STROKE_WIDTH + 6 : STROKE_WIDTH}
                    strokeLinecap="butt"
                    className={cn(
                      "allocation-donut-slice cursor-pointer transition-opacity duration-200",
                      dimmed && "opacity-40",
                    )}
                    tabIndex={0}
                    role="button"
                    aria-label={`${bucket.label}, ${bucket.percent} percent`}
                    aria-pressed={activeId === bucket.id}
                    onMouseEnter={() => setHoverId(bucket.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(bucket.id)}
                    onBlur={() => setHoverId(null)}
                    onClick={() =>
                      setActiveId((prev) => (prev === bucket.id ? null : bucket.id))
                    }
                    onKeyDown={(event) => handleKeyDown(event, bucket.id)}
                  />
                );
              })}

              <circle
                cx={cx}
                cy={cy}
                r={DONUT_RADIUS - STROKE_WIDTH}
                fill="rgba(6,12,24,0.92)"
              />

              <text
                x={cx}
                y={cy - 6}
                textAnchor="middle"
                className="fill-white font-display text-lg"
                style={{ fontSize: "18px" }}
              >
                {highlighted ? `${highlighted.percent}%` : "100%"}
              </text>
              <text
                x={cx}
                y={cy + 16}
                textAnchor="middle"
                className="fill-[var(--text-muted)]"
                style={{ fontSize: "11px" }}
              >
                {highlighted ? highlighted.label : "Total allocated"}
              </text>
            </svg>
          </div>

          <ul className="w-full space-y-2 text-sm">
            {slices.map(({ bucket }) => (
              <li key={bucket.id}>
                <button
                  type="button"
                  className={cn(
                    "focus-ring flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left transition-colors",
                    highlightedId === bucket.id
                      ? "border-[var(--stroke)] bg-[rgba(26,39,68,0.72)]"
                      : "hover:bg-[rgba(26,39,68,0.45)]",
                  )}
                  onMouseEnter={() => setHoverId(bucket.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(bucket.id)}
                  onBlur={() => setHoverId(null)}
                  onClick={() =>
                    setActiveId((prev) => (prev === bucket.id ? null : bucket.id))
                  }
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: bucket.color }}
                    aria-hidden
                  />
                  <span className="flex-1 text-[var(--text-muted)]">{bucket.label}</span>
                  <span className="font-display tabular-nums text-white">{bucket.percent}%</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
