"use client";

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

const AMBER: [number, number, number] = [255, 184, 77];
const CYAN: [number, number, number] = [61, 231, 255];

/**
 * Site-wide amber/cyan mote overlay. Ambient drift always;
 * fine pointers get soft mouse parallax + local scatter/attract.
 * pointer-events: none — never blocks UI. Off under prefers-reduced-motion.
 */
export function MagicalDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionMq.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const fineMq = window.matchMedia("(pointer: fine)");
    let fine = fineMq.matches;
    let count = fine ? 46 : 20;

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
      const z = 0.35 + Math.random() * 0.65;
      return {
        x: Math.random() * (w || window.innerWidth),
        y: partial
          ? (h || window.innerHeight) + 8 + Math.random() * 40
          : Math.random() * (h || window.innerHeight),
        z,
        vx: (Math.random() - 0.5) * 0.12 * z,
        vy: -(0.08 + Math.random() * 0.22) * z,
        r: (0.6 + Math.random() * 1.6) * z,
        baseA: 0.12 + Math.random() * 0.28,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.2,
        cyan: Math.random() > 0.55,
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
      count = fine ? 46 : 20;
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
      const influence = fine ? 140 : 0;
      const speed = Math.hypot(mouse.vx, mouse.vy);

      for (const m of motes) {
        m.phase += 0.02 * m.speed * dt;
        m.x += m.vx * dt + Math.sin(m.phase) * 0.09 * m.z * dt;
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
        const parallax = (1 - m.z) * 10;
        const drawX = m.x + ((m.x - px) / Math.max(w, 1)) * parallax;
        const drawY = m.y + ((m.y - py) / Math.max(h, 1)) * parallax;

        if (m.y < -20 || m.x < -30 || m.x > w + 30) {
          Object.assign(m, spawn(true));
          continue;
        }

        const twinkle = 0.55 + 0.45 * Math.sin(m.phase * 1.7);
        const a = m.baseA * twinkle;
        const [cr, cg, cb] = m.cyan ? CYAN : AMBER;
        const glow = m.r * 2.2;

        const g = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, glow);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${a})`);
        g.addColorStop(0.45, `rgba(${cr},${cg},${cb},${a * 0.35})`);
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
  }, []);

  return <canvas ref={canvasRef} className="magical-dust" aria-hidden />;
}
