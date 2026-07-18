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
    <main className="relative min-h-[70vh]">
      <RiftBattleBoard
        encounterEnemyId={pick("encounter") ?? null}
        regionSlug={pick("region") ?? null}
        returnTo={pick("returnTo") ?? "/tcg/collection"}
      />
    </main>
  );
}
