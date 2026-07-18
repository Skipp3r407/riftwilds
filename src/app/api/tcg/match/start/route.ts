import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { authDefaults } from "@/lib/config/project";
import { getActiveDeckList } from "@/game/tcg/collection-store";
import { materializeDeck, validateContentDeckList } from "@/game/tcg/deck";
import { snapshotTcgMatch, startTcgMatch } from "@/game/tcg/match-store";

const bodySchema = z.object({
  playerName: z.string().min(1).max(40).optional(),
  encounter: z
    .object({
      enemyId: z.string().min(1).max(64),
      regionSlug: z.string().min(1).max(64),
      returnTo: z.string().min(1).max(200),
    })
    .optional(),
});

async function ownerKey(): Promise<string> {
  const jar = await cookies();
  const session = jar.get(authDefaults.COOKIE_NAME)?.value;
  if (session) return `sess_${session.slice(0, 24)}`;
  const guest = jar.get("tcg_guest")?.value;
  if (guest) return `guest_${guest}`;
  return `guest_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
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
  const deckList = getActiveDeckList(key);
  // Starter / content decks may exceed constructed copy limits intentionally.
  const valid = validateContentDeckList(deckList);
  if (!valid.ok) {
    return NextResponse.json({ error: "INVALID_DECK", reason: valid.reason }, { status: 400 });
  }

  const rec = startTcgMatch(key, {
    playerName: parsed.data.playerName,
    playerDeck: materializeDeck(deckList),
    encounter: parsed.data.encounter,
  });

  const res = NextResponse.json(snapshotTcgMatch(rec));
  if (key.startsWith("guest_")) {
    res.cookies.set("tcg_guest", key.replace(/^guest_/, ""), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }
  return res;
}
