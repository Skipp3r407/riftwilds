import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { TrendDirection } from "@/lib/leaderboards/types";
import { cn } from "@/lib/utils/cn";

export function TrendCell({
  trend,
  delta,
  className,
}: {
  trend: TrendDirection;
  delta: number;
  className?: string;
}) {
  if (trend === "up") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[var(--emerald)]",
          className,
        )}
      >
        <TrendingUp className="h-3.5 w-3.5" aria-hidden />
        <span className="font-mono text-xs">+{delta}</span>
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span
        className={cn("inline-flex items-center gap-1 text-[var(--danger)]", className)}
      >
        <TrendingDown className="h-3.5 w-3.5" aria-hidden />
        <span className="font-mono text-xs">-{delta}</span>
      </span>
    );
  }
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-[var(--text-dim)]", className)}
    >
      <Minus className="h-3.5 w-3.5" aria-hidden />
      <span className="font-mono text-xs">0</span>
    </span>
  );
}
