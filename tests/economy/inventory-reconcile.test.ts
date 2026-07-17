import { describe, expect, it } from "vitest";
import {
  applyInventoryDeltas,
  canApplyInventoryDeltas,
  reconcileInventories,
} from "@/lib/inventory/reconcile";

describe("inventory reconciliation helpers", () => {
  it("applies purchase and consume deltas", () => {
    const start = [{ itemKey: "ember-potion", quantity: 2 }];
    const next = applyInventoryDeltas(start, [
      { itemKey: "ember-potion", delta: 1 },
      { itemKey: "barkguard-shield", delta: 1 },
      { itemKey: "ember-potion", delta: -1 },
    ]);
    expect(next).toEqual([
      { itemKey: "barkguard-shield", quantity: 1 },
      { itemKey: "ember-potion", quantity: 2 },
    ]);
  });

  it("blocks negative consumption", () => {
    expect(
      canApplyInventoryDeltas([{ itemKey: "x", quantity: 1 }], [{ itemKey: "x", delta: -2 }]),
    ).toBe(false);
  });

  it("detects drift between expected and actual", () => {
    const result = reconcileInventories(
      [
        { itemKey: "a", quantity: 3 },
        { itemKey: "b", quantity: 1 },
      ],
      [
        { itemKey: "a", quantity: 2 },
        { itemKey: "c", quantity: 1 },
      ],
    );
    expect(result.ok).toBe(false);
    expect(result.mismatches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ itemKey: "a", drift: -1 }),
        expect.objectContaining({ itemKey: "b", expectedQty: 1, actualQty: 0 }),
        expect.objectContaining({ itemKey: "c", expectedQty: 0, actualQty: 1 }),
      ]),
    );
  });

  it("passes when inventories match", () => {
    const lines = [
      { itemKey: "z", quantity: 5 },
      { itemKey: "a", quantity: 1 },
    ];
    expect(reconcileInventories(lines, [...lines].reverse()).ok).toBe(true);
  });
});
