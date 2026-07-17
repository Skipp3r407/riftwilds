import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { consultArchivist } from "@/game/archivist/companion";
import { resolveLivingWorldClock } from "@/game/living-world/clock";
import { trackAnalytics } from "@/lib/analytics/events";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "archivist",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
    auditAction: "archivist_consult",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.AI_ARCHIVIST_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  const url = new URL(request.url);
  const topic = url.searchParams.get("topic") ?? undefined;
  const speciesSlug = url.searchParams.get("species") ?? undefined;
  const regionSlug = url.searchParams.get("region") ?? undefined;
  const clock = resolveLivingWorldClock();

  const reply = consultArchivist({ topic, speciesSlug, regionSlug, clock });
  trackAnalytics("archivist_consult", {
    hasTopic: Boolean(topic),
    hasSpecies: Boolean(speciesSlug),
  });

  return jsonOk({ enabled: true, reply }, guard.requestId);
}
