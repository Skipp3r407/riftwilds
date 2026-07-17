import { NextResponse } from "next/server";
import { z } from "zod";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  evaluateBreedingEligibility,
  splitBreedingFee,
  BREEDING_RULES,
} from "@/lib/economy/breeding-rules";
import { lamportsToSolString } from "@/lib/items/lamports";

const schema = z.object({
  ageHours: z.number().min(0),
  bond: z.number().min(0).max(100),
  breedingUsesRemaining: z.number().int().min(0),
  lastBredAt: z.string().nullable(),
  usesConsumed: z.number().int().min(0).default(0),
  lifecycle: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY", details: parsed.error.flatten() }, { status: 400 });
  }

  const result = evaluateBreedingEligibility(
    {
      ageHours: parsed.data.ageHours,
      bond: parsed.data.bond,
      breedingUsesRemaining: parsed.data.breedingUsesRemaining,
      lastBredAt: parsed.data.lastBredAt,
      lifecycle: parsed.data.lifecycle,
    },
    parsed.data.usesConsumed,
  );

  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      reason: result.reason,
      breedingEnabled: featureFlagDefaults.BREEDING_ENABLED,
      disclosures: BREEDING_RULES.disclosures,
    });
  }

  const split = splitBreedingFee(result.nextFeeLamports);
  return NextResponse.json({
    ok: true,
    breedingEnabled: featureFlagDefaults.BREEDING_ENABLED,
    nextFeeSol: lamportsToSolString(result.nextFeeLamports),
    nextFeeLamports: result.nextFeeLamports.toString(),
    usesRemainingAfter: result.usesRemainingAfter,
    feeSplit: {
      projectReserve: split.projectReserve.toString(),
      holderVault: split.holderVault.toString(),
      development: split.development.toString(),
      communityEvents: split.communityEvents.toString(),
    },
    disclosures: BREEDING_RULES.disclosures,
    note: featureFlagDefaults.BREEDING_ENABLED
      ? "Eligible under current rules. Fee settlement still respects SOL_PURCHASES_ENABLED."
      : "Rules evaluation only — BREEDING_ENABLED is false, so attempts are blocked.",
  });
}
