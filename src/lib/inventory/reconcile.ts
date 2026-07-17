/**
 * Inventory reconciliation helpers (Phase 1 — pure math / demo sync checks).
 * Server inventory is not authoritative yet; these helpers detect drift between
 * expected ledger deltas and observed demo balances.
 */

export type InventoryLine = {
  itemKey: string;
  quantity: number;
};

export type InventoryDelta = {
  itemKey: string;
  delta: number;
};

export type ReconcileResult = {
  ok: boolean;
  expected: InventoryLine[];
  actual: InventoryLine[];
  mismatches: {
    itemKey: string;
    expectedQty: number;
    actualQty: number;
    drift: number;
  }[];
};

function toMap(lines: InventoryLine[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const line of lines) {
    m.set(line.itemKey, (m.get(line.itemKey) ?? 0) + line.quantity);
  }
  return m;
}

/** Apply signed deltas to a starting inventory (negative = consume). */
export function applyInventoryDeltas(
  starting: InventoryLine[],
  deltas: InventoryDelta[],
): InventoryLine[] {
  const m = toMap(starting);
  for (const d of deltas) {
    const next = (m.get(d.itemKey) ?? 0) + d.delta;
    if (next === 0) m.delete(d.itemKey);
    else m.set(d.itemKey, next);
  }
  return [...m.entries()]
    .map(([itemKey, quantity]) => ({ itemKey, quantity }))
    .sort((a, b) => a.itemKey.localeCompare(b.itemKey));
}

/** True when no line would go negative after applying deltas. */
export function canApplyInventoryDeltas(
  starting: InventoryLine[],
  deltas: InventoryDelta[],
): boolean {
  const m = toMap(starting);
  for (const d of deltas) {
    const next = (m.get(d.itemKey) ?? 0) + d.delta;
    if (next < 0) return false;
  }
  return true;
}

/**
 * Compare expected vs actual inventories.
 * Quantities must be non-negative integers; unknown keys are treated as qty 0.
 */
export function reconcileInventories(
  expected: InventoryLine[],
  actual: InventoryLine[],
): ReconcileResult {
  const exp = toMap(expected);
  const act = toMap(actual);
  const keys = new Set([...exp.keys(), ...act.keys()]);
  const mismatches: ReconcileResult["mismatches"] = [];

  for (const itemKey of [...keys].sort()) {
    const expectedQty = exp.get(itemKey) ?? 0;
    const actualQty = act.get(itemKey) ?? 0;
    if (expectedQty !== actualQty) {
      mismatches.push({
        itemKey,
        expectedQty,
        actualQty,
        drift: actualQty - expectedQty,
      });
    }
  }

  return {
    ok: mismatches.length === 0,
    expected: [...exp.entries()]
      .map(([itemKey, quantity]) => ({ itemKey, quantity }))
      .sort((a, b) => a.itemKey.localeCompare(b.itemKey)),
    actual: [...act.entries()]
      .map(([itemKey, quantity]) => ({ itemKey, quantity }))
      .sort((a, b) => a.itemKey.localeCompare(b.itemKey)),
    mismatches,
  };
}
