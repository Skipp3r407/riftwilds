import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getSessionContext } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { buildPlayerDashboardSnapshot } from "@/lib/ecosystem/player-dashboard";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "player-dashboard",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.ECOSYSTEM_PLAYER_DASHBOARD_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  const session = await getSessionContext();
  let input: Parameters<typeof buildPlayerDashboardSnapshot>[0] = {
    walletAddress: session?.walletAddress ?? null,
  };

  if (session?.userId) {
    try {
      const [profile, petCount, eggCount, listingCount, inventoryCount, achievementCount] =
        await Promise.all([
          prisma.playerProfile.findUnique({ where: { userId: session.userId } }),
          prisma.creature.count({
            where: { ownerId: session.userId, deletedAt: null },
          }),
          prisma.egg.count({ where: { ownerId: session.userId } }),
          prisma.marketplaceListing.count({
            where: { sellerId: session.userId, status: "ACTIVE" },
          }),
          prisma.inventoryItem.count({ where: { userId: session.userId } }),
          prisma.playerAchievement.count({ where: { userId: session.userId } }),
        ]);

      input = {
        username: profile?.username,
        displayName: profile?.displayName,
        avatarKey: profile?.avatarKey,
        rankTitle: profile?.rankTitle,
        walletAddress: session.walletAddress,
        petCount,
        eggCount,
        softCurrency: profile?.softCurrency,
        demoCredits: profile?.demoCredits,
        questPoints: profile?.questPoints,
        battleRating: profile?.battleRating,
        careStreak: profile?.careStreak,
        achievementCount,
        listingCount,
        inventoryCount,
      };
    } catch {
      // DB unavailable — fall through to placeholder snapshot
    }
  }

  return jsonOk(
    {
      enabled: true,
      authenticated: Boolean(session),
      dashboard: buildPlayerDashboardSnapshot(input),
    },
    guard.requestId,
  );
}
