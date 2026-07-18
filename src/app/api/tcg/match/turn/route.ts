import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { authDefaults } from "@/lib/config/project";
import { snapshotTcgMatch, submitTcgAction } from "@/game/tcg/match-store";

const bodySchema = z.object({
  publicId: z.string().min(4).max(48),
  action: z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("PLAY_CARD"),
      handInstanceId: z.string().min(1).max(48),
      targetInstanceId: z.string().min(1).max(48).optional(),
    }),
    z.object({ kind: z.literal("END_TURN") }),
    z.object({ kind: z.literal("SURRENDER") }),
  ]),
});

async function ownerKey(): Promise<string | null> {
  const jar = await cookies();
  const session = jar.get(authDefaults.COOKIE_NAME)?.value;
  if (session) return `sess_${session.slice(0, 24)}`;
  const guest = jar.get("tcg_guest")?.value;
  if (guest) return `guest_${guest}`;
  return null;
}

export async function POST(req: Request) {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_BODY", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const key = await ownerKey();
  if (!key) {
    return NextResponse.json({ error: "NO_SESSION" }, { status: 401 });
  }

  try {
    const rec = submitTcgAction(
      parsed.data.publicId,
      key,
      parsed.data.action,
    );
    if (!rec) {
      return NextResponse.json({ error: "MATCH_NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json(snapshotTcgMatch(rec));
  } catch (err) {
    const message = err instanceof Error ? err.message : "ACTION_FAILED";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
