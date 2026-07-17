import { NextResponse } from "next/server";
import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { buildGenotypeV2, previewInheritance } from "@/game/genetics/genetics-v2";

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "genetics-v2",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.GENETICS_V2_ENABLED) {
    return NextResponse.json(
      { ok: false, error: "disabled", requestId: guard.requestId },
      { status: 403 },
    );
  }

  let body: {
    geneticsSeed?: string;
    traitSeed?: string;
    cosmeticSeed?: string;
    generation?: number;
    parentB?: {
      geneticsSeed: string;
      traitSeed: string;
      cosmeticSeed: string;
      generation?: number;
    };
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json", requestId: guard.requestId },
      { status: 400 },
    );
  }

  const parentA = buildGenotypeV2({
    geneticsSeed: body.geneticsSeed ?? "demo-genetics",
    traitSeed: body.traitSeed ?? "demo-trait",
    cosmeticSeed: body.cosmeticSeed ?? "demo-cosmetic",
    generation: body.generation,
  });

  if (body.parentB) {
    const parentB = buildGenotypeV2(body.parentB);
    const preview = previewInheritance(parentA, parentB, `preview:${Date.now()}`);
    return jsonOk({ parentA, parentB, preview }, guard.requestId);
  }

  return jsonOk({ genotype: parentA }, guard.requestId);
}
