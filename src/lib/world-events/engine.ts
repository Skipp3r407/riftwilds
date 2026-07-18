/**
 * Server-authoritative Dynamic World Events engine.
 * Phases: SCHEDULED → ANNOUNCED → ACTIVE → RESOLVING → ENDED | CANCELLED
 */

import { trackAnalytics } from "@/lib/analytics/events";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { creditCredits } from "@/lib/credits/ledger";
import { getWorldEventDef, listWorldEventCatalog } from "@/lib/world-events/catalog";
import {
  WORLD_EVENT_ACTIVE_HOURS_UTC,
  WORLD_EVENT_MULTIPLAYER_BACKLOG,
  WORLD_EVENT_PUBLIC_NOTE,
  WORLD_EVENT_QUALIFY_CREDITS,
  WORLD_EVENT_SPAWN_COOLDOWN_MS,
} from "@/lib/world-events/config";
import { applyEventNpcWarmth } from "@/lib/npc-relationships";
import {
  appendWorldEventSignals,
  applyWorldEventParticipation,
  emptyWorldEventParticipant,
  evaluateWorldEventAntiAfk,
  idleAloneQualifiesForWorldEvent,
  isWorldEventParticipationAction,
} from "@/lib/world-events/participation";
import {
  appendWorldEventAudit,
  getActiveWorldEventInstance,
  getSchedulerState,
  getWorldEventInstance,
  getWorldEventParticipant,
  listRecentWorldEvents,
  listWorldEventAudit,
  pushWorldEventHistory,
  saveSchedulerState,
  saveWorldEventInstance,
  saveWorldEventParticipant,
} from "@/lib/world-events/store";
import type {
  HappeningNowItem,
  NpcEventReaction,
  TempEventQuestStub,
  WorldChangeStub,
  WorldEventAnnouncement,
  WorldEventInstance,
  WorldEventKey,
  WorldEventPlayerView,
  WorldEventTriggerReason,
  WorldEventInputSignal,
  WorldEventParticipationAction,
} from "@/lib/world-events/types";

function seedCommit(now: number): string {
  let h = now >>> 0;
  h ^= h << 13;
  h ^= h >>> 17;
  h ^= h << 5;
  return `we_commit_${(h >>> 0).toString(16)}`;
}

function regionSpawn(regionSlug: string): { x: number; y: number; locationId: string } {
  const table: Record<string, { x: number; y: number; locationId: string }> = {
    "riftwild-commons": { x: 512, y: 420, locationId: "commons-plaza" },
    "ember-crater": { x: 480, y: 400, locationId: "ember-ridge" },
    "elderwood-forest": { x: 500, y: 460, locationId: "elderwood-path" },
    "moonwater-coast": { x: 540, y: 480, locationId: "moonwater-dock" },
    "void-hollow": { x: 490, y: 390, locationId: "void-rim" },
    "stormspire-peaks": { x: 510, y: 350, locationId: "storm-overlook" },
    "frostveil-basin": { x: 470, y: 410, locationId: "frost-trail" },
    "stoneheart-canyon": { x: 520, y: 440, locationId: "canyon-road" },
  };
  return table[regionSlug] ?? { x: 512, y: 420, locationId: "commons-plaza" };
}

function pickRegion(affinity: string[]): string {
  if (affinity.length === 0) return "riftwild-commons";
  return affinity[Math.floor(Math.random() * affinity.length)]!;
}

function buildWorldChanges(
  defKey: WorldEventKey,
  regionSlug: string,
): WorldChangeStub[] {
  const def = getWorldEventDef(defKey);
  return def.worldChanges.map((c) => ({ ...c, regionSlug }));
}

function buildNpcReactions(
  defKey: WorldEventKey,
  regionSlug: string,
  questIds: string[],
): NpcEventReaction[] {
  const def = getWorldEventDef(defKey);
  return def.npcReactionTemplates.map((r, i) => ({
    ...r,
    regionSlug,
    questStubId: questIds[i],
  }));
}

function buildTempQuests(
  instanceId: string,
  defKey: WorldEventKey,
  regionSlug: string,
  expiresAt: string,
): TempEventQuestStub[] {
  const def = getWorldEventDef(defKey);
  return def.questTemplates.map((q, i) => ({
    ...q,
    id: `${instanceId}_q${i}`,
    eventInstanceId: instanceId,
    regionSlug,
    expiresAt,
  }));
}

