"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { playSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils/cn";

/** Show after the user has scrolled past this many pixels. */
const SHOW_AFTER_PX = 400;

/**
 * Marketing shell has no MobileGameNav — dock lower (mirrors music-player).
 * Keep in sync with `music-player.tsx` path heuristics so we clear that dock.
 */
const MARKETING_PREFIXES = [
  "/about",
  "/analytics",
  "/bugs",
  "/codex",
  "/coloring",
  "/comics",
  "/community",
  "/creators",
  "/creatures",
  "/docs",
  "/downloads",
  "/economy",
  "/fairness",
  "/fan-kit",
  "/feedback",
  "/legal",
  "/login",
  "/patch-notes",
  "/press",
  "/printables",
  "/token",
  "/transparency",
  "/treasury",
  "/updates",
] as const;

function isMarketingPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/") return true;
  if (pathname === "/economy/credits" || pathname.startsWith("/economy/credits/")) {
    return false;
  }
  return MARKETING_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isBattlePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/tcg/battle" ||
    pathname.startsWith("/tcg/battle/") ||
    pathname === "/battle" ||
    pathname.startsWith("/battle/")
  );
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Site-wide floating control — appears after scrolling down, jumps to top.
 * Sits above the ambience player / mobile game nav; below modals.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const onMarketing = isMarketingPath(pathname);
  const onBattle = isBattlePath(pathname);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  function scrollToTop() {
    playSfx("ui.click");
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  // Position via globals.css (.scroll-to-top / --marketing|--game|--battle).
  // Bottoms = music-player bottoms + --dock-music-height + --dock-stack-gap.
  const pathClass = onBattle
    ? "scroll-to-top--battle"
    : onMarketing
      ? "scroll-to-top--marketing"
      : "scroll-to-top--game";

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "scroll-to-top focus-ring group relative flex h-11 w-11 items-center justify-center",
        pathClass,
        "rounded-xl border border-[var(--stroke-bronze)]",
        "lw-hud-glass text-[var(--amber)]",
        "shadow-[0_10px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(232,213,176,0.12)]",
        "motion-safe:transition-[opacity,transform,border-color,color,box-shadow] motion-safe:duration-200",
        "hover:border-[var(--stroke-amber)] hover:text-[var(--radiant)]",
        "hover:shadow-[0_12px_32px_rgba(0,0,0,0.45),0_0_22px_rgba(255,184,77,0.14),0_0_18px_rgba(61,231,255,0.1)]",
        "active:scale-[0.96]",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ChevronUp
        size={22}
        strokeWidth={2.25}
        className="drop-shadow-[0_0_8px_rgba(255,184,77,0.35)] motion-safe:transition-transform motion-safe:group-hover:-translate-y-0.5"
        aria-hidden
      />
    </button>
  );
}
