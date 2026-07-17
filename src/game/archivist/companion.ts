/**
 * AI Archivist companion — lore/hints grounded in existing species lore + world state.
 * Deterministic stub (no external LLM required). Swap provider later behind this interface.
 */

import { getSpeciesLore, listSpeciesLore } from "@/content/pets/lore";
import type { LivingWorldClock } from "@/game/living-world/clock";
import { onArchivistConsult } from "@/game/achievements/hooks";
import { appendTimelineEvent } from "@/game/timeline/store";

export type ArchivistHint = {
  id: string;
  kind: "lore" | "world" | "care" | "story" | "civilization" | "expedition";
  title: string;
  body: string;
  speciesSlug?: string;
  refs?: string[];
};

export type ArchivistReply = {
  greeting: string;
  hints: ArchivistHint[];
  disclaimer: string;
};

export interface ArchivistProvider {
  consult(input: {
    topic?: string;
    speciesSlug?: string;
    clock?: LivingWorldClock;
    regionSlug?: string;
  }): ArchivistReply;
}

function loreHint(slug: string): ArchivistHint | null {
  const lore = getSpeciesLore(slug);
  if (!lore) return null;
  const hook = lore.storyHooks[0] ?? lore.regionQuestHooks[0];
  return {
    id: `lore_${slug}`,
    kind: "lore",
    title: `${lore.name}: ${lore.title}`,
    body: hook
      ? `${lore.shortBio.slice(0, 180)}… Story thread: ${hook}`
      : lore.shortBio.slice(0, 220),
    speciesSlug: slug,
    refs: ["codex", `species:${slug}`],
  };
}

export const localArchivist: ArchivistProvider = {
  consult(input) {
    onArchivistConsult();
    const hints: ArchivistHint[] = [];

    if (input.speciesSlug) {
      const h = loreHint(input.speciesSlug);
      if (h) hints.push(h);
    } else if (input.topic) {
      const all = listSpeciesLore();
      const q = input.topic.toLowerCase();
      const match = all.find(
        (s) =>
          s.slug.includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.nativeRegion.toLowerCase().includes(q) ||
          s.affinity.toLowerCase().includes(q),
      );
      if (match) {
        const h = loreHint(match.slug);
        if (h) hints.push(h);
      }
    }

    if (hints.length === 0) {
      const all = listSpeciesLore();
      const pick = all[Math.floor(Date.now() / 86400000) % Math.max(1, all.length)];
      if (pick) {
        const h = loreHint(pick.slug);
        if (h) hints.push(h);
      }
    }

    if (input.clock) {
      hints.push({
        id: "world_clock",
        kind: "world",
        title: `${input.clock.labels.season} · ${input.clock.labels.dayPhase}`,
        body: `The wilds wear ${input.clock.labels.weather.toLowerCase()}. Expeditions and NPC schedules shift with this rhythm.`,
        refs: ["living-world-clock"],
      });
    }

    if (input.regionSlug) {
      hints.push({
        id: "region_tip",
        kind: "expedition",
        title: `Notes on ${input.regionSlug}`,
        body: "A procedural expedition can be spun from this region seed. Discoveries feed the living timeline and Codex.",
        refs: ["expeditions", input.regionSlug],
      });
    }

    hints.push({
      id: "civ_nudge",
      kind: "civilization",
      title: "Restoration whispers",
      body: "Collective milestones permanently reshape regions. Check the Ecosystem dashboard for era progress.",
      refs: ["civilization", "ecosystem"],
    });

    appendTimelineEvent({
      scope: "player",
      title: "Consulted Archivist Echo",
      detail: input.topic
        ? `Asked about “${input.topic}”.`
        : "Sought general guidance.",
      tags: ["archivist"],
    });

    return {
      greeting:
        "I am Echo — Archivist of the Riftwilds. I keep lore, seasons, and keeper footprints from unraveling.",
      hints: hints.slice(0, 5),
      disclaimer:
        "Archivist guidance is entertainment lore and gameplay hints — not financial advice.",
    };
  },
};

export function consultArchivist(
  input: Parameters<ArchivistProvider["consult"]>[0],
): ArchivistReply {
  return localArchivist.consult(input);
}
