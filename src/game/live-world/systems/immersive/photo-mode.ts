/**
 * Photo mode — client presentation stub.
 * Hides HUD, freezes optional camera follow (via bridge), no network side effects.
 */

export type PhotoModeState = {
  active: boolean;
  /** Hide all chrome including exit hint after a short delay */
  hideChrome: boolean;
  enteredAt: number | null;
};

export function createPhotoModeState(): PhotoModeState {
  return { active: false, hideChrome: false, enteredAt: null };
}

export function enterPhotoMode(now = Date.now()): PhotoModeState {
  return { active: true, hideChrome: false, enteredAt: now };
}

export function exitPhotoMode(): PhotoModeState {
  return createPhotoModeState();
}

export function togglePhotoMode(state: PhotoModeState, now = Date.now()): PhotoModeState {
  return state.active ? exitPhotoMode() : enterPhotoMode(now);
}

/** Capture stub — returns a logical shot id for achievements / future canvas export. */
export function capturePhotoStub(regionSlug: string, now = Date.now()): {
  ok: true;
  shotId: string;
  note: string;
} {
  return {
    ok: true,
    shotId: `photo-${regionSlug}-${now}`,
    note: "Photo mode capture stub — canvas export lands in a later pass",
  };
}
