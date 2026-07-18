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
  | "marketplace_pet_card_view"
  | "loyalty_check_in"
  | "loyalty_activity"
  | "loyalty_airdrop_claim"
  | "loyalty_milestone_claim"
  | "loyalty_shop_purchase"
  | "rift_storm_start"
  | "rift_storm_end"
  | "rift_storm_roll"
  | "rift_storm_participate"
  | "presence_xp_award"
  | "presence_afk_block"
  | "presence_idle_claim"
  | "presence_rest_enter"
  | "presence_home_like"
  | "presence_featured_award"
  | "presence_community_event"
  | "presence_status_set"
  | "presence_scripted_block"
  | "presence_daily_task_claim"
  | "presence_helper_assist"
  | "presence_performance_start"
  | "presence_community_token"
  | "presence_tier_change"
  | "world_event_start"
  | "world_event_end"
  | "world_event_participate"
  | "world_boss_engage"
  | "player_city_claim"
  | "housing_competition_enter"
  | "newspaper_issue"
  | "life_skill_xp"
  | "secret_discovery"
  | "festival_join";

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
