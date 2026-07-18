/**
 * Weather + day/night crossfade hooks for ambient/music buses.
 */

import { ambientEngine } from "@/lib/audio/ambient";
import { musicEngine } from "@/lib/audio/music";
import { audioManager } from "@/lib/audio/manager";
import { playSfx } from "@/lib/audio/sfx";
import type { DayPhase, WeatherKey } from "@/game/living-world/clock";

const PHASE_AMBIENT_MUL: Record<DayPhase, number> = {
  dawn: 0.85,
  day: 1,
  dusk: 0.9,
  night: 0.7,
};

const PHASE_MUSIC_MUL: Record<DayPhase, number> = {
  dawn: 0.9,
  day: 1,
  dusk: 0.95,
  night: 0.75,
};

const WEATHER_AMBIENT_MUL: Partial<Record<WeatherKey | string, number>> = {
  clear: 1,
  light_rain: 0.95,
  mist: 0.9,
  fireflies: 1.05,
  rift_aurora: 1.1,
  ash_storm: 0.85,
  heat_shimmer: 0.9,
  coastal_fog: 0.88,
  snow_drift: 0.85,
  blizzard: 0.8,
  storm_front: 0.82,
  sparks_rain: 0.9,
  void_haze: 0.75,
  void_distortion: 0.7,
  spirit_mist: 0.92,
  starfall: 1.08,
  aurora: 1.05,
};

let lastWeather: string | null = null;
let lastThunderAt = 0;

export function applyDayNightAudio(phase: DayPhase) {
  ambientEngine.setDayNightMultiplier(PHASE_AMBIENT_MUL[phase] ?? 1);
  musicEngine.setDayNightMultiplier(PHASE_MUSIC_MUL[phase] ?? 1);
}

export function applyWeatherAudio(weather: string) {
  const mul = WEATHER_AMBIENT_MUL[weather] ?? 1;
  ambientEngine.setWeatherMultiplier(mul);

  if (audioManager.prefersReduced()) {
    lastWeather = weather;
    return;
  }

  if (weather === lastWeather) return;
  lastWeather = weather;

  if (weather === "light_rain" || weather === "sparks_rain") {
    playSfx("weather.rain");
  } else if (
    weather === "storm_front" ||
    weather === "ash_storm" ||
    weather === "blizzard"
  ) {
    playSfx("weather.wind");
    const now = performance.now();
    if (now - lastThunderAt > 8000) {
      lastThunderAt = now;
      playSfx("weather.thunder");
    }
  } else if (weather === "coastal_fog" || weather === "mist") {
    playSfx("weather.wind");
  }
}

/** Combined hook for Live World clock ticks. */
export function syncWorldClockAudio(opts: {
  dayPhase: DayPhase;
  weather: string;
}) {
  applyDayNightAudio(opts.dayPhase);
  applyWeatherAudio(opts.weather);
}
