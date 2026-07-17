import Image from "next/image";
import Link from "next/link";
import { projectConfig } from "@/lib/config/project";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { sectionUiThumbPath } from "@/lib/assets/paths";
import { DashboardEconomyWidget } from "@/components/economy";
import { EconomySummary } from "@/components/economy";
import { PageHeader } from "@/components/shared/page-header";
import { ImageButton } from "@/components/ui/image-button";

export const metadata = { title: "Play" };

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
            <ImageButton href="/hatchery" variant="primary">
              Open Hatchery
            </ImageButton>
            <ImageButton href="/profile" variant="secondary">
              Profile
            </ImageButton>
            <ImageButton href="/inventory" variant="secondary">
              Inventory
            </ImageButton>
            <ImageButton href="/homestead" variant="secondary">
              Homestead
            </ImageButton>
            <ImageButton href="/guilds" variant="secondary">
              Guilds
            </ImageButton>
            <ImageButton href="/economy" variant="secondary">
              Economy
            </ImageButton>
          </>
        }
      />

      <DashboardEconomyWidget />

      <EconomySummary variant="compact" />

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="panel group relative block overflow-hidden p-5 transition hover:border-[rgba(61,231,255,0.35)] hover:shadow-[0_0_24px_rgba(61,231,255,0.1)]"
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
