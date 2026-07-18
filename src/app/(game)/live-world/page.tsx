import Link from "next/link";
import { canEnterLiveWorld, isLiveWorldEntryOpen } from "@/lib/config/feature-flags";
import { projectConfig } from "@/lib/config/project";
import { PageHeader } from "@/components/shared/page-header";
import { LiveWorldShell } from "@/components/live-world/live-world-shell";

export const metadata = { title: "Live World" };

export default function LiveWorldPage() {
  const entryOpen = isLiveWorldEntryOpen();
  const playable = canEnterLiveWorld();

  if (!entryOpen) {
    return (
      <div className="space-y-6">
        <PageHeader
          kicker="Future release"
          titleSlug="live-world"
          title="Live World"
          description={
            <>
              The Living World — walk towns, meet Keepers, and raise{" "}
              {projectConfig.CREATURE_NAME}s in a shared habitat — is coming in a future update.
              Right now the main game is Rift Battles: build a deck, spend Rift Energy, and duel.
            </>
          }
          status="Coming Soon"
          statusTone="warn"
          actions={
            <>
              <Link href="/tcg/battle" className="btn-primary focus-ring">
                Play Rift Battle
              </Link>
              <Link href="/tcg/collection" className="btn-secondary focus-ring">
                Card Binder
              </Link>
              <Link href="/play" className="btn-secondary focus-ring">
                Play hub
              </Link>
            </>
          }
        />

        <section className="panel relative overflow-hidden p-8 md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[rgba(61,231,255,0.1)] blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-[rgba(255,184,77,0.08)] blur-3xl"
          />
          <div className="relative mx-auto max-w-xl text-center">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-[var(--amber)]">
              Coming in a future update
            </p>
            <h2 className="font-display mt-3 text-2xl text-white md:text-3xl">
              Living World arrives later
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)] md:text-base">
              Explore, housing, and social presence will open when the Living World release ships.
              Until then, build your deck, duel with Rift Energy, and care for your companions.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/tcg/battle" className="btn-primary focus-ring">
                Start a Rift Battle
              </Link>
              <Link href="/tcg/collection" className="btn-secondary focus-ring">
                Open Card Binder
              </Link>
              <Link href="/hatchery" className="btn-secondary focus-ring">
                Hatchery
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

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
            lands later — the habitat stays enterable while you build and test.
          </>
        }
        status={playable ? "Open" : "Disabled"}
        statusTone={playable ? "live" : "warn"}
        actions={
          <>
            <a href="#enter-live-world" className="btn-primary focus-ring">
              ENTER THE LIVE WORLD
            </a>
            <Link href="/tcg/battle" className="btn-secondary focus-ring">
              Rift Battle
            </Link>
            <Link href="/world" className="btn-secondary focus-ring">
              World map
            </Link>
          </>
        }
      />

      <div id="enter-live-world">
        <LiveWorldShell playable={playable} />
      </div>

      <section className="panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg text-white">Primary loop: Rift Battles</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Product focus stays the TCG board — Live World is the social habitat layer you can enter
            anytime while building.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/tcg/battle" className="btn-primary focus-ring text-sm">
            Rift Battle
          </Link>
          <Link href="/tcg/collection" className="btn-secondary focus-ring text-sm">
            Card Binder
          </Link>
        </div>
      </section>
    </div>
  );
}
