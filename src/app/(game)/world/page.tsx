import Link from "next/link";
import {
  featureFlagDefaults,
  isLiveWorldEntryOpen,
  isLiveWorldPublicAccess,
  liveWorldAccessBadge,
} from "@/lib/config/feature-flags";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { RegionBanner } from "@/components/assets/region-banner";
import { MapDirectoryPanel } from "@/components/world-expansion/map-directory";

export const metadata = { title: "World" };

const REGIONS = [
  ["Riftwild Commons", "Central social region — habitat, plaza, training yard", "riftwild-commons"],
  ["Ember Crater", "Volcanic caves, ember materials, lava bridges", "ember-crater"],
  ["Moonwater Coast", "Beaches, tide pools, fishing, underwater ruins", "moonwater-coast"],
  ["Elderwood Forest", "Farming, herb gathering, ancient tree dungeon", "elderwood-forest"],
  ["Stormspire Peaks", "Climbing, lightning crystals, wind trials", "stormspire-peaks"],
  ["Stoneheart Canyon", "Mining, ruins, fossil excavation", "stoneheart-canyon"],
  ["Frostveil Basin", "Snow, ice caves, winter events", "frostveil-basin"],
  ["Radiant Citadel", "Light temples, healing quests, celestial lore", "radiant-citadel"],
  ["Void Hollow", "Puzzle portals, void materials, high-level quests", "void-hollow"],
  ["Alloy Ruins", "Mechanical structures, crafting technology", "alloy-ruins"],
  ["Spirit Marsh", "Lanterns, spirit quests, memory shrines", "spirit-marsh"],
  ["Celestial Rift", "Endgame cosmic region — World Rifts", "celestial-rift"],
] as const;

export default function WorldPage() {
  const liveWorldOpen = isLiveWorldEntryOpen();
  const liveWorldPublic = isLiveWorldPublicAccess();
  const accessBadge = liveWorldAccessBadge();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Exploration map"
        titleSlug="world"
        title="The Riftwilds"
        description={
          liveWorldPublic ? (
            <>
              Twelve Riftwilds regions with machine-readable map blueprints. Launch combat is Rift
              Battles. Exploration flag:{" "}
              {featureFlagDefaults.EXPLORATION_ENABLED ? "online" : "hub preview"}.
            </>
          ) : liveWorldOpen ? (
            <>
              Twelve Riftwilds regions — habitats, coasts, peaks, and more. Live World is Coming
              Soon for the public; local/dev access is open for testing. Launch combat is Rift
              Battles.
            </>
          ) : (
            <>
              Twelve Riftwilds regions — habitats, coasts, peaks, and more. Live World exploration
              is Coming Soon; launch combat is Rift Battles.
            </>
          )
        }
        status={
          liveWorldPublic
            ? featureFlagDefaults.EXPLORATION_ENABLED
              ? "Online"
              : "Preview"
            : (accessBadge ?? "Coming Soon")
        }
        statusTone={liveWorldPublic && featureFlagDefaults.EXPLORATION_ENABLED ? "live" : "warn"}
        actions={
          <>
            <Link href="/tcg/battle" className="btn-primary focus-ring">
              Rift Battle
            </Link>
            <Link href="/live-world" className="btn-secondary focus-ring">
              {liveWorldOpen ? "ENTER THE LIVE WORLD" : "Live World — Coming Soon"}
            </Link>
          </>
        }
      />
      {featureFlagDefaults.WORLD_EXPANSION_ENABLED ? (
        <section className="panel space-y-3 p-5">
          <div>
            <p className="page-kicker">Settlements</p>
            <h2 className="font-display text-lg text-white">Live map directory</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {liveWorldPublic
                ? "Quiet→Full crowd labels · friends · guild · events · housing. Temporary overflow maps never host permanent deeds."
                : liveWorldOpen
                  ? "COMING SOON · DEV ACCESS — settlement directory open for local testing."
                  : "Settlement directory art stays — Live World housing and crowd status are Coming Soon."}
            </p>
          </div>
          <MapDirectoryPanel comingSoon={!liveWorldPublic && !liveWorldOpen} />
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REGIONS.map(([name, blurb, slug]) => (
          <div key={name} className="panel overflow-hidden p-0">
            <div className="relative h-28 w-full">
              <RegionBanner slug={slug} alt={name} />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.85)] to-transparent" />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg text-white">{name}</h2>
                <StatusChip tone="warn">Coming Soon</StatusChip>
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{blurb}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
