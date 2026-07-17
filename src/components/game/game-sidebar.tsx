"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { projectConfig } from "@/lib/config/project";
import { extraSidebarNav, sidebarNav } from "@/lib/config/nav";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string) {
  if (href === "/play") return pathname === "/play";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function GameSidebar() {
  const pathname = usePathname();

  return (
    <aside className="shell-sidebar hidden w-60 shrink-0 p-4 lg:block">
      <div className="flex items-center gap-2 px-1">
        <span
          className="inline-block h-2 w-2 rounded-full bg-[var(--cyan)] shadow-[0_0_10px_var(--cyan)]"
          aria-hidden
        />
        <p className="font-display text-[11px] uppercase tracking-[0.22em] text-[var(--cyan)]">
          {projectConfig.UNIVERSE_NAME}
        </p>
      </div>
      <p className="mt-1 px-1 text-[11px] text-[var(--text-dim)]">Keeper ops console</p>

      <nav className="mt-5 flex flex-col gap-0.5" aria-label="Game sidebar">
        {sidebarNav.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn("nav-link focus-ring", active && "nav-link--active")}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
        <div className="my-3 border-t border-[var(--stroke)]" />
        <p className="mb-1 px-3 text-[10px] uppercase tracking-[0.18em] text-[var(--text-dim)]">
          Account
        </p>
        {extraSidebarNav.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
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
