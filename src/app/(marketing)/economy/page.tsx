import Link from "next/link";
import {
  AllocationCards,
  AllocationDonut,
  RevenueFlow,
  EligibilityChecklist,
  SurvivalTimeline,
  MarketplaceFeeBreakdown,
  EconomyFaq,
  RewardDisclaimer,
  MarketplaceDisclaimer,
  GrowthDisclaimer,
} from "@/components/economy";
import {
  EveryPurchaseSection,
  HolderRewardsDashboard,
  RevenueTransparencyMetrics,
} from "@/components/revenue";
import { getActiveTreasuryPolicy, CARE_SHOP_ITEMS } from "@/lib/config/treasury-policy";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { projectConfig } from "@/lib/config/project";
import { GameImage } from "@/components/assets/game-image";
import { SectionTitleBand } from "@/components/shared/page-header";

export const metadata = {
  title: "Economy",
  description:
    "Treasury allocation, pet rewards, marketplace fees, and care rules for the Riftwilds economy.",
};

function WalletRow({ label, address }: { label: string; address: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--stroke)] py-2 text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="font-mono text-xs text-white">
        {address}
        {address !== "COMING_SOON" ? (
          <a
            className="ml-2 text-[var(--cyan)]"
            href={`https://explorer.solana.com/address/${address}?cluster=${projectConfig.SOLANA_NETWORK}`}
            target="_blank"
            rel="noreferrer"
          >
            Explorer
          </a>
        ) : null}
      </span>
    </div>
  );
}

