"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type BiographyPayload = {
  title: string;
  personalBio: string;
  originStory: string;
  firstMemory: string;
  temperamentSummary: string;
  favoriteFood: string;
  favoriteActivity: string;
  favoriteRegion: string;
  favoriteWeather: string;
  preferredSleepLocation: string;
  favoriteToy: string;
  greatestFear: string;
  strongestInstinct: string;
  socialStyle: string;
  bondStyle: string;
  uniqueHabit: string;
  hiddenTalent: string;
  personalDream: string;
  motto: string;
  signatureBehavior: string;
  mysteryClue: string;
  questHook: string;
  emotionalNeed: string;
  comfortAction: string;
  dislikedEnvironment: string;
  friendshipPreference: string;
  rivalryTendency: string;
  reactionToDanger: string;
  reactionToStrangers: string;
  reactionToOtherPets: string;
  reactionToOwner: string;
  reactionToVictory: string;
  reactionToDefeat: string;
  bondStage: string;
  familyHistory: string | null;
  personalQuestHooks: { id: string; title: string; summary: string; category: string }[];
  version: number;
  locked: boolean;
};

export type SpeciesLorePayload = {
  slug: string;
  name: string;
  title: string;
  pronunciation: string;
  shortBio: string;
  standardBio: string;
  fullLore: string;
  origin: string;
  nativeRegion: string;
  affinity: string;
  ancientLegend: string;
  hiddenTruth: string | null;
  hiddenTruthLocked: boolean;
  commonMisunderstanding: string;
  diet: string;
  favoriteFoods: string[];
  naturalBehavior: string;
  socialBehavior: string;
  eggAppearance: string;
  evolutionPhilosophy: string;
  marketplaceCollectorNote: string;
  storyHooks: string[];
  historicalTimeline: { era: string; event: string }[];
  myths: string[];
};

type Memory = { kind: string; label: string; at: string; narrative?: string };

type Props = {
  petName: string;
  speciesSlug: string;
  temperament: string;
  biography: BiographyPayload | null;
  speciesLore: SpeciesLorePayload | null;
  memories: Memory[];
};

const TABS = [
  "Overview",
  "Personal Story",
  "Species Lore",
  "Memories",
  "Family",
  "Evolution",
  "Relationships",
  "Achievements",
  "Mysteries",
] as const;

type Tab = (typeof TABS)[number];

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel-inset px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-sm text-white">{value}</p>
    </div>
  );
}

