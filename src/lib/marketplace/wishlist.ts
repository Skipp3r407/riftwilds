/**
 * Wishlist + watchlist — in-memory demo store (session-scoped on server).
 * Client may also mirror via localStorage in UI.
 */

export type WishlistEntry = {
  listingPublicId: string;
  kind: "wishlist" | "watchlist";
  note?: string;
  addedAt: string;
};

const store = new Map<string, WishlistEntry[]>();

function keyFor(keeperId: string) {
  return keeperId.trim() || "demo-keeper";
}

export function listWishlist(keeperId: string, kind?: "wishlist" | "watchlist"): WishlistEntry[] {
  const rows = store.get(keyFor(keeperId)) ?? [];
  return kind ? rows.filter((r) => r.kind === kind) : rows;
}

export function addWishlistEntry(
  keeperId: string,
  entry: Omit<WishlistEntry, "addedAt"> & { addedAt?: string },
): WishlistEntry {
  const k = keyFor(keeperId);
  const rows = store.get(k) ?? [];
  const next: WishlistEntry = {
    listingPublicId: entry.listingPublicId,
    kind: entry.kind,
    note: entry.note,
    addedAt: entry.addedAt ?? new Date().toISOString(),
  };
  const filtered = rows.filter(
    (r) => !(r.listingPublicId === next.listingPublicId && r.kind === next.kind),
  );
  filtered.unshift(next);
  store.set(k, filtered.slice(0, 100));
  return next;
}

export function removeWishlistEntry(
  keeperId: string,
  listingPublicId: string,
  kind: "wishlist" | "watchlist",
): boolean {
  const k = keyFor(keeperId);
  const rows = store.get(k) ?? [];
  const next = rows.filter((r) => !(r.listingPublicId === listingPublicId && r.kind === kind));
  store.set(k, next);
  return next.length !== rows.length;
}