export default function EconomyPage() {
  const policy = getActiveTreasuryPolicy();
  const total = policy.allocations.reduce((s, a) => s + a.percent, 0);

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden px-4 pb-12 pt-10 md:px-6 md:pt-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="portal-glow absolute left-1/2 top-8 h-48 w-48 -translate-x-1/2 rounded-full opacity-70" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <SectionTitleBand
            slug="economy"
            label="Economy"
            kicker={`Economy · Policy v${policy.version}`}
            className="mb-8"
          />
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
            <p className="font-display text-2xl font-bold text-white md:text-3xl">
              Powering the Riftwilds economy
            </p>
            <p className="mt-4 max-w-2xl text-base text-[var(--text-muted)] md:text-lg">
              Verified project-controlled revenue helps grow the game, fund promotions, maintain the
              platform, support community events, and fund Community Reward Treasury distributions for
              eligible Riftling owners — not automatic SOL from each Pump.fun buy.
            </p>
            <div className="panel mt-5 border-[rgba(255,184,77,0.35)] p-4 text-sm text-[var(--amber)]">
              Community rewards depend on verified treasury deposits and published eligibility rules.
              Buying the coin does not automatically pay pet owners. Rewards are not guaranteed and
              may change, pause, or be unavailable.
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#treasury-allocation" className="btn-primary focus-ring">
                View Treasury Allocation
              </a>
              <a href="#pet-eligibility" className="btn-secondary focus-ring">
                See Pet Eligibility
              </a>
              <Link href="/marketplace" className="btn-secondary focus-ring">
                Explore Marketplace
              </Link>
              <Link href="/token" className="btn-secondary focus-ring">
                Verify Token
              </Link>
            </div>
          </div>

          <div className="panel relative flex min-h-[320px] flex-col items-center justify-center p-6">
            <GameImage
              src="/assets/ui/economy/vault.png"
              alt="Riftwilds treasury vault"
              width={112}
              height={112}
              className="drop-shadow-[0_0_28px_rgba(61,231,255,0.25)]"
              showDevBadge={false}
              priority
            />
            <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              <div className="rounded-lg border border-[var(--stroke)] p-2">
                <GameImage
                  src="/assets/ui/economy/pets.png"
                  alt="Pet care"
                  width={40}
                  height={40}
                  className="mx-auto"
                  showDevBadge={false}
                />
                Pets
              </div>
              <div className="rounded-lg border border-[var(--stroke)] p-2">
                <GameImage
                  src="/assets/ui/economy/market.png"
                  alt="Marketplace exchange"
                  width={40}
                  height={40}
                  className="mx-auto"
                  showDevBadge={false}
                />
                Market
              </div>
              <div className="rounded-lg border border-[var(--stroke)] p-2">
                <GameImage
                  src="/assets/ui/economy/growth.png"
                  alt="Ecosystem growth"
                  width={40}
                  height={40}
                  className="mx-auto"
                  showDevBadge={false}
                />
                Growth
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 md:px-6">
        <EveryPurchaseSection />

        <HolderRewardsDashboard />

        <RevenueTransparencyMetrics />

        <section id="revenue-flow">
          <h2 className="font-display text-2xl text-white">How Project Revenue Flows</h2>
          <div className="mt-6">
            <RevenueFlow />
          </div>
        </section>

        <section id="treasury-allocation">
          <div>
            <h2 className="font-display text-2xl text-white">Treasury Allocation</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {policy.label} · Status:{" "}
              <span className="text-[var(--amber)] uppercase">{policy.status}</span> · Effective{" "}
              {new Date(policy.effectiveAt).toLocaleDateString()} · Updated{" "}
              {new Date(policy.updatedAt).toLocaleDateString()} · Total {total}%
            </p>
          </div>
          <div className="mt-6 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <AllocationDonut allocations={policy.allocations} />
            <AllocationCards />
          </div>
          <GrowthDisclaimer className="mt-6" />
          <div className="panel mt-6 p-5">
            <h3 className="font-display text-lg text-white">Public wallets</h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Addresses load from policy configuration. Demo placeholders until configured.
            </p>
            <div className="mt-3">
              <WalletRow label="Collection" address={policy.collectionWallet} />
              <WalletRow label="Growth" address={policy.growthWallet} />
              <WalletRow label="Community Rewards" address={policy.petRewardWallet} />
              <WalletRow label="Operations" address={policy.operationsWallet} />
              <WalletRow label="Events" address={policy.eventsWallet} />
              <WalletRow label="Emergency" address={policy.emergencyWallet} />
            </div>
          </div>
        </section>

        <section id="growth">
          <h2 className="font-display text-2xl text-white">How the Growth Treasury May Be Used</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "DEX and Liquidity",
                items: [
                  "DEX-related launch expenses",
                  "Liquidity initiatives",
                  "Market infrastructure",
                  "Trading-pair support",
                  "Professional liquidity services when legally and technically appropriate",
                ],
                note: "Liquidity actions must be publicly documented and must not be described as guaranteeing token-price appreciation.",
              },
              {
                title: "Marketing and Promotions",
                items: [
                  "DexScreener advertising or boosts",
                  "Social-media advertising",
                  "Community partnerships",
                  "Promotional campaigns",
                  "Influencer collaborations",
                  "Content creation",
                  "Giveaways",
                  "Launch events",
                ],
              },
              {
                title: "Game Development",
                items: [
                  "Creature artwork",
                  "Animations",
                  "New maps",
                  "Battle development",
                  "Marketplace improvements",
                  "Mobile optimization",
                  "New quests",
                  "Community bosses",
                  "Security enhancements",
                ],
              },
              {
                title: "Professional Services",
                items: [
                  "Legal review",
                  "Smart-contract auditing",
                  "Accounting",
                  "Security testing",
                  "Infrastructure support",
                ],
              },
            ].map((card) => (
              <article key={card.title} className="panel p-5">
                <h3 className="font-display text-lg text-white">{card.title}</h3>
                <ul className="mt-3 space-y-1 text-sm text-[var(--text-muted)]">
                  {card.items.map((i) => (
                    <li key={i}>• {i}</li>
                  ))}
                </ul>
                {card.note ? <p className="mt-3 text-xs text-[var(--amber)]">{card.note}</p> : null}
              </article>
            ))}
          </div>
          <details className="panel mt-4 p-5">
            <summary className="cursor-pointer font-display text-white">Spending report</summary>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Verified spend history will list date, category, amount, asset, recipient, signature,
              approval, and explorer links. No fake spend data is shown.
            </p>
          </details>
        </section>

        <section id="pet-rewards">
          <h2 className="font-display text-2xl text-white">Community Reward Treasury</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Own a Riftling to unlock the Pet Reward system. Eligible living pets may share in
            Community Reward Treasury distributions during scheduled epochs. Buying the Pump.fun
            coin does not automatically generate SOL for pet owners.
          </p>
          <ol className="mt-6 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {[
              "Verified project-controlled deposit",
              "Active treasury allocation is applied",
              "Community Reward Treasury pool funded",
              "Eligible pets identified at snapshot",
              "Pool divided by published formula",
              "Rewards claimable after finalization",
            ].map((step, i) => (
              <li key={step} className="panel p-4 text-sm text-[var(--text-muted)]">
                <span className="font-display text-[var(--cyan)]">0{i + 1}</span>
                <p className="mt-2">{step}</p>
              </li>
            ))}
          </ol>
          <div className="panel mt-6 p-5 font-mono text-sm text-[var(--cyan)]">
            {policy.rewardRules.formulaLines.map((line) => (
              <p key={line} className="py-1">
                {line}
              </p>
            ))}
          </div>
          <ul className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
            <li>• Equal weight for qualified pets at launch (rarity does not auto-boost payouts).</li>
            <li>• Marketplace price does not increase reward weight.</li>
            <li>
              • Max {policy.rewardRules.maxRewardActivePets} reward-active pets per wallet
              (configurable).
            </li>
            <li>• No revenue means no new allocation for that epoch; small balances may carry forward.</li>
            <li>• Feature can be paused for security, legal, or treasury reasons.</li>
            <li>
              · Soft epoch rewards: {featureFlagDefaults.EPOCH_REWARDS_ENABLED ? "on" : "off"} ·
              Real-money: {featureFlagDefaults.REAL_MONEY_REWARDS_ENABLED ? "on" : "off"}
            </li>
          </ul>
          <RewardDisclaimer className="mt-4" />
        </section>

        <section id="pet-eligibility">
          <h2 className="font-display text-2xl text-white">Is Your Pet Eligible?</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Connect a wallet to refresh live checks. Guaranteed dollar estimates are never shown.
          </p>
          <div className="mt-6">
            <EligibilityChecklist />
          </div>
        </section>

        <section id="survival">
          <h2 className="font-display text-2xl text-white">Keep Your Riftling Healthy</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Riftlings need food, care, rest, and attention. Neglect reduces eligibility and features.
            Decay uses server time — never the device clock.
          </p>
          <div className="mt-6">
            <SurvivalTimeline />
          </div>
          <p className="panel mt-4 p-4 text-sm text-[var(--amber)]">
            Permanent pet death is disabled by default during the initial release (
            PERMANENT_DEATH_ENABLED = {String(featureFlagDefaults.PERMANENT_DEATH_ENABLED)}).
          </p>
        </section>

        <section id="items">
          <h2 className="font-display text-2xl text-white">Care, Trade and Grow</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Acquire items to keep pets healthy. Prices are demo credits from configuration — not live
            market quotes.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CARE_SHOP_ITEMS.map((item) => (
              <article key={item.slug} className="panel p-4">
                <h3 className="font-display text-white">{item.name}</h3>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--amber)]">
                  {item.category} · {item.rarity}
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{item.description}</p>
                <p className="mt-2 text-xs text-[var(--cyan)]">{item.effects.join(" · ")}</p>
                <p className="mt-3 text-sm text-white">{item.priceCredits} demo credits</p>
              </article>
            ))}
          </div>
        </section>

        <section id="marketplace-economy">
          <h2 className="font-display text-2xl text-white">Creature Marketplace</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Sell unopened eggs (disclosed ranges only) or hatched pets on known traits. Starter eggs
            are account-bound. Sellers set prices — purchasing never guarantees future rewards or
            resale value. Pet listings may be pet-only or an explicit loadout bundle.
          </p>
          <ul className="mt-4 space-y-1 text-sm text-[var(--text-muted)]">
            <li>
              • Fee split on sale: 90% seller / 5% reserve / 3% Community Reward Treasury / 1% ops /
              1% events (settled fees — not automatic token-buy pet income)
            </li>
            <li>• Price history uses “similar sold between X–Y” language only</li>
            <li>• Ranked Arena normalizes equipment and paid upgrades</li>
            <li>• Full rules: docs/MARKETPLACE_ECONOMY.md</li>
          </ul>
          <div className="mt-6">
            <MarketplaceFeeBreakdown />
          </div>
          <MarketplaceDisclaimer className="mt-4" />
          <Link href="/marketplace" className="btn-secondary focus-ring mt-4 inline-flex">
            Open Marketplace
          </Link>
        </section>

        <section id="faq">
          <h2 className="font-display text-2xl text-white">Economy FAQ</h2>
          <div className="mt-6">
            <EconomyFaq />
          </div>
        </section>
      </div>
    </div>
  );
}
