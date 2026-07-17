import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authDefaults } from "@/lib/config/project";
import { listTrainingHistory, toClientSnapshot } from "@/game/arena/training-store";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

async function ownerKey(): Promise<string | null> {
  const jar = await cookies();
  const session = jar.get(authDefaults.COOKIE_NAME)?.value;
  if (session) return `sess_${session.slice(0, 24)}`;
  const guest = jar.get("arena_guest")?.value;
  if (guest) return `guest_${guest}`;
  return null;
}

export async function GET() {
  if (!featureFlagDefaults.ARENA_ENABLED) {
    return NextResponse.json({ error: "ARENA_DISABLED" }, { status: 403 });
  }
  const key = await ownerKey();
  if (!key) {
    return NextResponse.json({ battles: [] });
  }
  const battles = listTrainingHistory(key).map(toClientSnapshot);
  return NextResponse.json({ battles });
}
