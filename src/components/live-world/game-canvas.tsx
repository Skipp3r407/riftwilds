"use client";

import { useEffect, useRef } from "react";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import type * as Phaser from "phaser";

type Props = {
  bridge: LiveWorldBridge;
  className?: string;
};

/**
 * Mounts Phaser only on the client. Dynamic import keeps SSR clean.
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

  return (
    <div
      ref={hostRef}
      className={className}
      data-testid="live-world-canvas"
      style={{ width: "100%", height: "100%", touchAction: "none" }}
    />
  );
}
