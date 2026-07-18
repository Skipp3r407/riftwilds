"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

type Property = {
  tier: string;
  name: string;
  blurb: string;
  creditsCost: number;
  thumbKey: string;
  acquisition: string[];
};

type BrowseEntry = {
  homeId: string;
  name: string;
  propertyTier: string;
  visitPolicy: string;
  likes: number;
  featured: boolean;
  exteriorFacadeKey: string;
  competitionDecorScore: number | null;
  source?: "player_home" | "social_demo";
};

type HomeState = {
  homeId: string;
  name: string;
  propertyTier: string;
  visitPolicy: string;
  rooms: { roomKey: string; name: string; unlocked: boolean; furniture: unknown[] }[];
  expansionLevel: number;
  likes: number;
  garden: { plotKey: string; cropKey: string | null }[];
  workshopStations: string[];
};

export function HousingHub() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [browse, setBrowse] = useState<BrowseEntry[]>([]);
  const [mine, setMine] = useState<HomeState | null>(null);
  const [furnitureCount, setFurnitureCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("My Keeper Home");
  const [tier, setTier] = useState("starter_cabin");
  const [roomKey, setRoomKey] = useState("pet-house");
  const [skuKey, setSkuKey] = useState("lantern_ember");

  function refresh() {
    startTransition(async () => {
      const res = await fetch("/api/housing");
      const data = await res.json();
      setProperties(data.catalog?.properties ?? []);
      setBrowse(data.browse ?? []);
      setMine(data.mine ?? null);
      setFurnitureCount(data.furnitureCount ?? 0);
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  async function post(body: Record<string, unknown>) {
    setMessage(null);
    const res = await fetch("/api/housing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setMessage(data.ok ? "Done." : data.message ?? data.error ?? "Failed");
    refresh();
    return data;
  }

  return (
    <div className="space-y-6">
      <section className="panel p-5" aria-labelledby="housing-own">
        <h2 id="housing-own" className="font-display text-lg text-white">
          Your private home
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Each home is a persistent private instance. Exteriors sit in shared neighborhoods;
          interiors stay isolated for creativity and performance. Credits only for basics — SOL
          never required.
        </p>
        {mine ? (
          <div className="mt-4 space-y-3 text-sm text-[var(--text-muted)]">
            <p>
              <span className="text-white">{mine.name}</span> · {mine.propertyTier.replace(/_/g, " ")} ·
              policy {mine.visitPolicy} · likes {mine.likes} · expansion {mine.expansionLevel}
            </p>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {mine.rooms.map((r) => (
                <li key={r.roomKey} className="rounded border border-[rgba(61,231,255,0.12)] p-3">
                  <div className="flex justify-between gap-2">
                    <span className="text-white">{r.name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-[var(--text-dim)]">
                      {r.unlocked ? "open" : "locked"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--text-dim)]">
                    {r.furniture.length} placed · {r.roomKey}
                  </p>
                  {!r.unlocked ? (
                    <button
                      type="button"
                      className="btn-secondary focus-ring mt-2 text-xs"
                      disabled={pending}
                      onClick={() => post({ action: "unlock_room", roomKey: r.roomKey })}
                    >
                      Unlock (75 Credits)
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary focus-ring text-sm"
                disabled={pending}
                onClick={() => post({ action: "build_start" })}
              >
                Enter build mode
              </button>
              <button
                type="button"
                className="btn-secondary focus-ring text-sm"
                disabled={pending}
                onClick={() => post({ action: "expand" })}
              >
                Expand property
              </button>
              <button
                type="button"
                className="btn-secondary focus-ring text-sm"
                disabled={pending}
                onClick={() =>
                  post({
                    action: "event",
                    title: "Hearth Gathering",
                    kind: "party",
                    hours: 2,
                  })
                }
              >
                Host event
              </button>
              <Link href="/neighborhoods" className="btn-secondary focus-ring text-sm">
                Neighborhood map
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block text-xs text-[var(--text-dim)]">
              Home name
              <input
                className="mt-1 w-full rounded border border-[rgba(61,231,255,0.2)] bg-[rgba(0,0,0,0.35)] px-3 py-2 text-sm text-white focus-ring"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block text-xs text-[var(--text-dim)]">
              Property
              <select
                className="mt-1 w-full rounded border border-[rgba(61,231,255,0.2)] bg-[rgba(0,0,0,0.35)] px-3 py-2 text-sm text-white focus-ring"
                value={tier}
                onChange={(e) => setTier(e.target.value)}
              >
                {properties.map((p) => (
                  <option key={p.tier} value={p.tier}>
                    {p.name} ({p.creditsCost} Cr)
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="btn-primary focus-ring text-sm"
              disabled={pending}
              onClick={() =>
                post({
                  action: "purchase",
                  name,
                  propertyTier: tier,
                  acquisition: "buy_prebuilt",
                })
              }
            >
              Buy prebuilt
            </button>
            <button
              type="button"
              className="btn-secondary focus-ring text-sm"
              disabled={pending}
              onClick={() =>
                post({
                  action: "purchase",
                  name,
                  propertyTier: tier,
                  acquisition: "claim_land_build",
                })
              }
            >
              Claim land & build
            </button>
          </div>
        )}
        {message ? (
          <p className="mt-3 text-xs text-[var(--amber)]" role="status">
            {message}
          </p>
        ) : null}
      </section>

      {mine ? (
        <section className="panel p-5" aria-labelledby="build-panel">
          <h2 id="build-panel" className="font-display text-lg text-white">
            Build mode
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Grid snap, rotate, undo/redo, collision checks. Keyboard: place via controls below;
            controller/touch assist uses the same actions.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="text-xs text-[var(--text-dim)]">
              Room
              <input
                className="mt-1 block rounded border border-[rgba(61,231,255,0.2)] bg-[rgba(0,0,0,0.35)] px-3 py-2 text-sm text-white focus-ring"
                value={roomKey}
                onChange={(e) => setRoomKey(e.target.value)}
                aria-label="Room key"
              />
            </label>
            <label className="text-xs text-[var(--text-dim)]">
              Furniture SKU
              <input
                className="mt-1 block rounded border border-[rgba(61,231,255,0.2)] bg-[rgba(0,0,0,0.35)] px-3 py-2 text-sm text-white focus-ring"
                value={skuKey}
                onChange={(e) => setSkuKey(e.target.value)}
                aria-label="Furniture SKU key"
              />
            </label>
            <button
              type="button"
              className="btn-primary focus-ring text-sm"
              disabled={pending}
              onClick={() =>
                post({
                  action: "place",
                  skuKey,
                  roomKey,
                  x: 64,
                  y: 64,
                  rotation: 0,
                })
              }
            >
              Place
            </button>
            <button
              type="button"
              className="btn-secondary focus-ring text-sm"
              disabled={pending}
              onClick={() => post({ action: "undo" })}
            >
              Undo
            </button>
            <button
              type="button"
              className="btn-secondary focus-ring text-sm"
              disabled={pending}
              onClick={() => post({ action: "redo" })}
            >
              Redo
            </button>
          </div>
          <p className="mt-2 text-[11px] text-[var(--text-dim)]">
            Catalog size: {furnitureCount} SKUs (hundreds planned — see docs backlog).
          </p>
        </section>
      ) : null}

      <section className="panel p-5" aria-labelledby="property-catalog">
        <h2 id="property-catalog" className="font-display text-lg text-white">
          Property types
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <article key={p.tier} className="overflow-hidden rounded border border-[rgba(61,231,255,0.12)]">
              <div className="relative aspect-[16/10] bg-[rgba(42,33,24,0.6)]">
                <Image
                  src={`/assets/housing/${p.thumbKey}.svg`}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-3">
                <h3 className="font-display text-white">{p.name}</h3>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{p.blurb}</p>
                <p className="mt-2 text-[11px] text-[var(--amber)]">{p.creditsCost} Credits</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel p-5" aria-labelledby="visitor-browser">
        <h2 id="visitor-browser" className="font-display text-lg text-white">
          Visitor browser
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Public, featured, friends, and guild homes. Walk, chat, emote, guestbook, and likes —
          housing competition scores surface when entered.
        </p>
        <ul className="mt-4 space-y-2">
          {browse.map((h) => (
            <li
              key={h.homeId}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-[rgba(61,231,255,0.1)] px-3 py-2 text-sm"
            >
              <div>
                <span className="text-white">{h.name}</span>
                <span className="ml-2 text-[11px] text-[var(--text-dim)]">
                  {h.propertyTier} · {h.visitPolicy}
                  {h.featured ? " · featured" : ""}
                  {h.competitionDecorScore != null
                    ? ` · contest ${h.competitionDecorScore}`
                    : ""}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-[11px] text-[var(--text-dim)]" aria-label={`${h.likes} likes`}>
                  {h.likes} likes
                </span>
                {h.source !== "social_demo" ? (
                  <button
                    type="button"
                    className="btn-secondary focus-ring text-xs"
                    disabled={pending}
                    onClick={() =>
                      post({
                        action: "visit_social",
                        homeId: h.homeId,
                        liked: true,
                        guestbookNote: "Lovely hearth!",
                      })
                    }
                  >
                    Visit & like
                  </button>
                ) : (
                  <span className="text-[11px] text-[var(--text-dim)]">Demo listing</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
