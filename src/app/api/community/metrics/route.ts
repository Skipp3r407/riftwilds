import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createRequestId } from "@/lib/utils/request-id";
import { getCommunityDashboard } from "@/lib/community";
import { setCommunityActivitySnapshot } from "@/lib/rewards/vault-store";

async function loadGameMetrics() {
  try {
    const [eggsHatched, marketplaceTrades] = await Promise.all([
      prisma.egg.count({ where: { status: "HATCHED" } }),
      prisma.marketplaceListing.count({ where: { status: "SOLD" } }),
    ]);
    return { eggsHatched, marketplaceTrades, petsEvolved: 0 };
  } catch {
    return { eggsHatched: 0, marketplaceTrades: 0, petsEvolved: 0 };
  }
}

export async function GET() {
  const requestId = createRequestId();
  const game = await loadGameMetrics();
  setCommunityActivitySnapshot({
    eggsHatched: game.eggsHatched,
    marketplaceTrades: game.marketplaceTrades,
    petsEvolved: game.petsEvolved,
  });

  const dashboard = await getCommunityDashboard(game);

  return NextResponse.json({
    requestId,
    ...dashboard,
  });
}
