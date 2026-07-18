import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import {
  allRegionMapGoals,
  mapGoalsForRegion,
  starterMapGoalRecommendations,
} from "@/content/map-goals";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "map-goals",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const regionId = url.searchParams.get("regionId");
  const starter = url.searchParams.get("starter") === "1";

  if (starter) {
    return jsonOk(
      { goals: starterMapGoalRecommendations(), kind: "starter" },
      guard.requestId,
    );
  }
  if (regionId) {
    return jsonOk(
      { regionId, goals: mapGoalsForRegion(regionId) },
      guard.requestId,
    );
  }
  return jsonOk({ regions: allRegionMapGoals() }, guard.requestId);
}
