import { arenaConfig } from "@/lib/config/arena";
import { cn } from "@/lib/utils/cn";

export function ArenaNoWageringBanner({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "rounded-md border border-[rgba(255,196,92,0.35)] bg-[rgba(255,196,92,0.08)] px-3 py-2 text-xs text-[var(--amber)]",
        className,
      )}
      role="note"
    >
      {arenaConfig.DISCLOSURES.noWagering}
    </p>
  );
}

export function CommunityPredictionDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-[var(--text-muted)]", className)} role="note">
      {arenaConfig.DISCLOSURES.predictions}
    </p>
  );
}

export function WeaponsDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-[var(--text-muted)]", className)} role="note">
      {arenaConfig.DISCLOSURES.weapons}
    </p>
  );
}
