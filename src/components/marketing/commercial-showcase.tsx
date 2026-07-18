"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { audioManager } from "@/lib/audio/manager";

const VERSIONS = [
  {
    id: "60s",
    label: "60s Comic",
    aspect: "16 / 9",
    src: "/assets/commercials/video/riftwilds-commercial-60s-16x9.mp4",
    captions: "/assets/commercials/captions/riftwilds-commercial-60s.vtt",
    poster: "/assets/commercials/posters/poster-cinematic-16x9.png",
  },
  {
    id: "30s",
    label: "30s Social",
    aspect: "9 / 16",
    src: "/assets/commercials/video/riftwilds-commercial-30s-9x16.mp4",
    captions: "/assets/commercials/captions/riftwilds-commercial-30s.vtt",
    poster: "/assets/commercials/posters/poster-vertical-rift.png",
  },
  {
    id: "15s",
    label: "15s Teaser",
    aspect: "9 / 16",
    src: "/assets/commercials/video/riftwilds-commercial-15s-9x16-teaser.mp4",
    captions: "/assets/commercials/captions/riftwilds-commercial-15s.vtt",
    poster: "/assets/commercials/posters/poster-vertical-rift.png",
  },
  {
    id: "25s",
    label: "25s Square",
    aspect: "1 / 1",
    src: "/assets/commercials/video/riftwilds-commercial-25s-1x1.mp4",
    captions: "/assets/commercials/captions/riftwilds-commercial-25s-square.vtt",
    poster: "/assets/commercials/posters/poster-square-hero.png",
  },
] as const;

type VersionId = (typeof VERSIONS)[number]["id"];

/**
 * Marketing commercial block — comic-cinematic MP4s (colorful Riftling panels),
 * music bed + AI narrator VO baked in, captions, posters.
 * No loud autoplay. CTA language matches closed alpha.
 */
export function CommercialShowcase() {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState<VersionId>("60s");
  const [open, setOpen] = useState(false);

  const version = VERSIONS.find((v) => v.id === active) ?? VERSIONS[0];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) {
      videoRef.current?.pause();
      audioManager.clearDuck("commercial-player");
      return;
    }
    // Hold duck while the trailer plays so site BGM / Live World beds stay out.
    audioManager.duck("commercial-player", {
      amount: 1,
      durationMs: 24 * 60 * 60 * 1000,
      buses: ["music", "ambient"],
    });
    return () => {
      audioManager.clearDuck("commercial-player");
    };
  }, [open]);

  function openPlayer(id: VersionId = "60s") {
    setActive(id);
    setOpen(true);
  }

  function closePlayer() {
    setOpen(false);
  }

  return (
    <section
      id="commercial"
      className="relative overflow-hidden px-4 py-16 md:px-6"
      aria-labelledby={titleId}
    >
      {/* Muted atmospheric loop — visual only, never with audio */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.22]" aria-hidden>
        <CommercialHeaderLoop className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,10,15,0.55)] via-[rgba(10,10,15,0.82)] to-[var(--bg-deep)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-[var(--cyan)]">
            Watch · Comic cinematic
          </p>
          <h2 id={titleId} className="font-display mt-2 text-3xl text-white md:text-4xl">
            Enter the Live World
          </h2>
          <p className="mt-3 text-sm text-[var(--text-muted)] md:text-base">
            Graphic-novel trailers with music and narrator — hatch Riftlings, explore, quest, battle,
            craft, and build with other Keepers. Closed alpha. No investment promises.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-stretch">
          <button
            type="button"
            onClick={() => openPlayer("60s")}
            className="group relative aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--stroke)] bg-[var(--bg-panel)] text-left shadow-[var(--shadow-panel)] focus-ring"
            aria-label="Play 60 second Riftwilds comic cinematic with music and narrator"
          >
            <Image
              src="/assets/commercials/posters/poster-cinematic-16x9.png"
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 70vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.92)] via-[rgba(10,10,15,0.25)] to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(61,231,255,0.45)] bg-[rgba(10,10,18,0.72)] text-[var(--cyan)] shadow-[0_0_32px_rgba(61,231,255,0.25)] transition group-hover:scale-105">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5.14v13.72L19 12 8 5.14z" />
                </svg>
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <p className="font-display text-xs uppercase tracking-[0.22em] text-[var(--amber)]">
                60s comic cinematic · 16:9 · music + VO
              </p>
              <p className="mt-1 text-lg text-white md:text-xl">Play the commercial</p>
            </div>
          </button>

          <div className="flex flex-col gap-3">
            {VERSIONS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => openPlayer(v.id)}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--stroke)] bg-[rgba(18,18,28,0.55)] px-3 py-3 text-left transition hover:border-[var(--stroke-strong)] focus-ring"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-[var(--stroke)]">
                  <Image src={v.poster} alt="" fill className="object-cover" unoptimized />
                </span>
                <span>
                  <span className="block font-display text-sm text-white">{v.label}</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    Click to play · music + narrator · captions
                  </span>
                </span>
              </button>
            ))}
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <Link href="/live-world" className="btn-primary focus-ring">
                Enter the Live World
              </Link>
              <Link href="/hatchery" className="btn-secondary focus-ring">
                Play the alpha
              </Link>
            </div>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="commercial-dialog m-auto w-[min(96vw,1100px)] max-w-none rounded-[var(--radius-lg)] border border-[var(--stroke-strong)] bg-[var(--bg-deep)] p-0 text-[var(--text)] shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop:bg-[rgba(6,8,14,0.78)]"
        onClose={closePlayer}
        onCancel={(e) => {
          e.preventDefault();
          closePlayer();
        }}
        aria-labelledby={`${titleId}-player`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--stroke)] px-4 py-3">
          <div>
            <p id={`${titleId}-player`} className="font-display text-sm text-white">
              {version.label}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Music + AI narrator · captions · closed alpha
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary focus-ring px-3 py-1.5 text-sm"
            onClick={closePlayer}
          >
            Close
          </button>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-[var(--stroke)] px-4 py-2">
          {VERSIONS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setActive(v.id)}
              className={
                v.id === active
                  ? "rounded-md bg-[rgba(61,231,255,0.16)] px-2.5 py-1 text-xs text-[var(--cyan)]"
                  : "rounded-md px-2.5 py-1 text-xs text-[var(--text-muted)] hover:text-white"
              }
            >
              {v.label}
            </button>
          ))}
        </div>
        <div
          className="relative mx-auto w-full max-h-[min(78vh,720px)] bg-black"
          style={{ aspectRatio: version.aspect }}
        >
          {open ? (
            <video
              key={version.src}
              ref={videoRef}
              className="h-full w-full object-contain"
              controls
              playsInline
              preload="metadata"
              poster={version.poster}
              autoPlay
            >
              <source src={version.src} type="video/mp4" />
              <track kind="captions" src={version.captions} srcLang="en" label="English" default />
            </video>
          ) : null}
        </div>
      </dialog>
    </section>
  );
}

/** Muted autoplay loop for marketing header atmosphere — never with sound. */
export function CommercialHeaderLoop({ className = "" }: { className?: string }) {
  return (
    <video
      className={className}
      src="/assets/commercials/video/riftwilds-header-loop-12s-16x9-muted.mp4"
      poster="/assets/commercials/storyboards/comic/comic-01-rift-splash.png"
      muted
      playsInline
      loop
      autoPlay
      preload="metadata"
      aria-hidden
      tabIndex={-1}
    />
  );
}
