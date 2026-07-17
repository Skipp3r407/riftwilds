import Link from "next/link";
import {
  AMBIENT_NPCS,
  NAMED_NPCS,
  NPC_CATALOG,
  npcsForRegion,
} from "@/content/npcs";
import { REGION_IDENTITIES } from "@/game/world-maps/regions";
import { STARTER_QUEST_CHAIN } from "@/game/npcs/starter-quests";
import { NPC_SHOPS } from "@/game/npcs/shops";

export const metadata = { title: "Admin · NPCs" };

export default function AdminNpcsPage() {
  const byRegion = REGION_IDENTITIES.map((r) => ({
    region: r,
    npcs: npcsForRegion(r.id),
    named: npcsForRegion(r.id).filter((n) => n.kind === "named").length,
    ambient: npcsForRegion(r.id).filter((n) => n.kind !== "named").length,
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="panel mb-6 flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <p className="page-kicker">Ops</p>
          <h1 className="page-title mt-2">NPC Management</h1>
          <p className="page-lede">
            {NAMED_NPCS.length} named · {AMBIENT_NPCS.length} ambient ·{" "}
            {NPC_CATALOG.length} total · {Object.keys(NPC_SHOPS).length} shops ·{" "}
            {STARTER_QUEST_CHAIN.length} starter quests
          </p>
        </div>
        <Link href="/admin" className="btn-secondary focus-ring text-sm">
          Back
        </Link>
      </div>

      <section className="panel mb-6 overflow-x-auto p-5">
        <h2 className="font-display text-lg text-white">By region</h2>
        <table className="mt-3 w-full text-left text-xs">
          <thead className="text-[var(--text-muted)]">
            <tr>
              <th className="py-2 pr-3">Region</th>
              <th className="py-2 pr-3">Named</th>
              <th className="py-2 pr-3">Ambient+</th>
              <th className="py-2">Playability</th>
            </tr>
          </thead>
          <tbody>
            {byRegion.map(({ region, named, ambient }) => (
              <tr key={region.id} className="border-t border-[var(--stroke)]">
                <td className="py-2 pr-3 text-white">{region.name}</td>
                <td className="py-2 pr-3">{named}</td>
                <td className="py-2 pr-3">{ambient}</td>
                <td className="py-2 text-[var(--text-muted)]">{region.playability}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Named cast</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {NAMED_NPCS.map((n) => (
            <li
              key={n.id}
              className="rounded-md border border-[var(--stroke)] px-3 py-2 text-xs"
            >
              <p className="font-medium text-white">{n.displayName}</p>
              <p className="text-[var(--text-muted)]">
                {n.regionId} · {n.title}
              </p>
              <p className="mt-1 text-[var(--text-dim)]">
                Art: {n.artStatus} · Shop: {n.shopId ?? "—"} · Quests:{" "}
                {n.questIds.join(", ") || "—"}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
