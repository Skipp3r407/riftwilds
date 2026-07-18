"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { playSfx } from "@/hooks/use-sfx";
import { useSocialBadgeCount } from "@/components/social/social-nav-badge";
import { projectConfig } from "@/lib/config/project";
import { extraSidebarNav, sidebarNav } from "@/lib/config/nav";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string) {
  if (href === "/play") return pathname === "/play";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function GameSidebar() {
  const pathname = usePathname();
  const socialBadge = useSocialBadgeCount();

  return (
    <aside className="shell-sidebar hidden w-60 shrink-0 p-4 lg:block">
      <div className="relative z-[1] flex items-center gap-2 px-1">
        <span
          className="inline-block h-2 w-2 rounded-full bg-[var(--cyan)] shadow-[0_0_10px_var(--cyan)]"
          aria-hidden
        />
        <p className="font-display text-[11px] uppercase tracking-[0.22em] text-[var(--cyan)]">
          {projectConfig.UNIVERSE_NAME}
        </p>
      </div>
      <p className="relative z-[1] mt-1 px-1 text-[11px] text-[var(--text-dim)]">Keeper ops console</p>

      <nav className="relative z-[1] mt-5 flex flex-col gap-0.5" aria-label="Game sidebar">
        {sidebarNav.map((link) => {
          const active = isActive(pathname, link.href);
          const showSocialBadge = link.href === "/social" && socialBadge > 0;
          const statusBadge = link.badge;
          return (
            <Link
              key={link.href}
              href={
                link.href === "/social" && showSocialBadge
                  ? "/social?tab=messages"
                  : link.href
              }
              onClick={() => playSfx("ui.nav")}
              className={cn("nav-link focus-ring", active && "nav-link--active")}
              aria-current={active ? "page" : undefined}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span>{link.label}</span>
                {showSocialBadge ? (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--amber)] px-1 text-[10px] font-medium text-black">
                    {socialBadge > 9 ? "9+" : socialBadge}
                  </span>
                ) : statusBadge ? (
                  <span className="shrink-0 font-display text-[9px] uppercase tracking-[0.12em] text-[var(--amber)]">
                    {statusBadge}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
        <div className="my-3 border-t border-[rgba(61,231,255,0.14)]" />
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
      </nav>
    </aside>
  );
}
