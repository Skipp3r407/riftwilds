"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Egg, Layers, Swords, Backpack, Home } from "lucide-react";
import { playSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/play", label: "Play", icon: Home },
  { href: "/tcg/battle", label: "Battle", icon: Swords },
  { href: "/tcg/collection", label: "Cards", icon: Layers },
  { href: "/hatchery", label: "Hatch", icon: Egg },
  { href: "/inventory", label: "Pack", icon: Backpack },
];

export function MobileGameNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mobile-game-nav fixed inset-x-0 bottom-0 z-40 border-t border-[var(--stroke)] bg-[rgba(10,10,15,0.62)] px-2 pt-2 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "calc(0.5rem + var(--safe-bottom))" }}
      aria-label="Game"
    >
      <ul className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => playSfx("ui.nav")}
                className={cn(
                  "mobile-game-nav__item focus-ring flex flex-col items-center rounded-xl px-1 py-2 text-[10px]",
                  active ? "mobile-game-nav__item--active" : "text-[var(--text-muted)]",
                )}
              >
                <Icon size={18} />
                <span className="mt-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
