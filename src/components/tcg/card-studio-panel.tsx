"use client";

/**
 * Admin Card Studio — inspect category frames, migrated stats, lore.
 * Category remaps are content-file based; writes remain disabled.
 */

import { useMemo, useState } from "react";
import { getTcgRegistry, normalizeCard } from "@/content/tcg";
import {
  CATEGORY_LABELS,
  CATEGORY_PURPOSE,
  TCG_CARD_CATEGORIES,
  type TcgCardCategory,
} from "@/content/tcg/framework/card-categories";
import { evaluateCardPowerBudget } from "@/content/tcg/framework/power-budget";
import { MasterCardTemplate } from "@/components/tcg/master-card-template";
import { layoutForType } from "@/components/tcg/master-card-template";

const CATEGORY_SAMPLES: Record<TcgCardCategory, string> = {
  companion: "rotr-c-bramblefox",
  spell: "rotr-s-ember-spark",
  item: "rotr-s-item-medicine-pack",
  equipment: "rotr-e-ember-collar",
  terrain: "rotr-l-riftwild-plaza",
  relic: "rotr-r-mat-wood-fiber",
  trap: "rotr-x-hidden-snare",
  commander: "rotr-h-npc-keeper-travel-cloak",
  evolution: "rotr-evo-bramblefox",
};

export function CardStudioPanel() {
  const registry = useMemo(() => getTcgRegistry(), []);
  const [query, setQuery] = useState("rotr-s-item-medicine-pack");
  const [categoryFilter, setCategoryFilter] = useState<TcgCardCategory | "ALL">(
    "ALL",
  );

  const card = useMemo(() => {
    const pool =
      categoryFilter === "ALL"
        ? registry.all
        : registry.all.filter((c) => normalizeCard(c).category === categoryFilter);
    const hit =
      pool.find((c) => c.id === query) ||
      pool.find((c) =>
        c.localization.name.toLowerCase().includes(query.toLowerCase()),
      ) ||
      (categoryFilter !== "ALL"
        ? pool.find((c) => c.id === CATEGORY_SAMPLES[categoryFilter])
        : undefined);
    return hit ? normalizeCard(hit) : null;
  }, [query, registry.all, categoryFilter]);

  const budget = card ? evaluateCardPowerBudget(card) : null;
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of registry.all) {
      const cat = normalizeCard(c).category;
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [registry.all]);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="font-display text-lg text-[var(--text)]">Card Studio</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Preview category frames + migrated stats. Writes are disabled — edit
          types via{" "}
          <code className="text-cyan-200">cards.json</code> /{" "}
          <code className="text-cyan-200">migrate-card-categories.mjs</code>.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-md border px-2 py-1 text-xs ${
            categoryFilter === "ALL"
              ? "border-cyan-400/50 text-cyan-100"
              : "border-white/10 text-[var(--text-muted)]"
          }`}
          onClick={() => setCategoryFilter("ALL")}
        >
          All
        </button>
        {TCG_CARD_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            title={CATEGORY_PURPOSE[cat]}
            className={`rounded-md border px-2 py-1 text-xs ${
              categoryFilter === cat
                ? "border-cyan-400/50 text-cyan-100"
                : "border-white/10 text-[var(--text-muted)]"
            }`}
            onClick={() => {
              setCategoryFilter(cat);
              setQuery(CATEGORY_SAMPLES[cat]);
            }}
          >
            {CATEGORY_LABELS[cat]} ({categoryCounts[cat] ?? 0})
          </button>
        ))}
      </div>

      <label className="block text-sm text-[var(--text-muted)]">
        Card id or name
        <input
          className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-[var(--text)]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="rotr-s-item-medicine-pack"
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
            type={card.category}
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
            familyId={card.familyId}
            evolutionStage={card.evolutionStage}
          />
          <div className="space-y-2 text-sm text-[var(--text)]">
            <p>
              <strong>Id</strong> {card.id}
            </p>
            <p>
              <strong>Category</strong> {CATEGORY_LABELS[card.category]} ·{" "}
              {card.category}
            </p>
            <p>
              <strong>Layout</strong> {card.templateLayout} (frame:{" "}
              {layoutForType(card.category)})
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {CATEGORY_PURPOSE[card.category]}
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
              <strong>Lore</strong>{" "}
              {card.localization.loreBlurb ||
                card.localization.flavorText ||
                "—"}
            </p>
            {card.localization.worldHookHint ? (
              <p>
                <strong>World hook</strong> {card.localization.worldHookHint}
              </p>
            ) : null}
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
              change competitive power. Item frames are leather/potion — never
              companion chrome.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
