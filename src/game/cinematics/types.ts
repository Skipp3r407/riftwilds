export type CinematicBeat = {
  id: string;
  kind: "narration" | "camera" | "fade" | "dialogue" | "world_fx";
  durationMs: number;
  payload: Record<string, string | number | boolean>;
};

export type CinematicScript = {
  key: string;
  title: string;
  beats: CinematicBeat[];
  skippable: boolean;
  featureFlag?: string;
};

export type CinematicPlayerState = {
  scriptKey: string;
  beatIndex: number;
  playing: boolean;
  skipped: boolean;
};
