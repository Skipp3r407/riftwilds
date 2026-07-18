import Image from "next/image";
import type { TreasuryBudgetLine } from "@/lib/ecosystem/treasury";
import {
  TREASURY_BUDGET_ART,
  TREASURY_BUDGET_ART_SRC,
} from "@/lib/ecosystem/treasury-art";

type TreasuryBudgetVisualProps = {
  budgets: TreasuryBudgetLine[];
  growthNote: string;
};

/**
 * Policy allocation bars (% of verified revenue split) — not live SOL balances.
 */
export function TreasuryBudgetVisual({ budgets, growthNote }: TreasuryBudgetVisualProps) {
  return (
    <section className="panel overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative min-h-[220px] border-b border-[var(--stroke)] lg:min-h-full lg:border-b-0 lg:border-r">
          <Image
            src={TREASURY_BUDGET_ART_SRC}
            alt="Riftwilds budget allocation crystal dial — policy shares, not live balances"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,12,24,0.75)] via-transparent to-[rgba(6,12,24,0.25)] lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[rgba(6,12,24,0.55)]"
            aria-hidden
          />
          <p className="absolute bottom-3 left-3 right-3 text-[10px] uppercase tracking-wider text-[rgba(220,230,245,0.75)] drop-shadow-sm">
            Policy shares · not live SOL
          </p>
        </div>

        <div className="p-5">
          <h2 className="font-display text-xl text-white">Budget policy</h2>
          <p className="mt-2 text-xs text-[var(--text-muted)]">{growthNote}</p>

          <ul className="mt-5 space-y-4" aria-label="Budget allocation percentages">
            {budgets.map((line) => {
              const art = TREASURY_BUDGET_ART[line.key];
              const accent = art?.accent ?? "var(--cyan)";
              return (
                <li key={line.key}>
                  <div className="flex items-center gap-3">
                    {art ? (
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-[rgba(61,231,255,0.22)] bg-[rgba(6,12,24,0.5)]">
                        <Image
                          src={art.iconSrc}
                          alt=""
                          fill
                          sizes="36px"
                          className="object-cover"
                          aria-hidden
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm text-white">{line.label}</span>
                        <span
                          className="font-display text-sm tabular-nums"
                          style={{ color: accent }}
                        >
                          {line.allocationPercent}%
                        </span>
                      </div>
                      <div
                        className="mt-1.5 h-2 overflow-hidden rounded-full bg-[rgba(148,197,255,0.08)]"
                        role="presentation"
                      >
                        <div
                          className="h-full rounded-full transition-[width] duration-500"
                          style={{
                            width: `${line.allocationPercent}%`,
                            background: `linear-gradient(90deg, ${accent}, color-mix(in srgb, ${accent} 55%, #fff))`,
                            boxShadow: `0 0 12px color-mix(in srgb, ${accent} 45%, transparent)`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--text-dim)]">{line.note}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
