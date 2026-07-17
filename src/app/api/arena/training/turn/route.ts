import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { authDefaults } from "@/lib/config/project";
import { getTrainingBattle, submitTrainingTurn, toClientSnapshot } from "@/game/arena/training-store";

const bodySchema = z.object({
  publicId: z.string().min(4),
  action: z.object({
    kind: z.enum(["BASIC_ATTACK", "ABILITY", "DEFEND", "FOCUS", "ITEM", "SURRENDER"]),
    abilityId: z.string().optional(),
    itemId: z.string().optional(),
  }),
});

async function ownerKey(): Promise<string | null> {
  const jar = await cookies();
  const session = jar.get(authDefaults.COOKIE_NAME)?.value;
  if (session) return `sess_${session.slice(0, 24)}`;
  const guest = jar.get("arena_guest")?.value;
  if (guest) return `guest_${guest}`;
  return null;
}

export async function POST(req: Request) {
  if (!featureFlagDefaults.ARENA_ENABLED) {
    return NextResponse.json({ error: "ARENA_DISABLED" }, { status: 403 });
  }

  const key = await ownerKey();
  if (!key) {
    return NextResponse.json({ error: "NO_SESSION" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const existing = getTrainingBattle(parsed.data.publicId);
  if (!existing) {
    return NextResponse.json({ error: "BATTLE_NOT_FOUND" }, { status: 404 });
  }

  try {
    const record = submitTrainingTurn({
      publicId: parsed.data.publicId,
      ownerKey: key,
      action: parsed.data.action,
    });
    return NextResponse.json(toClientSnapshot(record));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ERROR";
    const status = msg === "FORBIDDEN" ? 403 : msg === "BATTLE_NOT_ACTIVE" ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
