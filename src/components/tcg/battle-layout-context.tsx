"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  isActiveBattleSearch,
  readBattleLayoutPreset,
  readBattleSidebarMode,
  writeBattleLayoutPreset,
  writeBattleSidebarMode,
  type BattleLayoutPreset,
  type BattleSidebarMode,
} from "@/lib/tcg/battle-layout-prefs";

type ShellSidebarVisual = "expanded" | "collapsed" | "hidden" | "peek";

type BattleLayoutContextValue = {
  /** Practice Board / invite / encounter desk is open. */
  battleActive: boolean;
  /** Focus Mode — hide site header / collapse world chrome, expand battlefield. Auto-on in battle. */
  focusMode: boolean;
  setFocusMode: (on: boolean) => void;
  layoutPreset: BattleLayoutPreset;
  setLayoutPreset: (preset: BattleLayoutPreset) => void;
  sidebarMode: BattleSidebarMode;
  setSidebarMode: (mode: BattleSidebarMode) => void;
  /** User pinned the shell sidebar open (overrides auto-collapse). */
  sidebarPinned: boolean;
  setSidebarPinned: (pinned: boolean) => void;
  /** Transient hover reveal along the left edge. */
  sidebarPeek: boolean;
  setSidebarPeek: (peek: boolean) => void;
  /** Resolved visual for CSS / GameSidebar. */
  shellSidebarVisual: ShellSidebarVisual;
  toggleShellSidebar: () => void;
  /** ESC battle menu overlay. */
  battleMenuOpen: boolean;
  setBattleMenuOpen: (open: boolean) => void;
  /** Combat VFX playing — fade intel/feed. */
  combatAnimating: boolean;
  setCombatAnimating: (on: boolean) => void;
};

const BattleLayoutContext = createContext<BattleLayoutContextValue | null>(null);

function applyDocumentAttrs(opts: {
  battleActive: boolean;
  focusMode: boolean;
  layoutPreset: BattleLayoutPreset;
  shellSidebarVisual: ShellSidebarVisual;
  combatAnimating: boolean;
}) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.battleActive = opts.battleActive ? "true" : "false";
  root.dataset.battleFocus = opts.focusMode && opts.battleActive ? "true" : "false";
  root.dataset.battleLayout = opts.layoutPreset;
  root.dataset.shellSidebar = opts.shellSidebarVisual;
  root.dataset.battleCombat = opts.combatAnimating ? "true" : "false";
}

