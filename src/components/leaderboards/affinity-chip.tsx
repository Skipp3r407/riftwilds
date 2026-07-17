import { cn } from "@/lib/utils/cn";
import type { AffinityFilter } from "@/lib/leaderboards/types";

const AFFINITY_STYLES: Record<Exclude<AffinityFilter, "ALL">, string> = {
  EMBER: "border-[rgba(255,122,61,0.45)] bg-[rgba(255,122,61,0.12)] text-[var(--ember)]",
  TIDE: "border-[rgba(61,155,255,0.45)] bg-[rgba(61,155,255,0.12)] text-[var(--tide)]",
  GROVE: "border-[rgba(74,223,122,0.45)] bg-[rgba(74,223,122,0.12)] text-[var(--grove)]",
  STORM: "border-[rgba(184,212,255,0.45)] bg-[rgba(184,212,255,0.1)] text-[var(--storm)]",
  STONE: "border-[rgba(196,168,130,0.45)] bg-[rgba(196,168,130,0.12)] text-[var(--stone)]",
  FROST: "border-[rgba(168,231,255,0.45)] bg-[rgba(168,231,255,0.12)] text-[var(--frost)]",
  RADIANT: "border-[rgba(255,229,102,0.45)] bg-[rgba(255,229,102,0.12)] text-[var(--radiant)]",
  VOID: "border-[rgba(122,92,255,0.45)] bg-[rgba(122,92,255,0.14)] text-[var(--void)]",
  ALLOY: "border-[rgba(208,214,224,0.4)] bg-[rgba(208,214,224,0.1)] text-[var(--alloy)]",
  SPIRIT: "border-[rgba(255,154,213,0.45)] bg-[rgba(255,154,213,0.12)] text-[var(--spirit)]",
};

export function AffinityChip({
  affinity,
  className,
}: {
  affinity: Exclude<AffinityFilter, "ALL">;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        AFFINITY_STYLES[affinity],
        className,
      )}
    >
      {affinity}
    </span>
  );
}
