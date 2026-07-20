"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Backpack,
  Bike,
  BookOpen,
  Droplets,
  Flame,
  Hand,
  HeartHandshake,
  Layers,
  Map,
  MessageCircle,
  ScrollText,
  Smile,
  Store,
  Waves,
} from "lucide-react";
import { LW_HUD_GLASS, LW_HUD_SLOT } from "@/components/live-world/hud-chrome";
import { playSfx } from "@/hooks/use-sfx";

export type HotbarActionId =
  | "interact"
  | "emote"
  | "pet"
  | "map"
  | "chat"
  | "rest"
  | "wave"
  | "inventory"
  | "quest"
  | "cards"
  | "deck"
  | "marketplace"
  | "potion"
  | "mount"
  | "companion";

type SlotTier = "primary" | "quick" | "utility";

type Slot = {
  id: HotbarActionId;
  key: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  tier: SlotTier;
  /** Demo cooldown seconds — visual only unless wired. */
  cooldownSec?: number;
};

const SLOTS: Slot[] = [
  { id: "interact", key: "E", label: "Use", hint: "Interact", icon: Hand, tier: "primary" },
  {
    id: "companion",
    key: "Y",
    label: "Bond",
    hint: "Focus companion",
    icon: HeartHandshake,
    tier: "primary",
  },
  { id: "emote", key: "T", label: "Emote", hint: "Emote wheel", icon: Smile, tier: "quick" },
  { id: "wave", key: "1", label: "Wave", hint: "Social wave", icon: Waves, tier: "quick" },
  { id: "rest", key: "2", label: "Rest", hint: "Campfire rest", icon: Flame, tier: "quick" },
  {
    id: "potion",
    key: "3",
    label: "Potion",
    hint: "Care tonic",
    icon: Droplets,
    tier: "quick",
    cooldownSec: 8,
  },
  {
    id: "mount",
    key: "4",
    label: "Mount",
    hint: "Summon mount",
    icon: Bike,
    tier: "quick",
    cooldownSec: 12,
  },
  { id: "chat", key: "⏎", label: "Chat", hint: "Open chat", icon: MessageCircle, tier: "utility" },
  { id: "map", key: "M", label: "Map", hint: "World map", icon: Map, tier: "utility" },
  { id: "inventory", key: "I", label: "Pack", hint: "Inventory", icon: Backpack, tier: "utility" },
  { id: "quest", key: "J", label: "Quests", hint: "Quest log", icon: ScrollText, tier: "utility" },
  { id: "cards", key: "C", label: "Cards", hint: "Card collection", icon: Layers, tier: "utility" },
  { id: "marketplace", key: "B", label: "Market", hint: "Marketplace", icon: Store, tier: "utility" },
  { id: "deck", key: "K", label: "Deck", hint: "Deck builder", icon: BookOpen, tier: "utility" },
];

type Props = {
  onAction?: (id: HotbarActionId) => void;
  className?: string;
  activeId?: HotbarActionId | null;
};

/**
 * Bottom-center action bar — primary / quick / utility tiers with hotkeys + cooldown chrome.
 * Drag-reorder and controller focus hooks via data attributes.
 */
export function ActionHotbar({ onAction, className = "", activeId = null }: Props) {
  const [cds, setCds] = useState<Record<string, number>>({});
  const [dragId, setDragId] = useState<string | null>(null);

  const fire = (slot: Slot) => {
    playSfx("ui.click");
    if (slot.cooldownSec && (cds[slot.id] ?? 0) > 0) return;
    onAction?.(slot.id);
    if (slot.cooldownSec) {
      setCds((prev) => ({ ...prev, [slot.id]: 100 }));
      const start = Date.now();
      const ms = slot.cooldownSec * 1000;
      const tick = () => {
        const left = Math.max(0, 1 - (Date.now() - start) / ms);
        setCds((prev) => ({ ...prev, [slot.id]: left * 100 }));
        if (left > 0) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  };

  const renderSlot = (slot: Slot) => {
    const Icon = slot.icon;
    const active = activeId === slot.id;
    const tierClass =
      slot.tier === "primary"
        ? "lw-hud-slot--primary"
        : slot.tier === "utility"
          ? "lw-hud-slot--utility"
          : "";
    const cd = cds[slot.id] ?? 0;

    return (
      <button
        key={slot.id}
        type="button"
        title={`${slot.hint} (${slot.key})`}
        aria-label={`${slot.hint} (${slot.key})`}
        aria-pressed={active}
        data-active={active ? "1" : "0"}
        data-tier={slot.tier}
        data-hotkey={slot.key}
        draggable
        onDragStart={() => setDragId(slot.id)}
        onDragEnd={() => setDragId(null)}
        className={`${LW_HUD_SLOT} ${tierClass} ${
          active
            ? "border-[var(--stroke-amber)] bg-[rgba(255,184,77,0.12)] text-[var(--amber)]"
            : ""
        } ${dragId === slot.id ? "opacity-70" : ""}`}
        onClick={() => fire(slot)}
      >
        {cd > 0 ? (
          <span className="lw-hud-slot__cd" style={{ ["--lw-cd" as string]: `${cd}%` }} />
        ) : null}
        <Icon
          className="h-4 w-4 text-[var(--amber)] transition-colors group-hover:text-[var(--radiant)]"
          aria-hidden
          strokeWidth={2}
        />
        <span className="sr-only">{slot.label}</span>
        <span className="lw-hud-slot__key" aria-hidden>
          {slot.key}
        </span>
      </button>
    );
  };

  const primary = SLOTS.filter((s) => s.tier === "primary");
  const quick = SLOTS.filter((s) => s.tier === "quick");
  const utility = SLOTS.filter((s) => s.tier === "utility");

  return (
    <div
      className={`pointer-events-auto ${LW_HUD_GLASS} lw-hud-glass--primary lw-hud-enter flex flex-wrap items-end gap-1 px-1.5 py-1.5 md:gap-1.5 md:px-2 ${className}`}
      data-testid="live-world-action-hotbar"
      role="toolbar"
      aria-label="Keeper skills"
      data-controller-focus="hotbar"
    >
      <div className="flex items-end gap-0.5 md:gap-1" data-tier-group="primary">
        {primary.map(renderSlot)}
      </div>
      <span className="mx-0.5 hidden h-8 w-px bg-[var(--lw-trim)]/40 sm:block" aria-hidden />
      <div className="flex items-end gap-0.5 md:gap-1" data-tier-group="quick">
        {quick.map(renderSlot)}
      </div>
      <span className="mx-0.5 hidden h-7 w-px bg-[var(--lw-trim)]/30 md:block" aria-hidden />
      <div
        className="flex max-w-[11rem] flex-wrap items-end justify-end gap-0.5 sm:max-w-none md:gap-1"
        data-tier-group="utility"
      >
        {utility.map(renderSlot)}
      </div>
    </div>
  );
}
