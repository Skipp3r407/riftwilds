"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { ReducedMotionScene } from "@/components/about/reduced-motion-scene";

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  accent?: string;
};

export function ParallaxScene({ src, alt, className, priority, accent }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  if (reduceMotion) {
    return (
      <div ref={ref} className={cn("absolute inset-0", className)}>
        <ReducedMotionScene src={src} alt={alt} priority={priority} />
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("absolute inset-0 overflow-hidden", className)}>
      <motion.div className="absolute inset-[-8%]" style={{ y, scale }}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          unoptimized
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,8,14,0.94)] via-[rgba(6,8,14,0.5)] to-[rgba(6,8,14,0.28)]"
        aria-hidden
      />
      {accent ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 opacity-40 mix-blend-screen"
          style={{
            background: `linear-gradient(to top, ${accent}, transparent)`,
          }}
          aria-hidden
        />
      ) : null}
    </div>
  );
}
