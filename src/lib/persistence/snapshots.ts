import { listSnapshots, type SnapshotRecord } from "@/lib/persistence/memory-store";

export function listOwnerSnapshots(ownerKey: string): SnapshotRecord[] {
  return listSnapshots(ownerKey);
}

export function findSnapshotByRequestId(
  ownerKey: string,
  requestId: string,
): SnapshotRecord | null {
  return listSnapshots(ownerKey).find((s) => s.requestId === requestId) ?? null;
}
