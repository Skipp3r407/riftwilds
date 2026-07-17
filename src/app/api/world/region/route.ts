import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getRegionLivingState } from "@/game/living-world/region-state";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "world-region",
    limit: 120,
    windowMs: 60_000,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.LIVING_WORLD_CLOCK_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") ?? "riftwild-commons";
  const state = getRegionLivingState(slug);

  return jsonOk(
    {
      enabled: true,
      region: {
        slug: state.regionSlug,
        name: state.regionName,
        weather: state.weather,
        dayPhase: state.clock.labels.dayPhase,
        season: state.clock.labels.season,
        disaster: state.disaster
          ? {
              key: state.disaster.disaster.key,
              name: state.disaster.disaster.name,
              intensity: state.disaster.intensity,
            }
          : null,
        npcsPresent: state.npcsPresent,
        resourceModifiers: state.resourceModifiers,
        discoveryChanceBoost: state.discoveryChanceBoost,
        wildlifeAgitation: state.wildlifeAgitation,
      },
    },
    guard.requestId,
  );
}
