"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameImage } from "@/components/assets/game-image";
import { StatusChip } from "@/components/shared/page-header";
import { playSfx } from "@/hooks/use-sfx";
import { playRiftlingCry, setCompanionSpeciesSlug } from "@/lib/audio/riftling-cries";
import { guestFetch, rememberGuestTokenFromPayload } from "@/lib/auth/guest-client";
import {
  creatureIconPath,
  creaturePortraitPath,
  eggFullPath,
  eggTypeAssetClass,
  hatcheryClaimEggPath,
  hatcheryEmptyEggsPath,
  hatcheryEmptyRiftlingsPath,
  hatcheryRarityIconPath,
} from "@/lib/assets/paths";
import { projectConfig } from "@/lib/config/project";

type EggRow = {
  publicId: string;
  eggType?: string;
  eggTypeLabel: string;
  hatchStatus: string;
  incubationEndsAt: string | null;
};

type PetRow = {
  publicId: string;
  name: string;
  speciesSlug?: string;
  rarity: string;
  affinity: string;
  condition: string;
};

type Reveal = {
  species: string;
  speciesSlug?: string;
  affinity: string;
  rarity: string;
  temperament: string;
  evolutionPaths: string[];
  signatureAbility?: { name: string; description: string } | null;
  signatureTrait?: { name: string; description: string } | null;
};

type HatcheryOffer = {
  cap: number;
  released: number;
  remaining: number;
  exhausted: boolean;
  canClaimFree: boolean;
  alreadyClaimedFree: boolean;
  canBuyPremium: boolean;
  premiumPriceCredits: number;
  creditBalance: number;
};

function statusTone(status: string): "live" | "warn" | "info" | "default" {
  if (status === "READY") return "live";
  if (status === "INCUBATING") return "warn";
  if (status === "HATCHED") return "info";
  return "default";
}

function eggIsReady(egg: EggRow): boolean {
  if (egg.hatchStatus === "READY") return true;
  if (egg.hatchStatus === "INCUBATING" && egg.incubationEndsAt) {
    return new Date(egg.incubationEndsAt).getTime() <= Date.now();
  }
  return false;
}

function displayStatus(egg: EggRow): string {
  if (egg.hatchStatus === "INCUBATING" && eggIsReady(egg)) return "READY";
  return egg.hatchStatus;
}

function eggThumbSrc(egg: EggRow): string {
  return eggFullPath(eggTypeAssetClass(egg.eggType ?? "COMMON_RIFT"));
}

function formatCredits(n: number): string {
  return n.toLocaleString("en-US");
}

