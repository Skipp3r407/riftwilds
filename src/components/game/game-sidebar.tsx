"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pin, PinOff, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { playSfx } from "@/hooks/use-sfx";
import { useSocialBadgeCount } from "@/components/social/social-nav-badge";
import { useBattleLayoutOptional } from "@/components/tcg/battle-layout-context";
import { projectConfig } from "@/lib/config/project";
import { extraSidebarNav, sidebarNavGroups } from "@/lib/config/nav";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string) {
  const pathOnly = href.split("?")[0] ?? href;
  if (pathOnly === "/play") return pathname === "/play";
  if (pathOnly === "/tcg/battle") {
    return pathname === "/tcg/battle" || pathname.startsWith("/tcg/battle/");
  }
  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}

/** Short labels / initials for icon-rail mode during battle Focus Mode. */
function railLabel(label: string) {
  const words = label.trim().split(/\s+/);
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function GameSidebar() {
  const pathname = usePathname();
  const socialBadge = useSocialBadgeCount();
  const layout = useBattleLayoutOptional();
  const battleActive = layout?.battleActive ?? false;
  const shellVisual = layout?.shellSidebarVisual ?? "expanded";
  const compact = battleActive && shellVisual === "collapsed";
  const hidden = battleActive && shellVisual === "hidden";
  const peeking = battleActive && shellVisual === "peek";

  return (
    <aside
      className={cn(
        "shell-sidebar hidden shrink-0 p-4 lg:block",
        compact ? "shell-sidebar--rail w-[4.25rem] px-2" : "w-60",
        peeking && "shell-sidebar--peek",
        hidden && "shell-sidebar--battle-hidden",
      )}
      onMouseLeave={() => {
        if (peeking) layout?.setSidebarPeek(false);
      }}
      data-shell-visual={shellVisual}
    >
      <div
        className={cn(
          "relative z-[1] flex items-center gap-2",
          compact ? "justify-center px-0" : "px-1",
        )}
      >
        <span
          className="inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--cyan)] shadow-[0_0_10px_var(--cyan)]"
          aria-hidden
        />
        {!compact ? (
          <p className="font-display text-[11px] uppercase tracking-[0.22em] text-[var(--cyan)]">
            {projectConfig.UNIVERSE_NAME}
          </p>
        ) : null}
      </div>
      {!compact ? (
        <p className="relative z-[1] mt-1 px-1 text-[11px] text-[var(--text-dim)]">
          Riftwilds keep
        </p>
      ) : null}

      {battleActive ? (
        <div
          className={cn(
            "relative z-[1] mt-3 flex gap-1",
            compact ? "flex-col items-center" : "items-center justify-between px-1",
          )}
        >
          <button
            type="button"
            className="shell-sidebar__ctrl focus-ring"
            title={
              layout?.sidebarPinned
                ? "Unpin sidebar (Tab)"
                : "Pin sidebar open (Tab)"
            }
            aria-pressed={Boolean(layout?.sidebarPinned)}
            onClick={() => {
              playSfx("ui.nav");
              layout?.toggleShellSidebar();
            }}
          >
            {layout?.sidebarPinned || shellVisual === "expanded" ? (
              <PinOff className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Pin className="h-3.5 w-3.5" aria-hidden />
            )}
            <span className="sr-only">
              {layout?.sidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
            </span>
          </button>
          {!compact ? (
            <button
              type="button"
              className="shell-sidebar__ctrl focus-ring"
              title="Collapse sidebar (Tab)"
              onClick={() => {
                playSfx("ui.nav");
                layout?.setSidebarPinned(false);
                layout?.setSidebarPeek(false);
              }}
            >
              <PanelLeftClose className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">Collapse sidebar</span>
            </button>
          ) : (
            <button
              type="button"
              className="shell-sidebar__ctrl focus-ring"
              title="Expand sidebar (Tab)"
              onClick={() => {
                playSfx("ui.nav");
                layout?.setSidebarPinned(true);
                layout?.setSidebarPeek(false);
              }}
            >
              <PanelLeftOpen className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">Expand sidebar</span>
            </button>
          )}
        </div>
      ) : null}

      <nav
        className={cn(
          "relative z-[1] mt-5 flex flex-col",
          compact ? "gap-1.5" : "gap-3",
        )}
        aria-label="Game sidebar"
      >
        {sidebarNavGroups.map((group) => (
          <div key={group.id}>
            {!compact ? (
              <p className="mb-1 px-3 text-[10px] uppercase tracking-[0.18em] text-[var(--amber)]">
                {group.label}
              </p>
            ) : null}
            <div className={cn("flex flex-col", compact ? "gap-1" : "gap-0.5")}>
              {group.items.map((link) => {
                const active = isActive(pathname, link.href);
                const showSocialBadge = link.href === "/social" && socialBadge > 0;
                const statusBadge = link.badge;
                return (
                  <Link
                    key={`${group.id}:${link.href}`}
                    href={
                      link.href === "/social" && showSocialBadge
                        ? "/social?tab=messages"
                        : link.href
                    }
                    onClick={() => playSfx("ui.nav")}
                    className={cn(
                      "nav-link focus-ring",
                      active && "nav-link--active",
                      compact && "nav-link--rail",
                    )}
                    aria-current={active ? "page" : undefined}
                    title={compact ? link.label : undefined}
                  >
                    {compact ? (
                      <span className="nav-link__rail-glyph" aria-hidden>
                        {railLabel(link.label)}
                      </span>
                    ) : (
                      <span className="hud-nav__dropdown-item">
                        <span className="hud-nav__dropdown-item-label flex w-full items-center justify-between gap-2">
                          <span>{link.label}</span>
                          {showSocialBadge ? (
                            <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[var(--amber)] px-1 text-[10px] font-medium text-black">
                              {socialBadge > 9 ? "9+" : socialBadge}
                            </span>
                          ) : null}
                        </span>
                        {statusBadge && !showSocialBadge ? (
                          <span
                            className="hud-nav__dropdown-item-badge"
                            title={statusBadge}
                          >
                            {statusBadge}
                          </span>
                        ) : null}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {!compact ? (
          <>
            <div className="my-1 border-t border-[rgba(61,231,255,0.14)]" />
            <p className="mb-1 px-3 text-[10px] uppercase tracking-[0.18em] text-[var(--amber)]">
              Account
            </p>
            {extraSidebarNav.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => playSfx("ui.nav")}
                  className={cn("nav-link focus-ring", active && "nav-link--active")}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </>
        ) : null}
      </nav>
    </aside>
  );
}
