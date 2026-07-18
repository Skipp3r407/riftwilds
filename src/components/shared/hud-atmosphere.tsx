"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Soft site-wide HUD atmosphere: vignette + optional cursor glow.
 * Disabled on coarse pointers / prefers-reduced-motion.
 */
export function HudAtmosphere() {
  const glowRef = useRef<HTMLDivElement>(null);
  const [glowOn, setGlowOn] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || !motionOk) return;

    setGlowOn(true);
    const el = glowRef.current;
    if (!el) return;

    let raf = 0;
    let x = 0;
    let y = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        el.style.setProperty("--hud-mx", `${x}px`);
        el.style.setProperty("--hud-my", `${y}px`);
        el.style.opacity = "1";
      });
    };

    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hud-atmosphere" aria-hidden>
      <div className="hud-atmosphere__vignette" />
      <div className="hud-atmosphere__grid" />
      <div className="hud-atmosphere__scan" />
      {glowOn ? <div ref={glowRef} className="hud-atmosphere__cursor" /> : null}
    </div>
  );
}
