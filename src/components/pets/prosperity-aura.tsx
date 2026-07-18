"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import type { CelebrationStyle } from "@/lib/rewards/types";

type Props = {
  children: React.ReactNode;
  /** 0–1 scale from estimated pending (server value). */
  pendingIntensity: number;
  status: "active" | "inactive";
  accumulating?: boolean;
  largeDepositPulse?: boolean;
  celebration?: CelebrationStyle | null;
  className?: string;
};

/**
 * Prosperity Aura — brightens as the server estimate of treasury share grows.
 * Framed as ecosystem / Community Reward Treasury sharing — not minting SOL from token buys.
 */
export function ProsperityAura({
  children,
  pendingIntensity,
  status,
  accumulating = false,
  largeDepositPulse = false,
  celebration = null,
  className,
}: Props) {
  const reduceMotion = useReducedMotion();
  const intensity = status === "inactive" ? 0 : Math.min(1, Math.max(0, pendingIntensity));
  const glow = 0.12 + intensity * 0.55;
  const blur = 12 + intensity * 28;

  return (
    <div
      className={cn(
        "prosperity-aura relative mx-auto flex size-40 shrink-0 items-center justify-center sm:mx-0",
        status === "inactive" && "opacity-70 grayscale",
        accumulating && status === "active" && !reduceMotion && "prosperity-accumulating",
        largeDepositPulse && !reduceMotion && "prosperity-deposit-pulse",
        celebration && !reduceMotion && `prosperity-celebrate-${celebration}`,
        className,
      )}
      style={
        {
          "--aura-glow": String(glow),
          "--aura-blur": `${blur}px`,
        } as React.CSSProperties
      }
      aria-hidden={false}
    >
      <div
        className="pointer-events-none absolute inset-[-18%] rounded-full"
        style={{
          background:
            status === "inactive"
              ? "radial-gradient(circle, rgba(140,140,160,0.18) 0%, transparent 70%)"
              : `radial-gradient(circle, rgba(61,231,255,${glow}) 0%, rgba(155,123,255,${glow * 0.45}) 42%, transparent 72%)`,
          filter: reduceMotion ? "none" : `blur(calc(var(--aura-blur) * 0.35))`,
        }}
      />
      {accumulating && status === "active" && !reduceMotion ? (
        <span className="prosperity-sparkles pointer-events-none absolute inset-0" aria-hidden />
      ) : null}
      <div className="relative z-[1] flex h-full w-full items-center justify-center rounded-2xl bg-[rgba(7,11,22,0.55)]">
        {children}
      </div>
      <span className="sr-only">
        {status === "active"
          ? "Prosperity aura reflects estimated share of Community Reward Treasury deposits. Pets do not mint SOL from token purchases."
          : "Community rewards inactive for this pet."}
      </span>
    </div>
  );
}
