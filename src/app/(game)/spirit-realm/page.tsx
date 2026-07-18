import Link from "next/link";
import {
  QUEST_INSET,
  QUEST_PANEL,
} from "@/components/quests/quest-surface";
import { PageHeader } from "@/components/shared/page-header";
import { SPIRIT_REALM_CONTENT_PACK } from "@/content/regions/packs/spirit-realm";
import { SPIRIT_QUEST_CATALOG, SPIRIT_REALM_NPCS } from "@/game/spirit";
import { cn } from "@/lib/utils/cn";

export const metadata = { title: "Spirit Realm" };

export default function SpiritRealmPage() {
  const pack = SPIRIT_REALM_CONTENT_PACK;
  const rescueQuest = SPIRIT_QUEST_CATALOG[0];

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Rescue instance"
        titleSlug="spirit-realm"
        title="Spirit Realm"
        description={
          <>
            {pack.blurb} SOL is never required — Credits, items, loyalty, guild, friends, and
            rescue quests bring companions home.
          </>
        }
        status="Playable stub"
        statusTone="info"
      />

      <section className={cn(QUEST_PANEL, "relative overflow-hidden")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/spirit/spirit-realm-isles.svg"
          alt="Floating lantern islands of the Spirit Realm"
          width={1400}
          height={560}
          className="relative z-[1] h-auto w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-[rgba(8,8,16,0.92)] to-transparent p-6">
          <p className="max-w-xl text-sm text-[var(--text)]">{pack.portal.arrivalNote}</p>
          <Link
            href="/memorials"
            className="mt-2 inline-block text-sm text-[var(--cyan)] underline-offset-2 hover:underline"
          >
            Memorial Overlook → Garden
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className={cn(QUEST_PANEL, "relative space-y-3 p-5")}>
          <div className="relative z-[1] space-y-3">
            <h2 className="font-display text-xl text-white">Featured rescue quest</h2>
            <p className="text-sm text-[var(--text-muted)]">{rescueQuest.blurb}</p>
            <ul className="space-y-1.5">
              {rescueQuest.steps.map((s, i) => (
                <li
                  key={s.id}
                  className={cn(QUEST_INSET, "flex gap-2 px-2.5 py-2 text-sm text-[var(--text)]")}
                >
                  <span className="tabular-nums text-[var(--text-dim)]">{i + 1}.</span>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-[var(--text-dim)]">
              Start from a Downed Riftling&apos;s Spirit & Recovery panel → Spirit Realm Rescue Quest.
            </p>
          </div>
        </div>
        <div className={cn(QUEST_PANEL, "relative space-y-3 p-5")}>
          <div className="relative z-[1] space-y-3">
            <h2 className="font-display text-xl text-white">Spirit NPCs</h2>
            <ul className="space-y-2">
              {SPIRIT_REALM_NPCS.map((npc) => (
                <li
                  key={npc.id}
                  className="border-b border-[var(--stroke)] pb-2 text-sm last:border-b-0 last:pb-0"
                >
                  <span className="text-[var(--text)]">{npc.name}</span>
                  <span className="text-[var(--text-muted)]"> — {npc.role}</span>
                  <p className="text-xs text-[var(--text-dim)]">{npc.dialogueIdle[0]}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl text-white">Points of interest</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pack.pois.map((poi) => (
            <article key={poi.id} className={cn(QUEST_PANEL, "relative p-4")}>
              <div className="relative z-[1]">
                <h3 className="text-sm font-medium text-white">{poi.name}</h3>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{poi.blurb}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--text-dim)]">{pack.densityNote}</p>
      </section>
    </div>
  );
}
