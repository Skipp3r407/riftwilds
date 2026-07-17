import { ImageButton } from "@/components/ui/image-button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--cyan)]">404</p>
      <h1 className="font-display mt-3 text-3xl text-white">Lost in the Rift</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">
        This page does not exist — or has not opened in this phase yet.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ImageButton href="/" variant="primary">
          Home
        </ImageButton>
        <ImageButton href="/play" variant="secondary">
          Play
        </ImageButton>
      </div>
    </main>
  );
}
