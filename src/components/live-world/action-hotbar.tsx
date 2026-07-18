"use client";

import type { LucideIcon } from "lucide-react";
import {
  Backpack,
  Flame,
  Hand,
  HeartHandshake,
  Map,
  MessageCircle,
  Smile,
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
  | "inventory";

type Slot = {
  id: HotbarActionId;
  key: string;
  label: string;
  hint: string;
  icon: LucideIcon;
};

const SLOTS: Slot[] = [
  { id: "interact", key: "E", label: "Use", hint: "Interact", icon: Hand },
  { id: "emote", key: "T", label: "Emote", hint: "Emote wheel", icon: Smile },
  { id: "pet", key: "Y", label: "Bond", hint: "Focus companion", icon: HeartHandshake },
  { id: "wave", key: "1", label: "Wave", hint: "Social wave", icon: Waves },
  { id: "rest", key: "2", label: "Rest", hint: "Campfire rest", icon: Flame },
  { id: "chat", key: "⏎", label: "Chat", hint: "Open chat", icon: MessageCircle },
  { id: "map", key: "M", label: "Map", hint: "World map", icon: Map },
  { id: "inventory", key: "I", label: "Pack", hint: "Inventory", icon: Backpack },
];

type Props = {
  onAction?: (id: HotbarActionId) => void;
  className?: string;
  /** Optional highlight for the currently relevant action (e.g. interact). */
  activeId?: HotbarActionId | null;
};

/**
 * Bottom-center action bar — life/social skills only (no fake combat cooldowns).
 * Sits beside VitalOrbs so orbs + skills read as one organized dock.
 */
export function ActionHotbar({ onAction, className = "", activeId = null }: Props) {
  return (
    <div
      className={`pointer-events-auto ${LW_HUD_GLASS} flex items-center gap-0.5 px-1.5 py-1 md:gap-1 md:px-2 ${className}`}
      data-testid="live-world-action-hotbar"
      role="toolbar"
      aria-label="Keeper skills"
    >
      {SLOTS.map((slot) => {
        const Icon = slot.icon;
        const active = activeId === slot.id;
        return (
          <button
            key={slot.id}
            type="button"
            title={`${slot.hint} (${slot.key})`}
            aria-label={`${slot.hint} (${slot.key})`}
            aria-pressed={active}
            data-active={active ? "1" : "0"}
            className={`${LW_HUD_SLOT} ${
              active
                ? "border-[var(--stroke-amber)] bg-[rgba(255,184,77,0.12)] text-[var(--amber)]"
                : ""
            }`}
            onClick={() => {
              playSfx("ui.click");
              onAction?.(slot.id);
            }}
          >
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
      })}
    </div>
  );
}
