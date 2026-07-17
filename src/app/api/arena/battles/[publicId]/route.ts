import { NextResponse } from "next/server";
import { getTrainingBattle, toClientSnapshot } from "@/game/arena/training-store";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

type Params = { params: Promise<{ publicId: string }> };

export async function GET(_req: Request, { params }: Params) {
  if (!featureFlagDefaults.ARENA_ENABLED) {
    return NextResponse.json({ error: "ARENA_DISABLED" }, { status: 403 });
  }
  const { publicId } = await params;
  const record = getTrainingBattle(publicId);
  if (!record) {
    return NextResponse.json({ error: "BATTLE_NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json(toClientSnapshot(record));
}
