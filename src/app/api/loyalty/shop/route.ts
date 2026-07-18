import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { LOYALTY_SHOP_CATALOG } from "@/lib/loyalty/config";
import { purchaseLoyaltyShopItem } from "@/lib/loyalty/service";
import { withApiGuard } from "@/lib/security/api-guard";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "loyalty-shop",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  return NextResponse.json({
    ok: true,
    catalog: LOYALTY_SHOP_CATALOG,
    note: "Cosmetics, titles, badges, and housing only — never gameplay advantages.",
    requestId: guard.requestId,
  });
}

const buySchema = z.object({ itemId: z.string().min(1).max(64) });

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "loyalty-shop-buy",
    limit: 30,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const parsed = buySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const result = purchaseLoyaltyShopItem({ userId: ownerKey, itemId: parsed.data.itemId });
  const res = NextResponse.json({
    requestId: guard.requestId,
    ...result,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
