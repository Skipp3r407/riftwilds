"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { WEAPON_CATALOG, ARMOR_CATALOG, POTION_CATALOG, ABILITY_CATALOG } from "@/lib/items/catalog";
import { normalizeRankedEquipBonus } from "@/lib/items/rarity";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { itemDisclosures } from "@/lib/items/disclosures";
import { playSfx } from "@/hooks/use-sfx";

const STORAGE = "riftwilds-pet-loadout-v1";

type LoadoutState = {
  weaponKey: string | null;
  armorKey: string | null;
  charmKey: string | null;
  cosmeticKey: string | null;
  ability1: string | null;
  ability2: string | null;
  ability3: string | null;
  ultimate: string | null;
  potion1: string | null;
  potion2: string | null;
};

const defaultLoadout: LoadoutState = {
  weaponKey: "wooden-paw-guard",
  armorKey: "cloth-pet-vest",
  charmKey: null,
  cosmeticKey: null,
  ability1: "ember-bolt",
  ability2: "ember-shield",
  ability3: "grove-mend",
  ultimate: "volcanic-heartburst",
  potion1: "small-healing-salve",
  potion2: "sparkfruit-juice",
};

export function PetLoadoutEditor({ publicPetId }: { publicPetId: string }) {
  const [loadout, setLoadout] = useState<LoadoutState>(defaultLoadout);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE}:${publicPetId}`);
      if (raw) setLoadout(JSON.parse(raw) as LoadoutState);
    } catch {
      /* ignore */
    }
  }, [publicPetId]);

  const weapon = WEAPON_CATALOG.find((w) => w.id === loadout.weaponKey);
  const armor = ARMOR_CATALOG.find((a) => a.id === loadout.armorKey);

  const casualStats = useMemo(() => {
    return {
      attack: 30 + (weapon?.stats.attack ?? 0),
      defense: 24 + (weapon?.stats.defense ?? 0) + (armor?.stats.defense ?? 0),
      speed: 20 + (weapon?.stats.speed ?? 0),
      maxHp: 100 + (armor?.stats.maxHp ?? 0),
    };
  }, [weapon, armor]);

  const rankedStats = useMemo(() => {
    const atkBonus = normalizeRankedEquipBonus(weapon?.stats.attack ?? 0, 30);
    const defBonus = normalizeRankedEquipBonus(
      (weapon?.stats.defense ?? 0) + (armor?.stats.defense ?? 0),
      24,
    );
    return {
      attack: 30 + atkBonus,
      defense: 24 + defBonus,
      speed: 20 + normalizeRankedEquipBonus(weapon?.stats.speed ?? 0, 20),
      maxHp: 100 + normalizeRankedEquipBonus(armor?.stats.maxHp ?? 0, 100),
    };
  }, [weapon, armor]);

  const persist = () => {
    localStorage.setItem(`${STORAGE}:${publicPetId}`, JSON.stringify(loadout));
    playSfx("pets.equip");
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--amber)]">{itemDisclosures.combat}</p>
      <p className="text-xs text-[var(--text-muted)]">
        RANKED_EQUIPMENT_NORMALIZATION_ENABLED=
        {String(featureFlagDefaults.RANKED_EQUIPMENT_NORMALIZATION_ENABLED)}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel relative overflow-hidden p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(61,231,255,0.12),transparent_60%)]" />
          <p className="font-display text-xs uppercase tracking-[0.2em] text-[var(--cyan)]">
            Pet preview · {publicPetId}
          </p>
          <div className="relative mx-auto mt-6 flex h-48 w-48 items-center justify-center">
            <Image
              src="/assets/placeholders/creature-cindercub-battle.svg"
              alt="Pet"
              width={180}
              height={180}
              unoptimized
            />
            {weapon ? (
              <Image
                src={weapon.iconPath}
                alt=""
                width={48}
                height={48}
                className="absolute bottom-6 right-4"
                unoptimized
              />
            ) : null}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-md bg-[var(--bg-elevated)] p-3">
              <p className="text-[var(--text-muted)]">Casual stats</p>
              <p className="mt-1 text-white">
                ATK {casualStats.attack} · DEF {casualStats.defense} · SPD {casualStats.speed} · HP{" "}
                {casualStats.maxHp}
              </p>
            </div>
            <div className="rounded-md bg-[var(--bg-elevated)] p-3">
              <p className="text-[var(--text-muted)]">Ranked normalized</p>
              <p className="mt-1 text-[var(--mint)]">
                ATK {rankedStats.attack} · DEF {rankedStats.defense} · SPD {rankedStats.speed} · HP{" "}
                {rankedStats.maxHp}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Slot
            label="Weapon"
            value={loadout.weaponKey}
            options={WEAPON_CATALOG.slice(0, 20).map((w) => ({ id: w.id, name: w.name }))}
            onChange={(v) => setLoadout((l) => ({ ...l, weaponKey: v }))}
          />
          <Slot
            label="Armor"
            value={loadout.armorKey}
            options={ARMOR_CATALOG.map((a) => ({ id: a.id, name: a.name }))}
            onChange={(v) => setLoadout((l) => ({ ...l, armorKey: v }))}
          />
          <Slot
            label="Ability 1"
            value={loadout.ability1}
            options={ABILITY_CATALOG.filter((a) => a.category !== "ULTIMATE").map((a) => ({
              id: a.id,
              name: a.name,
            }))}
            onChange={(v) => setLoadout((l) => ({ ...l, ability1: v }))}
          />
          <Slot
            label="Ability 2"
            value={loadout.ability2}
            options={ABILITY_CATALOG.filter((a) => a.category !== "ULTIMATE").map((a) => ({
              id: a.id,
              name: a.name,
            }))}
            onChange={(v) => setLoadout((l) => ({ ...l, ability2: v }))}
          />
          <Slot
            label="Ability 3"
            value={loadout.ability3}
            options={ABILITY_CATALOG.filter((a) => a.category !== "ULTIMATE").map((a) => ({
              id: a.id,
              name: a.name,
            }))}
            onChange={(v) => setLoadout((l) => ({ ...l, ability3: v }))}
          />
          <Slot
            label="Ultimate"
            value={loadout.ultimate}
            options={ABILITY_CATALOG.filter((a) => a.category === "ULTIMATE").map((a) => ({
              id: a.id,
              name: a.name,
            }))}
            onChange={(v) => setLoadout((l) => ({ ...l, ultimate: v }))}
          />
          <Slot
            label="Battle potion 1"
            value={loadout.potion1}
            options={POTION_CATALOG.filter((p) => p.potionType === "HEALTH" || p.potionType === "ENERGY").map(
              (p) => ({ id: p.id, name: p.name }),
            )}
            onChange={(v) => setLoadout((l) => ({ ...l, potion1: v }))}
          />
          <Slot
            label="Battle potion 2"
            value={loadout.potion2}
            options={POTION_CATALOG.filter((p) => p.potionType === "STATUS" || p.potionType === "ENERGY").map(
              (p) => ({ id: p.id, name: p.name }),
            )}
            onChange={(v) => setLoadout((l) => ({ ...l, potion2: v }))}
          />
          <button type="button" className="btn-primary focus-ring w-full" onClick={persist}>
            {saved ? "Saved" : "Save loadout"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Slot({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: { id: string; name: string }[];
  onChange: (v: string | null) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>
      <select
        className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-2 text-white"
        value={value ?? ""}
        onChange={(e) => {
          playSfx("pets.equip");
          onChange(e.target.value || null);
        }}
      >
        <option value="">None</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}
