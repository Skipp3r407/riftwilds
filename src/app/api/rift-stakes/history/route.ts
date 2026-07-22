import { NextResponse } from "next/server";
import { isRiftStakesEnabled } from "@/game/rift-stakes/config";
import { getRiftStakesStore } from "@/game/rift-stakes/store";
import {
  attachTcgGuestCookie,
  resolveTcgOwnerKey,
} from "@/game/tcg/owner-key";

export async function GET() {
  if (!isRiftStakesEnabled()) {
    return NextResponse.json({ error: "RIFT_STAKES_DISABLED" }, { status: 403 });
  }
  const { key, guestToken } = await resolveTcgOwnerKey();
  const store = getRiftStakesStore();
  const mine = store.matches.filter(
    (m) => m.hostOwnerKey === key || m.guestOwnerKey === key,
  );
  const res = NextResponse.json({
    ownerKey: key,
    matches: mine.slice(0, 50),
    allRecent: store.matches.slice(0, 20),
  });
  return attachTcgGuestCookie(res, guestToken);
}
