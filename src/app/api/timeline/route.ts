import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { listTimelineEvents } from "@/game/timeline/store";
import type { TimelineScope } from "@/game/timeline/types";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "timeline",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.LIVING_TIMELINE_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") as TimelineScope | null;
  const entityId = url.searchParams.get("entityId") ?? undefined;
  const events = listTimelineEvents({
    scope: scope ?? undefined,
    entityId,
    limit: 40,
  });

  return jsonOk({ enabled: true, events }, guard.requestId);
}
