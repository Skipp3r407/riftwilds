/**
 * Living NPC runtime — schedule resolve, attention, reputation social notice, ambient social.
 * Pure-ish logic for Phaser scenes; no art thrash — only behavior/indicator state.
 * Nearby NPCs evaluate in real time; far NPCs = lightweight schedule-only LOD.
 */

import { resolveLivingWorldClock, type DayPhase, type WeatherKey } from "@/game/living-world/clock";
import {
  clearAttention,
  createAttention,
  markWaved,
  shouldWave,
  tickAttention,
  type AttentionKind,
  type AttentionState,
} from "@/game/npc-ai/attention";
import { pickAmbientChat, AMBIENT_CHAT_COOLDOWN_MS, AMBIENT_CHAT_RANGE, AMBIENT_CHAT_CHANCE, type AmbientChatLine } from "@/game/npc-ai/ambient-social";
import {
  buildKillerReputation,
  KILLER_NOTICE_RANGE,
  resolveKillerReaction,
  type KillerReaction,
  type KillerReputation,
} from "@/game/npc-ai/killer-reputation";
import {
  createEmptyGossipStore,
  knownReputationInRegion,
  tickGossipSpread,
  type GossipStore,
} from "@/game/npc-ai/gossip";
import {
  loadReputationStore,
  syncReputationFromKiller,
  type PlayerReputation,
} from "@/game/npc-ai/reputation";
import {
  resolveSocialReaction,
  SOCIAL_NOTICE_RANGE,
  type SocialReaction,
} from "@/game/npc-ai/social-reactions";
import { resolveNpcSchedule, scheduleTickSlot, type ResolvedNpcSchedule } from "@/game/npc-ai/schedules";
import { rollNpcDiscovery } from "@/game/npc-ai/quest-discovery";
import { weatherReaction, combatNearbyReaction, REACTION_COOLDOWN_MS } from "@/game/npc-ai/reactions";
import { formatRumorLine, rumorForNpc } from "@/game/npc-ai/rumors";
import {
  adjustRelationship,
  loadRelationships,
  saveRelationships,
  type NpcRelationshipStore,
} from "@/game/npc-ai/relationships";
import { getNpcBySlug } from "@/content/npcs";

export type LivingNpcActor = {
  npcSlug: string;
  name: string;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  behavior: string;
  spawnHomeX: number;
  spawnHomeY: number;
  attention: AttentionState | null;
  present: boolean;
  schedule?: ResolvedNpcSchedule;
  fleeUntil?: number;
  lastKillerNoticeAt?: number;
  lastSocialNoticeAt?: number;
  indicatorSprite?: unknown;
};

export type LivingWorldAiContext = {
  now: number;
  dayPhase: DayPhase;
  weather: WeatherKey;
  playerX: number;
  playerY: number;
  killer: KillerReputation;
  /** Multi-axis reputation (optional — derived from killer if omitted). */
  reputation?: PlayerReputation;
  regionId?: string;
  gossipStore?: GossipStore;
  combatNearby?: boolean;
  /** Frame bucket 0–7 for staggered updates. */
  tickBucket: number;
  cullDistance?: number;
  relationshipStore?: NpcRelationshipStore;
};

export type LivingAiTickResult = {
  actors: LivingNpcActor[];
  ambientChat: AmbientChatLine | null;
  killerReactions: { npcSlug: string; reaction: KillerReaction }[];
  socialReactions: { npcSlug: string; reaction: SocialReaction }[];
  ambientLines: { npcSlug: string; line: string }[];
  relationshipStore: NpcRelationshipStore;
  reputation: PlayerReputation;
  gossipStore: GossipStore;
};

const DEFAULT_CULL = 520;
let lastAmbientChatAt = 0;
let lastWeatherReactAt = 0;
const attentionAssigned = new Set<string>();

export function resetLivingAiForTests(): void {
  lastAmbientChatAt = 0;
  lastWeatherReactAt = 0;
  attentionAssigned.clear();
}

