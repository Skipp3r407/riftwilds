"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { STARTER_SPECIES } from "@/lib/assets/manifest";
import { buildDefaultCreatureConfig, toPhaserAnimJson } from "@/game/assets/sprite-animation";
import { GameImage } from "@/components/assets/game-image";
import { creatureProfilePath } from "@/lib/assets/paths";
import { cn } from "@/lib/utils/cn";

const ANIMS = ["idle", "attack-basic", "attack-affinity", "hit", "victory", "defeat", "happy", "sleep"];

export default function SpriteInspectorPage() {
  const [species, setSpecies] = useState<string>("cindercub");
  const [anim, setAnim] = useState("idle");
  const [playing, setPlaying] = useState(true);
  const [frameRate, setFrameRate] = useState(9);
  const [frame, setFrame] = useState(0);
  const [checker, setChecker] = useState(true);
  const [showOrigin, setShowOrigin] = useState(true);
  const [showHitbox, setShowHitbox] = useState(false);
  const [scale, setScale] = useState(0.72);
  const [notes, setNotes] = useState("");
  const [approved, setApproved] = useState(false);

  const config = useMemo(() => buildDefaultCreatureConfig(species), [species]);
  const animConfig = config.battle.animations[anim] ?? config.battle.animations.idle!;
  const maxFrame = animConfig.end - animConfig.start;
  const phaserJson = useMemo(
    () => JSON.stringify(toPhaserAnimJson(species, config), null, 2),
    [species, config],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-white">Sprite Inspector</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Dev tool for animation review. Source masters are never modified here.
          </p>
        </div>
        <Link href="/admin/assets" className="btn-secondary focus-ring text-sm">
          Back to assets
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className={cn(
            "panel relative flex min-h-[420px] items-center justify-center p-6",
            checker && "checkerboard",
          )}
        >
          <div
            className="relative"
            style={{
              width: config.battle.frameWidth * scale,
              height: config.battle.frameHeight * scale,
            }}
          >
            <GameImage
              src={creatureProfilePath(species)}
              alt={`${species} preview`}
              width={Math.round(config.battle.frameWidth * scale)}
              height={Math.round(config.battle.frameHeight * scale)}
            />
            {showOrigin ? (
              <span
                className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--coral)]"
                style={{
                  left: `${config.battle.originX * 100}%`,
                  top: `${config.battle.originY * 100}%`,
                }}
                title="Origin"
              />
            ) : null}
            {showHitbox ? (
              <span className="pointer-events-none absolute inset-[18%] border-2 border-dashed border-[var(--cyan)]" />
            ) : null}
          </div>
          <p className="absolute bottom-3 left-3 text-xs text-[var(--text-muted)]">
            Frame {frame}/{maxFrame} · {playing ? "Playing" : "Paused"} · {frameRate} fps (preview)
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm text-[var(--text-muted)]">
            Creature
            <select
              className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-[var(--bg-panel)] px-3 py-2 text-white"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            >
              {STARTER_SPECIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-[var(--text-muted)]">
            Animation
            <select
              className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-[var(--bg-panel)] px-3 py-2 text-white"
              value={anim}
              onChange={(e) => {
                setAnim(e.target.value);
                setFrame(0);
              }}
            >
              {ANIMS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary text-sm" onClick={() => setPlaying((p) => !p)}>
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() => setFrame((f) => Math.max(0, f - 1))}
            >
              Prev frame
            </button>
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() => setFrame((f) => Math.min(maxFrame, f + 1))}
            >
              Next frame
            </button>
          </div>

          <label className="block text-sm text-[var(--text-muted)]">
            Frame rate: {frameRate}
            <input
              type="range"
              min={1}
              max={24}
              value={frameRate}
              onChange={(e) => setFrameRate(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </label>

          <label className="block text-sm text-[var(--text-muted)]">
            Display scale: {scale.toFixed(2)}
            <input
              type="range"
              min={0.25}
              max={1.5}
              step={0.01}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </label>

          <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={checker} onChange={(e) => setChecker(e.target.checked)} />
              Checkerboard
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showOrigin} onChange={(e) => setShowOrigin(e.target.checked)} />
              Origin
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showHitbox} onChange={(e) => setShowHitbox(e.target.checked)} />
              Hitbox
            </label>
          </div>

          <div className="panel p-3 text-xs text-[var(--text-muted)]">
            <p>
              Raw frame: {config.battle.frameWidth}×{config.battle.frameHeight}
            </p>
            <p>
              Origin: ({config.battle.originX}, {config.battle.originY}) · scale {config.battle.scale}
            </p>
            <p className="mt-1">
              Missing frames: sheets not packed yet — drop masters in{" "}
              <code>public/assets/creatures/source/</code>
            </p>
            <p className="mt-1">Files: creature-{species}-battle-*.png</p>
          </div>

          <label className="block text-sm text-[var(--text-muted)]">
            Review notes
            <textarea
              className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-[var(--bg-panel)] px-3 py-2 text-white"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary text-sm"
              onClick={() => void navigator.clipboard.writeText(phaserJson)}
            >
              Copy Phaser config
            </button>
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() => setApproved(true)}
            >
              {approved ? "Marked approved (local)" : "Mark animation approved"}
            </button>
          </div>

          <pre className="panel max-h-48 overflow-auto p-3 text-[10px] text-[var(--text-muted)]">
            {phaserJson}
          </pre>
        </div>
      </div>
    </main>
  );
}
