import { Suspense } from "react";
import { RiftBattleBoard } from "@/components/tcg/rift-battle-board";
import { BattleHub } from "@/components/tcg/battle-hub";
import {
  parseBattleHubMode,
  shouldOpenPracticeBoard,
} from "@/lib/tcg/battle-hub";

export const metadata = { title: "Rift Battle" };

type Search = Promise<Record<string, string | string[] | undefined>>;

function pickParam(
  sp: Record<string, string | string[] | undefined>,
  k: string,
) {
  const v = sp[k];
  return Array.isArray(v) ? v[0] : v;
}

export default async function TcgBattlePage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams;
  const invite = pickParam(sp, "invite") ?? null;
  const encounter = pickParam(sp, "encounter") ?? null;
  const region = pickParam(sp, "region") ?? null;
  const returnTo = pickParam(sp, "returnTo") ?? "/arena";
  const board = pickParam(sp, "board") ?? null;
  const play = pickParam(sp, "play") ?? null;
  const modeRaw = pickParam(sp, "mode") ?? null;
  const panel = pickParam(sp, "panel") ?? null;

  const openBoard = shouldOpenPracticeBoard({
    invite,
    encounter,
    board,
    play,
  });

  if (openBoard) {
    return (
      <main className="rift-page rift-page--battle relative min-h-[70vh]">
        <div className="rift-page__atmosphere" aria-hidden>
          <div className="rift-page__wash" />
          <div className="rift-page__motes" />
          <div className="rift-page__vignette" />
        </div>
        <div className="relative z-[1]">
          <RiftBattleBoard
            encounterEnemyId={encounter}
            regionSlug={region}
            returnTo={returnTo}
            inviteCode={invite}
          />
        </div>
      </main>
    );
  }

  const initialMode = modeRaw ? parseBattleHubMode(modeRaw) : null;

  return (
    <main className="rift-page relative min-h-[70vh]">
      <div className="rift-page__atmosphere" aria-hidden>
        <div className="rift-page__wash" />
        <div className="rift-page__motes" />
        <div className="rift-page__vignette" />
      </div>
      <div className="relative z-[1] mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6">
        <Suspense
          fallback={
            <p className="text-sm text-[var(--text-muted)]">Loading Battle Hub…</p>
          }
        >
          <BattleHub initialMode={initialMode} initialPanel={panel} />
        </Suspense>
      </div>
    </main>
  );
}
