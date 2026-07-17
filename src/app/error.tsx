"use client";

import { ImageButton } from "@/components/ui/image-button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--coral)]">
        Something went wrong
      </p>
      <h1 className="font-display mt-3 text-3xl text-white">Rift turbulence</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">
        An unexpected error interrupted this page. You can try again or return home.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">Ref: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ImageButton variant="primary" onClick={() => reset()}>
          Try again
        </ImageButton>
        <ImageButton href="/" variant="secondary">
          Home
        </ImageButton>
      </div>
    </main>
  );
}
