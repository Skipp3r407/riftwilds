import type { CinematicPlayerState, CinematicScript } from "@/game/cinematics/types";

export function startCinematic(script: CinematicScript): CinematicPlayerState {
  return {
    scriptKey: script.key,
    beatIndex: 0,
    playing: true,
    skipped: false,
  };
}

export function advanceCinematic(
  script: CinematicScript,
  state: CinematicPlayerState,
): CinematicPlayerState {
  if (!state.playing || state.skipped) return state;
  const next = state.beatIndex + 1;
  if (next >= script.beats.length) {
    return { ...state, beatIndex: next - 1, playing: false };
  }
  return { ...state, beatIndex: next };
}

export function skipCinematic(
  script: CinematicScript,
  state: CinematicPlayerState,
): CinematicPlayerState {
  if (!script.skippable) return state;
  return { ...state, playing: false, skipped: true };
}