export function HatcheryDashboard() {
  const [eggs, setEggs] = useState<EggRow[]>([]);
  const [pets, setPets] = useState<PetRow[]>([]);
  const [offer, setOffer] = useState<HatcheryOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [tick, setTick] = useState(0);
  const lastIncubateSfx = useRef(0);
  const claimedIdsRef = useRef<Set<string>>(new Set());

  const applyOffer = (raw: unknown) => {
    if (!raw || typeof raw !== "object") return;
    const o = raw as Partial<HatcheryOffer>;
    if (typeof o.premiumPriceCredits !== "number") return;
    setOffer({
      cap: typeof o.cap === "number" ? o.cap : 0,
      released: typeof o.released === "number" ? o.released : 0,
      remaining: typeof o.remaining === "number" ? o.remaining : 0,
      exhausted: Boolean(o.exhausted),
      canClaimFree: Boolean(o.canClaimFree),
      alreadyClaimedFree: Boolean(o.alreadyClaimedFree),
      canBuyPremium: Boolean(o.canBuyPremium),
      premiumPriceCredits: o.premiumPriceCredits,
      creditBalance: typeof o.creditBalance === "number" ? o.creditBalance : 0,
    });
  };

  const refresh = useCallback(async () => {
    try {
      const res = await guestFetch("/api/hatchery/eggs");
      const data = await res.json().catch(() => ({}));
      rememberGuestTokenFromPayload(data);
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : `Could not load hatchery (${res.status})`,
        );
        setLoading(false);
        return;
      }
      applyOffer(data.offer);
      const nextEggs: EggRow[] = data.eggs ?? [];
      // Keep recently claimed eggs if list is empty (cookie/header race on mobile).
      setEggs((prev) => {
        if (nextEggs.length > 0) return nextEggs;
        const kept = prev.filter((e) => claimedIdsRef.current.has(e.publicId));
        return kept.length > 0 ? kept : nextEggs;
      });
      setPets(
        (data.pets ?? []).map((p: PetRow & { speciesName?: string }) => ({
          publicId: p.publicId,
          name: p.name ?? p.speciesName ?? "Riftling",
          speciesSlug: p.speciesSlug,
          rarity: p.rarity,
          affinity: p.affinity,
          condition: p.condition,
        })),
      );
    } catch {
      setError("Could not reach hatchery. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const incubating = eggs.some((e) => e.hatchStatus === "INCUBATING" && !eggIsReady(e));
    if (!incubating) return;
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
      const now = Date.now();
      if (now - lastIncubateSfx.current >= 3000) {
        lastIncubateSfx.current = now;
        playSfx("hatchery.incubate_tick");
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [eggs]);

  useEffect(() => {
    const readySoon = eggs.some((e) => eggIsReady(e) && e.hatchStatus === "INCUBATING");
    if (readySoon) void refresh();
  }, [tick, eggs, refresh]);

  const pushEggFromResponse = (egg: {
    publicId?: string;
    eggType?: string;
    eggTypeLabel?: string;
    hatchStatus?: string;
    incubationEndsAt?: string | null;
  }) => {
    if (!egg?.publicId) return;
    claimedIdsRef.current.add(egg.publicId);
    setEggs((prev) => {
      if (prev.some((e) => e.publicId === egg.publicId)) return prev;
      return [
        {
          publicId: egg.publicId!,
          eggType: egg.eggType ?? "COMMON_RIFT",
          eggTypeLabel: egg.eggTypeLabel ?? "Common Rift Egg",
          hatchStatus: egg.hatchStatus ?? "INCUBATING",
          incubationEndsAt: egg.incubationEndsAt ?? null,
        },
        ...prev,
      ];
    });
  };

  const claim = async () => {
    setBusy("claim");
    setError(null);
    playSfx("ui.click");
    try {
      const res = await guestFetch("/api/hatchery/claim", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      rememberGuestTokenFromPayload(data);
      applyOffer(data.offer);
      if (!res.ok) {
        playSfx("ui.error");
        setError(
          typeof data.message === "string"
            ? data.message
            : typeof data.error === "string"
              ? data.error
              : `Claim failed (${res.status})`,
        );
      } else {
        playSfx("hatchery.claim");
        pushEggFromResponse(data.egg);
      }
      await refresh();
    } catch {
      playSfx("ui.error");
      setError("Claim failed — network error. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const purchase = async () => {
    setBusy("purchase");
    setError(null);
    playSfx("ui.click");
    try {
      const res = await guestFetch("/api/hatchery/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: `egg-buy:${Date.now()}:${Math.random().toString(16).slice(2, 10)}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      rememberGuestTokenFromPayload(data);
      applyOffer(data.offer);
      if (!res.ok) {
        playSfx("ui.error");
        setError(
          typeof data.message === "string"
            ? data.message
            : data.error === "insufficient_credits"
              ? `Not enough Credits — need ${formatCredits(data.priceCredits ?? offer?.premiumPriceCredits ?? 0)}.`
              : `Purchase failed (${res.status})`,
        );
      } else {
        playSfx("hatchery.claim");
        pushEggFromResponse(data.egg);
      }
      await refresh();
    } catch {
      playSfx("ui.error");
      setError("Purchase failed — network error. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const hatch = async (eggPublicId: string, skipWait = false) => {
    setBusy(eggPublicId);
    setError(null);
    setReveal(null);
    playSfx("ui.click");
    try {
      const res = await guestFetch("/api/hatchery/hatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eggPublicId, skipWait }),
      });
      const data = await res.json().catch(() => ({}));
      rememberGuestTokenFromPayload(data);
      if (!res.ok) {
        playSfx("ui.error");
        setError(
          typeof data.error === "string" ? data.error : `Hatch failed (${res.status})`,
        );
      } else {
        playSfx("hatchery.hatch_reveal");
        const slug =
          typeof data.reveal?.speciesSlug === "string" ? data.reveal.speciesSlug : null;
        if (slug) {
          playRiftlingCry(slug, { mood: "happy", force: true });
          setCompanionSpeciesSlug(slug);
        }
        setReveal(data.reveal);
        claimedIdsRef.current.delete(eggPublicId);
        setEggs((prev) => prev.filter((e) => e.publicId !== eggPublicId));
      }
      await refresh();
    } catch {
      playSfx("ui.error");
      setError("Hatch failed — network error. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const countdown = (endsAt: string | null) => {
    if (!endsAt) return "—";
    const ms = new Date(endsAt).getTime() - Date.now();
    if (ms <= 0) return "Ready";
    return `${Math.ceil(ms / 1000)}s`;
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel panel-glow relative flex flex-col items-center overflow-hidden p-5 sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 surface-grid opacity-30"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[rgba(61,231,255,0.16)] blur-3xl"
            aria-hidden
          />
          <div className="egg-wobble relative h-44 w-36 sm:h-52 sm:w-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hatcheryClaimEggPath()}
              alt="Common Rift starter egg"
              className="h-full w-full object-contain drop-shadow-[0_0_40px_rgba(61,231,255,0.5)]"
            />
          </div>
          {offer ? (
            <div className="relative mt-4 flex flex-wrap items-center justify-center gap-2">
              {offer.exhausted ? (
                <StatusChip tone="warn">Free eggs sold out</StatusChip>
              ) : (
                <StatusChip tone="live">
                  {formatCredits(offer.remaining)} free left
                </StatusChip>
              )}
              {offer.canBuyPremium ? (
                <StatusChip tone="info">
                  {formatCredits(offer.creditBalance)} Credits
                </StatusChip>
              ) : null}
            </div>
          ) : null}
          <p className="relative mt-5 max-w-sm text-center text-sm text-[var(--text-muted)] sm:mt-6">
            {offer?.canClaimFree
              ? "Claim a free starter Common Rift Egg while the early pool lasts. Demo incubation is ~30 seconds. Hatch reveals are server-rolled — no near-miss theater."
              : offer?.exhausted
                ? "Free starter eggs are gone. Late keepers can still buy a Common Rift Egg for a steep Credits price — soft currency only, never SOL."
                : offer?.alreadyClaimedFree
                  ? "You already claimed your free starter. Need another egg? Buy one with Credits at a premium late-game price."
                  : "Claim a starter Common Rift Egg. Demo incubation is ~30 seconds. Hatch reveals are server-rolled — no near-miss theater."}
          </p>
          {offer?.canClaimFree || !offer ? (
            <button
              type="button"
              className="btn-primary focus-ring relative mt-5 min-h-12 w-full max-w-sm touch-manipulation text-base sm:w-auto sm:min-h-0 sm:text-sm"
              disabled={busy === "claim" || busy === "purchase"}
              onClick={() => void claim()}
            >
              {busy === "claim" ? "Claiming…" : "Claim free starter egg"}
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary focus-ring relative mt-5 min-h-12 w-full max-w-sm touch-manipulation text-base sm:w-auto sm:min-h-0 sm:text-sm"
              disabled={busy === "claim" || busy === "purchase"}
              onClick={() => void purchase()}
            >
              {busy === "purchase"
                ? "Buying…"
                : `Buy egg — ${formatCredits(offer.premiumPriceCredits)} Credits`}
            </button>
          )}
          {error ? (
            <p className="relative mt-3 max-w-sm text-center text-sm text-[var(--coral)]">{error}</p>
          ) : null}
        </div>

        <div className="panel p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg text-white">Your eggs</h2>
            <StatusChip tone="info">{eggs.length} held</StatusChip>
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-[var(--text-muted)]">Loading…</p>
          ) : eggs.length === 0 ? (
            <div className="empty-state mt-4 min-h-[12rem] gap-3 px-4 py-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hatcheryEmptyEggsPath()}
                alt=""
                className="relative z-[1] h-28 w-auto max-w-[14rem] object-contain drop-shadow-[0_0_24px_rgba(61,231,255,0.28)] sm:h-32"
              />
              <p className="relative z-[1] text-sm text-[var(--text-muted)]">
                {offer?.canBuyPremium && !offer.canClaimFree
                  ? "None yet — buy a premium egg above, or wait if free stock returns."
                  : "None yet — claim a free starter above."}
              </p>
            </div>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-1">
              {eggs.map((egg) => {
                const ready = eggIsReady(egg);
                const status = displayStatus(egg);
                const incubating = status === "INCUBATING";
                return (
                  <li
                    key={egg.publicId}
                    className="panel-inset flex flex-col gap-3 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <GameImage
                        src={eggThumbSrc(egg)}
                        alt=""
                        width={64}
                        height={72}
                        fallbackSrc="/assets/eggs/common-rift.svg"
                        showDevBadge={false}
                        unoptimized
                        className="shrink-0 drop-shadow-[0_0_12px_rgba(61,231,255,0.25)]"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{egg.eggTypeLabel}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <StatusChip tone={statusTone(status)}>{status}</StatusChip>
                          <span className="text-xs text-[var(--text-muted)]">
                            {countdown(egg.incubationEndsAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap">
                      {incubating ? (
                        <button
                          type="button"
                          className="btn-secondary focus-ring min-h-12 w-full touch-manipulation px-4 py-3 text-sm sm:min-h-0 sm:w-auto sm:px-3 sm:py-2 sm:text-xs"
                          disabled={busy === egg.publicId}
                          onClick={() => void hatch(egg.publicId, true)}
                        >
                          {busy === egg.publicId ? "Hatching…" : "Skip wait (demo)"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className={
                          ready
                            ? "btn-primary focus-ring min-h-12 w-full touch-manipulation px-4 py-3 text-sm sm:min-h-0 sm:w-auto sm:px-3 sm:py-2 sm:text-xs"
                            : "btn-secondary focus-ring min-h-12 w-full touch-manipulation px-4 py-3 text-sm sm:min-h-0 sm:w-auto sm:px-3 sm:py-2 sm:text-xs"
                        }
                        disabled={!ready || busy === egg.publicId}
                        onClick={() => void hatch(egg.publicId)}
                      >
                        {busy === egg.publicId ? "Hatching…" : "Hatch"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {reveal ? (
        <section className="panel panel-glow p-4 sm:p-6">
          <p className="page-kicker">Reveal complete</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            {reveal.speciesSlug ? (
              <GameImage
                src={creaturePortraitPath(reveal.speciesSlug)}
                alt={reveal.species}
                width={128}
                height={128}
                fallbackSrc={creatureIconPath(reveal.speciesSlug, true)}
                showDevBadge={false}
                className="shrink-0 drop-shadow-[0_0_20px_rgba(61,231,255,0.3)]"
              />
            ) : null}
            <div className="min-w-0">
              <h2 className="font-display text-xl text-[var(--cyan)]">Hatch reveal</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white">
                <span>{reveal.species}</span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="inline-flex items-center gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hatcheryRarityIconPath(reveal.rarity)}
                    alt=""
                    width={22}
                    height={22}
                    className="h-[22px] w-[22px] object-contain"
                  />
                  {reveal.rarity}
                </span>
                <span className="text-[var(--text-muted)]">·</span>
                <span>
                  {reveal.affinity} · {reveal.temperament}
                </span>
              </div>
              {reveal.signatureAbility ? (
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  <span className="text-[var(--cyan)]">Signature ability</span> ·{" "}
                  <span className="text-white">{reveal.signatureAbility.name}</span> —{" "}
                  {reveal.signatureAbility.description}
                </p>
              ) : null}
              {reveal.signatureTrait ? (
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  <span className="text-[var(--amber)]">Signature trait</span> ·{" "}
                  <span className="text-white">{reveal.signatureTrait.name}</span> —{" "}
                  {reveal.signatureTrait.description}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Evolution paths: {reveal.evolutionPaths.join(" → ")}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="panel p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg text-white">
            Your {projectConfig.CREATURE_NAME_PLURAL}
          </h2>
          <StatusChip tone="default">{pets.length} active</StatusChip>
        </div>
        {pets.length === 0 ? (
          <div className="empty-state mt-4 min-h-[12rem] gap-3 px-4 py-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hatcheryEmptyRiftlingsPath()}
              alt=""
              className="relative z-[1] h-28 w-auto max-w-[14rem] object-contain drop-shadow-[0_0_24px_rgba(61,231,255,0.28)] sm:h-32"
            />
            <p className="relative z-[1] text-sm text-[var(--text-muted)]">
              None yet — hatch an egg to begin care.
            </p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {pets.map((pet) => (
              <li key={pet.publicId}>
                <Link
                  href={`/pets/${pet.publicId}`}
                  className="panel-inset flex min-h-16 items-center gap-3 p-3 transition hover:border-[rgba(61,231,255,0.35)] hover:shadow-[0_0_20px_rgba(61,231,255,0.1)] sm:p-4"
                >
                  {pet.speciesSlug ? (
                    <GameImage
                      src={creaturePortraitPath(pet.speciesSlug)}
                      alt=""
                      width={72}
                      height={72}
                      fallbackSrc={creatureIconPath(pet.speciesSlug, true)}
                      showDevBadge={false}
                      className="shrink-0 drop-shadow-[0_0_12px_rgba(61,231,255,0.2)]"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-display text-white">{pet.name}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={hatcheryRarityIconPath(pet.rarity)}
                        alt=""
                        width={16}
                        height={16}
                        className="h-4 w-4 object-contain"
                      />
                      <span>
                        {pet.rarity} · {pet.affinity} · {pet.condition}
                      </span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