export function killerFromPlayState(state: {
  pvpKills?: number;
  combatKills?: number;
  enemiesDefeated?: number;
  killerReputation?: number;
  bountyTier?: number;
  flags?: string[];
}): KillerReputation {
  return buildKillerReputation(state);
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Assign or refresh attention indicators (rate-limited per NPC). */
export function ensureDiscoveryAttention(
  actor: LivingNpcActor,
  ctx: LivingWorldAiContext,
  store: NpcRelationshipStore,
): LivingNpcActor {
  if (!actor.present || actor.attention?.active) return actor;
  if (attentionAssigned.has(actor.npcSlug) && actor.attention) return actor;

  const npc = getNpcBySlug(actor.npcSlug);
  const schedule = actor.schedule ?? resolveNpcSchedule(actor.npcSlug, ctx.dayPhase);
  const roll =
    ((ctx.now / 1000 + scheduleTickSlot(actor.npcSlug, 97)) % 100) / 100;
  const discovery = rollNpcDiscovery({
    npcSlug: actor.npcSlug,
    role: schedule.role,
    dayPhase: ctx.dayPhase,
    weather: ctx.weather,
    relationshipScore: store.byNpc[actor.npcSlug]?.score ?? 0,
    flags: [],
    roll,
  });

  // Sparse: only some NPCs show indicators each phase window
  if (roll > 0.55 && discovery.interaction !== "quest_offer") return actor;

  attentionAssigned.add(actor.npcSlug);
  return {
    ...actor,
    attention: createAttention(discovery.attention, ctx.now, discovery.questId),
  };
}

function applyBehaviorFromSocial(
  actor: LivingNpcActor,
  reaction: SocialReaction,
  now: number,
): LivingNpcActor {
  let next = { ...actor };
  const hint = reaction.behaviorHint;
  if (hint === "flee" || hint === "cower" || hint === "hide") {
    next.fleeUntil = now + (hint === "cower" || hint === "hide" ? 4000 : 7000);
    next.behavior = hint === "flee" ? "pace" : "idle";
  } else if (hint === "cheer" || hint === "wave" || hint === "salute") {
    next.behavior = "look_around";
  } else if (hint === "challenge" || hint === "watch") {
    next.behavior = "patrol";
  } else if (hint === "lock" || hint === "avoid") {
    next.behavior = "idle";
  }
  return next;
}

function attentionFromSocial(reaction: SocialReaction): Exclude<AttentionKind, "none"> {
  if (reaction.attention !== "none") return reaction.attention;
  if (reaction.kind === "respect" || reaction.kind === "admire_strength") return "respect";
  if (reaction.kind === "watch") return "wary";
  if (reaction.kind === "fear" || reaction.kind === "hide" || reaction.kind === "arrest") {
    return "fear";
  }
  if (reaction.kind === "praise" || reaction.kind === "salute") return "praise";
  return "chat";
}

export function tickLivingNpcs(
  actorsIn: LivingNpcActor[],
  ctx: LivingWorldAiContext,
): LivingAiTickResult {
  const cull = ctx.cullDistance ?? DEFAULT_CULL;
  const store = ctx.relationshipStore ?? loadRelationships();
  const regionId = ctx.regionId ?? "riftwild-commons";
  let gossip = ctx.gossipStore ?? createEmptyGossipStore();
  gossip = tickGossipSpread(gossip, ctx.now);

  let trueAxes =
    ctx.reputation ??
    syncReputationFromKiller(
      loadReputationStore().axes,
      ctx.killer,
    );
  trueAxes = syncReputationFromKiller(trueAxes, ctx.killer);
  const knownAxes = knownReputationInRegion(trueAxes, gossip, regionId, ctx.now);

  const killerReactions: { npcSlug: string; reaction: KillerReaction }[] = [];
  const socialReactions: { npcSlug: string; reaction: SocialReaction }[] = [];
  const ambientLines: { npcSlug: string; line: string }[] = [];
  let ambientChat: AmbientChatLine | null = null;

  const actors = actorsIn.map((raw) => {
    const slot = scheduleTickSlot(raw.npcSlug);
    const dPlayer = dist(raw.x, raw.y, ctx.playerX, ctx.playerY);
    const far = dPlayer > cull;

    // LOD: far NPCs only keep presence/schedule, skip social/killer (background sim)
    let actor = { ...raw };
    if (slot === ctx.tickBucket || !actor.schedule) {
      const schedule = resolveNpcSchedule(actor.npcSlug, ctx.dayPhase);
      const ax = actor.spawnHomeX + schedule.anchorOffset.x;
      const ay = actor.spawnHomeY + schedule.anchorOffset.y;
      actor = {
        ...actor,
        schedule,
        present: schedule.present,
        behavior: schedule.behavior,
        homeX: ax,
        homeY: ay,
      };
    }

    if (!actor.present) {
      actor.attention = null;
      return actor;
    }

    // Flee offset while scared
    if (actor.fleeUntil && ctx.now < actor.fleeUntil) {
      const away = Math.atan2(actor.y - ctx.playerY, actor.x - ctx.playerX);
      actor.homeX = actor.spawnHomeX + Math.cos(away) * 36;
      actor.homeY = actor.spawnHomeY + Math.sin(away) * 36;
      actor.behavior = "pace";
    }

    if (!far && slot === ctx.tickBucket) {
      actor = ensureDiscoveryAttention(actor, ctx, store);
      actor.attention = tickAttention(actor.attention, ctx.now);
      if (actor.attention && shouldWave(actor.attention, ctx.now)) {
        actor.attention = markWaved(actor.attention);
      }

      const noticeRange = Math.max(KILLER_NOTICE_RANGE, SOCIAL_NOTICE_RANGE);
      const noticeReady =
        dPlayer < noticeRange &&
        (!actor.lastSocialNoticeAt || ctx.now - actor.lastSocialNoticeAt > 20_000);

      if (noticeReady) {
        const npc = getNpcBySlug(actor.npcSlug);
        const alreadySocial = store.byNpc[actor.npcSlug]?.socialNoticed ?? false;
        const social = resolveSocialReaction({
          npcSlug: actor.npcSlug,
          displayName: actor.name,
          occupation: npc?.occupation,
          kind: npc?.kind,
          personalityTraits: npc?.personalityTraits,
          knownAxes,
          trueAxes,
          alreadyReacted: alreadySocial,
        });

        if (social) {
          actor.lastSocialNoticeAt = ctx.now;
          actor.lastKillerNoticeAt = ctx.now;
          actor.attention = createAttention(attentionFromSocial(social), ctx.now);
          actor = applyBehaviorFromSocial(actor, social, ctx.now);
          adjustRelationship(
            store,
            actor.npcSlug,
            social.relationshipDelta,
            `social:${social.kind}`,
          );
          if (store.byNpc[actor.npcSlug]) {
            store.byNpc[actor.npcSlug]!.socialNoticed = true;
            if (
              social.kind === "fear" ||
              social.kind === "hide" ||
              social.kind === "arrest" ||
              social.kind === "challenge"
            ) {
              store.byNpc[actor.npcSlug]!.killerNoticed = true;
            }
          }
          socialReactions.push({ npcSlug: actor.npcSlug, reaction: social });
        } else if (
          ctx.killer.knownAsKiller &&
          dPlayer < KILLER_NOTICE_RANGE
        ) {
          // Fallback: legacy killer-notice path (personality-gated)
          const already = store.byNpc[actor.npcSlug]?.killerNoticed ?? false;
          const reaction = resolveKillerReaction({
            npcSlug: actor.npcSlug,
            displayName: actor.name,
            occupation: npc?.occupation,
            kind: npc?.kind,
            personalityTraits: npc?.personalityTraits,
            reputation: ctx.killer,
            alreadyNoticed: already,
          });
          if (reaction) {
            actor.lastKillerNoticeAt = ctx.now;
            actor.lastSocialNoticeAt = ctx.now;
            actor.attention = createAttention(
              reaction.attention === "none" ? "fear" : reaction.attention,
              ctx.now,
            );
            if (reaction.behaviorHint === "flee" || reaction.behaviorHint === "cower") {
              actor.fleeUntil = ctx.now + (reaction.behaviorHint === "cower" ? 4000 : 7000);
              actor.behavior = reaction.behaviorHint === "cower" ? "idle" : "pace";
            }
            if (reaction.behaviorHint === "cheer") actor.behavior = "look_around";
            if (reaction.behaviorHint === "challenge") actor.behavior = "patrol";
            adjustRelationship(
              store,
              actor.npcSlug,
              reaction.relationshipDelta,
              `killer:${reaction.kind}`,
            );
            if (store.byNpc[actor.npcSlug]) {
              store.byNpc[actor.npcSlug]!.killerNoticed = true;
            }
            killerReactions.push({ npcSlug: actor.npcSlug, reaction });
          }
        }
      }

      // Weather ambient (rare)
      if (
        ctx.combatNearby &&
        ctx.now - lastWeatherReactAt > REACTION_COOLDOWN_MS
      ) {
        const role = actor.schedule?.role ?? "citizen";
        const react = combatNearbyReaction(role);
        ambientLines.push({ npcSlug: actor.npcSlug, line: react.line });
        lastWeatherReactAt = ctx.now;
      } else if (
        !ctx.combatNearby &&
        ctx.now - lastWeatherReactAt > REACTION_COOLDOWN_MS * 2 &&
        slot === 0
      ) {
        const role = actor.schedule?.role ?? "citizen";
        const react = weatherReaction(ctx.weather, role);
        if (react && Math.random() < 0.15) {
          ambientLines.push({ npcSlug: actor.npcSlug, line: react.line });
          lastWeatherReactAt = ctx.now;
        }
      }
    }

    return actor;
  });

  // Ambient NPC–NPC chat among nearby present actors
  if (ctx.now - lastAmbientChatAt > AMBIENT_CHAT_COOLDOWN_MS) {
    const present = actors.filter((a) => a.present);
    for (let i = 0; i < present.length && !ambientChat; i++) {
      for (let j = i + 1; j < present.length; j++) {
        const a = present[i]!;
        const b = present[j]!;
        if (dist(a.x, a.y, b.x, b.y) > AMBIENT_CHAT_RANGE) continue;
        if (Math.random() > AMBIENT_CHAT_CHANCE) continue;
        ambientChat = pickAmbientChat({
          slugA: a.npcSlug,
          slugB: b.npcSlug,
          seed: Math.floor(ctx.now / 1000) + i + j,
        });
        lastAmbientChatAt = ctx.now;
        break;
      }
    }
  }

  saveRelationships(store);
  return {
    actors,
    ambientChat,
    killerReactions,
    socialReactions,
    ambientLines,
    relationshipStore: store,
    reputation: trueAxes,
    gossipStore: gossip,
  };
}

export function acknowledgeAttention(
  actor: LivingNpcActor,
  store?: NpcRelationshipStore,
): LivingNpcActor {
  const s = store ?? loadRelationships();
  if (actor.attention?.active) {
    // Talking clears indicator
  }
  saveRelationships(s);
  return { ...actor, attention: clearAttention(actor.attention) };
}

export function livingClockSnapshot(atMs = Date.now()) {
  const clock = resolveLivingWorldClock(atMs);
  return {
    dayPhase: clock.dayPhase,
    weather: clock.weather,
    labels: clock.labels,
  };
}

export function ambientRumorLine(npcSlug: string, seed = 0): string {
  return formatRumorLine(rumorForNpc(npcSlug, seed));
}
