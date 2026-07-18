"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { GameImage } from "@/components/assets/game-image";
import { SpeciesKitPanel } from "@/components/creatures/species-kit-panel";
import { CareActionButton } from "@/components/pets/care-action-button";
import { CareFxOverlay } from "@/components/pets/care-fx";
import { CareJournal } from "@/components/pets/care-journal";
import { CareNeedBanner } from "@/components/pets/care-need-banner";
import { CARE_STAT_ORDER, CareStatBar } from "@/components/pets/care-stat-bar";
import { HardcoreWarning } from "@/components/spirit/hardcore-warning";
import { RecoveryPanel } from "@/components/spirit/recovery-panel";
import {
  PetBiographyPanel,
  type BiographyPayload,
  type SpeciesLorePayload,
} from "@/components/pets/pet-biography-panel";
import { PetRewardVaultCard } from "@/components/pets/pet-reward-vault-card";
import { ProsperityAura } from "@/components/pets/prosperity-aura";
import { CARE_ACTION_DEFS, CARE_ITEM_CATALOG, type NeedMessage } from "@/game/creatures/care-catalog";
import type { CareAction, CareStats } from "@/game/creatures/care";
import type { CelebrationStyle } from "@/lib/rewards/types";
import type { SpeciesAbilityDef, SpeciesBaseStats, SpeciesTraitDef } from "@/game/creatures/rpg-types";
import { playCareSfx, playSfx } from "@/lib/audio/sfx";
import { playRiftlingCry, setCompanionSpeciesSlug } from "@/lib/audio/riftling-cries";
import { creaturePortraitPath, creatureIconPath } from "@/lib/assets/paths";
import { cn } from "@/lib/utils/cn";

type RpgPayload = {
  bodyType: string;
  habitat: string;
  food: string;
  baseStats: SpeciesBaseStats;
  abilities: SpeciesAbilityDef[];
  traits: SpeciesTraitDef[];
  evolutionPaths: string[];
};

type CareProgressPayload = {
  careXp: number;
  careLevel: number;
  careStreak: number;
  longestCareStreak: number;
  titles: string[];
  badges: string[];
  cosmetics: string[];
  journal: {
    id: string;
    at: string;
    action: CareAction;
    label: string;
    creditCost: number;
    careXpGained: number;
    note: string;
  }[];
  inventory: { itemId: string; qty: number }[];
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
  summary?: {
    careScore: number;
    rewardEligibleHint: boolean;
    careXp?: number;
    careLevel?: number;
    careStreak?: number;
    titles?: string[];
  };
  careProgress?: CareProgressPayload;
  rpg?: RpgPayload | null;
  biography?: BiographyPayload | null;
  speciesLore?: SpeciesLorePayload | null;
};

/** Primary care actions shown on the Care tab (Credits economy). */
const PRIMARY_ACTIONS: CareAction[] = [
  "PET",
  "FEED",
  "GIVE_WATER",
  "PLAY",
  "BRUSH",
  "CLEAN",
  "WALK",
  "REST",
  "SLEEP",
  "TRAIN",
  "EXERCISE",
  "LEARN_TRICK",
  "GROOM",
  "COOK_MEAL",
  "TREAT",
  "MEDITATE",
  "SOCIALIZE",
  "DECORATE",
  "HEAL",
  "MEDICINE",
  "VET",
  "ADVENTURE",
  "RECOVERY_CENTER",
  "ENCOURAGE",
];

const PROFILE_TABS = [
  { id: "overview", label: "Overview", icon: "/assets/ui/pets/tab-overview.svg" },
  { id: "care", label: "Care", icon: "/assets/ui/pets/tab-care.svg" },
  { id: "story", label: "Story", icon: "/assets/ui/pets/tab-story.svg" },
  { id: "rewards", label: "Rewards", icon: "/assets/ui/pets/tab-rewards.svg" },
  { id: "stats", label: "Stats", icon: "/assets/ui/pets/tab-stats.svg" },
] as const;

type ProfileTab = (typeof PROFILE_TABS)[number]["id"];

