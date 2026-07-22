"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyBattleViewportDocumentAttrs,
  clearBattleViewportDocumentAttrs,
  isCompactBattleViewport,
  readBattleA11yPrefs,
  readBattlePerfProfile,
  readHandExpandedDefault,
  resolveBattlePerfProfile,
  resolveBattleViewport,
  writeBattleA11yPrefs,
  writeBattlePerfProfile,
  writeHandExpanded,
  type BattleA11yPrefs,
  type BattlePerfProfile,
  type BattleViewportClass,
} from "@/lib/tcg/battle-viewport";

export type BattleViewportState = {
  viewport: BattleViewportClass;
  compact: boolean;
  portrait: boolean;
  perfStored: BattlePerfProfile;
  perfResolved: Exclude<BattlePerfProfile, "auto">;
  a11y: BattleA11yPrefs;
  handExpanded: boolean;
  setPerfProfile: (p: BattlePerfProfile) => void;
  setA11y: (patch: Partial<BattleA11yPrefs>) => void;
  setHandExpanded: (expanded: boolean) => void;
};

/**
 * Tracks intentional battle viewport class + a11y/perf document attrs.
 * Safe to call outside battle — attrs only applied when `active` is true.
 */
export function useBattleViewport(active: boolean): BattleViewportState {
  const [viewport, setViewport] = useState<BattleViewportClass>("desktop");
  const [perfStored, setPerfStored] = useState<BattlePerfProfile>("auto");
  const [a11y, setA11yState] = useState<BattleA11yPrefs>({
    largeCard: false,
    oneHand: false,
    highContrast: false,
  });
  const [handExpanded, setHandExpandedState] = useState(true);
  const handUserTouched = useRef(false);

  useEffect(() => {
    const sync = () => {
      const vp = resolveBattleViewport(window.innerWidth, window.innerHeight);
      setViewport(vp);
      if (!handUserTouched.current) {
        setHandExpandedState(readHandExpandedDefault(vp));
      }
    };
    setPerfStored(readBattlePerfProfile());
    setA11yState(readBattleA11yPrefs());
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    let mq: MediaQueryList | null = null;
    try {
      mq = window.matchMedia("(orientation: landscape)");
      mq.addEventListener("change", sync);
    } catch {
      /* ignore */
    }
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      mq?.removeEventListener("change", sync);
    };
  }, []);

  const perfResolved = resolveBattlePerfProfile(perfStored, viewport);
  const compact = isCompactBattleViewport(viewport);
  const portrait =
    viewport === "phone-portrait" || viewport === "tablet-portrait";

  useEffect(() => {
    if (!active) {
      clearBattleViewportDocumentAttrs();
      return;
    }
    applyBattleViewportDocumentAttrs({
      viewport,
      perf: perfResolved,
      a11y,
      handExpanded,
    });
    return () => clearBattleViewportDocumentAttrs();
  }, [active, viewport, perfResolved, a11y, handExpanded]);

  const setPerfProfile = useCallback((p: BattlePerfProfile) => {
    setPerfStored(p);
    writeBattlePerfProfile(p);
  }, []);

  const setA11y = useCallback((patch: Partial<BattleA11yPrefs>) => {
    setA11yState((prev) => {
      const next = { ...prev, ...patch };
      writeBattleA11yPrefs(patch);
      return next;
    });
  }, []);

  const setHandExpanded = useCallback((expanded: boolean) => {
    handUserTouched.current = true;
    setHandExpandedState(expanded);
    writeHandExpanded(expanded);
  }, []);

  return {
    viewport,
    compact,
    portrait,
    perfStored,
    perfResolved,
    a11y,
    handExpanded,
    setPerfProfile,
    setA11y,
    setHandExpanded,
  };
}
