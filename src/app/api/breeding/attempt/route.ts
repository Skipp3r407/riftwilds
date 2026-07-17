import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { featureFlagDefaults, isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  evaluateBreedingEligibility,
  splitBreedingFee,
  BREEDING_RULES,
} from "@/lib/economy/breeding-rules";
import { lamportsToSolString } from "@/lib/items/lamports";

const schema = z.object({
  parentAId: z.string().min(2),
  parentBId: z.string().min(2),
  ageHoursA: z.number().min(0),
  ageHoursB: z.number().min(0),
  bondA: z.number().min(0).max(100),
  bondB: z.number().min(0).max(100),
  usesRemainingA: z.number().int().min(0),
  usesRemainingB: z.number().int().min(0),
  usesConsumedA: z.number().int().min(0).default(0),
  usesConsumedB: z.number().int().min(0).default(0),
  lastBredAtA: z.string().nullable(),
  lastBredAtB: z.string().nullable(),
  requestId: z.string().min(8).max(128).optional(),
});

/**
 * Breeding attempt shell — enforces rules, never guarantees rarity,
 * does not mint eggs or charge SOL while flags are off.
 */
export async function POST(req: Request) {
  if (!isFeatureEnabled("BREEDING_ENABLED")) {
    return NextResponse.json(
      {
        error: "BREEDING_DISABLED",
        hint: "Set BREEDING_ENABLED=true after rules review. Fee settlement still needs SOL_PURCHASES_ENABLED.",
      },
      { status: 403 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY", details: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  if (d.parentAId === d.parentBId) {
    return NextResponse.json({ error: "parents_must_differ" }, { status: 400 });
  }

  const a = evaluateBreedingEligibility(
    {
      ageHours: d.ageHoursA,
      bond: d.bondA,
      breedingUsesRemaining: d.usesRemainingA,
      lastBredAt: d.lastBredAtA,
    },
    d.usesConsumedA,
  );
  const b = evaluateBreedingEligibility(
    {
      ageHours: d.ageHoursB,
      bond: d.bondB,
      breedingUsesRemaining: d.usesRemainingB,
      lastBredAt: d.lastBredAtB,
    },
    d.usesConsumedB,
  );

  if (!a.ok || !b.ok) {
    return NextResponse.json(
      {
        ok: false,
        parentA: a,
        parentB: b,
        disclosures: BREEDING_RULES.disclosures,
      },
      { status: 400 },
    );
  }

  const feeLamports = a.nextFeeLamports > b.nextFeeLamports ? a.nextFeeLamports : b.nextFeeLamports;
  const split = splitBreedingFee(feeLamports);
  const requestId = d.requestId ?? `breed_${randomUUID()}`;
  const offspringGeneration = Math.max(1, 2);

  return NextResponse.json({
    ok: true,
    status: "PREVIEW_ONLY",
    requestId,
    offspringGeneration,
    rarityGuaranteed: false,
    feeSol: lamportsToSolString(feeLamports),
    feeLamports: feeLamports.toString(),
    feeSplit: {
      projectReserve: split.projectReserve.toString(),
      holderVault: split.holderVault.toString(),
      development: split.development.toString(),
      communityEvents: split.communityEvents.toString(),
    },
    solSettlement:
      featureFlagDefaults.SOL_PURCHASES_ENABLED
        ? "SOL path selected but on-chain breeding escrow is not implemented"
        : "SOL settlement off — no charge applied",
    eggMinted: false,
    disclosures: BREEDING_RULES.disclosures,
    note: "Rules passed. Egg mint + fee ledger persist when breeding persistence is wired to Prisma BreedingRecord / EggSupplyCounter.",
  });
}
