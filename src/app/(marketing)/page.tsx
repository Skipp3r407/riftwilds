import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/marketing/hero";
import { LiveStatus } from "@/components/marketing/live-status";
import { CommercialShowcase } from "@/components/marketing/commercial-showcase";
import { HatchOddsPanel } from "@/components/marketing/hatch-odds-panel";
import { EconomySummary } from "@/components/economy";
import { EveryPurchaseSection } from "@/components/revenue";
import { homeAffinityBgPath, mysteryRiftEggPath, sectionUiThumbPath } from "@/lib/assets/paths";
import { projectConfig } from "@/lib/config/project";
import { getActivePolicy, bpsToPercentLabel } from "@/lib/revenue/policies";

const howItWorks = [
  {
    step: "1",
    title: "Claim an egg",
    body: `Hold ${projectConfig.TOKEN_SYMBOL} as a Keeper, connect your wallet, and claim a starter Rift egg.`,
    href: "/hatchery",
  },
  {
    step: "2",
    title: "Hatch & collect",
    body: "Server-fair hatch reveals affinity and species. Grow a card binder tied to your Riftlings.",
    href: "/tcg/collection",
  },
  {
    step: "3",
    title: "Build a deck",
    body: "Shape a Rift Energy deck from your binder — short sessions, readable choices, real strategy.",
    href: "/tcg/collection",
  },
  {
    step: "4",
    title: "Rift Battle",
    body: "Duel on the TCG board — primary combat for launch. Living World habitat ships later.",
    href: "/tcg/battle",
  },
];

const featured = [
  {
    name: "Cindercub",
    affinity: "Ember",
    rarity: "Uncommon",
    src: "/assets/pets/cindercub.png?v=mask3",
    bg: homeAffinityBgPath("ember-rift"),
  },
  {
    name: "Mossprig",
    affinity: "Grove",
    rarity: "Common",
    src: "/assets/pets/mossprig.png?v=mask3",
    bg: homeAffinityBgPath("grove-moss"),
  },
  {
    name: "Bubbloon",
    affinity: "Tide",
    rarity: "Common",
    src: "/assets/pets/bubbloon.png?v=mask3",
    bg: homeAffinityBgPath("tide-glow"),
  },
  {
    name: "Wisplet",
    affinity: "Spirit",
    rarity: "Rare",
    src: "/assets/pets/wisplet.png?v=mask3",
    bg: homeAffinityBgPath("spirit-haze"),
  },
];

const faq = [
  {
    q: "How is this different from other Solana pet games?",
    a: `${projectConfig.PROJECT_NAME} centers on a strategic Rift Battles card game with Riftling companions, Credits-first economy, and transparent revenue policies — not just hatch-and-hold. Living World is a future release.`,
    thumb: "different",
  },
  {
    q: "Do I need the token?",
    a: `Visitors can browse. Holding ${projectConfig.TOKEN_SYMBOL} unlocks Keeper+ features such as starter eggs. Token holding does not guarantee profit.`,
    thumb: "token",
  },
  {
    q: "Are SOL rewards guaranteed?",
    a: "No. Holder allocations depend on actual eligible revenue, eligibility rules, treasury conditions, and policy versions. Claims stay feature-flagged until ready.",
    thumb: "sol-rewards",
  },
  {
    q: "Can my Riftling die?",
    a: "Permanent death is off by default. Neglect can make a pet dormant. Memorials exist if that mode is ever enabled.",
    thumb: "bond",
  },
  {
    q: "How are hatch results chosen?",
    a: "Server-authoritative randomness with logged rolls. See Fairness for the model — not a paid mystery box for equipment.",
    thumb: "hatch",
  },
  {
    q: "Where does shop SOL go?",
    a: "Direct purchases split by the active public policy (Growth, Pet Holder Vault, Ops, Events). Full breakdown before you pay.",
    thumb: "treasury",
  },
];

