"use client";

import { usePathname } from "next/navigation";
import { PageWallpaper, resolveWallpaperForPath } from "@/components/shared/page-wallpaper";

/**
 * Layout-level wallpaper that auto-selects art from the current route.
 * Sits fixed behind marketing + game shells so panels stay on top.
 */
export function RouteWallpaper() {
  const pathname = usePathname() || "/";
  const resolved = resolveWallpaperForPath(pathname);
  if (!resolved) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <PageWallpaper name={resolved.name} opacity={resolved.opacity} />
    </div>
  );
}
