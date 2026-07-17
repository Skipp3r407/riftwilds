import Link from "next/link";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { projectConfig } from "@/lib/config/project";
import { PageHeader } from "@/components/shared/page-header";
import { LiveWorldShell } from "@/components/live-world/live-world-shell";

export const metadata = { title: "Live World" };

export default function LiveWorldPage() {
  const playable = featureFlagDefaults.PLAYABLE_LIVE_WORLD_ENABLED;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Browser multiplayer world"
        titleSlug="live-world"
        title="Live World"
        description={
          <>
            Enter Riftwild Commons and control your Keeper directly. Walk the plaza, keep your{" "}
            {projectConfig.CREATURE_NAME} companion close, and talk to NPCs. Multiplayer authority
            lands in Phase 2 — Phase 1 is a playable local demo.
          </>
        }
        status={playable ? "Playable demo" : "Disabled"}
        statusTone={playable ? "live" : "warn"}
        actions={
          <>
            <a href="#enter-live-world" className="btn-primary focus-ring">
              ENTER THE LIVE WORLD
            </a>
            <Link href="/world" className="btn-secondary focus-ring">
              World map
            </Link>
          </>
        }
      />

      <div id="enter-live-world">
        <LiveWorldShell playable={playable} />
      </div>
    </div>
  );
}
