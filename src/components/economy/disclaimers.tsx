import { ECONOMY_DISCLAIMERS } from "@/lib/config/treasury-policy";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type DisclaimerProps = {
  className?: string;
};

function DisclaimerText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs leading-relaxed text-[var(--text-muted)]",
        className,
      )}
      role="note"
    >
      {children}
    </p>
  );
}

export function RewardDisclaimer({ className }: DisclaimerProps) {
  return (
    <DisclaimerText className={className}>{ECONOMY_DISCLAIMERS.rewards}</DisclaimerText>
  );
}

export function MarketplaceDisclaimer({ className }: DisclaimerProps) {
  return (
    <DisclaimerText className={className}>{ECONOMY_DISCLAIMERS.marketplace}</DisclaimerText>
  );
}

export function GrowthDisclaimer({ className }: DisclaimerProps) {
  return (
    <DisclaimerText className={className}>{ECONOMY_DISCLAIMERS.growth}</DisclaimerText>
  );
}
