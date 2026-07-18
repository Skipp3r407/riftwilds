"use client";

import { useRef, useState } from "react";

type Props = {
  src: string;
  title: string;
  captionsUrl?: string;
  /** Autoplay stays off by default per Academy policy */
  autoPlay?: boolean;
};

export function AcademyVideoPlayer({
  src,
  title,
  captionsUrl,
  autoPlay = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [rate, setRate] = useState(1);

  const isEmbed = src.includes("youtube.com") || src.includes("youtu.be") || src.includes("vimeo.com");

  if (isEmbed) {
    const embedSrc = src.includes("?")
      ? `${src}${autoPlay ? "&autoplay=1" : ""}`
      : `${src}${autoPlay ? "?autoplay=1" : ""}`;
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[var(--stroke)] bg-black">
        <iframe
          title={title}
          src={embedSrc}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <video
        ref={videoRef}
        className="aspect-video w-full rounded-lg border border-[var(--stroke)] bg-black"
        controls
        playsInline
        preload="metadata"
        autoPlay={autoPlay}
        title={title}
      >
        <source src={src} />
        {captionsUrl ? (
          <track kind="captions" src={captionsUrl} srcLang="en" label="English" default />
        ) : null}
      </video>
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
        <label className="flex items-center gap-1">
          Speed
          <select
            className="focus-ring rounded border border-[var(--stroke)] bg-[var(--bg-elevated)] px-2 py-1 text-[var(--text)]"
            value={rate}
            onChange={(e) => {
              const next = Number(e.target.value);
              setRate(next);
              if (videoRef.current) videoRef.current.playbackRate = next;
            }}
          >
            {[0.75, 1, 1.25, 1.5, 2].map((r) => (
              <option key={r} value={r}>
                {r}x
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="focus-ring rounded border border-[var(--stroke)] px-2 py-1 hover:border-[var(--cyan)]/50"
          onClick={() => void videoRef.current?.requestFullscreen?.()}
        >
          Fullscreen
        </button>
      </div>
    </div>
  );
}
