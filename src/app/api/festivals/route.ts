import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { resolveLivingWorldClock } from "@/game/living-world/clock";
import { resolveFestivalOccurrences } from "@/game/festivals/calendar";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "festivals",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.FESTIVALS_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  const clock = resolveLivingWorldClock();
  const occurrences = resolveFestivalOccurrences(clock);

  return jsonOk(
    {
      enabled: true,
      clock: {
        season: clock.labels.season,
        worldDay: clock.worldDay,
        dayPhase: clock.labels.dayPhase,
      },
      festivals: occurrences,
      disclaimer: "Festival rewards are entertainment cosmetics and gameplay — no cash value.",
    },
    guard.requestId,
  );
}
