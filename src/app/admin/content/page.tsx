import Link from "next/link";
import { REGION_CONTENT_PACKS } from "@/content/regions";
import { ALL_MAP_GOALS, starterMapGoalRecommendations } from "@/content/map-goals";
import { JOB_BOARD } from "@/content/jobs/board";
import { PUBLIC_EVENTS } from "@/content/events/public-events";
import { PROFESSION_CATALOG } from "@/content/professions/catalog";
import { DAILY_GOALS, WEEKLY_GOALS } from "@/content/goals/daily-weekly";
import { FAUCET_RULES, SINK_RULES } from "@/lib/credits/config";

export const metadata = { title: "Admin · Content Studio" };

export default function AdminContentStudioPage() {
  const full = REGION_CONTENT_PACKS.filter((p) => p.completeness === "full").length;
  const scaffold = REGION_CONTENT_PACKS.filter((p) => p.completeness === "scaffold").length;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 md:px-6">
      <div>
        <p className="page-kicker">Ops · Content</p>
        <h1 className="page-title mt-2">Content Studio</h1>
        <p className="page-lede">
          Read-only shell over structured content packs, map goals, jobs, events, and Credits rules.
          Mutations require future admin auth — no silent ledger edits.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Region packs" value={`${full} full / ${scaffold} scaffold`} />
        <Stat label="Map goals" value={String(ALL_MAP_GOALS.length)} />
        <Stat label="Jobs" value={String(JOB_BOARD.length)} />
        <Stat label="Public events" value={String(PUBLIC_EVENTS.length)} />
        <Stat label="Professions" value={String(PROFESSION_CATALOG.length)} />
        <Stat label="Daily goals" value={String(DAILY_GOALS.length)} />
        <Stat label="Weekly goals" value={String(WEEKLY_GOALS.length)} />
        <Stat
          label="Starter map goals"
          value={String(starterMapGoalRecommendations().length)}
        />
      </div>

      <section className="panel space-y-3 p-4">
        <h2 className="font-display text-lg text-white">Region packs</h2>
        <ul className="divide-y divide-[var(--stroke)] text-sm">
          {REGION_CONTENT_PACKS.map((p) => (
            <li key={p.regionId} className="flex flex-wrap justify-between gap-2 py-2">
              <span className="text-white">{p.regionName}</span>
              <span className="text-[var(--text-muted)]">
                {p.completeness} · {p.quests.length} quests · {p.activities.length} activities ·{" "}
                {p.sinks.length} sinks
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel p-4">
          <h2 className="font-display text-lg text-white">Faucet rules</h2>
          <ul className="mt-2 space-y-1 text-xs text-[var(--text-muted)]">
            {Object.values(FAUCET_RULES).map((f) => (
              <li key={f.reason}>
                {f.reason}: max {f.maxPerGrant}/grant · day {f.dailyCap}
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-4">
          <h2 className="font-display text-lg text-white">Sink rules</h2>
          <ul className="mt-2 space-y-1 text-xs text-[var(--text-muted)]">
            {Object.values(SINK_RULES).map((s) => (
              <li key={s.reason}>
                {s.reason}: {s.minAmount}–{s.maxPerAction}
                {s.leavesCirculation ? " · burns" : ""}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/economy/credits" className="btn-primary focus-ring text-sm">
          Credits health
        </Link>
        <Link href="/economy/credits" className="btn-secondary focus-ring text-sm">
          Player Credits guide
        </Link>
        <Link href="/admin/npcs" className="btn-secondary focus-ring text-sm">
          NPC management
        </Link>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <p className="text-xs uppercase text-[var(--text-dim)]">{label}</p>
      <p className="mt-1 font-display text-xl text-white">{value}</p>
    </div>
  );
}
