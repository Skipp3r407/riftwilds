import { aggregateAnalytics, listAnalyticsEvents } from "@/lib/analytics/events";
import { ACHIEVEMENT_CATALOG } from "@/game/achievements/catalog";
import { CIVILIZATION_MILESTONES } from "@/game/civilization/milestones";
import { getCivilizationProgress } from "@/game/civilization/progress-store";
import { buildEcosystemSnapshot } from "@/game/expansion/ecosystem";
import { listAuditEntries } from "@/lib/security/audit-log";

export function buildAnalyticsDashboard() {
  const ecosystem = buildEcosystemSnapshot();
  const civ = getCivilizationProgress();
  return {
    generatedAt: new Date().toISOString(),
    eventCounts: aggregateAnalytics(),
    recentEvents: listAnalyticsEvents(25),
    content: {
      achievements: ACHIEVEMENT_CATALOG.length,
      civilizationMilestones: CIVILIZATION_MILESTONES.length,
      unlockedMilestones: civ.unlockedMilestoneKeys.length,
      expansionPacks: ecosystem.packs.length,
      contentByKind: ecosystem.countsByKind,
    },
    security: {
      recentAudits: listAuditEntries(10),
    },
    notes: [
      "In-memory analytics only — swap for warehouse later.",
      "Never log wallet signatures, private keys, or raw payment proofs.",
      "Entertainment metrics only; no investment performance framing.",
    ],
  };
}
