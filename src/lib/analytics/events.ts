/**
 * Analytics event catalog — privacy-conscious gameplay metrics (no wallet secrets).
 */

export type AnalyticsEventName =
  | "live_world_enter"
  | "expedition_generated"
  | "story_choice"
  | "civ_contribute"
  | "archivist_consult"
  | "festival_view"
  | "achievement_unlock"
  | "homestead_view"
  | "marketplace_pet_card_view";

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  at: string;
  props?: Record<string, string | number | boolean>;
};

const buffer: AnalyticsEvent[] = [];

export function trackAnalytics(
  name: AnalyticsEventName,
  props?: Record<string, string | number | boolean>,
): void {
  buffer.push({ name, at: new Date().toISOString(), props });
  if (buffer.length > 2000) buffer.splice(0, buffer.length - 2000);
}

export function listAnalyticsEvents(limit = 100): AnalyticsEvent[] {
  return buffer.slice(-limit).reverse();
}

export function aggregateAnalytics(): Record<AnalyticsEventName, number> {
  const counts = {} as Record<AnalyticsEventName, number>;
  for (const e of buffer) {
    counts[e.name] = (counts[e.name] ?? 0) + 1;
  }
  return counts;
}

export function resetAnalyticsForTests(): void {
  buffer.length = 0;
}
