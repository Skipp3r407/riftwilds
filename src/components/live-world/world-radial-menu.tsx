"use client";

import Link from "next/link";
import {
  Backpack,
  BookOpen,
  Building2,
  Map,
  PawPrint,
  ScrollText,
  Settings,
  Store,
} from "lucide-react";
import { LW_HUD_ICON_BTN } from "@/components/live-world/hud-chrome";
import { playSfx } from "@/hooks/use-sfx";

type Props = {
  onOpenMap?: () => void;
  onOpenSettings?: () => void;
  className?: string;
};

const ITEMS: {
  id: string;
  label: string;
  href?: string;
  action?: "map" | "settings";
  icon: typeof Backpack;
}[] = [
  { id: "inventory", label: "Inventory", href: "/inventory", icon: Backpack },
  { id: "skills", label: "Academy", href: "/academy", icon: BookOpen },
  { id: "riftlings", label: "Riftlings", href: "/collection", icon: PawPrint },
  { id: "quests", label: "Quests", href: "/quests", icon: ScrollText },
  { id: "map", label: "Map", action: "map", icon: Map },
  { id: "market", label: "Market", href: "/marketplace", icon: Store },
  { id: "guild", label: "Guild", href: "/guilds", icon: Building2 },
  { id: "settings", label: "Settings", action: "settings", icon: Settings },
];

/**
 * Bottom-right circular menu — links to existing game routes / in-world panels.
 * Skills → Academy (no dedicated /skills route yet).
 */
export function WorldRadialMenu({
  onOpenMap,
  onOpenSettings,
  className = "",
}: Props) {
  return (
    <nav
      className={`pointer-events-auto flex flex-wrap items-center justify-end gap-1.5 md:gap-2 ${className}`}
      data-testid="live-world-radial-menu"
      aria-label="World menu"
    >
      {ITEMS.map((item) => {
        const Icon = item.icon;

        if (item.action === "map") {
          return (
            <button
              key={item.id}
              type="button"
              className={LW_HUD_ICON_BTN}
              title={item.label}
              aria-label={item.label}
              onClick={() => {
                playSfx("ui.click");
                onOpenMap?.();
              }}
            >
              <Icon className="h-4 w-4" aria-hidden strokeWidth={2} />
            </button>
          );
        }
        if (item.action === "settings") {
          return (
            <button
              key={item.id}
              type="button"
              className={LW_HUD_ICON_BTN}
              title={item.label}
              aria-label={item.label}
              onClick={() => {
                playSfx("ui.click");
                onOpenSettings?.();
              }}
            >
              <Icon className="h-4 w-4" aria-hidden strokeWidth={2} />
            </button>
          );
        }
        return (
          <Link
            key={item.id}
            href={item.href!}
            className={LW_HUD_ICON_BTN}
            title={item.label}
            aria-label={item.label}
            onClick={() => playSfx("ui.nav")}
          >
            <Icon className="h-4 w-4" aria-hidden strokeWidth={2} />
          </Link>
        );
      })}
    </nav>
  );
}
