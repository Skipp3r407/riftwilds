"use client";

import { useEffect, useRef } from "react";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import type * as Phaser from "phaser";

type Props = {
  bridge: LiveWorldBridge;
  className?: string;
};

function refreshPhaserScale(game: Phaser.Game | null | undefined): void {
  if (!game?.scale) return;
  try {
    game.scale.refresh();
  } catch {
    /* tearing down */
  }
}

/**
 * Mounts Phaser only on the client. Dynamic import keeps SSR clean.
 * Observes parent size + fullscreen so RESIZE never sticks at windowed bounds.
 */
export function LiveWorldGameCanvas({ bridge, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;

    void (async () => {
      const { createLiveWorldGame, destroyLiveWorldGame } = await import(
        "@/game/live-world/create-game"
      );
      if (cancelled || !hostRef.current) return;
      const game = createLiveWorldGame({
        parent: hostRef.current,
        bridge,
      });
      gameRef.current = game;
      refreshPhaserScale(game);
      if (cancelled) {
        destroyLiveWorldGame(game);
        gameRef.current = null;
      }
    })();

    return () => {
      cancelled = true;
      const game = gameRef.current;
      gameRef.current = null;
      if (game) {
        void import("@/game/live-world/create-game").then(({ destroyLiveWorldGame }) => {
          destroyLiveWorldGame(game);
        });
      }
    };
  }, [bridge]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let raf = 0;
    let debounceTimer = 0;

    const refresh = () => refreshPhaserScale(gameRef.current);

    // Coalesce resize/fullscreen storms — refresh after layout settles.
    const scheduleRefresh = () => {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          refresh();
          raf = requestAnimationFrame(refresh);
        });
      }, 16);
    };

    scheduleRefresh();

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleRefresh) : null;
    ro?.observe(host);

    document.addEventListener("fullscreenchange", scheduleRefresh);
    document.addEventListener("webkitfullscreenchange", scheduleRefresh as EventListener);
    window.addEventListener("resize", scheduleRefresh);

    const onContextRestored = () => scheduleRefresh();
    host.addEventListener("webglcontextrestored", onContextRestored);

    return () => {
      ro?.disconnect();
      window.clearTimeout(debounceTimer);
      cancelAnimationFrame(raf);
      document.removeEventListener("fullscreenchange", scheduleRefresh);
      document.removeEventListener(
        "webkitfullscreenchange",
        scheduleRefresh as EventListener,
      );
      window.removeEventListener("resize", scheduleRefresh);
      host.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, [bridge]);

  return (
    <div
      ref={hostRef}
      className={className}
      data-testid="live-world-canvas"
      style={{ width: "100%", height: "100%", touchAction: "none", zIndex: 0 }}
    />
  );
}
