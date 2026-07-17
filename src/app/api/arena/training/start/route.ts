import { NextResponse } from "next/server";
import { z } from "zod";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { startTrainingBattle, toClientSnapshot } from "@/game/arena/training-store";
import { cookies } from "next/headers";
import { authDefaults } from "@/lib/config/project";

const bodySchema = z.object({
  name: z.string().min(1).max(40).optional(),
  speciesSlug: z.string().min(1).max(40).optional(),
  affinity: z
    .enum([
      "EMBER",
      "TIDE",
      "GROVE",
      "STORM",
      "STONE",
      "FROST",
      "RADIANT",
      "VOID",
      "ALLOY",
      "SPIRIT",
    ])
    .optional(),
  weaponId: z.string().optional(),
  level: z.number().int().min(1).max(50).optional(),
  opponentAffinity: z
    .enum([
      "EMBER",
      "TIDE",
      "GROVE",
      "STORM",
      "STONE",
      "FROST",
      "RADIANT",
      "VOID",
      "ALLOY",
      "SPIRIT",
    ])
    .optional(),
});

async function ownerKey(): Promise<string> {
  const jar = await cookies();
  const session = jar.get(authDefaults.COOKIE_NAME)?.value;
  if (session) return `sess_${session.slice(0, 24)}`;
  const guest = jar.get("arena_guest")?.value;
  if (guest) return `guest_${guest}`;
  return `guest_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export async function POST(req: Request) {
  if (!featureFlagDefaults.ARENA_ENABLED) {
    return NextResponse.json({ error: "ARENA_DISABLED" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY", details: parsed.error.flatten() }, { status: 400 });
  }

  const key = await ownerKey();
  const record = startTrainingBattle({
    ownerKey: key,
    player: {
      name: parsed.data.name,
      speciesSlug: parsed.data.speciesSlug,
      affinity: parsed.data.affinity,
      weaponId: parsed.data.weaponId,
      level: parsed.data.level,
    },
    opponentAffinity: parsed.data.opponentAffinity,
  });

  const res = NextResponse.json(toClientSnapshot(record));
  if (key.startsWith("guest_")) {
    const { secureCookieOptions } = await import("@/lib/auth/cookie-options");
    res.cookies.set("arena_guest", key.replace("guest_", ""), secureCookieOptions(60 * 60 * 24 * 30));
  }
  return res;
}
