import Image from "next/image";
import Link from "next/link";
import { projectConfig } from "@/lib/config/project";
import {
  canEnterLiveWorld,
  featureFlagDefaults,
  isLiveWorldEntryOpen,
} from "@/lib/config/feature-flags";
import { dashboardActionIconPath, sectionUiThumbPath } from "@/lib/assets/paths";
import { DashboardEconomyWidget } from "@/components/economy";
import { EconomySummary } from "@/components/economy";
import { AcademyOnboardingBanner } from "@/components/academy";
import { PageHeader } from "@/components/shared/page-header";
import { ImageButton, type ImageButtonVariant } from "@/components/ui/image-button";
import { RiftPageShell } from "@/components/ui/rift-page-shell";
import { RiftPanel } from "@/components/ui/rift-panel";

export const metadata = { title: "Play" };

const quickActions: {
  href: string;
  label: string;
  slug: string;
  variant: ImageButtonVariant;
}[] = [
  { href: "/tcg/battle", label: "Rift Battle", slug: "arena", variant: "primary" },
  { href: "/tcg/collection", label: "Card Binder", slug: "collection", variant: "primary" },
  { href: "/hatchery", label: "Open Hatchery", slug: "hatchery", variant: "secondary" },
  { href: "/help", label: "Help", slug: "academy", variant: "secondary" },
  { href: "/profile", label: "Profile", slug: "profile", variant: "secondary" },
  { href: "/inventory", label: "Inventory", slug: "inventory", variant: "secondary" },
];

function liveWorldCard() {
  const entryOpen = isLiveWorldEntryOpen();
  const playable = canEnterLiveWorld();
  const publicAccess = featureFlagDefaults.LIVE_WORLD_PUBLIC_ACCESS_ENABLED;
  if (!entryOpen) {
    return {
      title: "Live World",
      body: "Coming Soon — shared habitat, settlements, and World Restoration. Launch focus is Rift Battles.",
      href: "/live-world",
      thumb: sectionUiThumbPath("features", "live-world"),
      glow: "rgba(61,231,255,0.12)",
    };
  }
  return {
    title: "Live World",
    body: playable
      ? publicAccess
        ? "Habitat preview stays open — launch combat is Rift Battles."
        : "COMING SOON · DEV ACCESS — enter locally while public stays gated."
      : "Playable Live World paused by feature flag.",
    href: "/live-world",
    thumb: sectionUiThumbPath("features", "live-world"),
    glow: "rgba(61,231,255,0.14)",
  };
}

const featureCards = [
  {
    title: "Rift Battle",
    body: featureFlagDefaults.TCG_FRAMEWORK_ENABLED
      ? "Primary combat — Rift Energy TCG board."
      : "TCG framework paused.",
    href: "/tcg/battle",
    thumb: sectionUiThumbPath("features", "arena"),
    glow: "rgba(61,231,255,0.22)",
  },
  {
    title: "Card Binder",
    body: featureFlagDefaults.TCG_FRAMEWORK_ENABLED
      ? "Browse your collection and shape decks."
      : "Binder paused.",
    href: "/tcg/collection",
    thumb: sectionUiThumbPath("features", "starter-claim"),
    glow: "rgba(255,184,77,0.18)",
  },
  {
    title: "Starter Egg",
    body: featureFlagDefaults.STARTER_EGG_CLAIMS_ENABLED
      ? "Guaranteed free Starter Egg for signed-in Keepers — no SOL required."
      : "Paused",
    href: "/hatchery",
    thumb: sectionUiThumbPath("features", "starter-claim"),
    glow: "rgba(61,231,255,0.18)",
  },
  liveWorldCard(),
  {
    title: "Arena",
    body: featureFlagDefaults.ARENA_ENABLED
      ? "Legacy pet battler — soft-secondary practice."
      : "Arena paused.",
    href: "/arena",
    thumb: sectionUiThumbPath("features", "arena"),
    glow: "rgba(255,184,77,0.12)",
  },
  {
    title: "Care & pets",
    body: featureFlagDefaults.PET_CARE_ENABLED
      ? "Server-side care decay and recovery enabled."
      : "Care paused",
    href: "/profile",
    thumb: sectionUiThumbPath("features", "care-pets"),
    glow: "rgba(255,184,77,0.14)",
  },
];

export default function PlayDashboardPage() {
  return (
    <RiftPageShell mood="hearth" className="!max-w-7xl">
      <div className="space-y-6">
        <PageHeader
          kicker="Keeper Dashboard"
          titleSlug="play"
          title={`Welcome to ${projectConfig.UNIVERSE_NAME}`}
          description={
            <>
              Signed-in Keepers only — no guest gameplay. Hatch companions, collect cards, duel in
              Rift Battles, and care for your {projectConfig.CREATURE_NAME}. Wallet link is optional
              for Web3; a free account is required. Optional {projectConfig.TOKEN_SYMBOL} perks are
              cosmetics only.
            </>
          }
          status="Account required"
          statusTone="live"
          actions={
            <>
              {quickActions.map((action) => (
                <ImageButton
                  key={action.href}
                  href={action.href}
                  variant={action.variant}
                  className="gap-2 px-3.5 py-2 sm:gap-2.5 sm:px-4 sm:py-2.5"
                >
                  <Image
                    src={dashboardActionIconPath(action.slug)}
                    alt=""
                    width={32}
                    height={32}
                    className="h-7 w-7 shrink-0 bg-transparent object-contain sm:h-8 sm:w-8"
                    unoptimized
                    aria-hidden
                  />
                  <span>{action.label}</span>
                </ImageButton>
              ))}
            </>
          }
        />

        <AcademyOnboardingBanner />

        <DashboardEconomyWidget />

        <EconomySummary variant="compact" />

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((card) => (
            <Link key={card.title} href={card.href} className="focus-ring">
              <RiftPanel
                material="obsidian"
                interactive
                className="group relative h-full overflow-hidden"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full opacity-70 blur-2xl transition group-hover:opacity-100"
                  style={{ background: card.glow }}
                />
                <div className="relative flex items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[rgba(61,231,255,0.18)] bg-[radial-gradient(ellipse_at_center,rgba(61,231,255,0.12),rgba(10,14,26,0.4)_70%)] shadow-[inset_0_0_20px_rgba(61,231,255,0.08)]">
                    <Image
                      src={card.thumb}
                      alt=""
                      width={128}
                      height={128}
                      className="h-full w-full object-contain p-1"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-lg text-white">{card.title}</h2>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">{card.body}</p>
                  </div>
                </div>
              </RiftPanel>
            </Link>
          ))}
        </section>
      </div>
    </RiftPageShell>
  );
}
