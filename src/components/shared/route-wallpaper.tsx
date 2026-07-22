"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PageWallpaper, resolveWallpaperForPath } from "@/components/shared/page-wallpaper";
import { shouldOpenPracticeBoard } from "@/lib/tcg/battle-hub";

/**
 * Layout-level wallpaper that auto-selects art from the current route.
 * Sits fixed behind marketing + game shells so panels stay on top.
 */
export function RouteWallpaper() {
  return (
    <Suspense fallback={null}>
      <RouteWallpaperInner />
    </Suspense>
  );
}

function RouteWallpaperInner() {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const resolved = resolveWallpaperForPath(pathname);
  if (!resolved) return null;

  const onBattleRoute =
    pathname === "/tcg/battle" || pathname.startsWith("/tcg/battle/");
  const deskOpen =
    onBattleRoute &&
    shouldOpenPracticeBoard({
      invite: searchParams.get("invite"),
      encounter: searchParams.get("encounter"),
      board: searchParams.get("board"),
      play: searchParams.get("play"),
    });

  const name = deskOpen ? "tcg-battle" : resolved.name;
  const opacity = deskOpen ? 0.64 : resolved.opacity;

  return (
    <div
      className="route-wallpaper pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <PageWallpaper name={name} opacity={opacity} />
    </div>
  );
}