type AuraState = {
  pendingIntensity: number;
  status: "active" | "inactive";
  accumulating: boolean;
  largeDepositPulse: boolean;
  celebration: string | null;
};

function prettyLabel(value: string): string {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function IdentityChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel-inset min-w-0 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-0.5 truncate text-sm text-white">{value}</p>
    </div>
  );
}

function newRequestId(action: string): string {
  return `care_${action}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function LiveCarePanel({ publicPetId }: { publicPetId: string }) {
  const tabBaseId = useId();
  const [pet, setPet] = useState<PetPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ProfileTab>("overview");
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null);
  const [needMessage, setNeedMessage] = useState<NeedMessage | null>(null);
  const [fxKind, setFxKind] = useState<string | null>(null);
  const [fxActive, setFxActive] = useState(false);
  const needCooldownRef = useRef(0);
  const [aura, setAura] = useState<AuraState>({
    pendingIntensity: 0,
    status: "inactive",
    accumulating: false,
    largeDepositPulse: false,
    celebration: null,
  });

  const load = useCallback(async () => {
    const [petRes, careMetaRes] = await Promise.all([
      fetch(`/api/pets/${publicPetId}`),
      fetch(`/api/pets/${publicPetId}/care`),
    ]);
    const data = await petRes.json();
    if (!petRes.ok) {
      setError(data.error ?? "Failed to load pet");
      setPet(null);
    } else {
      setPet(data.pet);
      setError(null);
      if (typeof data.pet?.speciesSlug === "string") {
        setCompanionSpeciesSlug(data.pet.speciesSlug);
      }
      if (typeof data.creditsBalance === "number") {
        setCreditsBalance(data.creditsBalance);
      }
    }
    if (careMetaRes.ok) {
      const meta = await careMetaRes.json();
      if (typeof meta.creditsBalance === "number") {
        setCreditsBalance(meta.creditsBalance);
      }
    }
    setLoading(false);
  }, [publicPetId]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (action: CareAction) => {
    setBusy(action);
    playSfx("ui.click");
    const res = await fetch(`/api/pets/${publicPetId}/care`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, requestId: newRequestId(action) }),
    });
    const data = await res.json();
    if (!res.ok) {
      playSfx("ui.error");
      setError(data.message ?? data.error ?? "Care failed");
      if (typeof data.creditsBalance === "number") {
        setCreditsBalance(data.creditsBalance);
      }
    } else {
      playCareSfx(action);
      const mood =
        action === "PLAY" || action === "WALK" || action === "SOCIALIZE"
          ? "happy"
          : action === "REST" || action === "SLEEP"
            ? "idle"
            : "cry";
      if (pet.speciesSlug) {
        playRiftlingCry(pet.speciesSlug, { mood });
        setCompanionSpeciesSlug(pet.speciesSlug);
      }
      setPet(data.pet);
      if (typeof data.care?.creditsBalance === "number") {
        setCreditsBalance(data.care.creditsBalance);
      }
      if (data.care?.animation) {
        setFxKind(data.care.animation);
        setFxActive(true);
        window.setTimeout(() => setFxActive(false), 750);
      }
      const msg = data.care?.needMessage as NeedMessage | null | undefined;
      const now = Date.now();
      if (msg && now - needCooldownRef.current > 45_000) {
        setNeedMessage(msg);
        needCooldownRef.current = now;
        if (msg.tone !== "content") playSfx("pets.need_low");
      }
      if (data.care?.newMilestones?.length) {
        const titles = data.care.newMilestones
          .map((m: { title: string }) => m.title)
          .join(", ");
        setError(null);
        setNeedMessage({
          id: "streak_reward",
          tone: "content",
          text: `Streak milestone! Unlocked: ${titles} (cosmetic / title — not Credits).`,
        });
      }
    }
    setBusy(null);
  };

  if (loading) {
    return (
      <div className="panel p-6 text-sm text-[var(--text-muted)]" aria-busy="true">
        Loading pet…
      </div>
    );
  }
  if (error && !pet) {
    return <div className="panel p-6 text-sm text-[var(--coral)]">{error}</div>;
  }
  if (!pet) return null;

  const speciesName =
    pet.speciesLore?.name ??
    (pet.speciesSlug ? prettyLabel(pet.speciesSlug) : "Unknown species");
  const region =
    pet.biography?.favoriteRegion ?? pet.rpg?.habitat ?? pet.speciesLore?.nativeRegion ?? "—";
  const favoriteFood = pet.biography?.favoriteFood ?? pet.rpg?.food ?? "—";
  const favoriteActivity = pet.biography?.favoriteActivity ?? "—";
  const careScore =
    pet.summary?.careScore ??
    Math.round(
      (pet.care.hunger +
        pet.care.thirst +
        pet.care.happiness +
        pet.care.hygiene +
        pet.care.energy +
        pet.care.health +
        pet.care.bond +
        (100 - pet.care.stress)) /
        8,
    );
  const progress = pet.careProgress;
  const shortWho =
    pet.biography?.temperamentSummary ??
    pet.speciesLore?.shortBio ??
    `${pet.name} is a ${prettyLabel(pet.rarity)} ${speciesName} with a ${prettyLabel(pet.temperament)} temperament.`;

  return (
    <div className="space-y-4">
      <header className="panel panel-glow relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 surface-grid opacity-20" aria-hidden />
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-40"
          style={{
            background:
              aura.status === "active"
                ? "radial-gradient(circle, rgba(61,231,255,0.22) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(148,197,255,0.1) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <div className="relative flex flex-col items-center gap-5 md:flex-row md:items-start md:gap-8">
          {pet.speciesSlug ? (
            <div className="relative">
              <button
                type="button"
                className="focus-ring rounded-xl"
                aria-label={`Hear ${pet.name} cry`}
                title="Hear cry"
                onClick={() => {
                  playRiftlingCry(pet.speciesSlug, {
                    mood: "happy",
                    force: true,
                    ignoreReducedSound: true,
                  });
                  setCompanionSpeciesSlug(pet.speciesSlug);
                }}
              >
                <ProsperityAura
                  pendingIntensity={aura.pendingIntensity}
                  status={aura.status}
                  accumulating={aura.accumulating}
                  largeDepositPulse={aura.largeDepositPulse}
                  celebration={(aura.celebration as CelebrationStyle | null) ?? null}
                  className="h-44 w-44 sm:h-48 sm:w-48"
                >
                  <GameImage
                    src={creaturePortraitPath(pet.speciesSlug)}
                    alt={`${pet.name} portrait`}
                    width={176}
                    height={176}
                    fallbackSrc={creatureIconPath(pet.speciesSlug, true)}
                    showDevBadge={false}
                  />
                </ProsperityAura>
              </button>
              <CareFxOverlay kind={fxKind} active={fxActive} />
            </div>
          ) : null}

          <div className="min-w-0 flex-1 text-center md:text-left">
            <p className="page-kicker">Your Riftling</p>
            <h1 className="page-title mt-1">{pet.name}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {speciesName}
              {pet.speciesLore?.title ? ` · ${pet.speciesLore.title}` : null}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <IdentityChip label="Species" value={speciesName} />
              <IdentityChip label="Affinity" value={prettyLabel(pet.affinity)} />
              <IdentityChip label="Rarity" value={prettyLabel(pet.rarity)} />
              <IdentityChip label="Mood" value={prettyLabel(pet.condition)} />
              <IdentityChip label="Health" value={`${Math.round(pet.care.health)}%`} />
              <IdentityChip label="Care score" value={`${careScore}`} />
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <IdentityChip label="Region" value={prettyLabel(region)} />
              <IdentityChip label="Likes to eat" value={prettyLabel(favoriteFood)} />
              <IdentityChip label="Likes to do" value={prettyLabel(favoriteActivity)} />
            </div>

            {error ? <p className="mt-3 text-sm text-[var(--coral)]">{error}</p> : null}
          </div>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Pet profile sections"
        className="panel flex flex-wrap gap-1.5 p-2"
      >
        {PROFILE_TABS.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`${tabBaseId}-${t.id}`}
              aria-selected={selected}
              aria-controls={`${tabBaseId}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                playSfx("ui.click");
                setTab(t.id);
              }}
              className={cn(
                "focus-ring inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs uppercase tracking-wider transition sm:flex-none",
                selected
                  ? "border-[var(--cyan)] bg-[rgba(56,189,248,0.14)] text-white"
                  : "border-transparent text-[var(--text-muted)] hover:border-[var(--stroke)] hover:text-white",
              )}
            >
              <Image src={t.icon} alt="" width={18} height={18} className="opacity-90" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${tabBaseId}-panel-${tab}`}
        aria-labelledby={`${tabBaseId}-${tab}`}
        className="min-w-0"
      >
        {tab === "overview" ? (
          <section className="panel space-y-5 p-5 sm:p-6">
            <div>
              <h2 className="font-display text-lg text-white">Who is this Riftling?</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">
                {shortWho}
              </p>
              {pet.biography?.motto ? (
                <p className="mt-3 italic text-white">“{pet.biography.motto}”</p>
              ) : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <IdentityChip label="Temperament" value={prettyLabel(pet.temperament)} />
              <IdentityChip
                label="Bond"
                value={
                  pet.biography?.bondStage
                    ? prettyLabel(pet.biography.bondStage)
                    : `${Math.round(pet.care.bond)}%`
                }
              />
              <IdentityChip label="Body type" value={prettyLabel(pet.rpg?.bodyType ?? "—")} />
              <IdentityChip
                label="Reward hint"
                value={
                  pet.summary?.rewardEligibleHint
                    ? "May share treasury rewards when eligible"
                    : "Not currently flagged as eligible"
                }
              />
            </div>

            <div>
              <h3 className="font-display text-sm text-white">Care at a glance</h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Open the Care tab — basic care uses Credits, never SOL.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {(["hunger", "happiness", "hygiene", "bond"] as const).map((key) => (
                  <CareStatBar key={key} statKey={key} value={pet.care[key]} compact />
                ))}
              </div>
              <button
                type="button"
                className="btn-primary focus-ring mt-4 text-sm"
                onClick={() => setTab("care")}
              >
                Take care of {pet.name}
              </button>
            </div>

            <RecoveryPanel petPublicId={publicPetId} />
            <HardcoreWarning petPublicId={publicPetId} />
          </section>
        ) : null}

        {tab === "care" ? (
          <section className="panel relative space-y-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-lg text-white">Care</h2>
                <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
                  Companion care spends in-game Credits through the ledger. Pet, Rest, and Sleep are
                  free. Adventure costs energy — never SOL.
                </p>
              </div>
              <div className="panel-inset px-3 py-2 text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Credits
                </p>
                <p className="text-lg tabular-nums text-white">
                  {creditsBalance == null ? "…" : creditsBalance}
                </p>
              </div>
            </div>

            <CareNeedBanner message={needMessage} />

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {CARE_STAT_ORDER.map((key) => (
                <CareStatBar key={key} statKey={key} value={pet.care[key]} />
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <IdentityChip
                label="Care level"
                value={`${progress?.careLevel ?? pet.summary?.careLevel ?? 1}`}
              />
              <IdentityChip
                label="Care XP"
                value={`${progress?.careXp ?? pet.summary?.careXp ?? 0}`}
              />
              <IdentityChip
                label="Care streak"
                value={`${progress?.careStreak ?? pet.summary?.careStreak ?? 0} days`}
              />
              <IdentityChip
                label="Best streak"
                value={`${progress?.longestCareStreak ?? 0} days`}
              />
              <IdentityChip
                label="Title"
                value={progress?.titles?.at(-1) ?? pet.summary?.titles?.at(-1) ?? "—"}
              />
              <IdentityChip
                label="Badges"
                value={`${progress?.badges?.length ?? 0}`}
              />
            </div>

            <div>
              <h3 className="font-display text-sm text-white">Actions</h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Hover for cost, cooldown, and expected stat changes.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PRIMARY_ACTIONS.map((action) => {
                  const def = CARE_ACTION_DEFS[action];
                  return (
                    <CareActionButton
                      key={action}
                      def={def}
                      busy={busy === action}
                      disabled={!!busy}
                      creditsBalance={creditsBalance}
                      onClick={() => void act(action)}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-display text-sm text-white">Pet inventory</h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Food, medicine, toys, and accessories. Shop / craft hooks listed for each item.
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(progress?.inventory ?? []).map((slot) => {
                  const item = CARE_ITEM_CATALOG.find((c) => c.id === slot.itemId);
                  return (
                    <li key={slot.itemId} className="panel-inset px-3 py-2.5 text-sm">
                      <p className="text-white">{item?.name ?? slot.itemId}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        ×{slot.qty}
                        {item ? ` · shop ${item.shopPriceCredits} Credits` : ""}
                      </p>
                      {item?.craftRecipeId ? (
                        <p className="mt-1 text-[10px] text-[var(--cyan)]">
                          Craft: {item.craftRecipeId}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
                {!progress?.inventory?.length ? (
                  <li className="text-sm text-[var(--text-muted)]">Inventory empty.</li>
                ) : null}
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm text-white">Care journal</h3>
              <div className="mt-3">
                <CareJournal entries={progress?.journal ?? []} />
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Permanent death is disabled. Critical pets stay recoverable. Streak rewards are titles
              and cosmetics — never unlimited Credits. Trait care bonuses still apply.
            </p>
          </section>
        ) : null}

        {tab === "story" ? (
          pet.speciesSlug ? (
            <PetBiographyPanel
              petName={pet.name}
              speciesSlug={pet.speciesSlug}
              temperament={pet.temperament}
              biography={pet.biography ?? null}
              speciesLore={pet.speciesLore ?? null}
              memories={pet.memories}
              mode="story"
            />
          ) : (
            <section className="panel p-6 text-sm text-[var(--text-muted)]">
              No biography available for this companion yet.
            </section>
          )
        ) : null}

        {tab === "rewards" ? (
          <PetRewardVaultCard publicPetId={publicPetId} onAuraState={setAura} />
        ) : null}

        {tab !== "rewards" ? (
          <div className="sr-only" aria-hidden>
            <PetRewardVaultCard publicPetId={publicPetId} onAuraState={setAura} />
          </div>
        ) : null}

        {tab === "stats" ? (
          <section className="panel space-y-4 p-5 sm:p-6">
            <div>
              <h2 className="font-display text-lg text-white">Stats & battle kit</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Advanced combat and genetics info. Skip this until you enter the Arena.
              </p>
            </div>

            {pet.rpg ? (
              <>
                <SpeciesKitPanel
                  baseStats={pet.rpg.baseStats}
                  abilities={pet.rpg.abilities}
                  traits={pet.rpg.traits}
                />
                {pet.rpg.evolutionPaths.length ? (
                  <p className="text-xs text-[var(--text-muted)]">
                    Evolution paths: {pet.rpg.evolutionPaths.join(" → ")}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                No combat kit data for this Riftling yet.
              </p>
            )}

            <details className="panel-inset group p-4">
              <summary className="cursor-pointer font-display text-sm text-white focus-ring rounded">
                Genetics & advanced details
              </summary>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div className="panel-soft px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Public ID
                  </dt>
                  <dd className="mt-1 break-all text-white">{pet.publicId}</dd>
                </div>
                <div className="panel-soft px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Affinity
                  </dt>
                  <dd className="mt-1 text-white">{prettyLabel(pet.affinity)}</dd>
                </div>
                <div className="panel-soft px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Body type
                  </dt>
                  <dd className="mt-1 text-white">{prettyLabel(pet.rpg?.bodyType ?? "—")}</dd>
                </div>
                <div className="panel-soft px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Habitat
                  </dt>
                  <dd className="mt-1 text-white">{prettyLabel(pet.rpg?.habitat ?? region)}</dd>
                </div>
              </dl>
            </details>
          </section>
        ) : null}
      </div>
    </div>
  );
}
