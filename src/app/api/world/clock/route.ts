import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { resolveLivingWorldClock } from "@/game/living-world/clock";
import { resolveActiveDisaster } from "@/game/living-world/disasters";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "world-clock",
    limit: 120,
    windowMs: 60_000,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.LIVING_WORLD_CLOCK_ENABLED) {
    return jsonOk(
      { enabled: false, message: "Living world clock paused by feature flag." },
      guard.requestId,
    );
  }

  const url = new URL(request.url);
  const at = url.searchParams.get("at");
  const atMs = at ? Number(at) : Date.now();
  const clock = resolveLivingWorldClock(Number.isFinite(atMs) ? atMs : Date.now());
  const disaster = resolveActiveDisaster(clock);

  return jsonOk(
    {
      enabled: true,
      clock,
      disaster: disaster
        ? {
            key: disaster.disaster.key,
            name: disaster.disaster.name,
            intensity: disaster.intensity,
            effects: disaster.disaster.worldEffects,
          }
        : null,
    },
    guard.requestId,
  );
}
