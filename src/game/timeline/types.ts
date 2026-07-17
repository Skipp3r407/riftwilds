export type TimelineScope = "player" | "pet" | "world" | "civilization" | "festival";

export type TimelineEvent = {
  id: string;
  scope: TimelineScope;
  at: string;
  title: string;
  detail: string;
  entityId?: string;
  tags: string[];
  /** Links into story / civ / achievement keys when relevant. */
  refs?: Record<string, string>;
};
