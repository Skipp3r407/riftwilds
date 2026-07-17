/**
 * Living World clock — deterministic day/night, seasons, and weather seeds.
 * Pure functions so Live World HUD / APIs / sims share one source of truth.
 */

export type DayPhase = "dawn" | "day" | "dusk" | "night";

export type WorldSeason = "bloom" | "ember" | "harvest" | "frostveil";

export type WeatherKey =
  | "clear"
  | "light_rain"
  | "mist"
  | "fireflies"
  | "rift_aurora"
  | "ash_storm"
  | "heat_shimmer"
  | "coastal_fog"
  | "snow_drift"
  | "storm_front"
  | "void_haze";

export type LivingWorldClock = {
  /** Epoch ms used for the snapshot (injectable for tests). */
  at: number;
  /** In-game calendar day since epoch (accelerated). */
  worldDay: number;
  /** 0–1 progress through the current in-game day. */
  dayProgress: number;
  dayPhase: DayPhase;
  season: WorldSeason;
  seasonDay: number;
  seasonProgress: number;
  /** Global weather seed; region may filter against weatherKeys. */
  weatherSeed: number;
  weather: WeatherKey;
  /** Human labels for UI. */
  labels: {
    dayPhase: string;
    season: string;
    weather: string;
  };
};

/** Real ms per in-game day (4 real hours ≈ one world day). */
export const MS_PER_WORLD_DAY = 4 * 60 * 60 * 1000;

/** In-game days per season. */
export const DAYS_PER_SEASON = 28;

export const SEASON_ORDER: WorldSeason[] = ["bloom", "ember", "harvest", "frostveil"];

const SEASON_LABELS: Record<WorldSeason, string> = {
  bloom: "Bloomtide",
  ember: "Emberfall",
  harvest: "Harvest Veil",
  frostveil: "Frostveil",
};

const PHASE_LABELS: Record<DayPhase, string> = {
  dawn: "Dawn",
  day: "Day",
  dusk: "Dusk",
  night: "Night",
};

const WEATHER_LABELS: Record<WeatherKey, string> = {
  clear: "Clear skies",
  light_rain: "Light rain",
  mist: "Mist",
  fireflies: "Firefly haze",
  rift_aurora: "Rift aurora",
  ash_storm: "Ash storm",
  heat_shimmer: "Heat shimmer",
  coastal_fog: "Coastal fog",
  snow_drift: "Snow drift",
  storm_front: "Storm front",
  void_haze: "Void haze",
};

/** Season-weighted global weather tables. */
const SEASON_WEATHER: Record<WorldSeason, WeatherKey[]> = {
  bloom: ["clear", "light_rain", "mist", "fireflies", "rift_aurora"],
  ember: ["clear", "heat_shimmer", "ash_storm", "storm_front"],
  harvest: ["clear", "mist", "light_rain", "coastal_fog", "fireflies"],
  frostveil: ["clear", "snow_drift", "mist", "rift_aurora", "void_haze"],
};

export function dayPhaseFromProgress(dayProgress: number): DayPhase {
  if (dayProgress < 0.18) return "dawn";
  if (dayProgress < 0.55) return "day";
  if (dayProgress < 0.72) return "dusk";
  return "night";
}

export function seasonFromWorldDay(worldDay: number): {
  season: WorldSeason;
  seasonDay: number;
  seasonProgress: number;
} {
  const cycleDay = ((worldDay % (DAYS_PER_SEASON * SEASON_ORDER.length)) +
    DAYS_PER_SEASON * SEASON_ORDER.length) %
    (DAYS_PER_SEASON * SEASON_ORDER.length);
  const seasonIndex = Math.floor(cycleDay / DAYS_PER_SEASON);
  const seasonDay = (cycleDay % DAYS_PER_SEASON) + 1;
  return {
    season: SEASON_ORDER[seasonIndex]!,
    seasonDay,
    seasonProgress: (seasonDay - 1) / DAYS_PER_SEASON,
  };
}

function hashSeed(n: number): number {
  let x = (n ^ 0x9e3779b9) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return (x ^ (x >>> 16)) >>> 0;
}

export function pickWeather(
  season: WorldSeason,
  weatherSeed: number,
  allowed?: readonly string[],
): WeatherKey {
  const table = SEASON_WEATHER[season];
  const filtered = allowed?.length
    ? table.filter((w) => allowed.includes(w))
    : table;
  const pool = filtered.length > 0 ? filtered : table;
  return pool[weatherSeed % pool.length]!;
}

export function resolveLivingWorldClock(
  atMs: number = Date.now(),
  opts?: { regionWeatherKeys?: readonly string[] },
): LivingWorldClock {
  const worldDay = Math.floor(atMs / MS_PER_WORLD_DAY);
  const dayProgress = (atMs % MS_PER_WORLD_DAY) / MS_PER_WORLD_DAY;
  const dayPhase = dayPhaseFromProgress(dayProgress);
  const { season, seasonDay, seasonProgress } = seasonFromWorldDay(worldDay);
  const weatherSeed = hashSeed(worldDay * 31 + Math.floor(dayProgress * 8));
  const weather = pickWeather(season, weatherSeed, opts?.regionWeatherKeys);

  return {
    at: atMs,
    worldDay,
    dayProgress,
    dayPhase,
    season,
    seasonDay,
    seasonProgress,
    weatherSeed,
    weather,
    labels: {
      dayPhase: PHASE_LABELS[dayPhase],
      season: SEASON_LABELS[season],
      weather: WEATHER_LABELS[weather],
    },
  };
}

/** Region-aware snapshot for Live World HUD / world APIs. */
export function resolveRegionWorldState(
  regionSlug: string,
  regionWeatherKeys: readonly string[],
  atMs: number = Date.now(),
) {
  const clock = resolveLivingWorldClock(atMs, {
    regionWeatherKeys,
  });
  return {
    regionSlug,
    clock,
  };
}
