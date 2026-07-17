import { NextResponse } from "next/server";
import { z } from "zod";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { cancelRuntimeListing } from "@/lib/marketplace/demo-listings";

const bodySchema = z.object({
  sellerLabel: z.string().min(2).max(64),
});

type Params = { params: Promise<{ publicId: string }> };

export async function POST(req: Request, { params }: Params) {
  if (
    !isFeatureEnabled("MARKETPLACE_WRITES_ENABLED") &&
    !isFeatureEnabled("MARKETPLACE_ENABLED")
  ) {
    return NextResponse.json({ error: "MARKETPLACE_WRITES_DISABLED" }, { status: 403 });
  }

  const { publicId } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const result = cancelRuntimeListing(publicId, parsed.data.sellerLabel);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }
  return NextResponse.json({ ok: true, publicId });
}