function announcementFor(
  instance: WorldEventInstance,
  severity: WorldEventAnnouncement["severity"],
  headline: string,
  body: string,
): WorldEventAnnouncement {
  return {
    id: `${instance.id}_${severity}_${Date.now()}`,
    eventInstanceId: instance.id,
    severity,
    headline,
    body,
    regionSlug: instance.regionSlug,
    at: new Date().toISOString(),
  };
}

export function isWorldEventActiveHours(now = Date.now()): boolean {
  const hour = new Date(now).getUTCHours();
  const { start, end } = WORLD_EVENT_ACTIVE_HOURS_UTC;
  if (start > end) return hour >= start || hour < end;
  return hour >= start && hour < end;
}

export function createWorldEventInstance(params: {
  key: WorldEventKey;
  triggerReason?: WorldEventTriggerReason;
  regionSlug?: string;
  skipAnnounce?: boolean;
  now?: number;
}): WorldEventInstance {
  const now = params.now ?? Date.now();
  const def = getWorldEventDef(params.key);
  const regionSlug = params.regionSlug ?? pickRegion(def.regionAffinity);
  const spawn = regionSpawn(regionSlug);
  const id = `we_${params.key}_${now.toString(36)}`;
  const announceMs = params.skipAnnounce ? 0 : def.announceMs;
  const announcedAt = new Date(now).toISOString();
  const startedAtMs = now + announceMs;
  const endsAtMs = startedAtMs + def.activeMs;
  const resolvingUntilMs = endsAtMs + def.resolveMs;

  const tempQuests = buildTempQuests(
    id,
    params.key,
    regionSlug,
    new Date(resolvingUntilMs).toISOString(),
  );
  const questIds = tempQuests.map((q) => q.id);

  const instance: WorldEventInstance = {
    id,
    key: params.key,
    name: def.name,
    phase: announceMs === 0 ? "ACTIVE" : "ANNOUNCED",
    tier: def.tier,
    triggerReason: params.triggerReason ?? "DEV",
    regionSlug,
    locationId: spawn.locationId,
    markerX: spawn.x,
    markerY: spawn.y,
    scheduledAt: null,
    announcedAt,
    startedAt: announceMs === 0 ? announcedAt : new Date(startedAtMs).toISOString(),
    endsAt: new Date(endsAtMs).toISOString(),
    resolvingUntil: new Date(resolvingUntilMs).toISOString(),
    endedAt: null,
    cancelledAt: null,
    cancelReason: null,
    worldMessage: def.blurb,
    participantCount: 0,
    qualifiedCount: 0,
    worldChanges: buildWorldChanges(params.key, regionSlug),
    npcReactions: buildNpcReactions(params.key, regionSlug, questIds),
    tempQuests,
    announcements: [],
    seedCommit: seedCommit(now),
  };

  instance.announcements.push(
    announcementFor(
      instance,
      def.tier === "LEGENDARY" || def.tier === "CONTINENTAL" ? "urgent" : "spectacle",
      announceMs === 0 ? `${def.name} is underway!` : `${def.name} gathers…`,
      def.blurb,
    ),
  );

  return instance;
}

export function activateWorldEvent(params: {
  key: WorldEventKey;
  triggerReason?: WorldEventTriggerReason;
  regionSlug?: string;
  skipAnnounce?: boolean;
  now?: number;
  actorId?: string;
  /** When true, replace an existing active event (admin). */
  forceReplace?: boolean;
}): WorldEventInstance {
  const now = params.now ?? Date.now();

  const existing = getActiveWorldEventInstance();
  if (
    existing &&
    !params.forceReplace &&
    (existing.phase === "ANNOUNCED" ||
      existing.phase === "ACTIVE" ||
      existing.phase === "RESOLVING")
  ) {
    // Advance phases only — never recurse into scheduler spawn.
    return advanceInstance(existing, now);
  }

  const instance = createWorldEventInstance(params);
  saveWorldEventInstance(instance);
  const sched = getSchedulerState();
  saveSchedulerState({
    ...sched,
    activeInstanceId: instance.id,
    lastSpawnAt: now,
    spawnCooldownUntil: now + WORLD_EVENT_SPAWN_COOLDOWN_MS,
    lastTickAt: now,
  });
  pushWorldEventHistory(instance.id);
  appendWorldEventAudit({
    action: "activate",
    detail: `${instance.key}:${instance.phase}`,
    instanceId: instance.id,
    actorId: params.actorId,
  });
  trackAnalytics("world_event_start", {
    key: instance.key,
    region: instance.regionSlug,
  });
  return instance;
}

