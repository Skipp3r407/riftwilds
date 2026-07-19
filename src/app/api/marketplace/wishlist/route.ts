import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addWishlistEntry,
  listWishlist,
  removeWishlistEntry,
} from "@/lib/marketplace/wishlist";
import { appendMarketplaceTxLog } from "@/lib/marketplace/security";

const bodySchema = z.object({
  keeperId: z.string().min(1).max(64).default("demo-keeper"),
  listingPublicId: z.string().min(2).max(80),
  kind: z.enum(["wishlist", "watchlist"]),
  note: z.string().max(120).optional(),
  action: z.enum(["add", "remove"]).default("add"),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keeperId = searchParams.get("keeperId") ?? "demo-keeper";
  const kind = searchParams.get("kind") as "wishlist" | "watchlist" | null;
  return NextResponse.json({
    entries: listWishlist(keeperId, kind ?? undefined),
  });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { keeperId, listingPublicId, kind, note, action } = parsed.data;
  if (action === "remove") {
    const ok = removeWishlistEntry(keeperId, listingPublicId, kind);
    return NextResponse.json({ ok, entries: listWishlist(keeperId) });
  }
  const entry = addWishlistEntry(keeperId, { listingPublicId, kind, note });
  appendMarketplaceTxLog({
    type: "WISHLIST_ADD",
    actorLabel: keeperId,
    detail: `${kind} ${listingPublicId}`,
  });
  return NextResponse.json({ ok: true, entry, entries: listWishlist(keeperId) });
}
