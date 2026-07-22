"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CARE_ACTION_DEFS } from "@/game/creatures/care-catalog";
import { BASIC_PET_MEAL_CARE } from "@/lib/items/card-inventory-migration";
import { useDemoInventory } from "@/hooks/use-demo-inventory";

const CARE_ACTIONS = [
  "FEED",
  "PLAY",
  "TRAIN",
  "HEAL",
  "CLEAN",
  "SLEEP",
  "PET",
  "GIVE_WATER",
] as const;

const DEMO_COMPANIONS = [
  {
    publicId: "demo-riftling",
    name: "Demo Riftling",
    species: "Commonspark",
    hunger: 42,
    energy: 68,
    mood: 55,
    trust: 48,
    bond: 30,
    xp: 120,
    favorites: ["Basic Pet Meal", "Rift Toy"],
  },
  {
    publicId: "demo-emberkit",
    name: "Emberkit",
    species: "Cindercub",
    hunger: 70,
    energy: 40,
    mood: 62,
    trust: 35,
    bond: 18,
    xp: 40,
    favorites: ["Ember Dust snack"],
  },
];

function StatBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: tone }}
        />
      </div>
    </div>
  );
}

export function CompanionCareHub() {
  const { rows, ready } = useDemoInventory();

  const foodRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.tab === "Food" ||
          r.careHint === "feed" ||
          r.id === BASIC_PET_MEAL_CARE.inventoryItemId,
      ),
    [rows],
  );

  return (
    <div className="space-y-6">
      <section className="panel space-y-3 p-4">
        <h2 className="font-display text-lg text-white">Care actions</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Feed, Play, Train, Heal, and more happen outside Rift Battle. Combat
          still spends Rift Energy on combat cards only.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CARE_ACTIONS.map((key) => {
            const def = CARE_ACTION_DEFS[key];
            if (!def) return null;
            return (
              <li
                key={key}
                className="rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-2"
              >
                <p className="text-sm font-medium text-white">{def.label}</p>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  {def.description}
                </p>
                <p className="mt-1 text-[10px] text-[var(--cyan)]">
                  {def.creditCost > 0 ? `${def.creditCost} Credits` : "Free"} · +
                  {def.careXp} XP
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel space-y-3 p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-lg text-white">Companions</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Open a profile for full Feed / Play / Train / Heal controls.
            </p>
          </div>
          <Link href="/collection" className="btn-secondary focus-ring text-xs">
            All pets
          </Link>
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {DEMO_COMPANIONS.map((pet) => (
            <li key={pet.publicId} className="rounded-md border border-[var(--stroke)] p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-white">{pet.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{pet.species}</p>
                </div>
                <Link
                  href={`/pets/${pet.publicId}`}
                  className="btn-primary focus-ring text-xs"
                >
                  Care profile
                </Link>
              </div>
              <div className="mt-3 grid gap-2">
                <StatBar label="Hunger" value={pet.hunger} tone="var(--amber, #f0b429)" />
                <StatBar label="Energy" value={pet.energy} tone="var(--cyan)" />
                <StatBar label="Mood" value={pet.mood} tone="#7dd3a7" />
                <StatBar label="Trust" value={pet.trust} tone="#8ecbff" />
                <StatBar label="Bond" value={pet.bond} tone="#c4a1ff" />
              </div>
              <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                Care XP {pet.xp} · Favorites: {pet.favorites.join(", ")}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {["Feed", "Play", "Train", "Heal", "Customize", "Rename"].map((label) => (
                  <Link
                    key={label}
                    href={`/pets/${pet.publicId}`}
                    className="rounded border border-[var(--stroke)] px-2 py-0.5 text-[10px] text-[var(--text)] hover:border-[var(--cyan)]/50"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel space-y-3 p-4">
        <h2 className="font-display text-lg text-white">Feed from Inventory</h2>
        <p className="text-sm text-[var(--text-muted)]">
          {BASIC_PET_MEAL_CARE.description}
        </p>
        {!ready ? (
          <p className="text-xs text-[var(--text-muted)]">Loading bag…</p>
        ) : foodRows.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            No food in your bag yet.{" "}
            <Link href="/inventory" className="text-[var(--cyan)] underline">
              Open Inventory
            </Link>
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {foodRows.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-2"
              >
                <div>
                  <p className="text-sm text-white">{item.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    ×{item.quantity} · Inventory Food
                  </p>
                </div>
                <Link
                  href="/pets/demo-riftling"
                  className="btn-secondary focus-ring text-xs"
                >
                  Feed companion
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
