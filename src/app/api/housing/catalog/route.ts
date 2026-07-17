import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { getHomesteadExpansionModel } from "@/game/housing/catalog";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "housing-catalog",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  return jsonOk(
    {
      model: getHomesteadExpansionModel(),
      note: "Layout editor and persistence land with HOMESTEADS_ENABLED.",
    },
    guard.requestId,
  );
}
