/**
 * Emote privacy — mute / block / social request prefs (local stub + clear sync shape).
 */

import type { PrivacySettings } from "@/game/live-world/systems/emotes/types";

export const PRIVACY_STORAGE_KEY = "riftwilds-emote-privacy-v1";

export const DEFAULT_PRIVACY: PrivacySettings = {
  allowSocialRequests: true,
  friendsOnlySocial: false,
  hideRemoteBubbles: false,
  mutedPlayerIds: [],
  blockedPlayerIds: [],
};

export function loadPrivacySettings(): PrivacySettings {
  if (typeof window === "undefined") return { ...DEFAULT_PRIVACY, mutedPlayerIds: [], blockedPlayerIds: [] };
  try {
    const raw = localStorage.getItem(PRIVACY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PRIVACY, mutedPlayerIds: [], blockedPlayerIds: [] };
    const parsed = JSON.parse(raw) as Partial<PrivacySettings>;
    return {
      allowSocialRequests: parsed.allowSocialRequests ?? true,
      friendsOnlySocial: parsed.friendsOnlySocial ?? false,
      hideRemoteBubbles: parsed.hideRemoteBubbles ?? false,
      mutedPlayerIds: Array.isArray(parsed.mutedPlayerIds)
        ? parsed.mutedPlayerIds.map(String)
        : [],
      blockedPlayerIds: Array.isArray(parsed.blockedPlayerIds)
        ? parsed.blockedPlayerIds.map(String)
        : [],
    };
  } catch {
    return { ...DEFAULT_PRIVACY, mutedPlayerIds: [], blockedPlayerIds: [] };
  }
}

export function savePrivacySettings(settings: PrivacySettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(settings));
}

export function isMuted(settings: PrivacySettings, playerId: string): boolean {
  return settings.mutedPlayerIds.includes(playerId);
}

export function isBlocked(settings: PrivacySettings, playerId: string): boolean {
  return settings.blockedPlayerIds.includes(playerId);
}

export function canReceiveSocialRequest(
  settings: PrivacySettings,
  fromId: string,
): { ok: true } | { ok: false; reason: string } {
  if (!settings.allowSocialRequests) {
    return { ok: false, reason: "Social emote requests are disabled in privacy settings" };
  }
  if (isBlocked(settings, fromId)) {
    return { ok: false, reason: "Player is blocked" };
  }
  if (isMuted(settings, fromId)) {
    return { ok: false, reason: "Player is muted" };
  }
  // friendsOnlySocial is a stub gate until friends graph ships
  if (settings.friendsOnlySocial) {
    return { ok: false, reason: "Friends-only social requests (friends graph Phase 2)" };
  }
  return { ok: true };
}

export function mutePlayer(settings: PrivacySettings, playerId: string): PrivacySettings {
  if (settings.mutedPlayerIds.includes(playerId)) return settings;
  return { ...settings, mutedPlayerIds: [...settings.mutedPlayerIds, playerId] };
}

export function unmutePlayer(settings: PrivacySettings, playerId: string): PrivacySettings {
  return {
    ...settings,
    mutedPlayerIds: settings.mutedPlayerIds.filter((id) => id !== playerId),
  };
}

export function blockPlayer(settings: PrivacySettings, playerId: string): PrivacySettings {
  if (settings.blockedPlayerIds.includes(playerId)) return settings;
  return {
    ...settings,
    blockedPlayerIds: [...settings.blockedPlayerIds, playerId],
    mutedPlayerIds: settings.mutedPlayerIds.includes(playerId)
      ? settings.mutedPlayerIds
      : [...settings.mutedPlayerIds, playerId],
  };
}

export function unblockPlayer(settings: PrivacySettings, playerId: string): PrivacySettings {
  return {
    ...settings,
    blockedPlayerIds: settings.blockedPlayerIds.filter((id) => id !== playerId),
  };
}