export function BattleLayoutProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const battleActive = isActiveBattleSearch(pathname, searchParams);

  const [focusMode, setFocusMode] = useState(true);
  const [layoutPreset, setLayoutPresetState] = useState<BattleLayoutPreset>("immersive");
  const [sidebarMode, setSidebarModeState] = useState<BattleSidebarMode>("auto-collapse");
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [sidebarPeek, setSidebarPeek] = useState(false);
  const [battleMenuOpen, setBattleMenuOpen] = useState(false);
  const [combatAnimating, setCombatAnimating] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLayoutPresetState(readBattleLayoutPreset());
    setSidebarModeState(readBattleSidebarMode());
    setHydrated(true);
  }, []);

  // Focus Mode auto-on when entering an active match desk.
  useEffect(() => {
    if (battleActive) {
      setFocusMode(true);
      setSidebarPinned(false);
      setSidebarPeek(false);
      setBattleMenuOpen(false);
    } else {
      setFocusMode(false);
      setCombatAnimating(false);
      setBattleMenuOpen(false);
    }
  }, [battleActive]);

  const setLayoutPreset = useCallback((preset: BattleLayoutPreset) => {
    setLayoutPresetState(preset);
    writeBattleLayoutPreset(preset);
  }, []);

  const setSidebarMode = useCallback((mode: BattleSidebarMode) => {
    setSidebarModeState(mode);
    writeBattleSidebarMode(mode);
    if (mode === "always-open") setSidebarPinned(true);
    if (mode === "hidden-during-battle") setSidebarPinned(false);
  }, []);

  const shellSidebarVisual: ShellSidebarVisual = useMemo(() => {
    if (!battleActive || !hydrated) return "expanded";
    if (sidebarMode === "hidden-during-battle") {
      return sidebarPeek ? "peek" : "hidden";
    }
    if (sidebarMode === "always-open") return "expanded";
    // auto-collapse
    if (sidebarPinned) return "expanded";
    if (sidebarPeek) return "peek";
    return "collapsed";
  }, [battleActive, hydrated, sidebarMode, sidebarPinned, sidebarPeek]);

  const toggleShellSidebar = useCallback(() => {
    if (!battleActive) return;
    if (sidebarMode === "hidden-during-battle") {
      // Temporarily peek via pin into auto-collapse UX
      setSidebarModeState("auto-collapse");
      writeBattleSidebarMode("auto-collapse");
      setSidebarPinned(true);
      return;
    }
    if (sidebarMode === "always-open") {
      setSidebarPinned(false);
      setSidebarModeState("auto-collapse");
      writeBattleSidebarMode("auto-collapse");
      return;
    }
    setSidebarPinned((prev) => !prev);
    setSidebarPeek(false);
  }, [battleActive, sidebarMode]);

  useEffect(() => {
    applyDocumentAttrs({
      battleActive,
      focusMode,
      layoutPreset,
      shellSidebarVisual,
      combatAnimating,
    });
    return () => {
      applyDocumentAttrs({
        battleActive: false,
        focusMode: false,
        layoutPreset: "immersive",
        shellSidebarVisual: "expanded",
        combatAnimating: false,
      });
    };
  }, [battleActive, focusMode, layoutPreset, shellSidebarVisual, combatAnimating]);

  // Global shortcuts while battle desk is active.
  useEffect(() => {
    if (!battleActive) return;

    const isTypingTarget = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (el.isContentEditable) return true;
      return Boolean(el.closest("[contenteditable='true']"));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;

      if (e.key === "Tab" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Toggle shell sidebar — prevent focus-trap jump across the page.
        e.preventDefault();
        toggleShellSidebar();
        return;
      }

      if (e.key === "F11") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("riftwilds:battle-toggle-fullscreen"));
        return;
      }

      if (e.key === "Escape") {
        if (battleMenuOpen) {
          e.preventDefault();
          setBattleMenuOpen(false);
          return;
        }
        e.preventDefault();
        setBattleMenuOpen(true);
        return;
      }

      if (e.code === "Space" || e.key === " ") {
        if (isTypingTarget(e.target)) return;
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("riftwilds:battle-end-turn"));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [battleActive, battleMenuOpen, toggleShellSidebar]);

  const value = useMemo<BattleLayoutContextValue>(
    () => ({
      battleActive,
      focusMode,
      setFocusMode,
      layoutPreset,
      setLayoutPreset,
      sidebarMode,
      setSidebarMode,
      sidebarPinned,
      setSidebarPinned,
      sidebarPeek,
      setSidebarPeek,
      shellSidebarVisual,
      toggleShellSidebar,
      battleMenuOpen,
      setBattleMenuOpen,
      combatAnimating,
      setCombatAnimating,
    }),
    [
      battleActive,
      focusMode,
      layoutPreset,
      setLayoutPreset,
      sidebarMode,
      setSidebarMode,
      sidebarPinned,
      sidebarPeek,
      shellSidebarVisual,
      toggleShellSidebar,
      battleMenuOpen,
      combatAnimating,
    ],
  );

  return (
    <BattleLayoutContext.Provider value={value}>{children}</BattleLayoutContext.Provider>
  );
}

export function useBattleLayout() {
  const ctx = useContext(BattleLayoutContext);
  if (!ctx) {
    throw new Error("useBattleLayout must be used within BattleLayoutProvider");
  }
  return ctx;
}

/** Safe optional access when provider may be absent (e.g. tests). */
export function useBattleLayoutOptional() {
  return useContext(BattleLayoutContext);
}
