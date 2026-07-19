"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const SPARK_COUNT = 5;
const SPARK_LIFE_MS = 420;

type Spark = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
};

/**
 * Enables thematic CSS cursors on fine pointers, a soft lag trail,
 * and a brief click spark. Touch / coarse pointers keep the system cursor.
 */
export function RiftCursor() {
  const [fine, setFine] = useState(false);
  const [fxOn, setFxOn] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const trailRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const soft = useRef({ x: -100, y: -100 });
  const raf = useRef<number | null>(null);
  const sparkId = useRef(0);
  const visible = useRef(false);
  const sparkTimers = useRef<number[]>([]);

  useEffect(() => {
    const fineMq = window.matchMedia("(pointer: fine)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      const isFine = fineMq.matches;
      setFine(isFine);
      setFxOn(isFine && !motionMq.matches);
      document.documentElement.classList.toggle("rift-cursors-enabled", isFine);
      document.documentElement.dataset.riftCursor = isFine ? "1" : "0";
    };

    sync();
    fineMq.addEventListener("change", sync);
    motionMq.addEventListener("change", sync);
    return () => {
      fineMq.removeEventListener("change", sync);
      motionMq.removeEventListener("change", sync);
      document.documentElement.classList.remove("rift-cursors-enabled");
      delete document.documentElement.dataset.riftCursor;
    };
  }, []);

  useEffect(() => {
    if (!fxOn) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      if (!visible.current) {
        visible.current = true;
        soft.current.x = e.clientX;
        soft.current.y = e.clientY;
        const el = trailRef.current;
        if (el) el.dataset.visible = "1";
      }
    };

    const onLeave = () => {
      visible.current = false;
      const el = trailRef.current;
      if (el) el.dataset.visible = "0";
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const originX = e.clientX;
      const originY = e.clientY;
      const batch: Spark[] = [];
      for (let i = 0; i < SPARK_COUNT; i++) {
        const angle = (Math.PI * 2 * i) / SPARK_COUNT + Math.random() * 0.45;
        const dist = 10 + Math.random() * 16;
        batch.push({
          id: ++sparkId.current,
          x: originX,
          y: originY,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
        });
      }
      setSparks((prev) => [...prev.slice(-12), ...batch]);
      const timer = window.setTimeout(() => {
        const ids = new Set(batch.map((s) => s.id));
        setSparks((prev) => prev.filter((s) => !ids.has(s.id)));
        sparkTimers.current = sparkTimers.current.filter((t) => t !== timer);
      }, SPARK_LIFE_MS);
      sparkTimers.current.push(timer);
    };

    const tick = () => {
      soft.current.x += (pos.current.x - soft.current.x) * 0.28;
      soft.current.y += (pos.current.y - soft.current.y) * 0.28;
      const el = trailRef.current;
      if (el) {
        el.style.transform = `translate3d(${soft.current.x}px, ${soft.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      if (raf.current != null) window.cancelAnimationFrame(raf.current);
      for (const t of sparkTimers.current) window.clearTimeout(t);
      sparkTimers.current = [];
    };
  }, [fxOn]);

  if (!fine) return null;

  return (
    <>
      {fxOn ? (
        <div
          ref={trailRef}
          className="rift-cursor-trail"
          aria-hidden
          data-sfx="ui.cursor"
          data-visible="0"
        />
      ) : null}
      {fxOn && sparks.length > 0 ? (
        <div className="rift-cursor-sparks" aria-hidden>
          {sparks.map((s) => (
            <span
              key={s.id}
              className="rift-cursor-spark"
              style={
                {
                  "--spark-x": `${s.x}px`,
                  "--spark-y": `${s.y}px`,
                  "--spark-dx": `${s.dx}px`,
                  "--spark-dy": `${s.dy}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
