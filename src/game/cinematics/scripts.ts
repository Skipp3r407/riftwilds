import type { CinematicScript } from "@/game/cinematics/types";

export const CINEMATIC_SCRIPTS: CinematicScript[] = [
  {
    key: "live_world_first_enter",
    title: "First Step Into the Commons",
    skippable: true,
    featureFlag: "CINEMATICS_ENABLED",
    beats: [
      {
        id: "fade_in",
        kind: "fade",
        durationMs: 800,
        payload: { direction: "in" },
      },
      {
        id: "camera_plaza",
        kind: "camera",
        durationMs: 1600,
        payload: { target: "plaza", zoom: 0.85 },
      },
      {
        id: "narration",
        kind: "narration",
        durationMs: 2400,
        payload: {
          text: "The Riftwilds remember every keeper who steps through the light.",
        },
      },
      {
        id: "dialogue_mira",
        kind: "dialogue",
        durationMs: 2000,
        payload: { speaker: "Keeper Mira", text: "Welcome home — tend well." },
      },
    ],
  },
  {
    key: "civ_milestone_unlock",
    title: "Civilization Milestone",
    skippable: true,
    featureFlag: "CINEMATICS_ENABLED",
    beats: [
      {
        id: "world_fx",
        kind: "world_fx",
        durationMs: 1200,
        payload: { fx: "lanterns_ignite" },
      },
      {
        id: "narration",
        kind: "narration",
        durationMs: 2200,
        payload: { text: "Together, the wilds are restored — permanently." },
      },
    ],
  },
];

export function getCinematicScript(key: string): CinematicScript | undefined {
  return CINEMATIC_SCRIPTS.find((s) => s.key === key);
}
