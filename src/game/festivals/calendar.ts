import type { LivingWorldClock, WorldSeason } from "@/game/living-world/clock";
import type { FestivalDef, FestivalOccurrence } from "@/game/festivals/types";
import { DAYS_PER_SEASON, SEASON_ORDER } from "@/game/living-world/clock";

export const FESTIVAL_CATALOG: FestivalDef[] = [
  {
    key: "bloomtide_festival",
    name: "Bloomtide Festival",
    description: "Grove shrines, herb contests, and community story beats.",
    recurrence: { kind: "seasonal", season: "bloom" },
    regionSlugs: ["elderwood-forest", "riftwild-commons"],
    durationWorldDays: 7,
    activities: ["herb_contest", "shrine_dance", "photo_contest"],
    storyArcKey: "bloomtide_gathering",
    rewardsHint: "Seasonal cosmetics and homestead decor previews — entertainment only.",
    featureFlag: "FESTIVALS_ENABLED",
    imageSrc: "/assets/festivals/bloomtide-festival.png",
  },
  {
    key: "emberfall_vigil",
    name: "Emberfall Vigil",
    description: "Night lanterns against ash storms; forge demonstrations.",
    recurrence: { kind: "seasonal", season: "ember" },
    regionSlugs: ["ember-crater", "alloy-ruins"],
    durationWorldDays: 5,
    activities: ["forge_demo", "ash_parade"],
    rewardsHint: "Ember furniture skins (preview).",
    featureFlag: "FESTIVALS_ENABLED",
    imageSrc: "/assets/festivals/emberfall-vigil.png",
  },
  {
    key: "harvest_veil_market",
    name: "Harvest Veil Market",
    description: "Traveling stalls and pet costume showcase.",
    recurrence: { kind: "seasonal", season: "harvest" },
    regionSlugs: ["riftwild-commons", "stoneheart-canyon"],
    durationWorldDays: 7,
    activities: ["costume_showcase", "trade_fair_stub"],
    rewardsHint: "Community gallery highlights.",
    featureFlag: "FESTIVALS_ENABLED",
    imageSrc: "/assets/festivals/harvest-veil-market.png",
  },
  {
    key: "frostveil_aurora",
    name: "Frostveil Aurora Night",
    description: "Observatory gatherings under rift aurora.",
    recurrence: { kind: "seasonal", season: "frostveil" },
    regionSlugs: ["frostveil-basin", "celestial-rift"],
    durationWorldDays: 5,
    activities: ["aurora_watch", "codex_reading"],
    rewardsHint: "Timeline commemorations.",
    featureFlag: "FESTIVALS_ENABLED",
    imageSrc: "/assets/festivals/frostveil-aurora.png",
  },
  {
    key: "commons_moon_market",
    name: "Commons Moon Market",
    description: "Recurring plaza night market every 14 world days.",
    recurrence: { kind: "interval_days", everyWorldDays: 14, offset: 3 },
    regionSlugs: ["riftwild-commons"],
    durationWorldDays: 2,
    activities: ["night_vendors", "emote_circle"],
    rewardsHint: "Social emote unlocks (stub).",
    featureFlag: "FESTIVALS_ENABLED",
    imageSrc: "/assets/festivals/commons-moon-market.png",
  },
];

function seasonStartWorldDay(clock: LivingWorldClock): number {
  const seasonIndex = SEASON_ORDER.indexOf(clock.season as WorldSeason);
  const cycleLength = DAYS_PER_SEASON * SEASON_ORDER.length;
  const cycleBase = Math.floor(clock.worldDay / cycleLength) * cycleLength;
  return cycleBase + seasonIndex * DAYS_PER_SEASON;
}

export function resolveFestivalOccurrences(
  clock: LivingWorldClock,
): FestivalOccurrence[] {
  return FESTIVAL_CATALOG.map((festival) => {
    let startsWorldDay = 0;
    if (festival.recurrence.kind === "seasonal") {
      if (clock.season !== festival.recurrence.season) {
        const targetIdx = SEASON_ORDER.indexOf(
          festival.recurrence.season as WorldSeason,
        );
        const cycleLength = DAYS_PER_SEASON * SEASON_ORDER.length;
        const cycleBase = Math.floor(clock.worldDay / cycleLength) * cycleLength;
        startsWorldDay = cycleBase + targetIdx * DAYS_PER_SEASON;
        if (startsWorldDay < clock.worldDay) startsWorldDay += cycleLength;
      } else {
        startsWorldDay = seasonStartWorldDay(clock);
      }
    } else if (festival.recurrence.kind === "interval_days") {
      const { everyWorldDays, offset } = festival.recurrence;
      const phase = (clock.worldDay - offset) % everyWorldDays;
      startsWorldDay =
        clock.worldDay - ((phase + everyWorldDays) % everyWorldDays);
    } else {
      const { worldDayModulo, day } = festival.recurrence;
      startsWorldDay =
        Math.floor(clock.worldDay / worldDayModulo) * worldDayModulo + day;
      if (startsWorldDay < clock.worldDay) startsWorldDay += worldDayModulo;
    }

    const endsWorldDay = startsWorldDay + festival.durationWorldDays - 1;
    const active =
      clock.worldDay >= startsWorldDay && clock.worldDay <= endsWorldDay;
    const upcomingInDays = active
      ? null
      : Math.max(0, startsWorldDay - clock.worldDay);

    return {
      festival,
      startsWorldDay,
      endsWorldDay,
      active,
      upcomingInDays,
    };
  }).sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    return (a.upcomingInDays ?? 0) - (b.upcomingInDays ?? 0);
  });
}
