/**
 * Public audio API — prefer these exports over deep imports.
 */

export {
  audioManager,
  unlockAudio,
} from "@/lib/audio/manager";
export {
  playSfx,
  playCareSfx,
  unlockSfx,
  sfx,
  SFX_EVENTS,
  type SfxEventId,
  type SfxPrefs,
} from "@/lib/audio/sfx";
export {
  playRiftlingCry,
  playCompanionCry,
  riftlingCryPath,
  hasRiftlingCry,
  allRiftlingCrySlugs,
  setCompanionSpeciesSlug,
  getCompanionSpeciesSlug,
  RIFTLING_CRY_CATALOG,
  type RiftlingCryMood,
  type RiftlingCryEntry,
} from "@/lib/audio/riftling-cries";
export {
  ambientEngine,
  startRegionAmbient,
  startMenuAmbient,
  stopAmbient,
} from "@/lib/audio/ambient";
export {
  musicEngine,
  playRegionMusic,
  playMenuMusic,
  crossfadeMusic,
  MUSIC_PLAYLIST,
} from "@/lib/audio/music";
export { playFootstep, resolveFootstepSurface } from "@/lib/audio/footsteps";
export { positionalAudio, distanceGain } from "@/lib/audio/positional";
export {
  applyDayNightAudio,
  applyWeatherAudio,
  syncWorldClockAudio,
} from "@/lib/audio/weather";
export {
  REGION_MUSIC,
  REGION_AMBIENT,
  REGION_FOOTSTEP_BIAS,
} from "@/lib/audio/catalog";
export {
  effectiveVolume,
  normalizePrefs,
  readAudioPrefs,
  clamp01,
  prefersReducedSound,
} from "@/lib/audio/prefs";
export {
  AUDIO_VOLUME_GROUPS,
  DEFAULT_AUDIO_PREFS,
  type AudioPrefs,
  type AudioVolumeGroup,
  type TerrainFootstep,
} from "@/lib/audio/types";
