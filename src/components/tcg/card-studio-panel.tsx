"use client";

/**
 * Admin Card Studio scaffold — inspect migrated stats + template preview.
 * Read-only until staff auth + write API land.
 */

import { useMemo, useState } from "react";
import { getTcgRegistry, normalizeCard } from "@/content/tcg";
import { evaluateCardPowerBudget } from "@/content/tcg/framework/power-budget";
import { MasterCardTemplate } from "@/components/tcg/master-card-template";

export function CardStudioPanel() {
  const registry = useMemo(() => getTcgRegistry(), []);
  const [query, setQuery] = useState("rotr-c-bramblefox");
  const card = useMemo(() => {
    const hit =
      registry.all.find((c) => c.id === query) ||
      registry.all.find((c) =>
        c.localization.name.toLowerCase().includes(query.toLowerCase()),
      );
    return hit ? normalizeCard(hit) : null;
  }, [query, registry.all]);

  const budget = card ? evaluateCardPowerBudget(card) : null;

  return (
    <section className="space-y-4">
      <header>
        <h2 className="font-display text-lg text-[var(--text)]">Card Studio</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Preview the master template with live migrated stats. Writes are
          disabled — edit overlays via{" "}
          <code className="text-cyan-200">card-stats-v2.json</code>.
        </p>
      </header>

      <label className="block text-sm text-[var(--text-muted)]">
        Card id or name
        <input
          className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-[var(--text)]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="rotr-c-bramblefox"
        />
      </label>

      {!card ? (
        <p className="text-sm text-red-200">No card matched.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <MasterCardTemplate
            size="inspect"
            name={card.localization.name}
            energyCost={card.energyCost}
            type={card.type}
            element={card.element}
            rarity={card.rarity}
            role={card.role}
            attack={card.attack}
            defense={card.defense}
            health={card.health}
            speed={card.speed}
            keywords={card.keywords}
            rulesText={card.localization.rulesText}
            abilitySummary={card.passive}
            artSrc={card.cleanArtPath}
            legacyFaceSrc={card.art.cardImagePath}
            interactive={false}
          />
          <div className="space-y-2 text-sm text-[var(--text)]">
            <p>
              <strong>Id</strong> {card.id}
            </p>
            <p>
              <strong>Layout</strong> {card.templateLayout}
            </p>
            <p>
              <strong>Role</strong> {card.role}
            </p>
            <p>
              <strong>Stats</strong> ATK {card.attack ?? "—"} · DEF{" "}
              {card.defense} · HP {card.health ?? "—"} · SPD {card.speed} · RE{" "}
              {card.energyCost}
            </p>
            <p>
              <strong>Keywords</strong>{" "}
              {card.keywords.length ? card.keywords.join(", ") : "—"}
            </p>
            <p>
              <strong>Competitive</strong>{" "}
              {card.competitiveEligible ? "eligible" : "collection-only"}
            </p>
            {budget ? (
              <p>
                <strong>Power budget</strong> {budget.budget} (expected ~
                {budget.expected}) · {budget.band}
              </p>
            ) : null}
            <p className="text-xs text-[var(--text-muted)]">
              Clean art: {card.cleanArtPath ?? "missing"} · Cosmetics never
              change competitive power.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
