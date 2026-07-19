/**
 * Runtime status effects on board units / keepers.
 * Engine-authoritative — UI only displays.
 */

export type TcgStatusId =
  | "poison"
  | "ward"
  | "silenced"
  | "rooted"
  | "empowered"
  | "bloom_stacks"
  | "taunt"
  | "guard"
  | "equipped"
  | "awakened"
  | "echo_ready";

export type TcgStatusInstance = {
  id: TcgStatusId | string;
  stacks: number;
  /** Turns remaining; null = permanent until cleansed. */
  duration: number | null;
  sourceInstanceId?: string;
};

export function hasStatus(
  statuses: TcgStatusInstance[] | undefined,
  id: string,
): boolean {
  return (statuses ?? []).some((s) => s.id === id && s.stacks > 0);
}

export function getStatusStacks(
  statuses: TcgStatusInstance[] | undefined,
  id: string,
): number {
  return (statuses ?? [])
    .filter((s) => s.id === id)
    .reduce((n, s) => n + s.stacks, 0);
}

export function addStatus(
  statuses: TcgStatusInstance[],
  next: TcgStatusInstance,
): TcgStatusInstance[] {
  const copy = [...statuses];
  const idx = copy.findIndex((s) => s.id === next.id);
  if (idx < 0) {
    copy.push({ ...next });
    return copy;
  }
  const cur = copy[idx]!;
  copy[idx] = {
    ...cur,
    stacks: cur.stacks + next.stacks,
    duration:
      cur.duration == null || next.duration == null
        ? null
        : Math.max(cur.duration, next.duration),
    sourceInstanceId: next.sourceInstanceId ?? cur.sourceInstanceId,
  };
  return copy;
}

export function removeStatus(
  statuses: TcgStatusInstance[],
  id: string,
): TcgStatusInstance[] {
  return statuses.filter((s) => s.id !== id);
}

export function consumeWard(
  statuses: TcgStatusInstance[],
): { statuses: TcgStatusInstance[]; blocked: boolean } {
  if (!hasStatus(statuses, "ward")) {
    return { statuses, blocked: false };
  }
  return { statuses: removeStatus(statuses, "ward"), blocked: true };
}

/** Tick durations at end of owning player's turn. */
export function tickStatuses(
  statuses: TcgStatusInstance[],
): TcgStatusInstance[] {
  return statuses
    .map((s) => {
      if (s.duration == null) return s;
      return { ...s, duration: s.duration - 1 };
    })
    .filter((s) => s.duration == null || s.duration > 0);
}
