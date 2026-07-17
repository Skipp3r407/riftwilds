import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/marketing/hero";
import { LiveStatus } from "@/components/marketing/live-status";
import { EconomySummary } from "@/components/economy";
import { EveryPurchaseSection } from "@/components/revenue";
import { projectConfig, hatchOddsDefault } from "@/lib/config/project";
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
    title: "Hatch it",
    body: "Server-fair hatch reveals affinity, species, and rarity. Odds are public before you roll.",
    href: "/fairness",
  },
  {
    step: "3",
    title: "Care for it",
    body: "Feed, clean, play, rest. Keep care scores healthy — dormant pets pause rewards and Arena.",
    href: "/play",
  },
  {
    step: "4",
    title: "Play the loop",
    body: "Train in Arena, equip original gear, browse the shop, and share in transparent holder epochs.",
    href: "/arena",
  },
];

const featured = [
  {
    name: "Cindercub",
    affinity: "Ember",
    rarity: "Uncommon",
    src: "/assets/pets/cindercub.png?v=mask3",
  },
  {
    name: "Mossprig",
    affinity: "Grove",
    rarity: "Common",
    src: "/assets/pets/mossprig.png?v=mask3",
  },
  {
    name: "Bubbloon",
    affinity: "Tide",
    rarity: "Common",
    src: "/assets/pets/bubbloon.png?v=mask3",
  },
  {
    name: "Wisplet",
    affinity: "Spirit",
    rarity: "Rare",
    src: "/assets/pets/wisplet.png?v=mask3",
  },
];

const faq = [
  {
    q: "How is this different from other Solana pet games?",
    a: `${projectConfig.PROJECT_NAME} adds turn-based Arena battles, a full equipment economy, versioned revenue splits, and public allocation policies — not just hatch-and-hold.`,
  },
  {
    q: "Do I need the token?",
    a: `Visitors can browse. Holding ${projectConfig.TOKEN_SYMBOL} unlocks Keeper+ features such as starter eggs. Token holding does not guarantee profit.`,
  },
  {
    q: "Are SOL rewards guaranteed?",
    a: "No. Holder allocations depend on actual eligible revenue, eligibility rules, treasury conditions, and policy versions. Claims stay feature-flagged until ready.",
  },
  {
    q: "Can my Riftling die?",
    a: "Permanent death is off by default. Neglect can make a pet dormant. Memorials exist if that mode is ever enabled.",
  },
  {
    q: "How are hatch results chosen?",
    a: "Server-authoritative randomness with logged rolls. See Fairness for the model — not a paid mystery box for equipment.",
  },
  {
    q: "Where does shop SOL go?",
    a: "Direct purchases split by the active public policy (Growth, Pet Holder Vault, Ops, Events). Full breakdown before you pay.",
  },
];

export default function HomePage() {
  const shop = getActivePolicy("SHOP_PURCHASE");
  const odds = Object.entries(hatchOddsDefault);

  return (
    <>
      <Hero />
      <LiveStatus />

      {/* Claim egg — primary conversion block */}
      <section id="claim" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="panel grid items-center gap-10 p-6 md:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <div className="pointer-events-none absolute inset-0 rounded-full bg-[rgba(61,231,255,0.12)] blur-3xl" />
            <Image
              src="/assets/eggs/mystery-rift-egg.png?v=mask3"
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
            The same simple loop players love — then Arena, gear, and a transparent economy on top.
          </p>
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item) => (
              <li key={item.step}>
                <Link
                  href={item.href}
                  className="panel block h-full p-5 transition hover:border-[rgba(61,231,255,0.4)]"
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
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {odds.map(([rarity, pct]) => (
            <div key={rarity} className="panel p-4 text-center">
              <p className="font-display text-xs uppercase tracking-wider text-[var(--cyan)]">
                {rarity}
              </p>
              <p className="font-display mt-2 text-2xl text-white">{pct}%</p>
            </div>
          ))}
        </div>
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
              <div className="relative aspect-[4/3] bg-[rgba(7,11,22,0.6)]">
                <Image src={c.src} alt="" fill className="object-contain p-4" unoptimized />
              </div>
              <div className="p-4">
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
          Other games stop at hatch-and-care. {projectConfig.UNIVERSE_NAME} adds skill battles and a
          public revenue split you can audit.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link
            href="/arena"
            className="panel block p-6 transition hover:border-[rgba(61,231,255,0.35)]"
          >
            <p className="font-display text-xs uppercase tracking-[0.2em] text-[var(--cyan)]">
              Arena
            </p>
            <h3 className="font-display mt-2 text-xl text-white">Turn-based duels</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Affinity matchups, weapons, training AI, and ranked normalization — no wagering.
            </p>
          </Link>
          <Link
            href="/shop"
            className="panel block p-6 transition hover:border-[rgba(61,231,255,0.35)]"
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
            className="panel block p-6 transition hover:border-[rgba(61,231,255,0.35)]"
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
              <div key={c.name} className="panel p-4">
                <div className="relative mx-auto h-24 w-24">
                  <Image src={c.src} alt="" fill className="object-contain" unoptimized />
                </div>
                <p className="font-display mt-3 text-center text-white">{c.name}</p>
                <p className="mt-1 text-center text-xs text-[var(--text-muted)]">
                  {c.rarity} · Listing demo
                </p>
                <p className="mt-2 text-center font-display text-[var(--amber)]">
                  {["—", "—", "—"][i]} SOL
                </p>
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

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl text-white">Questions people ask</h2>
        <div className="mt-6 space-y-3">
          {faq.map((item) => (
            <details key={item.q} className="panel group p-4">
              <summary className="focus-ring cursor-pointer list-none rounded font-medium text-white">
                {item.q}
              </summary>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{item.a}</p>
            </details>
          ))}
        </div>
        <Link href="/docs" className="mt-6 inline-block text-sm text-[var(--cyan)] underline">
          Read the docs →
        </Link>
      </section>
    </>
  );
}
