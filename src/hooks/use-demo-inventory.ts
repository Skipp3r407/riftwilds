"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEMO_INVENTORY_STORAGE_KEY,
  DEMO_STARTER_INVENTORY,
  grantDemoInventoryItem,
  parseDemoInventory,
  type DemoInventoryRow,
} from "@/lib/shop/demo-inventory";
import type { ItemRarity } from "@/lib/items/types";

export function useDemoInventory() {
  const [rows, setRows] = useState<DemoInventoryRow[]>(DEMO_STARTER_INVENTORY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DEMO_INVENTORY_STORAGE_KEY);
      if (raw) {
        setRows(parseDemoInventory(raw));
      } else {
        localStorage.setItem(
          DEMO_INVENTORY_STORAGE_KEY,
          JSON.stringify(DEMO_STARTER_INVENTORY),
        );
        setRows([...DEMO_STARTER_INVENTORY]);
      }
    } catch {
      setRows([...DEMO_STARTER_INVENTORY]);
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: DemoInventoryRow[]) => {
    setRows(next);
    try {
      localStorage.setItem(DEMO_INVENTORY_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const grantItem = useCallback(
    (item: {
      id: string;
      name: string;
      family: string;
      rarity: ItemRarity;
      iconPath: string;
    }) => {
      setRows((prev) => {
        const next = grantDemoInventoryItem(prev, item);
        try {
          localStorage.setItem(DEMO_INVENTORY_STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  return { ready, rows, setRows: persist, grantItem };
}
