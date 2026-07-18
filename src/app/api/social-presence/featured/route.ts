import { NextResponse } from "next/server";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";
import { getTownFeaturedSnapshot } from "@/lib/social-presence";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-featured",
    limit: 120,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (
    !featureFlagDefaults.SOCIAL_PRESENCE_ENABLED ||
    !featureFlagDefaults.TOWN_FEATURED_PLAYER_ENABLED
  ) {
    return NextResponse.json({
      requestId: guard.requestId,
      enabled: false,
      featured: [],
    });
  }

  const snap = getTownFeaturedSnapshot();
  return NextResponse.json({
    requestId: guard.requestId,
    enabled: true,
    ...snap,
    note: "Featured titles are cosmetic profile highlights only — no combat power, never SOL.",
  });
}
