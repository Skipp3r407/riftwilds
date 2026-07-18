import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { grantOwnedItem, listOwnedItems } from "@/lib/equipment/inventory-store";
import { getCatalogItem } from "@/lib/items/catalog";
import { isEquippableFamily } from "@/lib/equipment/compatibility";

/**
 * Demo / Phase-1 grant after shop purchase.
 * Only catalog ids are accepted — client cannot invent items.
 */
const bodySchema = z.object({
  itemId: z.string().min(1).max(128),
  quantity: z.number().int().min(1).max(99).optional(),
  source: z.enum(["shop", "quest", "demo", "starter"]).optional(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const result = grantOwnedItem(ownerKey, parsed.data.itemId, parsed.data.quantity ?? 1);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "GRANT_REJECTED", message: result.message }, { status: 400 });
  }

  const catalog = getCatalogItem(parsed.data.itemId);
  const res = NextResponse.json({
    ok: true,
    item: result.row,
    catalogName: catalog?.name ?? parsed.data.itemId,
    equippable: catalog ? isEquippableFamily(catalog) : false,
    inventoryCount: listOwnedItems(ownerKey).length,
    source: parsed.data.source ?? "demo",
    neverRequiresSol: true,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

export async function GET() {
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const items = listOwnedItems(ownerKey);
  const res = NextResponse.json({
    items,
    count: items.length,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
