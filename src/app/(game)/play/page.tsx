import Image from "next/image";
import Link from "next/link";
import { projectConfig } from "@/lib/config/project";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { dashboardActionIconPath, sectionUiThumbPath } from "@/lib/assets/paths";
import { DashboardEconomyWidget } from "@/components/economy";
import { EconomySummary } from "@/components/economy";
import { AcademyOnboardingBanner } from "@/components/academy";
import { PageHeader } from "@/components/shared/page-header";
import { ImageButton, type ImageButtonVariant } from "@/components/ui/image-button";

export const metadata = { title: "Play" };

const quickActions: {
  href: string;
  label: string;
  slug: string;
  variant: ImageButtonVariant;
}[] = [
  { href: "/hatchery", label: "Open Hatchery", slug: "hatchery", variant: "primary" },
  { href: "/academy", label: "Academy / Help", slug: "academy", variant: "secondary" },
  { href: "/profile", label: "Profile", slug: "profile", variant: "secondary" },
  { href: "/inventory", label: "Inventory", slug: "inventory", variant: "secondary" },
  { href: "/homestead", label: "Homestead", slug: "homestead", variant: "secondary" },
  { href: "/guilds", label: "Guilds", slug: "guilds", variant: "secondary" },
  { href: "/economy", label: "Economy", slug: "economy", variant: "secondary" },
];

const featureCards = [
  {
    title: "Starter claim",
    body: featureFlagDefaults.STARTER_EGG_CLAIMS_ENABLED
      ? "Enabled for eligible Keepers."
      : "Paused",
    href: "/hatchery",
    thumb: sectionUiThumbPath("features", "starter-claim"),
    glow: "rgba(61,231,255,0.18)",
  },
  {
    title: "World",
    body: featureFlagDefaults.EXPLORATION_ENABLED
      ? "Regions online"
      : "Hub map preview — twelve launch regions listed.",
    href: "/world",
    thumb: sectionUiThumbPath("features", "world"),
    glow: "rgba(61,231,255,0.16)",
  },
  {
    title: "Arena",
    body: featureFlagDefaults.ARENA_ENABLED
      ? "Riftwilds Arena training is open — no wagering."
      : "Arena paused.",
    href: "/arena",
    thumb: sectionUiThumbPath("features", "arena"),
    glow: "rgba(255,184,77,0.16)",
  },
  {
    title: "Live World",
    body: featureFlagDefaults.PLAYABLE_LIVE_WORLD_ENABLED
      ? "Enter Riftwild Commons — playable browser world."
      : "Playable Live World paused by feature flag.",
    href: "/live-world",
    thumb: sectionUiThumbPath("features", "live-world"),
    glow: "rgba(61,231,255,0.2)",
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
  {
    title: "Ecosystem",
    body: featureFlagDefaults.ECOSYSTEM_DASHBOARD_ENABLED
      ? "Living world, civilization, story, and expansion packs."
      : "Ecosystem dashboard paused.",
    href: "/ecosystem",
    thumb: sectionUiThumbPath("features", "world"),
    glow: "rgba(61,231,255,0.14)",
  },
] as const;

export default function PlayDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Keeper Dashboard"
        titleSlug="play"
        title={`Welcome to ${projectConfig.UNIVERSE_NAME}`}
        description={
          <>
            Connect your wallet, verify {projectConfig.TOKEN_SYMBOL} holdings, claim a starter egg,
            and begin caring for your first {projectConfig.CREATURE_NAME}.
          </>
        }
        status="Ops live"
        statusTone="live"
        actions={
          <>
            {quickActions.map((action) => (
              <ImageButton
                key={action.href}
                href={action.href}
                variant={action.variant}
                className="gap-2.5 px-4 py-2.5 sm:gap-3 sm:px-5 sm:py-3.5"
              >
                <Image
                  src={dashboardActionIconPath(action.slug)}
                  alt=""
                  width={56}
                  height={56}
                  className="h-12 w-12 shrink-0 bg-transparent object-contain sm:h-14 sm:w-14"
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
          <Link
            key={card.title}
            href={card.href}
            className="panel panel-interactive group relative block overflow-hidden p-5 focus-ring"
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
          </Link>
        ))}
      </section>
    </div>
  );
}
