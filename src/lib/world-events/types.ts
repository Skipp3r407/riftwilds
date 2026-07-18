/**
 * Dynamic World Events — server-authoritative living-world spectacle.
 * Soft Credits / story only. Never SOL. Never AFK-farmable.
 */

export type WorldEventKey =
  | "dragon_city_attack"
  | "caravan_ambush"
  | "goblin_invasion"
  | "bridge_collapse"
  | "wandering_world_boss"
  | "traveling_circus"
  | "meteor_crash"
  | "rare_rift_opening"
  | "shipwreck"
  | "haunted_forest_night";

export type WorldEventTier = "LOCAL" | "REGIONAL" | "CONTINENTAL" | "LEGENDARY";

export type WorldEventPhase =
  | "IDLE"
  | "SCHEDULED"
  | "ANNOUNCED"
  | "ACTIVE"
  | "RESOLVING"
  | "ENDED"
  | "CANCELLED";

export type WorldEventTriggerReason =
  | "SCHEDULER"
  | "ADMIN"
  | "STORY"
  | "COMMUNITY_MILESTONE"
  | "RIFT_STORM_AFTERMATH"
  | "DEV";

/** Verified engagement required before participation scores. */
export type WorldEventInputSignal =
  | "MOVE"
  | "CAMERA"
  | "INTERACT"
  | "CHAT"
  | "EMOTE"
  | "UI"
  | "PET"
  | "COMBAT";

export type WorldEventParticipationAction =
  | "ARRIVE"
  | "DEFEND"
  | "RESCUE"
  | "SCOUT"
  | "REPAIR"
  | "ESCORT"
  | "GATHER_AID"
  | "NPC_HELP"
  | "PHOTO"
  | "BOSS_HIT"
  | "TREASURE_CLAIM";

export type WorldChangeKind =
  | "weather"
  | "blocked_road"
  | "treasure_spawn"
  | "spawn_override"
  | "npc_schedule"
  | "ambient_audio"
  | "lighting";

export type WorldChangeStub = {
  kind: WorldChangeKind;
  key: string;
  label: string;
  regionSlug: string;
  /** Declarative payload for Live World / map consumers. */
  payload: Record<string, string | number | boolean>;
};

export type TempEventQuestStub = {
  id: string;
  eventInstanceId: string;
  title: string;
  giverNpcId: string;
  objective: string;
  regionSlug: string;
  expiresAt: string;
  rewardHint: string;
};

export type NpcEventReaction = {
  npcId: string;
  regionSlug: string;
  mood: "alarmed" | "excited" | "grim" | "curious" | "festive" | "haunted";
  line: string;
  questStubId?: string;
};

export type WorldEventDef = {
  key: WorldEventKey;
  name: string;
  blurb: string;
  tier: WorldEventTier;
  /** Preferred host regions (empty = commons default). */
  regionAffinity: string[];
  announceMs: number;
  activeMs: number;
  resolveMs: number;
  mapPriority: number;
  weatherHint?: string;
  worldChanges: Omit<WorldChangeStub, "regionSlug">[];
  npcReactionTemplates: Omit<NpcEventReaction, "regionSlug" | "questStubId">[];
  questTemplates: Omit<TempEventQuestStub, "id" | "eventInstanceId" | "regionSlug" | "expiresAt">[];
  participationActions: WorldEventParticipationAction[];
  qualifyScore: number;
  maxCreditsReward: number;
};

export type WorldEventAnnouncement = {
  id: string;
  eventInstanceId: string;
  severity: "info" | "urgent" | "spectacle";
  headline: string;
  body: string;
  regionSlug: string;
  at: string;
};

export type WorldEventParticipant = {
  userId: string;
  eventInstanceId: string;
  score: number;
  actionCounts: Partial<Record<WorldEventParticipationAction, number>>;
  lastActionAt: string | null;
  lastMeaningfulAt: number | null;
  inputs: { signal: WorldEventInputSignal; at: number }[];
  qualified: boolean;
  creditsGranted: number;
  fraudRisk: number;
  regionSlug: string | null;
};

export type WorldEventInstance = {
  id: string;
  key: WorldEventKey;
  name: string;
  phase: WorldEventPhase;
  tier: WorldEventTier;
  triggerReason: WorldEventTriggerReason;
  regionSlug: string;
  locationId: string;
  markerX: number;
  markerY: number;
  scheduledAt: string | null;
  announcedAt: string | null;
  startedAt: string | null;
  endsAt: string | null;
  resolvingUntil: string | null;
  endedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  worldMessage: string;
  participantCount: number;
  qualifiedCount: number;
  worldChanges: WorldChangeStub[];
  npcReactions: NpcEventReaction[];
  tempQuests: TempEventQuestStub[];
  announcements: WorldEventAnnouncement[];
  seedCommit: string;
};

export type WorldEventSchedulerState = {
  lastTickAt: number | null;
  lastSpawnAt: number | null;
  spawnCooldownUntil: number;
  activeInstanceId: string | null;
  historyIds: string[];
};

export type HappeningNowItem = {
  id: string;
  kind: "world_event" | "community";
  label: string;
  subtitle?: string;
  regionSlug: string;
  locationId: string;
  phase?: WorldEventPhase;
  endsAt: string;
  startsAt: string;
  presenceXpBonus: number;
  eventKey?: WorldEventKey;
  urgency?: "info" | "urgent" | "spectacle";
};

export type WorldEventPlayerView = {
  enabled: boolean;
  active: WorldEventInstance | null;
  happeningNow: HappeningNowItem[];
  announcements: WorldEventAnnouncement[];
  mapMarkers: {
    id: string;
    regionSlug: string;
    x: number;
    y: number;
    label: string;
    subtitle: string;
    eventKey: WorldEventKey;
    phase: WorldEventPhase;
  }[];
  participant: WorldEventParticipant | null;
  worldChanges: WorldChangeStub[];
  tempQuests: TempEventQuestStub[];
  npcReactions: NpcEventReaction[];
  note: string;
  /** Honest backlog for full multiplayer sync. */
  multiplayerBacklog: string[];
};

export type WorldEventAuditEntry = {
  at: string;
  action: string;
  detail?: string;
  instanceId?: string;
  actorId?: string;
};
