import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { getHomesteadExpansionModel } from "@/game/housing/catalog";
import { FURNITURE_SKUS } from "@/lib/housing/furniture-catalog";
import { housingCatalogSnapshot } from "@/lib/housing/instance-service";
import { PROPERTY_CATALOG } from "@/lib/housing/property-catalog";

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
      properties: PROPERTY_CATALOG,
      furnitureSkus: FURNITURE_SKUS,
      playerHousing: housingCatalogSnapshot(),
      note: "Player housing + build mode live under PLAYER_HOUSING_ENABLED. Prisma prepare-only.",
    },
    guard.requestId,
  );
}
