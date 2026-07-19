import Link from "next/link";
import { SoundscapeMount } from "@/components/audio/soundscape-mount";
import { ArenaNoWageringBanner } from "@/components/arena/disclosures";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  EXAMPLE_SOL_TOURNAMENT_CONFIG,
  FREE_TOURNAMENT_CONFIG,
  listPlayableTournaments,
} from "@/lib/economy/sol/tournament-sol";

export const metadata = { title: "Arena · Tournaments" };

export default function ArenaTournamentsPage() {
  const playable = listPlayableTournaments();
  const free = playable.free;
  const sol = EXAMPLE_SOL_TOURNAMENT_CONFIG;

  return (
    <div className="space-y-4">
      <SoundscapeMount mode="tournament" fadeMs={1000} />
      <h1 className="font-display text-3xl text-white">Tournaments</h1>
      <ArenaNoWageringBanner />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel space-y-3 border-[var(--emerald)]/40 p-6">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--emerald)]">
            Free entry · available architecture
          </p>
          <h2 className="font-display text-xl text-white">{free.name}</h2>
          <ul className="space-y-1 text-sm text-[var(--text-muted)]">
            <li>Entry: {free.entryCurrency} ({free.entryAmount})</li>
            <li>Cap: {free.playerCap} players</li>
            <li>Spectator betting: forbidden</li>
            <li>SOL entry: off</li>
          </ul>
          <p className="text-xs text-[var(--text-dim)]">
            Free and Gold/Credits cups remain the play path. Register via tournament economy when
            TOURNAMENT_ECONOMY_ENABLED is on.
          </p>
        </section>

        <section className="panel space-y-3 p-6 opacity-80">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--amber)]">
            SOL entry · disabled
          </p>
          <h2 className="font-display text-xl text-white">{sol.name}</h2>
          <ul className="space-y-1 text-sm text-[var(--text-muted)]">
            <li>Entry: {sol.entryAmount} SOL (architecture only)</li>
            <li>Prize split preview: {sol.prizePlayerBps / 100}% players</li>
            <li>
              Flags: SOL_TOURNAMENTS={String(featureFlagDefaults.SOL_TOURNAMENTS_ENABLED)} ·
              SOL_PURCHASES={String(featureFlagDefaults.SOL_PURCHASES_ENABLED)}
            </li>
            <li>Live SOL entry: {String(playable.solEntryLive)}</li>
          </ul>
          <p className="text-xs text-[var(--amber)]">
            SOL tournament entry stays feature-flagged off. No spectator betting. No real-value
            wagering.
          </p>
        </section>
      </div>

      <div className="panel p-6 text-sm text-[var(--text-muted)]">
        Legacy arena flags: TOURNAMENTS_ENABLED={String(featureFlagDefaults.TOURNAMENTS_ENABLED)} ·
        SPONSORED_PRIZES_ENABLED={String(featureFlagDefaults.SPONSORED_PRIZES_ENABLED)}. Free cup
        id: {FREE_TOURNAMENT_CONFIG.tournamentId}.
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/wallet" className="btn-secondary focus-ring text-sm">
            Wallet Center
          </Link>
          <Link href="/arena" className="btn-secondary focus-ring text-sm">
            Arena hub
          </Link>
        </div>
      </div>
    </div>
  );
}