export default function HomePage() {
  const shop = getActivePolicy("SHOP_PURCHASE");

  return (
    <>
      <Hero />
      <LiveStatus />
      <CommercialShowcase />

      {/* Claim egg — primary conversion block */}
      <section id="claim" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="panel grid items-center gap-10 p-6 md:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <div className="pointer-events-none absolute inset-0 rounded-full bg-[rgba(61,231,255,0.12)] blur-3xl" />
            <Image
              src={mysteryRiftEggPath()}
              alt="Rift egg"
              fill
              className="object-contain drop-shadow-[0_0_40px_rgba(61,231,255,0.35)]"
              unoptimized
            />
          </div>
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-[var(--amber)]">
              Starter claim
            </p>
            <h2 className="font-display mt-2 text-3xl text-white md:text-4xl">
              Claim your egg now
            </h2>
            <p className="mt-3 text-sm text-[var(--text-muted)] md:text-base">
              Keeper-tier holders can claim a starter egg on {projectConfig.SOLANA_NETWORK}. No fake
              “only X left” counters — supply and eligibility are disclosed honestly.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[var(--text-muted)]">
              <li>· Verify {projectConfig.TOKEN_SYMBOL} tier in your wallet</li>
              <li>· One starter claim per eligible wallet (configurable)</li>
              <li>· Hatch with published rarity odds</li>
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/hatchery" className="btn-primary focus-ring">
                Open Hatchery
              </Link>
              <Link href="/token" className="btn-secondary focus-ring">
                Check token tier
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — 4 clear steps */}
      <section className="border-y border-[var(--stroke)] bg-[rgba(10,10,15,0.65)] px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl text-white">How it works</h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
            Hatch a companion, grow a card collection, and duel in Rift Battles — the launch gameplay
            loop.
          </p>
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item) => (
              <li key={item.step}>
                <Link
                  href={item.href}
                  className="panel panel-interactive block h-full p-5 focus-ring"
                >
                  <p className="font-display text-4xl text-[var(--cyan)]">{item.step}</p>
                  <h3 className="font-display mt-3 text-xl text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">{item.body}</p>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Rarity odds — public like Hatchlings, but our table */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl text-white">What you might hatch</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Fixed odds shown before you hatch. Rarity is for collection and cosmetics — Arena ranked
          play normalizes equipment power.
        </p>
        <HatchOddsPanel />
        <Link href="/fairness" className="mt-6 inline-block text-sm text-[var(--cyan)] underline">
          Fairness & hatch model →
        </Link>
      </section>

      {/* Creatures */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl text-white">Meet the Riftlings</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Original species across ten affinities — not borrowed from any other franchise.
            </p>
          </div>
          <Link href="/creatures" className="btn-secondary focus-ring text-sm">
            All creatures
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((c) => (
            <article key={c.name} className="panel overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden bg-[rgba(7,11,22,0.6)]">
                <Image
                  src={c.bg}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                  unoptimized
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,10,20,0.72)] via-[rgba(6,10,20,0.28)] to-[rgba(6,10,20,0.35)]"
                  aria-hidden
                />
                <Image
                  src={c.src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="relative z-[1] object-contain p-4 drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
                  unoptimized
                />
              </div>
              <div className="relative p-4">
                <h3 className="font-display text-lg text-white">{c.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  {c.affinity} · {c.rarity}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why better — Arena + economy */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl text-white">Built to go further</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          Other games stop at hatch-and-care. {projectConfig.UNIVERSE_NAME} adds Rift Battles and a
          public revenue split you can audit.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link
            href="/tcg/battle"
            className="panel panel-interactive block p-6 focus-ring"
          >
            <p className="font-display text-xs uppercase tracking-[0.2em] text-[var(--cyan)]">
              Rift Battles
            </p>
            <h3 className="font-display mt-2 text-xl text-white">Strategic card duels</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Spend Rift Energy, play affinities, win short decisive matches — no wagering.
            </p>
          </Link>
          <Link
            href="/shop"
            className="panel panel-interactive block p-6 focus-ring"
          >
            <p className="font-display text-xs uppercase tracking-[0.2em] text-[var(--amber)]">
              Shop
            </p>
            <h3 className="font-display mt-2 text-xl text-white">Named gear, clear prices</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Weapons, armor, potions — direct SOL purchases only. No paid gacha for rarity.
            </p>
          </Link>
          <Link
            href="/economy"
            className="panel panel-interactive block p-6 focus-ring"
          >
            <p className="font-display text-xs uppercase tracking-[0.2em] text-[var(--emerald)]">
              Economy
            </p>
            <h3 className="font-display mt-2 text-xl text-white">Transparent splits</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Shop purchases fund Growth ({bpsToPercentLabel(
                shop.entries.find((e) => e.destination === "GROWTH_RESERVE")!.basisPoints,
              )}
              ), Community Reward Treasury, ops, and events — policy versioned in public. Not
              automatic SOL from Pump.fun buys.
            </p>
          </Link>
        </div>
      </section>

      {/* Marketplace teaser */}
      <section className="border-y border-[var(--stroke)] bg-[rgba(10,10,15,0.55)] px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl text-white">Marketplace</h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Trade pets and gear when listings go live. Seller gets 90% — published fees may fund
                Growth and the Community Reward Treasury when settled.
              </p>
            </div>
            <Link href="/marketplace" className="btn-secondary focus-ring text-sm">
              Browse market
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {featured.slice(0, 3).map((c, i) => (
              <div key={c.name} className="panel relative overflow-hidden p-4">
                <Image
                  src={c.bg}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,10,20,0.92)] via-[rgba(6,10,20,0.62)] to-[rgba(6,10,20,0.45)]"
                  aria-hidden
                />
                <div className="relative z-[1]">
                  <div className="relative mx-auto h-24 w-24">
                    <Image
                      src={c.src}
                      alt=""
                      fill
                      className="object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
                      unoptimized
                    />
                  </div>
                  <p className="font-display mt-3 text-center text-white">{c.name}</p>
                  <p className="mt-1 text-center text-xs text-[var(--text-muted)]">
                    {c.rarity} · Listing demo
                  </p>
                  <p className="mt-2 text-center font-display text-[var(--amber)]">
                    {["—", "—", "—"][i]} SOL
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
            Live listings appear when marketplace mode is enabled. Prices set by sellers.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <EveryPurchaseSection />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <EconomySummary variant="home" />
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl text-white">Questions people ask</h2>
        <div className="mt-6 space-y-3">
          {faq.map((item) => {
            const thumbSrc = sectionUiThumbPath("faq", item.thumb);
            return (
              <details
                key={item.q}
                className="panel group relative overflow-hidden !bg-[rgba(8,10,18,0.72)]"
              >
                <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
                  <Image
                    src={thumbSrc}
                    alt=""
                    fill
                    className="object-cover opacity-[0.42] transition-opacity duration-300 group-hover:opacity-[0.55] group-open:opacity-[0.55]"
                    sizes="720px"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[rgba(6,8,14,0.35)] via-[rgba(8,10,18,0.82)] to-[rgba(8,10,18,0.96)]" />
                </div>
                <summary className="focus-ring relative z-[1] flex cursor-pointer list-none items-center gap-3.5 rounded p-3 sm:gap-4 sm:p-4 [&::-webkit-details-marker]:hidden">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-[0_0_24px_rgba(61,231,255,0.12)] sm:h-16 sm:w-16">
                    <Image
                      src={thumbSrc}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105 group-open:scale-105"
                      sizes="64px"
                      unoptimized
                    />
                  </span>
                  <span className="min-w-0 flex-1 font-medium text-white">{item.q}</span>
                </summary>
                <p className="relative z-[1] border-t border-white/10 px-4 pb-4 pl-[4.35rem] pt-3 text-sm text-[var(--text-muted)] sm:pl-[5.25rem]">
                  {item.a}
                </p>
              </details>
            );
          })}
        </div>
        <Link href="/docs" className="mt-6 inline-block text-sm text-[var(--cyan)] underline">
          Read the docs →
        </Link>
      </section>
    </>
  );
}
