import type { TimelineEvent, TimelineScope } from "@/game/timeline/types";

const events: TimelineEvent[] = [
  {
    id: "tl_world_lanterns",
    scope: "civilization",
    at: new Date(Date.now() - 86400000 * 3).toISOString(),
    title: "Commons lanterns relit",
    detail: "Civilization milestone unlocked — night plaza restored.",
    tags: ["civilization", "commons"],
    refs: { milestone: "commons_lanterns" },
  },
  {
    id: "tl_player_hatch",
    scope: "player",
    at: new Date(Date.now() - 86400000).toISOString(),
    title: "First companion hatched",
    detail: "A starter Riftling entered your care.",
    tags: ["hatchery", "care"],
  },
  {
    id: "tl_pet_meal",
    scope: "pet",
    at: new Date(Date.now() - 3600000 * 5).toISOString(),
    title: "Shared a warm meal",
    detail: "Care memory logged for your active companion.",
    entityId: "demo-pet",
    tags: ["care", "memory"],
  },
];

export function listTimelineEvents(filter?: {
  scope?: TimelineScope;
  entityId?: string;
  limit?: number;
}): TimelineEvent[] {
  let list = [...events].sort((a, b) => (a.at < b.at ? 1 : -1));
  if (filter?.scope) list = list.filter((e) => e.scope === filter.scope);
  if (filter?.entityId) list = list.filter((e) => e.entityId === filter.entityId);
  return list.slice(0, filter?.limit ?? 50);
}

export function appendTimelineEvent(
  event: Omit<TimelineEvent, "id" | "at"> & { id?: string; at?: string },
): TimelineEvent {
  const next: TimelineEvent = {
    id: event.id ?? `tl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    at: event.at ?? new Date().toISOString(),
    scope: event.scope,
    title: event.title,
    detail: event.detail,
    entityId: event.entityId,
    tags: event.tags,
    refs: event.refs,
  };
  events.unshift(next);
  if (events.length > 500) events.length = 500;
  return next;
}

export function resetTimelineForTests(): void {
  events.length = 0;
}
