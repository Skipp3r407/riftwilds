/**
 * Solana transfer engine — demo-safe by default.
 * Real create/sign/broadcast only when TREASURY_OPS_REAL_TRANSFERS + encrypted key env present.
 * Private keys never leave the server; never exposed to frontend.
 */

import type { DistributionRecord, PayoutLine, SystemSettings } from "./types";

export type TransferResult = {
  line: PayoutLine;
  simulated: boolean;
  feeEstimateLamports: string;
};

function hasSigningKey(): boolean {
  return Boolean(
    process.env.TREASURY_OPS_SIGNER_SECRET_ENCRYPTED ||
      process.env.TREASURY_OPS_SIGNER_KEYPAIR_PATH,
  );
}

export function estimateFeeLamports(lineCount: number): string {
  // Rough Solana base fee × lines (demo estimate)
  return String(5_000 * Math.max(1, lineCount));
}

/**
 * Execute payout lines. Without keys or when real transfers disabled → simulate + mark SIMULATED.
 * Idempotent: skips lines already CONFIRMED / SIMULATED with signature.
 */
export async function executeTransfers(params: {
  distribution: DistributionRecord;
  settings: SystemSettings;
}): Promise<{ distribution: DistributionRecord; simulated: boolean }> {
  const { distribution, settings } = params;
  const now = new Date().toISOString();
  const canBroadcast = settings.realTransfersEnabled && hasSigningKey() && !settings.emergencyStop;

  if (!canBroadcast) {
    for (const line of distribution.lines) {
      if (line.status === "CONFIRMED" || (line.status === "SIMULATED" && line.txSignature)) {
        continue;
      }
      line.status = "SIMULATED";
      line.txSignature = `sim_${distribution.id}_${line.id}`;
      line.attemptedAt = now;
      line.confirmedAt = now;
      line.error = null;
    }
    distribution.simulated = true;
    distribution.status = "SIMULATED";
    distribution.executedAt = now;
    distribution.updatedAt = now;
    return { distribution, simulated: true };
  }

  // Live path stub — structured for multi-sig / real RPC wiring later.
  // Intentionally does not load private keys into this module surface.
  for (const line of distribution.lines) {
    if (line.status === "CONFIRMED" && line.txSignature) continue;
    if (line.address.includes("COMING_SOON") || line.address.startsWith("SEED_")) {
      line.status = "FAILED";
      line.error = "Destination address not configured";
      line.attemptedAt = now;
      continue;
    }
    // Placeholder: real signing would happen in a sealed server module.
    line.status = "FAILED";
    line.error =
      "Live transfer module not wired — enable after multi-sig + encrypted signer review";
    line.attemptedAt = now;
  }

  const anyFailed = distribution.lines.some((l) => l.status === "FAILED");
  const allOk = distribution.lines.every((l) => l.status === "CONFIRMED");
  distribution.simulated = false;
  distribution.status = allOk ? "COMPLETED" : anyFailed ? "FAILED" : "EXECUTING";
  distribution.executedAt = now;
  distribution.updatedAt = now;
  if (anyFailed) {
    distribution.error = "One or more payout lines failed";
  }
  return { distribution, simulated: false };
}

export function transferModeLabel(settings: SystemSettings): "demo_simulated" | "monitor_only" | "live_transfers" {
  if (settings.realTransfersEnabled && hasSigningKey()) return "live_transfers";
  if (settings.monitoringEnabled) return "monitor_only";
  return "demo_simulated";
}
