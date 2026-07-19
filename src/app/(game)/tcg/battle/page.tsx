import { RiftBattleBoard } from "@/components/tcg/rift-battle-board";

export const metadata = { title: "Rift Battle" };

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function TcgBattlePage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams;
  const pick = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  return (
    <main className="rift-page rift-page--battle relative min-h-[70vh]">
      <div className="rift-page__atmosphere" aria-hidden>
        <div className="rift-page__wash" />
        <div className="rift-page__motes" />
        <div className="rift-page__vignette" />
      </div>
      <div className="relative z-[1]">
        <RiftBattleBoard
          encounterEnemyId={pick("encounter") ?? null}
          regionSlug={pick("region") ?? null}
          returnTo={pick("returnTo") ?? "/arena"}
          inviteCode={pick("invite") ?? null}
        />
      </div>
    </main>
  );
}