export function cancelWorldEvent(reason = "Admin cancelled", now = Date.now()): WorldEventInstance | null {
  const active = getActiveWorldEventInstance();
  if (!active) return null;
  const next: WorldEventInstance = {
    ...active,
    phase: "CANCELLED",
    cancelledAt: new Date(now).toISOString(),
    cancelReason: reason,
    endedAt: new Date(now).toISOString(),
  };
  saveWorldEventInstance(next);
  const sched = getSchedulerState();
  saveSchedulerState({ ...sched, activeInstanceId: null, lastTickAt: now });
  appendWorldEventAudit({
    action: "cancel",
    detail: reason,
    instanceId: next.id,
  });
  return next;
}

function advanceInstance(instance: WorldEventInstance, now: number): WorldEventInstance {
  if (instance.phase === "ENDED" || instance.phase === "CANCELLED") return instance;

  const startedAt = instance.startedAt ? Date.parse(instance.startedAt) : null;
  const endsAt = instance.endsAt ? Date.parse(instance.endsAt) : null;
  const resolvingUntil = instance.resolvingUntil
    ? Date.parse(instance.resolvingUntil)
    : null;

  if (instance.phase === "ANNOUNCED" && startedAt != null && now >= startedAt) {
    const next = {
      ...instance,
      phase: "ACTIVE" as const,
      announcements: [
        ...instance.announcements,
        announcementFor(instance, "urgent", `${instance.name} has begun!`, instance.worldMessage),
      ],
    };
    saveWorldEventInstance(next);
    return next;
  }

  if (instance.phase === "ACTIVE" && endsAt != null && now >= endsAt) {
    const next = {
      ...instance,
      phase: "RESOLVING" as const,
      announcements: [
        ...instance.announcements,
        announcementFor(
          instance,
          "info",
          `${instance.name} winds down…`,
          "Keepers clear the field. Temporary quests expire soon.",
        ),
      ],
    };
    saveWorldEventInstance(next);
    return next;
  }

  if (
    (instance.phase === "RESOLVING" || instance.phase === "ACTIVE") &&
    resolvingUntil != null &&
    now >= resolvingUntil
  ) {
    const next: WorldEventInstance = {
      ...instance,
      phase: "ENDED",
      endedAt: new Date(now).toISOString(),
    };
    saveWorldEventInstance(next);
    const sched = getSchedulerState();
    if (sched.activeInstanceId === instance.id) {
      saveSchedulerState({ ...sched, activeInstanceId: null, lastTickAt: now });
    }
    appendWorldEventAudit({ action: "end", instanceId: instance.id });
    trackAnalytics("world_event_end", { key: instance.key });
    return next;
  }

  return instance;
}

export function tickWorldEventScheduler(now = Date.now(), opts?: { forceSpawn?: boolean }): {
  instance: WorldEventInstance | null;
  spawned: boolean;
} {
  if (!isFeatureEnabled("LIVE_WORLD_EVENTS_ENABLED")) {
    return { instance: null, spawned: false };
  }

  let active = getActiveWorldEventInstance();
  if (active) {
    active = advanceInstance(active, now);
  }

  const sched = getSchedulerState();
  saveSchedulerState({ ...sched, lastTickAt: now });

  const canSpawn =
    !getActiveWorldEventInstance() &&
    (opts?.forceSpawn ||
      (isWorldEventActiveHours(now) && now >= sched.spawnCooldownUntil));

  if (!canSpawn) {
    return { instance: getActiveWorldEventInstance(), spawned: false };
  }

  const catalog = listWorldEventCatalog();
  const pick = catalog[Math.floor(Math.random() * catalog.length)]!;
  const instance = createWorldEventInstance({
    key: pick.key,
    triggerReason: opts?.forceSpawn ? "ADMIN" : "SCHEDULER",
    now,
  });
  saveWorldEventInstance(instance);
  saveSchedulerState({
    ...getSchedulerState(),
    activeInstanceId: instance.id,
    lastSpawnAt: now,
    spawnCooldownUntil: now + WORLD_EVENT_SPAWN_COOLDOWN_MS,
    lastTickAt: now,
  });
  pushWorldEventHistory(instance.id);
  appendWorldEventAudit({
    action: "schedule_spawn",
    detail: instance.key,
    instanceId: instance.id,
  });
  trackAnalytics("world_event_start", {
    key: instance.key,
    region: instance.regionSlug,
  });
  return { instance, spawned: true };
}

