/**
 * Social privacy defaults — helpers, Riftling social, home visits, group emotes.
 */

import type { PrivacySocialSettings } from "@/lib/social-presence/types";

export const DEFAULT_PRIVACY: PrivacySocialSettings = {
  allowHelperContact: true,
  allowRiftlingSocial: true,
  allowHomeVisits: true,
  showOnlineStatus: true,
  allowGroupEmotes: true,
  allowPerformanceInvites: true,
};

export function mergePrivacy(
  partial?: Partial<PrivacySocialSettings> | null,
): PrivacySocialSettings {
  return { ...DEFAULT_PRIVACY, ...partial };
}
