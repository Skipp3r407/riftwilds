/**
 * Economy analytics stubs — counters only; no PII export.
 */

import { listEconomyLedger } from "@/lib/economy/sol/ledger";
import { solFlagDefaults } from "@/lib/economy/sol/flags";

export function getSolEconomyAnalyticsSnapshot() {
  const ledger = listEconomyLedger(500);
  const byType: Record<string, number> = {};
  for (const e of ledger) {
    byType[e.eventType] = (byType[e.eventType] ?? 0) + 1;
  }
  return {
    generatedAt: new Date().toISOString(),
    flags: solFlagDefaults(),
    ledgerEventCounts: byType,
    ledgerSize: ledger.length,
    note: "Scaffold analytics — wire warehouse exporters after legal/privacy review.",
  };
}
