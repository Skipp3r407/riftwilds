import { NextResponse } from "next/server";
import { z } from "zod";
import { buildGenotypeV2 } from "@/game/genetics/genetics-v2";
import {
  buildLineageBook,
  buildPedigreeNode,
  previewLitterStory,
} from "@/game/genetics/pedigree";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";

const bodySchema = z.object({
  action: z.enum(["pedigree", "preview_litter"]),
  petId: z.string().min(2).max(64).optional(),
  displayName: z.string().min(1).max(40).optional(),
  geneticsSeed: z.string().min(2).max(80),
  traitSeed: z.string().min(2).max(80),
  cosmeticSeed: z.string().min(2).max(80),
  parentA: z
    .object({
      geneticsSeed: z.string(),
      traitSeed: z.string(),
      cosmeticSeed: z.string(),
      generation: z.number().int().min(1).max(40).optional(),
    })
    .optional(),
  parentB: z
    .object({
      geneticsSeed: z.string(),
      traitSeed: z.string(),
      cosmeticSeed: z.string(),
      generation: z.number().int().min(1).max(40).optional(),
    })
    .optional(),
  litterSeed: z.string().min(2).max(80).optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "genetics-lineage",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.GENETICS_ENABLED && !featureFlagDefaults.GENETICS_V2_ENABLED) {
    return NextResponse.json({ ok: false, error: "DISABLED" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  if (parsed.data.action === "preview_litter") {
    if (!parsed.data.parentA || !parsed.data.parentB || !parsed.data.litterSeed) {
      return NextResponse.json({ ok: false, error: "MISSING_PARENTS" }, { status: 400 });
    }
    const a = buildGenotypeV2(parsed.data.parentA);
    const b = buildGenotypeV2(parsed.data.parentB);
    const story = previewLitterStory(a, b, parsed.data.litterSeed);
    return NextResponse.json({ ok: true, ...story, requestId: guard.requestId });
  }

  const root = buildPedigreeNode({
    petId: parsed.data.petId ?? "pet_demo",
    displayName: parsed.data.displayName ?? "Riftling",
    geneticsSeed: parsed.data.geneticsSeed,
    traitSeed: parsed.data.traitSeed,
    cosmeticSeed: parsed.data.cosmeticSeed,
  });
  const book = buildLineageBook({ root });
  return NextResponse.json({ ok: true, book, requestId: guard.requestId });
}
