import Image from "next/image";
import { SoundscapeMount } from "@/components/audio/soundscape-mount";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { sectionUiThumbPath } from "@/lib/assets/paths";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Guilds" };

const FEATURES = [
  { title: "Emblem & roles", slug: "emblem-roles" },
  { title: "Guild habitat", slug: "guild-habitat" },
  { title: "Shared crafting", slug: "shared-crafting" },
] as const;

export default function GuildsPage() {
  return (
    <div className="space-y-6">
      <SoundscapeMount mode="guild" fadeMs={850} />
      <PageHeader
        kicker="Social ops"
        titleSlug="guilds"
        title="Riftbound Guilds"
        description="Guild habitats, quests, treasuries, and tournaments. Creation fees use the project revenue split when enabled."
        status={featureFlagDefaults.GUILDS_ENABLED ? "Guilds open" : "Phase 6 shell"}
        statusTone={featureFlagDefaults.GUILDS_ENABLED ? "live" : "warn"}
      />
      <section className="grid gap-4 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.slug} className="panel group overflow-hidden">
            <div className="section-card-thumb border-b border-[rgba(61,231,255,0.12)]">
              <Image
                src={sectionUiThumbPath("guilds", feature.slug)}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="section-card-thumb__img"
                unoptimized
              />
            </div>
            <div className="p-5">
              <h2 className="font-display text-lg text-white">{feature.title}</h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Coming with guild schema, chat, and calendar systems.
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
