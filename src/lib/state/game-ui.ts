import { create } from "zustand";

type GameUiState = {
  skipAnimations: boolean;
  /** Mirrors SFX mute (`riftwilds-sfx-prefs`); music mute is separate. */
  soundMuted: boolean;
  setSkipAnimations: (value: boolean) => void;
  setSoundMuted: (value: boolean) => void;
};

export const useGameUiStore = create<GameUiState>((set) => ({
  skipAnimations: false,
  soundMuted: false,
  setSkipAnimations: (skipAnimations) => set({ skipAnimations }),
  setSoundMuted: (soundMuted) => set({ soundMuted }),
}));
