/**
 * Daily Server Newspaper — aggregates living-world story feeds.
 * Soft lore / fame surface. Never invents fake player counts as news.
 */

import { resolveLivingWorldClock } from "@/game/living-world/clock";
import { resolveFestivalOccurrences } from "@/game/festivals/calendar";
import { trackAnalytics } from "@/lib/analytics/events";
import { listPlayerCities } from "@/lib/player-cities";
import { listActiveCommunityEvents } from "@/lib/social-presence/community-events";
import { getActiveWorldEventInstance } from "@/lib/world-events";

export type NewspaperArticle = {
  id: string;
  section: "front" | "events" | "cities" | "society" | "weather" | "classifieds";
  headline: string;
  body: string;
  regionSlug?: string;
};

export type DailyNewspaperIssue = {
  issueId: string;
  dayKey: string;
  publishedAt: string;
  masthead: string;
  articles: NewspaperArticle[];
  note: string;
};

function dayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function generateDailyNewspaper(now = Date.now()): DailyNewspaperIssue {
  const key = dayKey(now);
  const clock = resolveLivingWorldClock(now);
  const festivals = resolveFestivalOccurrences(clock).filter((f) => f.active);
  const worldEvent = getActiveWorldEventInstance();
  const community = listActiveCommunityEvents(now).slice(0, 3);
  const cities = listPlayerCities().slice(0, 3);

  const articles: NewspaperArticle[] = [
    {
      id: `${key}-weather`,
      section: "weather",
      headline: `${clock.season} skies over Aeryndra`,
      body: `World day ${clock.worldDay}. Keepers note the ${clock.season} turn — travel and festivals shift with the clock.`,
    },
  ];

  if (worldEvent) {
    articles.unshift({
      id: `${key}-front-event`,
      section: "front",
      headline: worldEvent.name,
      body: `${worldEvent.worldMessage} (${worldEvent.phase} · ${worldEvent.regionSlug})`,
      regionSlug: worldEvent.regionSlug,
    });
  } else {
    articles.unshift({
      id: `${key}-front-calm`,
      section: "front",
      headline: "Commons hush before the next story",
      body: "Town criers sharpen their bells. Something always stirs by dusk.",
      regionSlug: "riftwild-commons",
    });
  }

  for (const f of festivals.slice(0, 2)) {
    articles.push({
      id: `${key}-fest-${f.festival.key}`,
      section: "events",
      headline: f.festival.name,
      body: f.festival.description,
      regionSlug: f.festival.regionSlugs[0],
    });
  }

  for (const c of community) {
    if (c.kind === "world_event") continue;
    articles.push({
      id: `${key}-soc-${c.id}`,
      section: "society",
      headline: c.label,
      body: `Gathering near ${c.locationId.replace(/-/g, " ")}.`,
      regionSlug: c.regionSlug,
    });
  }

  for (const city of cities) {
    articles.push({
      id: `${key}-city-${city.id}`,
      section: "cities",
      headline: `${city.name} posts its charter`,
      body: city.charterBlurb,
      regionSlug: city.regionSlug,
    });
  }

  articles.push({
    id: `${key}-classifieds`,
    section: "classifieds",
    headline: "Wanted: lantern oil & honest escorts",
    body: "Caravans pay in Credits. Standing still on the road pays nothing.",
  });

  const issue: DailyNewspaperIssue = {
    issueId: `paper_${key}`,
    dayKey: key,
    publishedAt: new Date(now).toISOString(),
    masthead: "The Riftwild Herald",
    articles,
    note: "Server newspaper is story flavor + discovery. Never paywalls lore behind SOL.",
  };

  trackAnalytics("newspaper_issue", { dayKey: key, articles: articles.length });
  return issue;
}
