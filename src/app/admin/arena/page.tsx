import Link from "next/link";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { REAL_VALUE_WAGERING_ENABLED, arenaConfig } from "@/lib/config/arena";
import { AdminRiftArenaControls } from "@/components/arena/admin-rift-arena-controls";

export const metadata = { title: "Admin · Arena" };

const metrics = [
  "Live battles",
  "Queue sizes",
  "Battle-server health",
  "Match duration",
  "Disconnect rate",
  "Suspicious matches",
  "Win-trading flags",
  "Tournament status",
  "Equipment usage",
  "Ability win rates",
  "Affinity win rates",
  "Species win rates",
  "Arena Point issuance",
  "Balance versions",
  "Reports",
];

const controls = [
  "Pause matchmaking",
  "Pause ranked mode",
  "End a broken match",
  "Cancel a tournament",
  "Disable an ability",
  "Disable an equipment item",
  "Publish a balance version",
  "Suspend an account from Arena",
  "Review anti-cheat flags",
];

export default function AdminArenaPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-white">Admin · Arena</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Monitoring shell for Riftwilds Arena. Mutations require role, reason, and audit log.
          </p>
        </div>
        <Link href="/admin" className="btn-secondary focus-ring text-sm">
          Admin home
        </Link>
      </div>

      <section className="panel p-5 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Flags</h2>
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          {(
            [
              "RIFT_ARENA_HUB_ENABLED",
              "RIFT_ARENA_FREE_MATCHMAKING_ENABLED",
              "RIFT_ARENA_RANKED_SCAFFOLD_ENABLED",
              "RIFT_ARENA_SOL_STAKES_ENABLED",
              "RIFT_ARENA_SOL_ESCROW_ENABLED",
              "ARENA_ENABLED",
              "CASUAL_DUELS_ENABLED",
              "RANKED_DUELS_ENABLED",
              "TOURNAMENTS_ENABLED",
              "WEAPONS_ENABLED",
              "ARENA_POINTS_ENABLED",
              "SPONSORED_PRIZES_ENABLED",
              "SOL_WALLET_ENABLED",
            ] as const
          ).map((k) => (
            <li key={k}>
              {k}: {String(featureFlagDefaults[k])}
            </li>
          ))}
          <li className="text-[var(--amber)]">
            REAL_VALUE_WAGERING_ENABLED: {String(REAL_VALUE_WAGERING_ENABLED)} (not toggleable here)
          </li>
        </ul>
        <p className="mt-4 text-xs">
          Balance v{arenaConfig.BALANCE_VERSION} · Affinity v{arenaConfig.AFFINITY_VERSION}.{" "}
          {arenaConfig.DISCLOSURES.noWagering}
        </p>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Rift Arena controls</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Pause matchmaking / soft entry caps. SOL stakes cannot go live without feature flags +
          compliance wagering gate.
        </p>
        <div className="mt-4">
          <AdminRiftArenaControls />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <h2 className="font-display text-lg text-white">Metrics (shell)</h2>
          <ul className="mt-3 space-y-1 text-sm text-[var(--text-muted)]">
            {metrics.map((m) => (
              <li key={m}>· {m}</li>
            ))}
          </ul>
        </div>
        <div className="panel p-5">
          <h2 className="font-display text-lg text-white">Controls (require audit)</h2>
          <ul className="mt-3 space-y-1 text-sm text-[var(--text-muted)]">
            {controls.map((c) => (
              <li key={c}>· {c}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[var(--amber)]">
            There is no dashboard control for REAL_VALUE_WAGERING_ENABLED.
          </p>
        </div>
      </section>
    </main>
  );
}
