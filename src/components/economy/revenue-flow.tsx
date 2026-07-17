"use client";

import { motion, useReducedMotion } from "framer-motion";
import { economyConfig } from "@/lib/config/economy";
import { cn } from "@/lib/utils/cn";

const FLOW_STEPS = [
  { id: "game-revenue", label: "Game & Marketplace Revenue", accent: "var(--cyan)" },
  { id: "creator-fees", label: "Optional Creator Allocations", accent: "var(--violet)" },
  { id: "treasury", label: "Project-Controlled Treasuries", accent: "var(--amber)" },
  { id: "allocation", label: "Community Reward Treasury", accent: "var(--emerald)" },
] as const;

const ALLOCATION_TARGETS = [
  "Growth",
  "Community Rewards",
  "Operations",
  "Events & Reserves",
] as const;

type RevenueFlowProps = {
  className?: string;
};

export function RevenueFlow({ className }: RevenueFlowProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className={cn("space-y-6", className)}
      aria-labelledby="revenue-flow-heading"
    >
      <div>
        <h2 id="revenue-flow-heading" className="font-display text-xl text-white">
          How revenue reaches the treasury
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Community Reward Treasury deposits come from approved, project-controlled sources
          (game revenue, marketplace fees, optional creator allocations). Buying the Pump.fun
          coin does not automatically generate SOL for pet owners. Amounts vary and are not
          guaranteed.
        </p>
      </div>

      <div className="panel overflow-hidden p-0">
        {FLOW_STEPS.map((step, index) => (
          <motion.div
            key={step.id}
            className="border-b border-[var(--stroke)] px-5 py-4 last:border-b-0"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
          >
            <p
              className="font-display text-sm"
              style={{ color: step.accent }}
            >
              {String(index + 1).padStart(2, "0")} · {step.label}
            </p>

            {step.id === "allocation" ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {ALLOCATION_TARGETS.map((target) => (
                  <li
                    key={target}
                    className="rounded-full border border-[var(--stroke)] bg-[rgba(7,11,22,0.45)] px-3 py-1 text-xs text-[var(--text-muted)]"
                  >
                    {target}
                  </li>
                ))}
              </ul>
            ) : null}

            {index < FLOW_STEPS.length - 1 ? (
              <p
                className="mt-3 text-center text-[var(--text-muted)]"
                aria-hidden
              >
                ▼
              </p>
            ) : null}
          </motion.div>
        ))}
      </div>

      <div className="space-y-3 text-sm leading-relaxed text-[var(--text-muted)]">
        <p>{economyConfig.CREATOR_FEE_NOTE}</p>
        <p>
          When you buy the token, an egg, or a marketplace listing, the{" "}
          <strong className="text-white">full purchase value is not sent to pet owners</strong>.
          Token trades settle on external platforms such as Pump.fun or DEX liquidity pools and
          do not auto-credit the Community Reward Treasury per trade. Marketplace seller proceeds
          go to sellers minus published fees. Only verified project-controlled fee portions and
          optional creator allocations may fund ecosystem distributions — and only when those
          funds are actually deposited.
        </p>
      </div>
    </section>
  );
}
