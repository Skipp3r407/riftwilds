"use client";

import { Suspense, type ReactNode } from "react";
import { BattleLayoutProvider, useBattleLayoutOptional } from "@/components/tcg/battle-layout-context";
import { cn } from "@/lib/utils/cn";

/**
 * Client chrome around (game) layout children.
 * Applies Focus Mode / Battle Mode shell classes driven by BattleLayoutProvider.
 * When Focus Mode is on an active match desk, the global SiteHeader and mobile
 * nav are omitted so only in-match chrome remains.
 */
function GameShellChromeInner({
  header,
  sidebar,
  children,
  mobileNav,
}: {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  mobileNav: ReactNode;
}) {
  const layout = useBattleLayoutOptional();
  const battleActive = layout?.battleActive ?? false;
  const focusMode = layout?.focusMode ?? false;
  /** Active match desk + Focus Mode: hide global site header / mobile nav chrome. */
  const hideWorldChrome = Boolean(focusMode && battleActive);
  const shellVisual = layout?.shellSidebarVisual ?? "expanded";
  const setSidebarPeek = layout?.setSidebarPeek;

  return (
    <div
      className={cn(
        "relative z-[1] flex min-h-full flex-1 flex-col",
        battleActive && "game-shell--battle",
        hideWorldChrome && "game-shell--focus",
        shellVisual === "collapsed" && "game-shell--sidebar-collapsed",
        shellVisual === "peek" && "game-shell--sidebar-peek",
        shellVisual === "hidden" && "game-shell--sidebar-hidden",
      )}
    >
      {!hideWorldChrome ? (
        <div className="game-shell__header-slot">{header}</div>
      ) : null}

      <div
        className={cn(
          "relative mx-auto flex w-full flex-1 gap-5 px-4 md:px-6 lg:gap-6",
          hideWorldChrome
            ? "game-shell__main--focus pb-3 pt-2 md:pb-3"
            : "pb-24 pt-5 md:pb-10",
          battleActive ? "max-w-none game-shell__main--battle" : "max-w-7xl",
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 surface-grid opacity-50"
          aria-hidden
        />

        {/* Left-edge hover reveal hit target when sidebar is icon-collapsed */}
        {battleActive &&
        (shellVisual === "collapsed" || shellVisual === "hidden") &&
        setSidebarPeek ? (
          <div
            className="shell-sidebar-peek-zone"
            onMouseEnter={() => setSidebarPeek(true)}
            aria-hidden
          />
        ) : null}

        {sidebar}
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      {!hideWorldChrome ? (
        <div className="game-shell__mobile-nav-slot">{mobileNav}</div>
      ) : null}
    </div>
  );
}

export function GameShellChrome({
  header,
  sidebar,
  children,
  mobileNav,
}: {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  mobileNav: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="relative z-[1] flex min-h-full flex-1 flex-col">
          {header}
          <div className="relative mx-auto flex w-full max-w-7xl flex-1 gap-5 px-4 pb-24 pt-5 md:px-6 md:pb-10 lg:gap-6">
            {sidebar}
            <div className="min-w-0 flex-1">{children}</div>
          </div>
          {mobileNav}
        </div>
      }
    >
      <BattleLayoutProvider>
        <GameShellChromeInner
          header={header}
          sidebar={sidebar}
          mobileNav={mobileNav}
        >
          {children}
        </GameShellChromeInner>
      </BattleLayoutProvider>
    </Suspense>
  );
}
