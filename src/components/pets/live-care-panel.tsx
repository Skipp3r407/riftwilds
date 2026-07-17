"use client";

import { useCallback, useEffect, useState } from "react";
import { GameImage } from "@/components/assets/game-image";
import { SpeciesKitPanel } from "@/components/creatures/species-kit-panel";
import {
  PetBiographyPanel,
  type BiographyPayload,
  type SpeciesLorePayload,
} from "@/components/pets/pet-biography-panel";
import { PetRewardVaultCard } from "@/components/pets/pet-reward-vault-card";
import { ProsperityAura } from "@/components/pets/prosperity-aura";
import type { CelebrationStyle } from "@/lib/rewards/types";
import type { SpeciesAbilityDef, SpeciesBaseStats, SpeciesTraitDef } from "@/game/creatures/rpg-types";
import { playSfx } from "@/hooks/use-sfx";
import { creaturePortraitPath, creatureIconPath } from "@/lib/assets/paths";
import { cn } from "@/lib/utils/cn";

type CareStats = {
  hunger: number;
  thirst: number;
  happiness: number;
  hygiene: number;
  energy: number;
  health: number;
  bond: number;
  stress: number;
};

type RpgPayload = {
  bodyType: string;
  habitat: string;
  food: string;
  baseStats: SpeciesBaseStats;
  abilities: SpeciesAbilityDef[];
  traits: SpeciesTraitDef[];
  evolutionPaths: string[];
};

type PetPayload = {
  publicId: string;
  name: string;
  speciesSlug?: string;
  affinity: string;
  rarity: string;
  temperament: string;
  condition: string;
  care: CareStats;
  memories: { kind: string; label: string; at: string; narrative?: string }[];
  summary?: { careScore: number; rewardEligibleHint: boolean };
  rpg?: RpgPayload | null;
  biography?: BiographyPayload | null;
  speciesLore?: SpeciesLorePayload | null;
};

const ACTIONS = [
  ["FEED", "Feed"],
  ["GIVE_WATER", "Water"],
  ["PLAY", "Play"],
  ["CLEAN", "Clean"],
  ["REST", "Rest"],
  ["HEAL", "Heal"],
  ["MEDICINE", "Medicine"],
  ["RECOVERY_CENTER", "Recovery"],
] as const;

const STAT_KEYS: (keyof CareStats)[] = [
  "hunger",
  "thirst",
  "happiness",
  "hygiene",
  "energy",
  "health",
  "bond",
  "stress",
];

type AuraState = {
  pendingIntensity: number;
  status: "active" | "inactive";
  accumulating: boolean;
  largeDepositPulse: boolean;
  celebration: string | null;
};

