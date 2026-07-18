import { ACADEMY_FAQ } from "@/game/academy/faq";
import { ALL_LESSONS, academyHref } from "@/game/academy/catalog";
import type { AcademySearchHit } from "@/game/academy/types";

function scoreText(query: string, parts: string[]): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const tokens = q.split(/\s+/).filter(Boolean);
  let score = 0;
  const hay = parts.join(" ").toLowerCase();
  for (const t of tokens) {
    if (hay.includes(t)) score += 2;
    if (parts.some((p) => p.toLowerCase() === t)) score += 3;
    if (parts.some((p) => p.toLowerCase().startsWith(t))) score += 1;
  }
  if (hay.includes(q)) score += 4;
  return score;
}

/** Search lessons, FAQ, and tagged NPCs / regions / items / abilities / controls. */
export function searchAcademy(query: string, limit = 24): AcademySearchHit[] {
  const q = query.trim();
  if (!q) return [];

  const hits: AcademySearchHit[] = [];

  for (const lesson of ALL_LESSONS) {
    const score = scoreText(q, [
      lesson.title,
      lesson.summary,
      ...lesson.keywords,
      ...lesson.body,
      ...(lesson.npcMentions ?? []),
      ...(lesson.regionMentions ?? []),
      ...(lesson.itemMentions ?? []),
      ...(lesson.abilityMentions ?? []),
      ...(lesson.controlMentions ?? []),
      lesson.category,
    ]);
    if (score > 0) {
      hits.push({
        kind: "lesson",
        id: lesson.id,
        title: lesson.title,
        snippet: lesson.summary,
        href: academyHref(lesson.id),
        score,
      });
    }

    for (const npc of lesson.npcMentions ?? []) {
      const s = scoreText(q, [npc, "npc"]);
      if (s > 0) {
        hits.push({
          kind: "npc",
          id: `${lesson.id}:${npc}`,
          title: npc,
          snippet: `Mentioned in ${lesson.title}`,
          href: academyHref(lesson.id),
          score: s + 1,
        });
      }
    }
    for (const region of lesson.regionMentions ?? []) {
      const s = scoreText(q, [region, "region"]);
      if (s > 0) {
        hits.push({
          kind: "region",
          id: `${lesson.id}:${region}`,
          title: region,
          snippet: `Region in ${lesson.title}`,
          href: academyHref(lesson.id),
          score: s + 1,
        });
      }
    }
    for (const item of lesson.itemMentions ?? []) {
      const s = scoreText(q, [item, "item"]);
      if (s > 0) {
        hits.push({
          kind: "item",
          id: `${lesson.id}:${item}`,
          title: item,
          snippet: `Item in ${lesson.title}`,
          href: academyHref(lesson.id),
          score: s + 1,
        });
      }
    }
    for (const ability of lesson.abilityMentions ?? []) {
      const s = scoreText(q, [ability, "ability"]);
      if (s > 0) {
        hits.push({
          kind: "ability",
          id: `${lesson.id}:${ability}`,
          title: ability,
          snippet: `Ability in ${lesson.title}`,
          href: academyHref(lesson.id),
          score: s + 1,
        });
      }
    }
    for (const control of lesson.controlMentions ?? []) {
      const s = scoreText(q, [control, "control", "key"]);
      if (s > 0) {
        hits.push({
          kind: "control",
          id: `${lesson.id}:${control}`,
          title: `Key: ${control}`,
          snippet: `Control in ${lesson.title}`,
          href: academyHref(lesson.id),
          score: s + 2,
        });
      }
    }
  }

  for (const faq of ACADEMY_FAQ) {
    const score = scoreText(q, [faq.question, faq.answer, ...faq.keywords]);
    if (score > 0) {
      hits.push({
        kind: "faq",
        id: faq.id,
        title: faq.question,
        snippet: faq.answer.slice(0, 140) + (faq.answer.length > 140 ? "…" : ""),
        href: `/academy?tab=faq&faq=${faq.id}`,
        score: score + 1,
      });
    }
  }

  hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  // Dedupe by kind+title keeping highest score
  const seen = new Set<string>();
  const unique: AcademySearchHit[] = [];
  for (const h of hits) {
    const key = `${h.kind}:${h.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(h);
    if (unique.length >= limit) break;
  }
  return unique;
}
