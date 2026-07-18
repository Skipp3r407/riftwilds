import {
  applyTcgAction,
  createTcgMatch,
  toTcgClientSnapshot,
  type CreateMatchInput,
} from "@/game/tcg/match-engine";
import type { TcgMatchState, TcgPlayAction } from "@/game/tcg/types";

type Record = {
  ownerKey: string;
  state: TcgMatchState;
  createdAt: number;
};

const matches = new Map<string, Record>();

function publicId(): string {
  return `tcg_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export function startTcgMatch(
  ownerKey: string,
  input: Omit<CreateMatchInput, "publicId"> = {},
) {
  const id = publicId();
  const state = createTcgMatch({ ...input, publicId: id });
  matches.set(id, { ownerKey, state, createdAt: Date.now() });
  return matches.get(id)!;
}

export function getTcgMatch(publicId: string, ownerKey: string): Record | null {
  const rec = matches.get(publicId);
  if (!rec || rec.ownerKey !== ownerKey) return null;
  return rec;
}

export function submitTcgAction(
  publicId: string,
  ownerKey: string,
  action: TcgPlayAction,
) {
  const rec = getTcgMatch(publicId, ownerKey);
  if (!rec) return null;
  applyTcgAction(rec.state, "player", action);
  return rec;
}

export function snapshotTcgMatch(rec: Record) {
  return toTcgClientSnapshot(rec.state);
}

/** Test helper */
export function __clearTcgMatchesForTests(): void {
  matches.clear();
}
