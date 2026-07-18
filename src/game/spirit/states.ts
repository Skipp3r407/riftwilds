/**
 * Derive Riftling life states + activity gates from care + spirit record.
 * Normal play: health ≤ 0 → DOWNED (never instant death).
 */

import type { CareStats } from "@/game/creatures/care";
import { normalizeCareStats } from "@/game/creatures/care";
import type {
  ActivityGates,
  RiftlingLifeState,
  SpiritRecord,
  VisualFxStub,
} from "@/game/spirit/types";
import { INCAPACITATED_STATES, MARKETPLACE_BLOCKED_STATES } from "@/game/spirit/types";
import { SPIRIT_RECOVERY_CONFIG } from "@/game/spirit/config";

export function deriveLifeStateFromCare(
  stats: Partial<CareStats>,
  opts?: {
    spirit?: SpiritRecord | null;
    hardcoreEnabled?: boolean;
    countdownExpired?: boolean;
  },
): RiftlingLifeState {
  const spirit = opts?.spirit;
  if (spirit?.lifeState === "PERMADEAD") return "PERMADEAD";
  if (spirit?.lifeState === "MEMORIALIZED") return "MEMORIALIZED";
  if (spirit?.lifeState === "LEGENDARY_ANCESTOR") return "LEGENDARY_ANCESTOR";
  if (spirit?.lifeState === "RETIRED") return "RETIRED";
  if (spirit?.lifeState === "SPIRIT_FORM") return "SPIRIT_FORM";
  if (spirit?.lifeState === "DOWNED") return "DOWNED";
  if (spirit?.lifeState === "RECOVERED") {
    // Soft label until care restabilizes — fall through to care-derived.
  }

  const s = normalizeCareStats(stats);

  if (s.health <= 0) {
    if (opts?.hardcoreEnabled && opts?.countdownExpired) return "PERMADEAD";
    return "DOWNED";
  }

  if (s.health < 20 || s.stress > 90) return "CRITICAL";
  if (s.health < 40 || s.stress > 75) return "WEAK";
  if (s.health < 65) return "INJURED";
  return "HEALTHY";
}

export function activityGatesForState(state: RiftlingLifeState): ActivityGates {
  const incapacitated = INCAPACITATED_STATES.has(state);
  const dead = state === "PERMADEAD" || state === "MEMORIALIZED";
  return {
    canFight: !incapacitated && state !== "CRITICAL",
    canExplore: !incapacitated,
    canGather: !incapacitated,
    canUseAbilities: !incapacitated && state !== "WEAK",
    canView: true,
    canHeal: !dead && state !== "LEGENDARY_ANCESTOR" && state !== "RETIRED",
    canListMarketplace: !MARKETPLACE_BLOCKED_STATES.has(state) && state === "HEALTHY",
  };
}

export function visualFxForState(state: RiftlingLifeState): VisualFxStub {
  if (state === "DOWNED" || state === "SPIRIT_FORM") {
    return {
      breathing: state === "DOWNED",
      dimGlow: true,
      spiritParticles: true,
      heartbeatAudioKey: SPIRIT_RECOVERY_CONFIG.fx.heartbeatAudioKey,
    };
  }
  return {
    breathing: false,
    dimGlow: false,
    spiritParticles: state === "LEGENDARY_ANCESTOR",
    heartbeatAudioKey: null,
  };
}

export function isRecoverable(state: RiftlingLifeState): boolean {
  return state === "DOWNED" || state === "SPIRIT_FORM" || state === "CRITICAL" || state === "WEAK";
}

export function remainingCountdownMs(
  record: SpiritRecord,
  nowMs: number = Date.now(),
): number | null {
  if (!record.countdownEndsAt) return null;
  if (record.maintenancePaused) {
    const end = new Date(record.countdownEndsAt).getTime();
    return Math.max(0, end - nowMs); // frozen wall-clock until resumed
  }
  const end = new Date(record.countdownEndsAt).getTime() + record.pausedMs;
  return Math.max(0, end - nowMs);
}

export function shouldEnterSpiritForm(record: SpiritRecord, nowMs: number = Date.now()): boolean {
  if (record.lifeState !== "DOWNED") return false;
  const rem = remainingCountdownMs(record, nowMs);
  if (rem === null) return false;
  // Mid-countdown spirit journey unlock — after 50% of timer or always available via quest.
  return rem > 0;
}
