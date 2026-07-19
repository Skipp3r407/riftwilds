import type { Session, StorageObject } from "@heroiclabs/nakama-js";
import { getNakamaClient } from "@/lib/nakama/client";
import { isNakamaSliceEnabled } from "@/lib/nakama/config";

/** Soft prefs only — never Credits balances, SOL, or escrow state. */
export const PLAYER_PREFS_COLLECTION = "rift_player_prefs";

function assertStorage(): void {
  if (!isNakamaSliceEnabled("NAKAMA_STORAGE_BRIDGE_ENABLED")) {
    throw new Error("NAKAMA_STORAGE_BRIDGE_DISABLED");
  }
}

export async function writePlayerPrefs(
  session: Session,
  key: string,
  value: Record<string, unknown>,
): Promise<void> {
  assertStorage();
  const client = getNakamaClient();
  await client.writeStorageObjects(session, [
    {
      collection: PLAYER_PREFS_COLLECTION,
      key,
      value,
      permission_read: 1,
      permission_write: 1,
    },
  ]);
}

export async function readPlayerPrefs(
  session: Session,
  key: string,
): Promise<StorageObject | null> {
  assertStorage();
  const client = getNakamaClient();
  const userId = session.user_id;
  if (!userId) return null;
  const result = await client.readStorageObjects(session, {
    object_ids: [
      {
        collection: PLAYER_PREFS_COLLECTION,
        key,
        user_id: userId,
      },
    ],
  });
  return result.objects?.[0] ?? null;
}
