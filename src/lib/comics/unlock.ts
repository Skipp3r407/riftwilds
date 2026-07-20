/**
 * Comic unlock evaluation — core story must remain free of marketplace/crypto gates.
 * Sequential issues may require completing a prior issue (with admin/dev override).
 */

import type { ComicIssueMeta, ComicUnlockGate } from "@/content/comics/types";
import type { ComicProgressState } from "@/content/comics/types";

export type UnlockContext = {
  progress: ComicProgressState;
  /** Stub flags from campaign / events / BP — all optional */
  campaignChapterIds?: string[];
  defeatedBossIds?: string[];
  activeEventKeys?: string[];
  battlePass?: { seasonId: string; tier: number };
  seasonIds?: string[];
  ownedSkuIds?: string[];
  /** Admin studio / local override — unlocks prior-issue gates */
  comicsDevUnlock?: boolean;
};

function envDevUnlock(): boolean {
  if (typeof process === "undefined") return false;
  const v = process.env.COMICS_DEV_UNLOCK || process.env.NEXT_PUBLIC_COMICS_DEV_UNLOCK;
  return v === "1" || v === "true" || v === "yes";
}

export function gatesForIssue(meta: ComicIssueMeta): ComicUnlockGate[] {
  const gates = meta.unlockGates?.length ? meta.unlockGates : [{ kind: "free" as const }];
  const hasPrior = gates.some((g) => g.kind === "prior-issue");
  const hasFree = gates.some((g) => g.kind === "free");
  // Hard rule: marketplace-only must not block core story — inject free.
  // Prior-issue sequential locks are intentional and must NOT be bypassed by free injection.
  if (!hasFree && !hasPrior) {
    return [{ kind: "free" }, ...gates];
  }
  return gates;
}

export function isIssueUnlocked(meta: ComicIssueMeta, ctx: UnlockContext): boolean {
  const gates = gatesForIssue(meta);
  const dev = Boolean(ctx.comicsDevUnlock) || envDevUnlock();
  return gates.some((gate) => evaluateGate(gate, ctx, dev));
}

function evaluateGate(gate: ComicUnlockGate, ctx: UnlockContext, devUnlock: boolean): boolean {
  switch (gate.kind) {
    case "free":
      return true;
    case "prior-issue": {
      if (devUnlock) return true;
      const prior = ctx.progress.issues[gate.slug];
      return Boolean(prior?.completed);
    }
    case "admin-dev":
      return devUnlock;
    case "campaign":
      return Boolean(ctx.campaignChapterIds?.includes(gate.chapterId));
    case "boss":
      return Boolean(ctx.defeatedBossIds?.includes(gate.bossId));
    case "achievement":
      return ctx.progress.achievements.includes(gate.achievementId);
    case "event":
      return Boolean(ctx.activeEventKeys?.includes(gate.eventKey));
    case "battle-pass":
      return Boolean(
        ctx.battlePass &&
          ctx.battlePass.seasonId === gate.seasonId &&
          ctx.battlePass.tier >= gate.tier,
      );
    case "season":
      return Boolean(ctx.seasonIds?.includes(gate.seasonId));
    case "marketplace":
      // Cosmetic path only — never blocks core story because free gate is injected
      return Boolean(ctx.ownedSkuIds?.includes(gate.skuId));
    default:
      return true;
  }
}

export function unlockLabel(meta: ComicIssueMeta): string {
  const gates = gatesForIssue(meta);
  if (gates.some((g) => g.kind === "free")) return "Free to read";
  const prior = gates.find((g) => g.kind === "prior-issue");
  if (prior && prior.kind === "prior-issue") return prior.label;
  return gates.map((g) => ("label" in g ? g.label : g.kind)).join(" · ");
}

export function issueLockReason(meta: ComicIssueMeta, ctx: UnlockContext): string | null {
  if (isIssueUnlocked(meta, ctx)) return null;
  const prior = gatesForIssue(meta).find((g) => g.kind === "prior-issue");
  if (prior && prior.kind === "prior-issue") {
    return `Locked until you finish ${prior.label.replace(/^Complete\s+/i, "")}. Admin/dev: set COMICS_DEV_UNLOCK=1.`;
  }
  return "Locked";
}
