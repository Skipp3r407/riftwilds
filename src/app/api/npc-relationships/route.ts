import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import {
  getNpcBond,
  listBondsForUser,
  recordNpcDeed,
} from "@/lib/npc-relationships";
import { withApiGuard } from "@/lib/security/api-guard";

const bodySchema = z.object({
  action: z.enum(["deed", "get"]),
  npcId: z.string().min(2).max(64),
  kind: z
    .enum([
      "talk",
      "gift",
      "quest_help",
      "quest_betray",
      "defend_in_event",
      "attack",
      "promise_kept",
      "promise_broken",
      "festival_dance",
      "rescue",
    ])
    .optional(),
  detail: z.string().max(200).optional(),
});

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "npc-bonds",
    limit: 100,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const res = NextResponse.json({
    requestId: guard.requestId,
    bonds: listBondsForUser(ownerKey),
    note: "Extends npc-ai client relationships — server deeds are authoritative for titles.",
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "npc-bonds-write",
    limit: 80,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();

  if (parsed.data.action === "get") {
    const bond = getNpcBond(ownerKey, parsed.data.npcId);
    const res = NextResponse.json({
      ok: true,
      bond,
      requestId: guard.requestId,
      ...guestIdentityFields(isGuest, guestToken),
    });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  if (!parsed.data.kind) {
    return NextResponse.json({ ok: false, error: "MISSING_KIND" }, { status: 400 });
  }

  const bond = recordNpcDeed({
    userId: ownerKey,
    npcId: parsed.data.npcId,
    kind: parsed.data.kind,
    detail: parsed.data.detail,
  });
  const res = NextResponse.json({
    ok: true,
    bond,
    requestId: guard.requestId,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
