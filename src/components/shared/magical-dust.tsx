"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Mote = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  r: number;
  baseA: number;
  phase: number;
  speed: number;
  cyan: boolean;
};

type DustTier = "ambient" | "auth";

const AMBER: [number, number, number] = [255, 184, 77];
const CYAN: [number, number, number] = [61, 231, 255];

/** Auth gateway + account flows — denser gold/cyan rift dust over cavern wallpaper. */
const AUTH_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/onboarding",
  "/account",
] as const;

function dustTierForPath(pathname: string | null): DustTier {
  const path = (pathname ?? "").split("?")[0] || "/";
  for (const prefix of AUTH_PREFIXES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return "auth";
  }
  return "ambient";
}

function moteBudget(tier: DustTier, fine: boolean): number {
  if (tier === "auth") return fine ? 96 : 44;
  return fine ? 68 : 30;
}

/**
 * Site-wide amber/cyan mote overlay. Ambient drift always;
 * fine pointers get soft mouse parallax + local scatter/attract.
 * Auth routes get a denser, slightly brighter pass over the gateway wallpaper.
 * pointer-events: none — never blocks UI. Off under prefers-reduced-motion.
 */
export function MagicalDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const tier = dustTierForPath(pathname);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionMq.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const fineMq = window.matchMedia("(pointer: fine)");
    let fine = fineMq.matches;
    let count = moteBudget(tier, fine);
    const authBoost = tier === "auth";

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let last = performance.now();

    const mouse = { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, active: false };
    const soft = { x: 0, y: 0 };
    let motes: Mote[] = [];

    const spawn = (partial = false): Mote => {
      const z = 0.3 + Math.random() * 0.7;
      const bright = authBoost ? 0.18 + Math.random() * 0.38 : 0.14 + Math.random() * 0.32;
      return {
        x: Math.random() * (w || window.innerWidth),
        y: partial
          ? (h || window.innerHeight) + 8 + Math.random() * 40
          : Math.random() * (h || window.innerHeight),
        z,
        vx: (Math.random() - 0.5) * (authBoost ? 0.16 : 0.13) * z,
        vy: -(0.07 + Math.random() * (authBoost ? 0.28 : 0.24)) * z,
        r: (0.7 + Math.random() * (authBoost ? 2.1 : 1.8)) * z,
        baseA: bright,
        phase: Math.random() * Math.PI * 2,
        speed: 0.55 + Math.random() * 1.25,
        cyan: Math.random() > (authBoost ? 0.48 : 0.55),
      };
    };

    const rebuild = () => {
      motes = Array.from({ length: count }, () => spawn(false));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, fine ? 1.5 : 1.25);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (motes.length !== count) rebuild();
      else {
        for (const m of motes) {
          m.x = Math.min(Math.max(m.x, 0), w);
          m.y = Math.min(Math.max(m.y, 0), h);
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!fine) return;
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const nx = e.clientX;
      const ny = e.clientY;
      mouse.vx = nx - mouse.px;
      mouse.vy = ny - mouse.py;
      mouse.px = nx;
      mouse.py = ny;
      mouse.x = nx;
      mouse.y = ny;
      mouse.active = true;
    };

    const onLeave = () => {
      mouse.active = false;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const syncPointer = () => {
      fine = fineMq.matches;
      count = moteBudget(tier, fine);
      rebuild();
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(32, now - last) / 16.67;
      last = now;

      soft.x += (mouse.x - soft.x) * 0.12;
      soft.y += (mouse.y - soft.y) * 0.12;
      mouse.vx *= 0.86;
      mouse.vy *= 0.86;

      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const influence = fine ? (authBoost ? 160 : 140) : 0;
      const speed = Math.hypot(mouse.vx, mouse.vy);
      const glowMul = authBoost ? 2.55 : 2.35;
      const sway = authBoost ? 0.11 : 0.09;

      for (const m of motes) {
        m.phase += 0.02 * m.speed * dt;
        m.x += m.vx * dt + Math.sin(m.phase) * sway * m.z * dt;
        m.y += m.vy * dt;

        if (fine && mouse.active && influence > 0) {
          const dx = soft.x - m.x;
          const dy = soft.y - m.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < influence) {
            const t = 1 - dist / influence;
            const fall = t * t;
            // Slow cursor: gentle attract. Fast move: soft scatter.
            if (speed > 8) {
              m.x -= (dx / dist) * fall * 1.8 * m.z * dt;
              m.y -= (dy / dist) * fall * 1.8 * m.z * dt;
            } else {
              m.x += (dx / dist) * fall * 0.22 * m.z * dt;
              m.y += (dy / dist) * fall * 0.22 * m.z * dt;
            }
          }
        }

        // Depth parallax toward cursor / screen center
        const px = fine && mouse.active ? soft.x : cx;
        const py = fine && mouse.active ? soft.y : cy;
        const parallax = (1 - m.z) * (authBoost ? 14 : 10);
        const drawX = m.x + ((m.x - px) / Math.max(w, 1)) * parallax;
        const drawY = m.y + ((m.y - py) / Math.max(h, 1)) * parallax;

        if (m.y < -20 || m.x < -30 || m.x > w + 30) {
          Object.assign(m, spawn(true));
          continue;
        }

        const twinkle = 0.55 + 0.45 * Math.sin(m.phase * 1.7);
        const a = m.baseA * twinkle;
        const [cr, cg, cb] = m.cyan ? CYAN : AMBER;
        const glow = m.r * glowMul;

        const g = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, glow);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${a})`);
        g.addColorStop(0.45, `rgba(${cr},${cg},${cb},${a * 0.38})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(drawX, drawY, glow, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    resize();
    rebuild();
    soft.x = w * 0.5;
    soft.y = h * 0.5;
    mouse.x = soft.x;
    mouse.y = soft.y;
    mouse.px = soft.x;
    mouse.py = soft.y;

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    fineMq.addEventListener("change", syncPointer);

    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      fineMq.removeEventListener("change", syncPointer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [tier]);

  return (
    <canvas
      ref={canvasRef}
      className="magical-dust"
      data-dust-tier={tier}
      aria-hidden
    />
  );
}
