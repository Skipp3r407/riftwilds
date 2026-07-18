import { getSessionContext } from "@/lib/auth/session";
import { resolveOwnerKey } from "@/lib/auth/owner-key";

export async function resolvePersistenceOwner(): Promise<{
  ownerKey: string;
  userId: string | null;
  isGuest: boolean;
  guestToken: string | null;
}> {
  const session = await getSessionContext();
  const owner = await resolveOwnerKey();
  return {
    ownerKey: session?.userId ? `user_${session.userId}` : owner.ownerKey,
    userId: session?.userId ?? null,
    isGuest: session ? false : owner.isGuest,
    guestToken: owner.guestToken,
  };
}
