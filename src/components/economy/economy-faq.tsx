import { projectConfig } from "@/lib/config/project";
import { cn } from "@/lib/utils/cn";

const ECONOMY_FAQ = [
  {
    q: "Does buying the Pump.fun coin automatically pay pet owners in SOL?",
    a: "No. Buying or trading the token does not automatically generate SOL for pet owners. The Community Reward Treasury is funded only by verified, project-controlled deposits such as game revenue, marketplace fees, and optional creator allocations.",
  },
  {
    q: "How do pet rewards work?",
    a: "Own a Riftling to unlock the Pet Reward system. Stay eligible through care, quests, and events. Eligible pets share in Community Reward Treasury epoch distributions when verified deposits fund the pool. Estimates update only on verified deposits — never on fake timer ticks.",
  },
  {
    q: "Does buying a pet, egg, or item guarantee future value?",
    a: "No. Digital creatures and items may lose value. Purchases do not promise resale profit, passive income, or future reward allocations.",
  },
  {
    q: "Where does Community Reward Treasury funding come from?",
    a: "Approved project-controlled sources only: game revenue, marketplace fees, optional creator allocations, and other transparent funding the project controls. Not each token purchase on Pump.fun.",
  },
  {
    q: "Are Pump.fun creator fees guaranteed pet income?",
    a: "No. Creator fees are collected externally. Optional allocations may enter treasuries only after the project verifies and deposits them. Volume, timing, and amounts are not guaranteed.",
  },
  {
    q: "Is the full purchase price sent to the treasury?",
    a: "No. Token trades settle on external platforms. Marketplace sellers receive their share minus published fees. Only configured fee portions may flow to treasury buckets per the active policy when settled.",
  },
  {
    q: "How are treasury revenue allocations decided?",
    a: "The published treasury policy defines percentage splits across growth, Community Reward Treasury, operations, events, and emergency reserves. Policy versions are labeled demo, proposed, testing, or live.",
  },
  {
    q: "What makes a pet eligible for epoch rewards?",
    a: "Living, cared-for pets that meet minimum age and care requirements, are not marketplace-listed, and fit within per-wallet reward pet limits. Dormant, critical, and memorial states are excluded. Quests and events may also affect participation.",
  },
  {
    q: "Are real-money rewards currently active?",
    a: "No by default. EPOCH_REWARDS_ENABLED and REAL_MONEY_REWARDS_ENABLED remain off until explicitly reviewed and enabled. Demo soft-currency loops may be used for testing only.",
  },
  {
    q: "Can treasury spending guarantee token price growth?",
    a: "No. Treasury allocations may support marketing, development, liquidity initiatives, and community events, but they do not promise exchange listings, liquidity, adoption, or token-price appreciation.",
  },
  {
    q: "How do marketplace fees work?",
    a: `${projectConfig.PROJECT_NAME} publishes a transparent fee split: seller proceeds plus allocations to growth, Community Reward Treasury, operations, and events/reserves. Amounts are calculated from the sale price using integer demo credits in the MVP. Fees fund the treasury when settled — they are not automatic income paid to every pet owner from each trade.`,
  },
] as const;

type EconomyFaqProps = {
  className?: string;
};

export function EconomyFaq({ className }: EconomyFaqProps) {
  return (
    <section
      className={cn("space-y-4", className)}
      aria-labelledby="economy-faq-heading"
    >
      <h2 id="economy-faq-heading" className="font-display text-xl text-white">
        Economy FAQ
      </h2>

      <div className="space-y-3">
        {ECONOMY_FAQ.map((item) => (
          <details key={item.q} className="panel group p-4">
            <summary className="focus-ring cursor-pointer list-none rounded font-medium text-white [&::-webkit-details-marker]:hidden">
              {item.q}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
