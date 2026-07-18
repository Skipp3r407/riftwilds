"use client";

import { useEffect } from "react";
import { playSfx } from "@/hooks/use-sfx";

const CLICKABLE = [
  "a.btn-primary",
  "a.btn-secondary",
  "a.btn-ghost",
  "a.btn-amber",
  "a.btn-danger",
  "a.btn-success",
  "a.btn-icon",
  "a.btn-skin",
  "button.btn-primary",
  "button.btn-secondary",
  "button.btn-ghost",
  "button.btn-amber",
  "button.btn-danger",
  "button.btn-success",
  "button.btn-icon",
  "button.btn-skin",
  "a.panel",
  "a.panel-interactive",
  "button.panel-interactive",
].join(", ");

/**
 * Subtle UI click SFX for shared button skins / interactive panels.
 * Skips disabled controls and anything marked data-sfx="off".
 * Cooldown is handled inside the SFX engine.
 */
export function HudInteraction() {
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const el = target.closest(CLICKABLE);
      if (!(el instanceof HTMLElement)) return;
      if (el.getAttribute("data-sfx") === "off") return;
      if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return;
      playSfx("ui.click");
    };

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return null;
}
