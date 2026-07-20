import Link from "next/link";
import {
  TUTORIAL_REWARDS,
  TUTORIAL_STAGES,
} from "@/game/tcg/tutorial/stages";

export const metadata = { title: "TCG Tutorial" };

export default function TcgTutorialPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--cyan)]">
          Keeper training
        </p>
        <h1 className="font-display text-3xl text-white">Battle Tutorial</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Eight staged lessons. No wallet required. Completion grants gold, a
          cosmetic card back, and a Codex entry.
        </p>
      </header>

      <ol className="space-y-3">
        {TUTORIAL_STAGES.map((stage) => (
          <li
            key={stage.id}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-lg text-white">
                {stage.order}. {stage.title}
              </h2>
              {stage.launchMode ? (
                <Link
                  href="/tcg/battle"
                  className="shrink-0 text-xs text-[var(--cyan)] hover:underline"
                >
                  Practice
                </Link>
              ) : (
                <Link
                  href="/tcg/deck-builder"
                  className="shrink-0 text-xs text-[var(--cyan)] hover:underline"
                >
                  Deck builder
                </Link>
              )}
            </div>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {stage.objective}
            </p>
            <p className="mt-1 text-xs text-[var(--text-dim)]">{stage.hint}</p>
          </li>
        ))}
      </ol>

      <aside className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-[var(--text-muted)]">
        <p className="font-display text-amber-200">Completion rewards</p>
        <ul className="mt-2 list-disc pl-5">
          <li>{TUTORIAL_REWARDS.gold} gold</li>
          <li>Cosmetic card back: {TUTORIAL_REWARDS.cosmeticCardBack}</li>
          <li>Codex: {TUTORIAL_REWARDS.codexEntry}</li>
        </ul>
      </aside>

      <Link href="/tcg/rules" className="text-sm text-[var(--cyan)] hover:underline">
        Read battle rules
      </Link>
    </div>
  );
}
