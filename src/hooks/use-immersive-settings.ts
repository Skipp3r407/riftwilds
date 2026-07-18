"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadImmersiveSettings,
  persistImmersiveSettings,
  type ImmersiveSettings,
} from "@/game/live-world/systems/immersive";

export function useImmersiveSettings() {
  const [settings, setSettings] = useState<ImmersiveSettings>(() => loadImmersiveSettings());

  useEffect(() => {
    setSettings(loadImmersiveSettings());
  }, []);

  const update = useCallback(
    (
      patch:
        | Partial<ImmersiveSettings>
        | ((prev: ImmersiveSettings) => Partial<ImmersiveSettings>),
    ) => {
      setSettings((prev) => {
        const resolved = typeof patch === "function" ? patch(prev) : patch;
        const next = { ...prev, ...resolved };
        persistImmersiveSettings(next);
        return next;
      });
    },
    [],
  );

  const replace = useCallback((next: ImmersiveSettings) => {
    persistImmersiveSettings(next);
    setSettings(next);
  }, []);

  return { settings, update, replace };
}
