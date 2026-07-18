/**
 * Live World emote system types — cosmetic only, no combat/economy advantages.
 */

export type EmoteCategory =
  | "greeting"
  | "reaction"
  | "stance"
  | "celebration"
  | "signal"
  | "social"
  | "ping";

export type EmoteTier = "free" | "credits" | "premium_cosmetic";

export type EmoteKind = "solo" | "social" | "ping";

/** Animation priority — higher wins; movement/combat/portal cancel emotes. */
export type AnimLayer =
  | "idle"
  | "walk"
  | "run"
  | "emote"
  | "combat"
  | "portal"
  | "stun";

export type EmoteDef = {
  key: string;
  label: string;
  description: string;
  category: EmoteCategory;
  kind: EmoteKind;
  tier: EmoteTier;
  animationKey: string;
  /** ms of local gesture playback */
  durationMs: number;
  cooldownMs: number;
  /** Social sync requires mutual consent */
  requiresConsent: boolean;
  /** Floating bubble / reduced-motion glyph */
  glyph: string;
  iconPath: string;
  previewPath: string;
  audioStub?: string;
  unlockHint: string;
  /** Credits cost when tier is credits (cosmetic unlock only) */
  creditsCost?: number;
  /** Family-safe tags for moderation filters */
  tags: string[];
  /** Optional slash aliases without leading slash */
  aliases?: string[];
};

export type EmotePlaybackRequest = {
  emoteKey: string;
  actorId: string;
  actorKind: "player" | "pet" | "npc" | "remote";
  targetId?: string;
  at: number;
  reducedMotion?: boolean;
  source: "wheel" | "chat" | "ping" | "consent" | "reaction" | "admin" | "network";
};

export type EmotePlaybackState = {
  active: EmotePlaybackRequest | null;
  layer: AnimLayer;
  endsAt: number;
  lastEmoteAt: number;
  lastEmoteKey: string | null;
};

export type ConsentRequest = {
  id: string;
  fromId: string;
  fromLabel: string;
  toId: string;
  emoteKey: string;
  createdAt: number;
  expiresAt: number;
  status: "pending" | "accepted" | "declined" | "expired" | "cancelled";
};

export type PrivacySettings = {
  /** Allow incoming social emote consent requests */
  allowSocialRequests: boolean;
  /** Auto-decline from non-friends (stub — friends graph Phase 2) */
  friendsOnlySocial: boolean;
  /** Hide floating emote bubbles from others locally */
  hideRemoteBubbles: boolean;
  mutedPlayerIds: string[];
  blockedPlayerIds: string[];
};

export type EmoteFavoritesState = {
  /** Up to 8 wheel slots */
  wheelSlots: (string | null)[];
  favorites: string[];
};

export type EmoteUnlockState = {
  unlockedKeys: string[];
};

export type PingKind =
  | "follow_me"
  | "help"
  | "ready"
  | "not_ready"
  | "look_here"
  | "celebrate"
  | "danger"
  | "thanks";

export type EmoteBusEvent =
  | { type: "play"; payload: EmotePlaybackRequest }
  | { type: "cancel"; payload: { actorId: string; reason: string } }
  | { type: "consent_request"; payload: ConsentRequest }
  | { type: "consent_resolve"; payload: ConsentRequest }
  | { type: "ping"; payload: { ping: PingKind; actorId: string; at: number } }
  | {
      type: "npc_react";
      payload: { npcSlug: string; emoteKey: string; line?: string; at: number };
    }
  | {
      type: "pet_react";
      payload: { emoteKey: string; mood: string; at: number };
    };

export type EmoteUiMode = "closed" | "wheel" | "panel";

export type EmoteUiState = {
  mode: EmoteUiMode;
  /** Angle highlight 0–7 for wheel */
  highlightIndex: number;
  holdStartedAt: number | null;
};
