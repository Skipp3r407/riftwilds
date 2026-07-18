import type { CompatibilityReason, SafetyGateContext } from "@/lib/equipment/types";

export type SafetyCheckResult =
  | { ok: true; inspectOnly: boolean }
  | { ok: false; reason: CompatibilityReason; message: string; inspectOnly: boolean };

/**
 * Combat / cutscene / other-player gates for equipment mutations.
 * Inspect is always allowed; equip/unequip requires owner + idle context.
 */
export function checkEquipmentSafety(ctx: SafetyGateContext): SafetyCheckResult {
  if (ctx.otherPlayer || !ctx.actorIsOwner) {
    return {
      ok: false,
      reason: "OTHER_PLAYER",
      message: "You can inspect this Riftling's gear, but only its Keeper can equip items.",
      inspectOnly: true,
    };
  }
  if (ctx.inCombat) {
    return {
      ok: false,
      reason: "SAFETY_BLOCKED",
      message: "Equipment is locked during combat.",
      inspectOnly: true,
    };
  }
  if (ctx.inCutscene) {
    return {
      ok: false,
      reason: "SAFETY_BLOCKED",
      message: "Equipment is locked during cutscenes.",
      inspectOnly: true,
    };
  }
  return { ok: true, inspectOnly: false };
}
