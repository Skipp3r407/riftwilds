import Image from "next/image";
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
import {
  GROWTH_USE_ART,
  PUBLIC_WALLET_ICONS,
  REVENUE_SECTION_ART,
} from "@/lib/revenue/revenue-art";

export const metadata = {
  title: "Economy",
  description:
    "Treasury allocation, pet rewards, marketplace fees, and care rules for the Riftwilds economy.",
};

function WalletRow({
  label,
  address,
  iconSrc,
}: {
  label: string;
  address: string;
  iconSrc?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--stroke)] py-2 text-sm">
      <span className="flex items-center gap-2.5 text-[var(--text-muted)]">
        {iconSrc ? (
          <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border border-[rgba(61,231,255,0.22)] bg-[rgba(6,12,24,0.55)]">
            <Image src={iconSrc} alt="" fill sizes="28px" className="object-cover" aria-hidden />
          </span>
        ) : null}
        {label}
      </span>
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
          <Image
            src="/assets/economy/purchase-flow-banner.png?v=ec3"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center opacity-70"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,10,18,0.35)] via-[rgba(8,10,18,0.45)] to-[rgba(8,10,18,0.78)]" />
          <div className="portal-glow absolute left-1/2 top-8 h-48 w-48 -translate-x-1/2 rounded-full opacity-50" />
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
            <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-wider text-[var(--text-muted)] sm:gap-3 sm:text-xs">
              <div className="rounded-lg border border-[var(--stroke)] px-1.5 py-2.5 sm:p-3">
                <GameImage
                  src="/assets/ui/economy/pets.png"
                  alt="Pet care"
                  width={80}
                  height={80}
                  className="mx-auto"
                  showDevBadge={false}
                />
                Pets
              </div>
              <div className="rounded-lg border border-[var(--stroke)] px-1.5 py-2.5 sm:p-3">
                <GameImage
                  src="/assets/ui/economy/market.png"
                  alt="Marketplace exchange"
                  width={80}
                  height={80}
                  className="mx-auto"
                  showDevBadge={false}
                />
                Market
              </div>
              <div className="rounded-lg border border-[var(--stroke)] px-1.5 py-2.5 sm:p-3">
                <GameImage
                  src="/assets/ui/economy/growth.png"
                  alt="Ecosystem growth"
                  width={80}
                  height={80}
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

        <section
          id="treasury-allocation"
          className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--stroke)]"
        >
          <Image
            src={REVENUE_SECTION_ART.allocation}
            alt=""
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-center"
            aria-hidden
            unoptimized
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(6,12,24,0.78)] via-[rgba(6,12,24,0.88)] to-[rgba(6,12,24,0.94)]"
            aria-hidden
          />
          <div className="relative z-10 space-y-6 p-4 sm:p-5 md:p-6">
            <div>
              <h2 className="font-display text-2xl text-white drop-shadow-sm">
                Revenue allocation
              </h2>
              <p className="mt-2 text-sm text-[rgba(220,230,245,0.88)]">
                {policy.label} · Status:{" "}
                <span className="text-[var(--amber)] uppercase">{policy.status}</span> · Effective{" "}
                {new Date(policy.effectiveAt).toLocaleDateString()} · Updated{" "}
                {new Date(policy.updatedAt).toLocaleDateString()} · Total {total}%
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <AllocationDonut allocations={policy.allocations} />
              <AllocationCards hideHeading />
            </div>
            <GrowthDisclaimer />
            <div className="panel border-[rgba(61,231,255,0.18)] bg-[rgba(6,12,24,0.72)] p-5 backdrop-blur-[2px]">
              <h3 className="font-display text-lg text-white">Public wallets</h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Addresses load from policy configuration. Demo placeholders until configured.
              </p>
              <div className="mt-3">
                <WalletRow
                  label="Collection"
                  address={policy.collectionWallet}
                  iconSrc={PUBLIC_WALLET_ICONS.Collection}
                />
                <WalletRow
                  label="Growth"
                  address={policy.growthWallet}
                  iconSrc={PUBLIC_WALLET_ICONS.Growth}
                />
                <WalletRow
                  label="Community Rewards"
                  address={policy.petRewardWallet}
                  iconSrc={PUBLIC_WALLET_ICONS["Community Rewards"]}
                />
                <WalletRow
                  label="Operations"
                  address={policy.operationsWallet}
                  iconSrc={PUBLIC_WALLET_ICONS.Operations}
                />
                <WalletRow
                  label="Events"
                  address={policy.eventsWallet}
                  iconSrc={PUBLIC_WALLET_ICONS.Events}
                />
                <WalletRow
                  label="Emergency"
                  address={policy.emergencyWallet}
                  iconSrc={PUBLIC_WALLET_ICONS.Emergency}
                />
              </div>
            </div>
          </div>
        </section>

        <section id="growth">
          <h2 className="font-display text-2xl text-white">How the Growth Treasury May Be Used</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {(
              [
                {
                  title: "DEX and Liquidity",
                  art: GROWTH_USE_ART.dex,
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
                  art: GROWTH_USE_ART.marketing,
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
                  art: GROWTH_USE_ART.gamedev,
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
                  art: GROWTH_USE_ART.services,
                  items: [
                    "Legal review",
                    "Smart-contract auditing",
                    "Accounting",
                    "Security testing",
                    "Infrastructure support",
                  ],
                },
              ] as const
            ).map((card) => (
              <article
                key={card.title}
                className="panel relative min-h-[16rem] overflow-hidden p-0"
                style={{ borderLeftColor: card.art.accent, borderLeftWidth: "3px" }}
              >
                <Image
                  src={card.art.imageSrc}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                  aria-hidden
                  unoptimized
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,12,24,0.97)] via-[rgba(6,12,24,0.86)] to-[rgba(6,12,24,0.42)]"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(6,12,24,0.55)] via-transparent to-[rgba(6,12,24,0.28)]"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-90"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${card.art.accent}, transparent)`,
                  }}
                  aria-hidden
                />
                <div className="relative z-10 flex h-full flex-col p-5">
                  <h3 className="font-display text-lg text-white drop-shadow-sm">{card.title}</h3>
                  <ul className="mt-3 space-y-1.5 text-sm text-[rgba(200,214,232,0.9)]">
                    {card.items.map((i) => (
                      <li key={i} className="flex gap-2">
                        <span style={{ color: card.art.accent }} aria-hidden>
                          •
                        </span>
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                  {"note" in card && card.note ? (
                    <p className="mt-3 text-xs text-[var(--amber)] drop-shadow-sm">{card.note}</p>
                  ) : null}
                </div>
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

        <section
          id="pet-rewards"
          className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--stroke)] px-4 py-8 sm:px-6 md:px-8"
        >
          <Image
            src="/assets/economy/section-treasury-bg.png"
            alt=""
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-center opacity-55"
            aria-hidden
            unoptimized
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(6,12,24,0.55)] via-[rgba(6,12,24,0.62)] to-[rgba(6,12,24,0.82)]"
            aria-hidden
          />
          <div className="relative z-10">
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
          </div>
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

        <section
          id="survival"
          className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--stroke)] px-4 py-8 sm:px-6 md:px-8"
        >
          <Image
            src="/assets/economy/section-care-bg.png"
            alt=""
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-center opacity-55"
            aria-hidden
            unoptimized
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(6,12,24,0.52)] via-[rgba(6,12,24,0.6)] to-[rgba(6,12,24,0.8)]"
            aria-hidden
          />
          <div className="relative z-10">
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
          </div>
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
