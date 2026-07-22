import Link from "next/link";
import { STANDARD_BATTLE_RULES } from "@/game/tcg/rules/battle-rules-config";
import { TUTORIAL_STAGES } from "@/game/tcg/tutorial/stages";
import { KEYWORD_REGISTRY } from "@/game/tcg/combat/keywords";

export const metadata = { title: "Battle Rules" };

const R = STANDARD_BATTLE_RULES;

export default function TcgRulesPage() {
  const keywords = Object.values(KEYWORD_REGISTRY).filter(
    (k) => k.support !== "stub",
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header className="space-y-2">
        <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--cyan)]">
          Riftwilds TCG · Rules v{R.rulesVersion}
        </p>
        <h1 className="font-display text-3xl text-white">Battle Rules</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Canonical config: <code>src/game/tcg/rules/battle-rules-config.ts</code>
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tcg/battle" className="text-[var(--cyan)] hover:underline">
            Practice Board
          </Link>
          <Link href="/tcg/tutorial" className="text-[var(--cyan)] hover:underline">
            Tutorial
          </Link>
          <Link href="/tcg" className="text-[var(--cyan)] hover:underline">
            TCG Hub
          </Link>
        </div>
      </header>

      <section className="space-y-2 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Win conditions</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Reduce the enemy Keeper to 0 HP (start {R.keeper.startingHp})</li>
          <li>Opponent concedes or disconnects past reconnect timer</li>
          <li>Alternate win effects from cards</li>
          <li>Fatal Rift Collapse from empty-deck draws</li>
        </ul>
      </section>

      <section className="space-y-2 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Deck construction</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            {R.deck.totalPieces} pieces = 1 Commander + {R.deck.mainDeckSize}{" "}
            shuffled cards
          </li>
          <li>Min {R.deck.minCreatures} creatures/companions</li>
          <li>Max {R.deck.maxSpells} spells</li>
          <li>
            Max {R.deck.maxSupportCombined} equipment / artifact / terrain /
            support
          </li>
          <li>
            Unique-only copies (max 1) · max{" "}
            {R.deck.maxPowerRarityCombined} power rarities combined
          </li>
          <li>
            Max {R.deck.maxZeroCostPerDeck} zero-cost combat cards per deck
          </li>
        </ul>
      </section>

      <section className="space-y-2 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Turn structure</h2>
        <p>{R.turn.phases.join(" → ")}</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Opening hand {R.hand.openingSize}, hand cap {R.hand.maxSize}, mulligan
            once (Keep / Partial / Full)
          </li>
          <li>
            Opening hands soft-shaped so ≥1 card costs ≤ turn-1 Energy (
            {R.energy.turn1Max})
          </li>
          <li>
            Energy turn 1 = {R.energy.turn1Max}, +{R.energy.perTurnGain}/turn to{" "}
            {R.energy.cap}
          </li>
          <li>P1 skips turn-1 draw · P2 receives Rift Spark</li>
          <li>
            Draw one at turn start — never auto-replace a played card
          </li>
          <li>
            Channel ({R.cardAdvantage.energyToDrawCost} Energy → draw) · Commander
            Focus ({R.cardAdvantage.commanderDrawCost} Energy → draw) · Bank /
            Recycle once each per turn
          </li>
          <li>
            Field: {R.field.frontlineSlots} Front + {R.field.backlineSlots} Back +
            Terrain + Commander
          </li>
        </ul>
      </section>

      <section className="space-y-2 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Keywords</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {keywords.map((k) => (
            <li key={k.id} className="rounded border border-white/10 px-3 py-2">
              <strong className="text-white">{k.id}</strong>
              <p className="mt-0.5 text-xs">{k.shortText}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Tutorial path</h2>
        <ol className="list-decimal space-y-1 pl-5">
          {TUTORIAL_STAGES.map((s) => (
            <li key={s.id}>
              <strong className="text-white">{s.title}</strong> — {s.objective}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
