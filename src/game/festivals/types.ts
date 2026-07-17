export type FestivalRecurrence =
  | { kind: "seasonal"; season: string }
  | { kind: "interval_days"; everyWorldDays: number; offset: number }
  | { kind: "fixed_world_day"; worldDayModulo: number; day: number };

export type FestivalDef = {
  key: string;
  name: string;
  description: string;
  recurrence: FestivalRecurrence;
  regionSlugs: string[];
  durationWorldDays: number;
  activities: string[];
  storyArcKey?: string;
  rewardsHint: string;
  featureFlag?: string;
  /** Cinematic card background under `public/assets/festivals/`. */
  imageSrc: string;
};

export type FestivalOccurrence = {
  festival: FestivalDef;
  startsWorldDay: number;
  endsWorldDay: number;
  active: boolean;
  upcomingInDays: number | null;
};