/** Ensure something demoable is live for HUD / map when store is cold. */
export function ensureDemoWorldEvent(now = Date.now()): WorldEventInstance {
  tickWorldEventScheduler(now);
  const active = getActiveWorldEventInstance();
  if (active && (active.phase === "ANNOUNCED" || active.phase === "ACTIVE")) {
    return active;
  }
  return activateWorldEvent({
    key: "traveling_circus",
    triggerReason: "DEV",
    skipAnnounce: true,
    now,
  });
}

export function recordWorldEventParticipation(params: {
  userId: string;
  action: WorldEventParticipationAction | string;
  signals?: WorldEventInputSignal[];
  regionSlug?: string;
  now?: number;
}): {
  ok: boolean;
  error?: string;
  message?: string;
  pointsGained?: number;
  participant?: ReturnType<typeof emptyWorldEventParticipant>;
  instance?: WorldEventInstance;
  creditsGranted?: number;
} {
  void idleAloneQualifiesForWorldEvent();
  const now = params.now ?? Date.now();
  tickWorldEventScheduler(now);

  if (!isFeatureEnabled("LIVE_WORLD_EVENTS_ENABLED")) {
    return { ok: false, error: "DISABLED", message: "World events are disabled." };
  }

  const instance = getActiveWorldEventInstance();
  if (!instance || (instance.phase !== "ACTIVE" && instance.phase !== "ANNOUNCED")) {
    return { ok: false, error: "NO_ACTIVE_EVENT", message: "No active world event." };
  }

  if (instance.phase === "ANNOUNCED" && params.action !== "ARRIVE" && params.action !== "SCOUT") {
    return {
      ok: false,
      error: "NOT_STARTED",
      message: "Event is still gathering — scout or arrive early.",
    };
  }

  if (!isWorldEventParticipationAction(params.action)) {
    return { ok: false, error: "INVALID_ACTION", message: "Unknown participation action." };
  }

  const def = getWorldEventDef(instance.key);
  if (!def.participationActions.includes(params.action)) {
    return {
      ok: false,
      error: "ACTION_NOT_ALLOWED",
      message: `Action ${params.action} is not part of ${instance.name}.`,
    };
  }

  let participant =
    getWorldEventParticipant(params.userId, instance.id) ??
    emptyWorldEventParticipant(params.userId, instance.id);

  const signals = params.signals?.length
    ? params.signals
    : (["MOVE", "INTERACT"] as WorldEventInputSignal[]);
  participant = appendWorldEventSignals(participant, signals, now);

  const afk = evaluateWorldEventAntiAfk(participant, now);
  if (!afk.ok) {
    saveWorldEventParticipant(participant);
    return { ok: false, error: afk.reason.toUpperCase(), message: afk.message, participant, instance };
  }

  const wasQualified = participant.qualified;
  const applied = applyWorldEventParticipation(participant, params.action, def.qualifyScore, now, {
    regionSlug: params.regionSlug ?? instance.regionSlug,
  });
  participant = applied.participant;

  let creditsGranted = 0;
  if (participant.qualified && !wasQualified && participant.creditsGranted === 0) {
    const grant = Math.min(def.maxCreditsReward, WORLD_EVENT_QUALIFY_CREDITS);
    const credited = creditCredits({
      userId: params.userId,
      amount: grant,
      reason: "EVENT_REWARD",
      requestId: `we_qualify_${instance.id}_${params.userId}`,
      metadata: { eventKey: instance.key, eventId: instance.id },
    });
    if (credited.ok) {
      creditsGranted = grant;
      participant = { ...participant, creditsGranted: grant };
    }
  }

  saveWorldEventParticipant(participant);

  if (!wasQualified) {
    const nextInst = {
      ...instance,
      participantCount: instance.participantCount + (participant.score === applied.pointsGained ? 1 : 0),
      qualifiedCount: participant.qualified
        ? instance.qualifiedCount + (wasQualified ? 0 : 1)
        : instance.qualifiedCount,
    };
    // Recount participants loosely — first action bumps count once
    if ((participant.actionCounts[params.action] ?? 0) === 1 && params.action === "ARRIVE") {
      nextInst.participantCount = instance.participantCount + 1;
    }
    if (participant.qualified && !wasQualified) {
      nextInst.qualifiedCount = instance.qualifiedCount + 1;
    }
    saveWorldEventInstance(nextInst);
  } else if (participant.qualified && !wasQualified) {
    saveWorldEventInstance({
      ...instance,
      qualifiedCount: instance.qualifiedCount + 1,
    });
  }

  trackAnalytics("world_event_participate", {
    key: instance.key,
    action: params.action,
  });

  if (params.action === "DEFEND" || params.action === "RESCUE" || params.action === "NPC_HELP") {
    const npcIds = instance.npcReactions.map((r) => r.npcId).slice(0, 3);
    if (npcIds.length) {
      applyEventNpcWarmth({ userId: params.userId, npcIds });
    }
  }

  return {
    ok: true,
    pointsGained: applied.pointsGained,
    participant,
    instance: getWorldEventInstance(instance.id) ?? instance,
    creditsGranted,
    message: participant.qualified
      ? `Qualified for ${instance.name}! Soft Credits awarded if faucet allowed.`
      : `+${applied.pointsGained} participation toward ${instance.name}.`,
  };
}

