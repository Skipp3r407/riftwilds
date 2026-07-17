import Link from "next/link";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Live World Spectate" };

export default function LiveWorldSpectatePage() {
  const enabled = featureFlagDefaults.LIVE_WORLD_SPECTATOR_MODE_ENABLED;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Secondary mode"
        titleSlug="live-world"
        title="Spectator"
        description={
          <>
            Optional cinematic camera for embeds and streams. Playable entry is the default Live
            World experience — this route stays off until explicitly enabled.
          </>
        }
        status={enabled ? "Available" : "Disabled"}
        statusTone={enabled ? "live" : "warn"}
        actions={
          <Link href="/live-world" className="btn-primary focus-ring">
            ENTER THE LIVE WORLD
          </Link>
        }
      />

      <section className="panel flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
        {enabled ? (
          <>
            <p className="font-display text-xl text-white">Spectator canvas stub</p>
            <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
              Phase 5 optional spectator mode — OBS-friendly camera hooks will mount here.
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-xl text-white">Spectator mode is off</p>
            <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
              `LIVE_WORLD_SPECTATOR_MODE_ENABLED` defaults to false. Use Enter Live World to play.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
