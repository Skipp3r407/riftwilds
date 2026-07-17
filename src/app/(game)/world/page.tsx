import Link from "next/link";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { RegionBanner } from "@/components/assets/region-banner";

export const metadata = { title: "World" };

const REGIONS = [
  ["Riftwild Commons", "Central social region — habitat, plaza, training yard", true, "riftwild-commons"],
  ["Ember Crater", "Volcanic caves, ember materials, lava bridges", true, "ember-crater"],
  ["Moonwater Coast", "Beaches, tide pools, fishing, underwater ruins", true, "moonwater-coast"],
  ["Elderwood Forest", "Farming, herb gathering, ancient tree dungeon", true, "elderwood-forest"],
  ["Stormspire Peaks", "Climbing, lightning crystals, wind trials", false, "stormspire-peaks"],
  ["Stoneheart Canyon", "Mining, ruins, fossil excavation", false, "stoneheart-canyon"],
  ["Frostveil Basin", "Snow, ice caves, winter events", false, "frostveil-basin"],
  ["Radiant Citadel", "Light temples, healing quests, celestial lore", false, "radiant-citadel"],
  ["Void Hollow", "Puzzle portals, void materials, high-level quests", false, "void-hollow"],
  ["Alloy Ruins", "Mechanical structures, crafting technology", false, "alloy-ruins"],
  ["Spirit Marsh", "Lanterns, spirit quests, memory shrines", false, "spirit-marsh"],
  ["Celestial Rift", "Endgame cosmic region — World Rifts", false, "celestial-rift"],
] as const;

export default function WorldPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Exploration map"
        titleSlug="world"
        title="The Riftwilds"
        description={
          <>
            Twelve Riftwilds regions with machine-readable map blueprints. Enter the Live World to
            walk Riftwild Commons and portal into starter hubs. Exploration flag:{" "}
            {featureFlagDefaults.EXPLORATION_ENABLED ? "online" : "hub preview + Live World"}.
            Playable maps require{" "}
            {featureFlagDefaults.PLAYABLE_LIVE_WORLD_ENABLED ? "PLAYABLE_LIVE_WORLD on" : "flag off"}.
          </>
        }
        status={featureFlagDefaults.EXPLORATION_ENABLED ? "Online" : "Preview"}
        statusTone={featureFlagDefaults.EXPLORATION_ENABLED ? "live" : "warn"}
        actions={
          <Link href="/live-world" className="btn-secondary focus-ring">
            ENTER THE LIVE WORLD
          </Link>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REGIONS.map(([name, blurb, open, slug]) => (
          <div key={name} className="panel overflow-hidden p-0">
            <div className="relative h-28 w-full">
              <RegionBanner slug={slug} alt={name} />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.85)] to-transparent" />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg text-white">{name}</h2>
                <StatusChip tone={open ? "live" : "warn"}>
                  {open ? "Hub" : "Locked"}
                </StatusChip>
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{blurb}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
