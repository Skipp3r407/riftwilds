import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { buildGlobalActivityFeed } from "@/lib/ecosystem/activity-feed";
import { getCommunityDashboard } from "@/lib/community/metrics";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "activity-feed",
    limit: 120,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.ECOSYSTEM_ACTIVITY_FEED_ENABLED) {
    return jsonOk({ enabled: false, items: [] }, guard.requestId);
  }

  const url = new URL(request.url);
  const limit = Math.min(48, Math.max(1, Number(url.searchParams.get("limit")) || 16));

  let communityFeed;
  try {
    const community = await getCommunityDashboard();
    communityFeed = community.feed;
  } catch {
    communityFeed = undefined;
  }

  const items = buildGlobalActivityFeed({ communityFeed, limit, includeDemo: true });

  return jsonOk(
    {
      enabled: true,
      items,
      note: "Mix of live civilization / community metrics and structural demo rows. Never fabricates reward SOL.",
      refreshedAt: new Date().toISOString(),
    },
    guard.requestId,
  );
}
