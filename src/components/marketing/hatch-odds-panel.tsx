"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { hatchOddsDefault } from "@/lib/config/project";
import { cn } from "@/lib/utils/cn";

const ODDS = Object.entries(hatchOddsDefault) as [string, number][];
const DURATION_MS = 1000;
const STAGGER_MS = 90;
const GLOW_MS = 700;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function CountUpPercent({
  target,
  active,
  delayMs,
  reduceMotion,
}: {
  target: number;
  active: boolean;
  delayMs: number;
  reduceMotion: boolean;
}) {
  const [value, setValue] = useState(() => (reduceMotion ? target : 0));
  const [glow, setGlow] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      setValue(target);
      return;
    }
    if (!active || startedRef.current) return;
    startedRef.current = true;

    let raf = 0;
    let glowTimer: ReturnType<typeof setTimeout> | undefined;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start - delayMs;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / DURATION_MS);
      setValue(Math.round(easeOutCubic(t) * target));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      setValue(target);
      setGlow(true);
      glowTimer = setTimeout(() => setGlow(false), GLOW_MS);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (glowTimer) clearTimeout(glowTimer);
    };
  }, [active, delayMs, reduceMotion, target]);

  return (
    <p
      className={cn(
        "font-display mt-2 text-2xl text-white transition-[text-shadow,color] duration-500",
        glow && "text-[var(--cyan)] [text-shadow:0_0_18px_rgba(61,231,255,0.5)]",
      )}
    >
      {value}%
    </p>
  );
}

export function HatchOddsPanel() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const seenRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      setActive(true);
      return;
    }
    if (reduceMotion === null) return;

    const node = rootRef.current;
    if (!node || seenRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || seenRef.current) return;
        seenRef.current = true;
        setActive(true);
        observer.disconnect();
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const motionOff = reduceMotion === true;

  return (
    <div ref={rootRef} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {ODDS.map(([rarity, pct], index) => (
        <div key={rarity} className="panel p-4 text-center">
          <p className="font-display text-xs uppercase tracking-wider text-[var(--cyan)]">
            {rarity}
          </p>
          <CountUpPercent
            target={pct}
            active={active || motionOff}
            delayMs={index * STAGGER_MS}
            reduceMotion={motionOff}
          />
        </div>
      ))}
    </div>
  );
}
