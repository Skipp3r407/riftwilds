"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Backpack,
  BookOpen,
  Building2,
  ChevronUp,
  Map,
  PawPrint,
  ScrollText,
  Settings,
  Store,
  BookMarked,
  Layers,
} from "lucide-react";
import { LW_HUD_ICON_BTN } from "@/components/live-world/hud-chrome";
import { playSfx } from "@/hooks/use-sfx";

type Props = {
  onOpenMap?: () => void;
  onOpenSettings?: () => void;
  className?: string;
};

type Item = {
  id: string;
  label: string;
  href?: string;
  action?: "map" | "settings";
  icon: typeof Backpack;
  tier: "primary" | "secondary";
};

const ITEMS: Item[] = [
  { id: "inventory", label: "Inventory", href: "/inventory", icon: Backpack, tier: "primary" },
  { id: "quests", label: "Quests", href: "/quests", icon: ScrollText, tier: "primary" },
  { id: "map", label: "Map", action: "map", icon: Map, tier: "primary" },
  { id: "cards", label: "Cards", href: "/collection", icon: Layers, tier: "primary" },
  { id: "riftlings", label: "Riftlings", href: "/collection", icon: PawPrint, tier: "secondary" },
  { id: "skills", label: "Academy", href: "/academy", icon: BookOpen, tier: "secondary" },
  { id: "codex", label: "Codex", href: "/codex", icon: BookMarked, tier: "secondary" },
  { id: "comics", label: "Comics", href: "/comics", icon: BookOpen, tier: "secondary" },
  { id: "market", label: "Market", href: "/marketplace", icon: Store, tier: "secondary" },
  { id: "guild", label: "Guild", href: "/guilds", icon: Building2, tier: "secondary" },
  { id: "settings", label: "Settings", action: "settings", icon: Settings, tier: "secondary" },
];

function MenuButton({
  item,
  onOpenMap,
  onOpenSettings,
}: {
  item: Item;
  onOpenMap?: () => void;
  onOpenSettings?: () => void;
}) {
  const Icon = item.icon;
  const tierClass =
    item.tier === "primary" ? "lw-hud-icon-btn--primary" : "lw-hud-icon-btn--secondary";

  if (item.action === "map") {
    return (
      <button
        type="button"
        className={`${LW_HUD_ICON_BTN} ${tierClass}`}
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
        type="button"
        className={`${LW_HUD_ICON_BTN} ${tierClass}`}
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
      href={item.href!}
      className={`${LW_HUD_ICON_BTN} ${tierClass}`}
      title={item.label}
      aria-label={item.label}
      onClick={() => playSfx("ui.nav")}
    >
      <Icon className="h-4 w-4" aria-hidden strokeWidth={2} />
    </Link>
  );
}

/**
 * Bottom-right world menu — primary shortcuts always visible; secondary in expand tray.
 */
export function WorldRadialMenu({
  onOpenMap,
  onOpenSettings,
  className = "",
}: Props) {
  const [openMore, setOpenMore] = useState(false);
  const primary = ITEMS.filter((i) => i.tier === "primary");
  const secondary = ITEMS.filter((i) => i.tier === "secondary");

  return (
    <nav
      className={`pointer-events-auto flex flex-col items-end gap-1.5 ${className}`}
      data-testid="live-world-radial-menu"
      aria-label="World menu"
    >
      {openMore ? (
        <div className="flex max-w-[11rem] flex-wrap items-center justify-end gap-1.5 md:max-w-[14rem] md:gap-2">
          {secondary.map((item) => (
            <MenuButton
              key={item.id}
              item={item}
              onOpenMap={onOpenMap}
              onOpenSettings={onOpenSettings}
            />
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-end gap-1.5 md:gap-2">
        {primary.map((item) => (
          <MenuButton
            key={item.id}
            item={item}
            onOpenMap={onOpenMap}
            onOpenSettings={onOpenSettings}
          />
        ))}
        <button
          type="button"
          className={`${LW_HUD_ICON_BTN} lw-hud-icon-btn--secondary`}
          title={openMore ? "Hide more" : "More"}
          aria-expanded={openMore}
          aria-label={openMore ? "Hide more menu items" : "Show more menu items"}
          onClick={() => {
            playSfx("ui.click");
            setOpenMore((v) => !v);
          }}
        >
          <ChevronUp
            className={`h-4 w-4 transition-transform ${openMore ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>
    </nav>
  );
}