export function PetBiographyPanel({
  petName,
  speciesSlug,
  temperament,
  biography,
  speciesLore,
  memories,
}: Props) {
  const [tab, setTab] = useState<Tab>("Overview");

  if (!biography && !speciesLore) {
    return (
      <section className="panel p-6">
        <h2 className="font-display text-lg text-white">Biography</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Pet lore is disabled or not yet generated for this companion.
        </p>
      </section>
    );
  }

  return (
    <section className="panel p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-white">Biography</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {biography?.title ?? speciesLore?.title ?? petName}
            {biography ? ` · v${biography.version}` : null}
            {biography?.locked ? " · locked" : null}
          </p>
        </div>
        <Link
          href={`/codex/riftlings/${speciesSlug}`}
          className="btn-secondary focus-ring text-xs"
        >
          Open Codex
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-[11px] uppercase tracking-wider transition",
              tab === t
                ? "border-[var(--cyan)] bg-[rgba(56,189,248,0.12)] text-white"
                : "border-[var(--stroke)] text-[var(--text-muted)] hover:text-white",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4 text-sm text-[var(--text-muted)]">
        {tab === "Overview" && biography ? (
          <>
            <p className="text-white">{biography.temperamentSummary}</p>
            <p>{speciesLore?.shortBio}</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <Fact label="Temperament" value={temperament} />
              <Fact label="Favorite food" value={biography.favoriteFood} />
              <Fact label="Favorite activity" value={biography.favoriteActivity} />
              <Fact label="Favorite region" value={biography.favoriteRegion} />
              <Fact label="Owner bond" value={biography.bondStage.replaceAll("_", " ")} />
              <Fact label="Personal dream" value={biography.personalDream} />
            </div>
            <p className="italic text-white">“{biography.motto}”</p>
          </>
        ) : null}

        {tab === "Personal Story" && biography ? (
          <>
            <p className="whitespace-pre-wrap leading-relaxed text-white/90">
              {biography.personalBio}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Fact label="Origin" value={biography.originStory} />
              <Fact label="First memory" value={biography.firstMemory} />
              <Fact label="Unique habit" value={biography.uniqueHabit} />
              <Fact label="Hidden talent" value={biography.hiddenTalent} />
              <Fact label="Greatest fear" value={biography.greatestFear} />
              <Fact label="Comfort action" value={biography.comfortAction} />
            </div>
          </>
        ) : null}

        {tab === "Species Lore" && speciesLore ? (
          <>
            <p className="text-xs uppercase tracking-wider text-[var(--mint)]">
              {speciesLore.name} · {speciesLore.pronunciation} · {speciesLore.affinity}
            </p>
            <p className="leading-relaxed text-white/90">{speciesLore.standardBio}</p>
            <details className="panel-inset p-3">
              <summary className="cursor-pointer text-white">Full lore entry</summary>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed">{speciesLore.fullLore}</p>
            </details>
            <Fact label="Ancient legend" value={speciesLore.ancientLegend} />
            <Fact label="Common misunderstanding" value={speciesLore.commonMisunderstanding} />
            {speciesLore.hiddenTruthLocked ? (
              <p className="rounded-md border border-dashed border-[var(--stroke)] px-3 py-2 text-xs">
                Hidden truth locked — discover through play (spoiler protection).
              </p>
            ) : (
              <Fact label="Hidden truth" value={speciesLore.hiddenTruth ?? ""} />
            )}
          </>
        ) : null}

        {tab === "Memories" ? (
          <ul className="space-y-2">
            {memories.map((m) => (
              <li key={`${m.kind}-${m.at}`} className="panel-inset px-3 py-2">
                <span className="text-white">{m.label}</span>
                <span className="ml-2 text-xs">{new Date(m.at).toLocaleString()}</span>
                {m.narrative ? (
                  <p className="mt-1 text-xs leading-relaxed">{m.narrative}</p>
                ) : null}
              </li>
            ))}
            {!memories.length ? <li>No verified memories yet.</li> : null}
          </ul>
        ) : null}

        {tab === "Family" ? (
          biography?.familyHistory ? (
            <p className="text-white/90">{biography.familyHistory}</p>
          ) : (
            <p>
              No breeding family history on record. Wild, starter, shop, and event origins do not
              invent parents.
            </p>
          )
        ) : null}

        {tab === "Evolution" ? (
          <p>
            {speciesLore?.evolutionPhilosophy ??
              "Evolution chapters append when the pet evolves — prior biography is never erased."}
          </p>
        ) : null}

        {tab === "Relationships" && biography ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Fact label="Bond style" value={biography.bondStyle} />
            <Fact label="Social style" value={biography.socialStyle} />
            <Fact label="Reaction to owner" value={biography.reactionToOwner} />
            <Fact label="Reaction to strangers" value={biography.reactionToStrangers} />
            <Fact label="Other pets" value={biography.reactionToOtherPets} />
            <Fact label="Friendship preference" value={biography.friendshipPreference} />
          </div>
        ) : null}

        {tab === "Achievements" ? (
          <p>
            Story achievements unlock from verified gameplay (battles, care milestones, region
            visits). None attached yet beyond hatch memories.
          </p>
        ) : null}

        {tab === "Mysteries" && biography ? (
          <>
            <Fact label="Mystery clue" value={biography.mysteryClue} />
            <Fact label="Quest hook" value={biography.questHook} />
            <ul className="mt-2 space-y-2">
              {biography.personalQuestHooks.map((q) => (
                <li key={q.id} className="panel-inset px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--amber)]">
                    {q.category}
                  </p>
                  <p className="mt-1 text-white">{q.title}</p>
                  <p className="mt-1 text-xs">{q.summary}</p>
                  <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                    Quest board integration stub — data ready for future wiring.
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </section>
  );
}
