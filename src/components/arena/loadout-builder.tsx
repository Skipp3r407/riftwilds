"use client";

import { useEffect, useMemo, useState } from "react";
import type { WeaponDefinition } from "@/game/arena/weapons";
import { GameImage } from "@/components/assets/game-image";
import { WeaponsDisclaimer } from "@/components/arena/disclosures";
import { LAUNCH_SPECIES } from "@/game/creatures/species-catalog";
import { itemIconFallback, itemIconPath } from "@/lib/assets/paths";
import { cn } from "@/lib/utils/cn";

const AFFINITIES = [
  "EMBER",
  "TIDE",
  "GROVE",
  "STORM",
  "STONE",
  "FROST",
  "RADIANT",
  "VOID",
  "ALLOY",
  "SPIRIT",
] as const;

const STORAGE_KEY = "riftwilds-arena-loadout-v1";

const DEFAULT_SPECIES: Record<(typeof AFFINITIES)[number], string> = {
  EMBER: "cindercub",
  TIDE: "bubbloon",
  GROVE: "mossprig",
  STORM: "voltkit",
  STONE: "pebblit",
  FROST: "frostnip",
  RADIANT: "luminara",
  VOID: "hollowshade",
  ALLOY: "gearling",
  SPIRIT: "wisplet",
};

export type SavedLoadout = {
  name: string;
  speciesSlug: string;
  affinity: (typeof AFFINITIES)[number];
  weaponId: string | null;
  level: number;
};

export function LoadoutBuilder() {
  const [weapons, setWeapons] = useState<WeaponDefinition[]>([]);
  const [loadout, setLoadout] = useState<SavedLoadout>({
    name: "Cinder Cub",
    speciesSlug: "cindercub",
    affinity: "EMBER",
    weaponId: "ember-talons",
    level: 5,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void fetch("/api/arena/weapons")
      .then((r) => r.json())
      .then((d) => setWeapons(d.weapons ?? []));
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedLoadout>;
        setLoadout((prev) => ({
          ...prev,
          ...parsed,
          speciesSlug:
            parsed.speciesSlug ??
            DEFAULT_SPECIES[(parsed.affinity as SavedLoadout["affinity"]) ?? "EMBER"] ??
            "cindercub",
        }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const speciesOptions = useMemo(
    () => LAUNCH_SPECIES.filter((s) => s.affinity === loadout.affinity),
    [loadout.affinity],
  );
  const selectedSpecies =
    LAUNCH_SPECIES.find((s) => s.slug === loadout.speciesSlug) ?? speciesOptions[0];
  const selected = weapons.find((w) => w.id === loadout.weaponId);

  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loadout));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-4">
      <WeaponsDisclaimer />
      <div className="panel grid gap-4 p-5 md:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[var(--text-muted)]">Pet display name</span>
          <input
            className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-2 text-white"
            value={loadout.name}
            onChange={(e) => setLoadout((l) => ({ ...l, name: e.target.value }))}
            maxLength={40}
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--text-muted)]">Affinity</span>
          <select
            className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-2 text-white"
            value={loadout.affinity}
            onChange={(e) => {
              const affinity = e.target.value as SavedLoadout["affinity"];
              const nextSlug = DEFAULT_SPECIES[affinity];
              const nextSpecies = LAUNCH_SPECIES.find((s) => s.slug === nextSlug);
              setLoadout((l) => ({
                ...l,
                affinity,
                speciesSlug: nextSlug,
                name: nextSpecies?.name ?? l.name,
              }));
            }}
          >
            {AFFINITIES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[var(--text-muted)]">Species kit</span>
          <select
            className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-2 text-white"
            value={loadout.speciesSlug}
            onChange={(e) => {
              const slug = e.target.value;
              const sp = LAUNCH_SPECIES.find((s) => s.slug === slug);
              setLoadout((l) => ({
                ...l,
                speciesSlug: slug,
                name: sp?.name ?? l.name,
              }));
            }}
          >
            {speciesOptions.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name} · {s.temperament}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[var(--text-muted)]">Level (1–50)</span>
          <input
            type="number"
            min={1}
            max={50}
            className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-2 text-white"
            value={loadout.level}
            onChange={(e) =>
              setLoadout((l) => ({ ...l, level: Number(e.target.value) || 1 }))
            }
          />
        </label>
      </div>

      {selectedSpecies ? (
        <div className="panel p-4">
          <p className="font-display text-sm text-white">
            {selectedSpecies.name} kit preview
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            HP {selectedSpecies.baseStats.hp} · ATK {selectedSpecies.baseStats.attack} · DEF{" "}
            {selectedSpecies.baseStats.defense} · SPD {selectedSpecies.baseStats.speed}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2 text-xs">
            {selectedSpecies.abilities.map((ab) => (
              <li
                key={ab.id}
                className="flex items-center gap-2 rounded border border-[var(--stroke)] bg-[var(--bg-elevated)] px-2 py-1.5 text-[var(--cyan)]"
              >
                <GameImage
                  src={itemIconPath("abilities", ab.id)}
                  fallbackSrc={itemIconFallback("abilities", ab.id)}
                  alt=""
                  width={28}
                  height={28}
                  showDevBadge={false}
                  className="shrink-0"
                />
                <span>{ab.name}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-2 flex flex-wrap gap-2 text-xs">
            {selectedSpecies.traits.map((tr) => (
              <li
                key={tr.id}
                className="flex items-center gap-2 rounded border border-[var(--stroke)] bg-[var(--bg-elevated)] px-2 py-1.5 text-[var(--amber)]"
              >
                <GameImage
                  src={itemIconPath("abilities", tr.id)}
                  fallbackSrc={itemIconFallback("abilities", tr.id)}
                  alt=""
                  width={28}
                  height={28}
                  showDevBadge={false}
                  className="shrink-0"
                />
                <span>{tr.name}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h2 className="font-display text-lg text-white">Starter weapons</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Equipment is capped in ranked modes (≤18% power). Training uses mild normalization.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {weapons.map((w) => {
            const active = loadout.weaponId === w.id;
            return (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => setLoadout((l) => ({ ...l, weaponId: w.id }))}
                  className={cn(
                    "focus-ring h-full w-full rounded-md border p-4 text-left transition",
                    active
                      ? "border-[var(--cyan)] bg-[rgba(61,231,255,0.08)]"
                      : "border-[var(--stroke)] bg-[var(--bg-elevated)] hover:border-[rgba(61,231,255,0.35)]",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <GameImage
                      src={w.iconPath || itemIconPath("weapons", w.id)}
                      fallbackSrc={itemIconFallback("weapons", w.id)}
                      alt=""
                      width={48}
                      height={48}
                      showDevBadge={false}
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-white">{w.name}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--cyan)]">
                        {w.weaponClass} · {w.rarity}
                      </p>
                      <p className="mt-2 text-xs text-[var(--text-muted)]">{w.description}</p>
                      <p className="mt-2 text-xs text-[var(--mint)]">
                        ATK +{w.attackBonus} · DEF +{w.defenseBonus} · SPD{" "}
                        {w.speedBonus >= 0 ? "+" : ""}
                        {w.speedBonus}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {selected ? (
        <div className="panel p-4 text-sm text-[var(--text-muted)]">
          Selected: <span className="text-white">{selected.name}</span> · attaches at{" "}
          {selected.attachment}
        </div>
      ) : null}

      <button type="button" className="btn-primary focus-ring" onClick={persist}>
        {saved ? "Saved" : "Save loadout locally"}
      </button>
    </div>
  );
}
