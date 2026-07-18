import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, resolveOwnerKey } from "@/lib/auth/owner-key";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  decorateGarden,
  getMemorial,
  getOrCreateGarden,
  leaveMemorialTribute,
  listAncestorsForOwner,
  listMemorialsForOwner,
  saveGarden,
  saveMemorial,
} from "@/game/spirit";

export async function GET() {
  if (!isFeatureEnabled("MEMORIAL_GARDEN_ENABLED")) {
    return NextResponse.json({ error: "DISABLED" }, { status: 403 });
  }
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const garden = getOrCreateGarden(ownerKey);
  const res = NextResponse.json({
    memorials: listMemorialsForOwner(ownerKey),
    garden,
    ancestors: listAncestorsForOwner(ownerKey),
    note: "Memorials honor Hardcore losses. Normal play never permanently kills Riftlings.",
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

const tributeSchema = z.object({
  memorialId: z.string().min(3),
  text: z.string().min(1).max(280),
  decorate: z.enum(["flowers", "candles", "lanterns"]).optional(),
});

export async function POST(req: Request) {
  if (!isFeatureEnabled("MEMORIAL_GARDEN_ENABLED")) {
    return NextResponse.json({ error: "DISABLED" }, { status: 403 });
  }
  const parsed = tributeSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const memorial = getMemorial(parsed.data.memorialId);
  if (!memorial) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const updated = leaveMemorialTribute(memorial, ownerKey, parsed.data.text);
  saveMemorial(updated);
  let garden = getOrCreateGarden(memorial.ownerKey);
  if (parsed.data.decorate) {
    garden = decorateGarden(garden, parsed.data.decorate, 1);
    saveGarden(garden);
  }
  const res = NextResponse.json({ ok: true, memorial: updated, garden });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