export function LiveCarePanel({ publicPetId }: { publicPetId: string }) {
  const [pet, setPet] = useState<PetPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [aura, setAura] = useState<AuraState>({
    pendingIntensity: 0,
    status: "inactive",
    accumulating: false,
    largeDepositPulse: false,
    celebration: null,
  });

  const load = useCallback(async () => {
    const res = await fetch(`/api/pets/${publicPetId}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load pet");
      setPet(null);
    } else {
      setPet(data.pet);
      setError(null);
    }
    setLoading(false);
  }, [publicPetId]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (action: string) => {
    setBusy(action);
    playSfx("ui.click");
    const res = await fetch(`/api/pets/${publicPetId}/care`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) {
      playSfx("ui.error");
      setError(data.error ?? "Care failed");
    } else {
      playSfx("pets.care");
      setPet(data.pet);
    }
    setBusy(null);
  };

  if (loading) {
    return <div className="panel p-6 text-sm text-[var(--text-muted)]">Loading pet…</div>;
  }
  if (error && !pet) {
    return <div className="panel p-6 text-sm text-[var(--coral)]">{error}</div>;
  }
  if (!pet) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <header className="panel panel-glow relative overflow-hidden p-6 lg:w-[22rem] lg:shrink-0">
          <div className="pointer-events-none absolute inset-0 surface-grid opacity-25" />
          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center lg:flex-col">
            {pet.speciesSlug ? (
              <ProsperityAura
                pendingIntensity={aura.pendingIntensity}
                status={aura.status}
                accumulating={aura.accumulating}
                largeDepositPulse={aura.largeDepositPulse}
                celebration={(aura.celebration as CelebrationStyle | null) ?? null}
              >
                <GameImage
                  src={creaturePortraitPath(pet.speciesSlug)}
                  alt={`${pet.name} portrait`}
                  width={160}
                  height={160}
                  fallbackSrc={creatureIconPath(pet.speciesSlug, true)}
                  showDevBadge={false}
                />
              </ProsperityAura>
            ) : null}
            <div className="text-center sm:text-left lg:text-center">
              <p className="page-kicker">Pet profile</p>
              <h1 className="page-title mt-2">{pet.name}</h1>
              <p className="page-lede">
                {pet.rarity} · {pet.affinity} · {pet.temperament} · {pet.condition}
                {pet.summary ? ` · Care score ${pet.summary.careScore}` : null}
              </p>
              {pet.rpg ? (
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  {pet.rpg.habitat} · prefers {pet.rpg.food} ·{" "}
                  {pet.rpg.bodyType.replaceAll("_", " ")}
                </p>
              ) : null}
              {error ? <p className="mt-2 text-sm text-[var(--coral)]">{error}</p> : null}
            </div>
          </div>
        </header>
        <div className="min-w-0 flex-1">
          <PetRewardVaultCard publicPetId={publicPetId} onAuraState={setAura} />
        </div>
      </div>

      {pet.speciesSlug ? (
        <PetBiographyPanel
          petName={pet.name}
          speciesSlug={pet.speciesSlug}
          temperament={pet.temperament}
          biography={pet.biography ?? null}
          speciesLore={pet.speciesLore ?? null}
          memories={pet.memories}
        />
      ) : null}

      {pet.rpg ? (
        <section className="panel p-6">
          <h2 className="font-display text-lg text-white">Combat kit</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Species abilities and traits used in Arena training. Signature techniques are unique to
            this Riftling line.
          </p>
          <div className="mt-4">
            <SpeciesKitPanel
              baseStats={pet.rpg.baseStats}
              abilities={pet.rpg.abilities}
              traits={pet.rpg.traits}
            />
          </div>
          {pet.rpg.evolutionPaths.length ? (
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              Evolution paths: {pet.rpg.evolutionPaths.join(" → ")}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="panel p-6">
        <h2 className="font-display text-lg text-white">Care</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {STAT_KEYS.map((key) => {
            const value = pet.care[key];
            return (
              <div key={key} className="panel-inset px-3 py-2.5">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="capitalize text-[var(--text-muted)]">{key}</span>
                  <span className="tabular-nums text-white">{value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[rgba(148,197,255,0.1)]">
                  <div
                    className="h-full rounded-full bg-[var(--grad-cta)]"
                    style={{
                      width: `${Math.min(100, value)}%`,
                      background: "var(--grad-cta)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {ACTIONS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={cn("btn-secondary focus-ring text-xs", busy === id && "opacity-60")}
              disabled={!!busy}
              onClick={() => void act(id)}
            >
              {busy === id ? "…" : label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--text-muted)]">
          Permanent death is disabled. Critical pets stay recoverable. Trait care bonuses apply on
          matching actions (play, rest, heal).
        </p>
      </section>

      <section className="panel p-6">
        <h2 className="font-display text-lg text-white">Memories</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
          {pet.memories.map((m) => (
            <li key={`${m.kind}-${m.at}`} className="panel-inset px-3 py-2">
              <span className="text-white">{m.label}</span>
              <span className="ml-2 text-xs">{new Date(m.at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