export function listHappeningNowWorldEvents(now = Date.now()): HappeningNowItem[] {
  // Keep HUD demoable: cold stores get a soft live event (Credits still anti-AFK gated).
  if (isFeatureEnabled("LIVE_WORLD_EVENTS_ENABLED")) {
    ensureDemoWorldEvent(now);
  } else {
    tickWorldEventScheduler(now);
  }
  const active = getActiveWorldEventInstance();
  if (!active) return [];
  if (!["ANNOUNCED", "ACTIVE", "RESOLVING"].includes(active.phase)) return [];
  return [
    {
      id: active.id,
      kind: "world_event",
      label: active.name,
      subtitle: `${active.phase} · ${active.regionSlug}`,
      regionSlug: active.regionSlug,
      locationId: active.locationId,
      phase: active.phase,
      startsAt: active.announcedAt ?? active.startedAt ?? new Date(now).toISOString(),
      endsAt: active.endsAt ?? new Date(now).toISOString(),
      presenceXpBonus: active.tier === "LEGENDARY" ? 6 : active.tier === "CONTINENTAL" ? 5 : 4,
      eventKey: active.key,
      urgency:
        active.tier === "LEGENDARY" || active.phase === "ACTIVE" ? "urgent" : "spectacle",
    },
  ];
}

export function getWorldEventPlayerView(params: {
  userId: string;
  now?: number;
  ensureDemo?: boolean;
}): WorldEventPlayerView {
  const now = params.now ?? Date.now();
  if (params.ensureDemo !== false) {
    ensureDemoWorldEvent(now);
  } else {
    tickWorldEventScheduler(now);
  }

  const enabled = isFeatureEnabled("LIVE_WORLD_EVENTS_ENABLED");
  const active = getActiveWorldEventInstance();
  const participant = active
    ? getWorldEventParticipant(params.userId, active.id)
    : null;

  return {
    enabled,
    active,
    happeningNow: listHappeningNowWorldEvents(now),
    announcements: active?.announcements.slice(-5) ?? [],
    mapMarkers: active
      ? [
          {
            id: `we-marker-${active.id}`,
            regionSlug: active.regionSlug,
            x: active.markerX,
            y: active.markerY,
            label: active.name,
            subtitle: `${active.phase} · ${active.tier}`,
            eventKey: active.key,
            phase: active.phase,
          },
        ]
      : [],
    participant,
    worldChanges: active?.worldChanges ?? [],
    tempQuests: active?.tempQuests ?? [],
    npcReactions: active?.npcReactions ?? [],
    note: WORLD_EVENT_PUBLIC_NOTE,
    multiplayerBacklog: [...WORLD_EVENT_MULTIPLAYER_BACKLOG],
  };
}

export function listWorldEventAdminSnapshot(now = Date.now()) {
  tickWorldEventScheduler(now);
  return {
    scheduler: getSchedulerState(),
    active: getActiveWorldEventInstance(),
    recent: listRecentWorldEvents(8),
    catalog: listWorldEventCatalog().map((d) => ({
      key: d.key,
      name: d.name,
      tier: d.tier,
      qualifyScore: d.qualifyScore,
    })),
    audit: listWorldEventAudit(20),
    multiplayerBacklog: WORLD_EVENT_MULTIPLAYER_BACKLOG,
  };
}

export { listWorldEventAudit, getActiveWorldEventInstance };
