"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  createLiveWorldBridge,
  destroyLiveWorldBridge,
  type LiveWorldBridge,
} from "@/game/live-world/bridge";
import type {
  DialoguePayload,
  InteractPrompt,
  WorldHudStatus,
} from "@/game/live-world/types";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { LiveWorldGameCanvas } from "@/components/live-world/game-canvas";
import { LiveWorldLoadingScreen } from "@/components/live-world/loading-screen";
import { LiveWorldStatusBar } from "@/components/live-world/status-bar";
import { LiveWorldDialogueOverlay } from "@/components/live-world/dialogue-overlay";
import { LiveWorldMobileControls } from "@/components/live-world/mobile-controls";
import { WorldClockChip } from "@/components/live-world/world-clock-chip";
import { playSfx } from "@/hooks/use-sfx";

type Props = {
  playable: boolean;
};

export function LiveWorldShell({ playable }: Props) {
  const [entered, setEntered] = useState(false);
  const [bridge, setBridge] = useState<LiveWorldBridge | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<WorldHudStatus | null>(null);
  const [dialogue, setDialogue] = useState<DialoguePayload | null>(null);
  const [prompt, setPrompt] = useState<InteractPrompt>({
    label: "",
    visible: false,
  });

  const mobileEnabled = featureFlagDefaults.LIVE_WORLD_MOBILE_CONTROLS_ENABLED;
  const spectatorEnabled = featureFlagDefaults.LIVE_WORLD_SPECTATOR_MODE_ENABLED;

  useEffect(() => {
    if (!entered || !playable) return;
    const next = createLiveWorldBridge();
    setBridge(next);
    return () => {
      destroyLiveWorldBridge(next);
      setBridge(null);
    };
  }, [entered, playable]);

  useEffect(() => {
    if (!bridge) return;
    const unsubs = [
      bridge.ready.subscribe(setReady),
      bridge.loadingProgress.subscribe(setProgress),
      bridge.status.subscribe(setStatus),
      bridge.dialogue.subscribe(setDialogue),
      bridge.interactPrompt.subscribe(setPrompt),
    ];
    return () => unsubs.forEach((u) => u());
  }, [bridge]);

  const statusFallback = useMemo<WorldHudStatus>(
    () => ({
      connection: "loading",
      mapName: "Riftwild Commons",
      instanceLabel: "Local solo",
      playerLabel: "Keeper",
      petLabel: "Companion",
      hint: "Preparing…",
    }),
    [],
  );

  if (!playable) {
    return (
      <section className="panel p-8 text-center">
        <p className="font-display text-2xl text-white">Live World paused</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          `PLAYABLE_LIVE_WORLD_ENABLED` is off. Enable the flag to enter the browser world.
        </p>
      </section>
    );
  }

  if (!entered) {
    return (
      <section className="panel relative overflow-hidden p-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(61,231,255,0.18),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(155,123,255,0.12),transparent_45%),linear-gradient(160deg,#0a0a0f,#12121c)]" />
        <div className="relative flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
          <p className="page-kicker">Playable habitat</p>
          <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">
            Riftwild Commons
          </h2>
          <p className="mt-3 max-w-lg text-sm text-[var(--text-muted)] md:text-base">
            Step into the shared plaza. Control your Keeper, walk with your companion, and talk to
            Keepers — not a livestream.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="btn-primary focus-ring"
              onClick={() => {
                playSfx("world.portal");
                setEntered(true);
              }}
            >
              ENTER THE LIVE WORLD
            </button>
            {spectatorEnabled ? (
              <Link href="/live-world/spectate" className="btn-secondary focus-ring">
                Spectator view
              </Link>
            ) : (
              <span className="text-xs text-[var(--text-dim)]">
                Spectator mode off by default
              </span>
            )}
          </div>
          <p className="mt-6 text-[11px] text-[var(--text-dim)]">
            Desktop: WASD / arrows · Shift run · E / Space interact · Mobile: joystick + buttons
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel relative overflow-hidden p-0">
      <div className="relative h-[min(72vh,720px)] min-h-[420px] w-full bg-[#0a101c]">
        {bridge ? <LiveWorldGameCanvas bridge={bridge} className="absolute inset-0" /> : null}
        <LiveWorldLoadingScreen progress={progress} visible={!ready} />
        <LiveWorldStatusBar status={status ?? statusFallback} />
        <WorldClockChip regionSlug={(status ?? statusFallback).mapName.toLowerCase().replace(/\s+/g, "-")} />
        {bridge ? (
          <>
            <LiveWorldMobileControls bridge={bridge} enabled={mobileEnabled} />
            <LiveWorldDialogueOverlay
              dialogue={dialogue}
              prompt={prompt}
              bridge={bridge}
              onAdvance={() => bridge.advanceDialogue()}
            />
          </>
        ) : null}
        <div className="absolute left-3 top-auto bottom-3 z-20 md:left-auto md:right-3 md:top-3 md:bottom-auto">
          <button
            type="button"
            className="btn-secondary focus-ring pointer-events-auto text-xs"
            onClick={() => {
              playSfx("ui.click");
              setEntered(false);
              setReady(false);
              setProgress(0);
            }}
          >
            Exit world
          </button>
        </div>
      </div>
    </section>
  );
}
