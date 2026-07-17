"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameImage } from "@/components/assets/game-image";
import { StatusChip } from "@/components/shared/page-header";
import { playSfx } from "@/hooks/use-sfx";
import { creatureIconPath, creaturePortraitPath } from "@/lib/assets/paths";
import { projectConfig } from "@/lib/config/project";

type EggRow = {
  publicId: string;
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

function statusTone(status: string): "live" | "warn" | "info" | "default" {
  if (status === "READY") return "live";
  if (status === "INCUBATING") return "warn";
  if (status === "HATCHED") return "info";
  return "default";
}

export function HatcheryDashboard() {
  const [eggs, setEggs] = useState<EggRow[]>([]);
  const [pets, setPets] = useState<PetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [tick, setTick] = useState(0);
  const lastIncubateSfx = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/hatchery/eggs", { credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : `Could not load hatchery (${res.status})`,
        );
        setLoading(false);
        return;
      }
      setEggs(data.eggs ?? []);
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
    const incubating = eggs.some((e) => e.hatchStatus === "INCUBATING");
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
    const readySoon = eggs.some((e) => {
      if (e.hatchStatus !== "INCUBATING" || !e.incubationEndsAt) return false;
      return new Date(e.incubationEndsAt).getTime() <= Date.now();
    });
    if (readySoon) void refresh();
  }, [tick, eggs, refresh]);

  const claim = async () => {
    setBusy("claim");
    setError(null);
    playSfx("ui.click");
    try {
      const res = await fetch("/api/hatchery/claim", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        playSfx("ui.error");
        setError(
          typeof data.error === "string"
            ? data.error
            : typeof data.message === "string"
              ? data.message
              : `Claim failed (${res.status})`,
        );
      } else if (data.egg?.publicId) {
        playSfx("hatchery.claim");
        // Optimistic: claim response is source of truth if list refresh races.
        setEggs((prev) => {
          if (prev.some((e) => e.publicId === data.egg.publicId)) return prev;
          return [
            {
              publicId: data.egg.publicId,
              eggTypeLabel: data.egg.eggTypeLabel ?? "Common Rift Egg",
              hatchStatus: data.egg.hatchStatus ?? "INCUBATING",
              incubationEndsAt: data.egg.incubationEndsAt ?? null,
            },
            ...prev,
          ];
        });
      }
      await refresh();
    } catch {
      playSfx("ui.error");
      setError("Claim failed — network error. Try again.");
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
      const res = await fetch("/api/hatchery/hatch", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eggPublicId, skipWait }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        playSfx("ui.error");
        setError(
          typeof data.error === "string" ? data.error : `Hatch failed (${res.status})`,
        );
      } else {
        playSfx("hatchery.hatch_reveal");
        setReveal(data.reveal);
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
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel panel-glow relative flex flex-col items-center overflow-hidden p-8">
          <div
            className="pointer-events-none absolute inset-0 surface-grid opacity-30"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[rgba(61,231,255,0.16)] blur-3xl"
            aria-hidden
          />
          <div className="egg-wobble relative h-44 w-36">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/eggs/mystery-rift-egg.png?v=mask3"
              alt=""
              className="h-full w-full object-contain drop-shadow-[0_0_36px_rgba(61,231,255,0.45)]"
            />
          </div>
          <p className="relative mt-6 text-center text-sm text-[var(--text-muted)]">
            Claim a starter Common Rift Egg. Demo incubation is ~30 seconds. Hatch reveals are
            server-rolled — no near-miss theater.
          </p>
          <button
            type="button"
            className="btn-primary focus-ring relative mt-5"
            disabled={busy === "claim" || loading}
            onClick={() => void claim()}
          >
            {busy === "claim" ? "Claiming…" : "Claim starter egg"}
          </button>
          {error ? <p className="relative mt-3 text-sm text-[var(--coral)]">{error}</p> : null}
        </div>

        <div className="panel p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg text-white">Your eggs</h2>
            <StatusChip tone="info">{eggs.length} held</StatusChip>
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-[var(--text-muted)]">Loading…</p>
          ) : eggs.length === 0 ? (
            <div className="empty-state mt-4 min-h-[10rem]">
              <p className="text-sm text-[var(--text-muted)]">No eggs yet. Claim a starter above.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {eggs.map((egg) => (
                <li
                  key={egg.publicId}
                  className="panel-inset flex flex-wrap items-center justify-between gap-2 px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{egg.eggTypeLabel}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <StatusChip tone={statusTone(egg.hatchStatus)}>{egg.hatchStatus}</StatusChip>
                      <span className="text-xs text-[var(--text-muted)]">
                        {countdown(egg.incubationEndsAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {egg.hatchStatus === "INCUBATING" ? (
                      <button
                        type="button"
                        className="btn-secondary focus-ring px-3 py-2 text-xs"
                        disabled={busy === egg.publicId}
                        onClick={() => void hatch(egg.publicId, true)}
                      >
                        {busy === egg.publicId ? "Hatching…" : "Skip wait (demo)"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className={
                        egg.hatchStatus === "READY"
                          ? "btn-primary focus-ring px-3 py-2 text-xs"
                          : "btn-secondary focus-ring px-3 py-2 text-xs"
                      }
                      disabled={egg.hatchStatus !== "READY" || busy === egg.publicId}
                      onClick={() => void hatch(egg.publicId)}
                    >
                      {busy === egg.publicId ? "Hatching…" : "Hatch"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {reveal ? (
        <section className="panel panel-glow p-6">
          <p className="page-kicker">Reveal complete</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            {reveal.speciesSlug ? (
              <GameImage
                src={creaturePortraitPath(reveal.speciesSlug)}
                alt={reveal.species}
                width={120}
                height={120}
                fallbackSrc={creatureIconPath(reveal.speciesSlug, true)}
                showDevBadge={false}
              />
            ) : null}
            <div>
          <h2 className="font-display text-xl text-[var(--cyan)]">Hatch reveal</h2>
          <p className="mt-2 text-sm text-white">
            {reveal.species} · {reveal.affinity} · {reveal.rarity} · {reveal.temperament}
          </p>
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

      <section className="panel p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg text-white">
            Your {projectConfig.CREATURE_NAME_PLURAL}
          </h2>
          <StatusChip tone="default">{pets.length} active</StatusChip>
        </div>
        {pets.length === 0 ? (
          <div className="empty-state mt-4 min-h-[8rem]">
            <p className="text-sm text-[var(--text-muted)]">
              None yet — hatch an egg to begin care.
            </p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {pets.map((pet) => (
              <li key={pet.publicId}>
                <Link
                  href={`/pets/${pet.publicId}`}
                  className="panel-inset flex items-center gap-3 p-4 transition hover:border-[rgba(61,231,255,0.35)] hover:shadow-[0_0_20px_rgba(61,231,255,0.1)]"
                >
                  {pet.speciesSlug ? (
                    <GameImage
                      src={creaturePortraitPath(pet.speciesSlug)}
                      alt=""
                      width={56}
                      height={56}
                      fallbackSrc={creatureIconPath(pet.speciesSlug, true)}
                      showDevBadge={false}
                      className="shrink-0"
                    />
                  ) : null}
                  <div>
                    <p className="font-display text-white">{pet.name}</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {pet.rarity} · {pet.affinity} · {pet.condition}
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
