"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

type Plot = {
  plotId: string;
  deedSize: string;
  coords: { col: number; row: number };
  status: string;
  districtId: string;
  biome: string;
  ownerUserId: string | null;
  homeId: string | null;
};

type Project = {
  projectId: string;
  name: string;
  donatedMaterials: number;
  goalMaterials: number;
  completed: boolean;
};

type Building = { key: string; label: string; unlocked: boolean; unlockStage: string };

type Neighborhood = {
  neighborhoodId: string;
  name: string;
  stage: string;
  occupiedHomes: number;
  plotCap: number;
  reputation: number;
  plots: Plot[];
  projects: Project[];
  publicBuildings: Building[];
  districts: { districtId: string; name: string; kind: string; flavor: string }[];
  npcLife: { musicians: number; animals: number; visitors: number; campfiresLit: boolean };
  seasonalDecorTheme: string | null;
};

export function NeighborhoodsHub() {
  const [nbhd, setNbhd] = useState<Neighborhood | null>(null);
  const [minePlot, setMinePlot] = useState<Plot | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      const res = await fetch("/api/neighborhoods");
      const data = await res.json();
      setNbhd(data.neighborhoods?.[0] ?? null);
      setMinePlot(data.minePlot ?? null);
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  async function post(body: Record<string, unknown>) {
    setMessage(null);
    const res = await fetch("/api/neighborhoods", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setMessage(data.ok ? "Done." : data.message ?? data.error ?? "Failed");
    refresh();
  }

  if (!nbhd) {
    return (
      <div className="panel p-5 text-sm text-[var(--text-muted)]" role="status">
        Loading neighborhoods…
      </div>
    );
  }

  const vacant = nbhd.plots.filter((p) => p.status === "vacant").slice(0, 12);

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-white">{nbhd.name}</h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
              Shared roads, parks, and public buildings — private interiors stay instanced per
              player. Stage: <span className="text-[var(--amber)]">{nbhd.stage}</span> (
              {nbhd.occupiedHomes}/{nbhd.plotCap} homes) · reputation {nbhd.reputation}
            </p>
          </div>
          <Link href="/housing" className="btn-secondary focus-ring text-sm">
            Private housing
          </Link>
        </div>
        <p className="mt-3 text-xs text-[var(--text-dim)]">
          NPC life: {nbhd.npcLife.musicians} musicians · {nbhd.npcLife.animals} animals ·{" "}
          {nbhd.npcLife.visitors} visitors
          {nbhd.npcLife.campfiresLit ? " · campfires lit" : ""}
          {nbhd.seasonalDecorTheme ? ` · seasonal: ${nbhd.seasonalDecorTheme}` : ""}
        </p>
        {minePlot ? (
          <p className="mt-3 text-sm text-white">
            Your plot: {minePlot.plotId} ({minePlot.deedSize}) at ({minePlot.coords.col},
            {minePlot.coords.row})
          </p>
        ) : null}
        {message ? (
          <p className="mt-2 text-xs text-[var(--amber)]" role="status">
            {message}
          </p>
        ) : null}
      </section>

      <section className="panel p-5" aria-labelledby="districts">
        <h2 id="districts" className="font-display text-lg text-white">
          Districts
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {nbhd.districts.map((d) => (
            <li key={d.districtId} className="rounded border border-[rgba(61,231,255,0.1)] p-3">
              <p className="text-sm text-white">{d.name}</p>
              <p className="text-[11px] uppercase tracking-wide text-[var(--text-dim)]">{d.kind}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{d.flavor}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-5" aria-labelledby="plots">
        <h2 id="plots" className="font-display text-lg text-white">
          Claim a plot
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Deeds from Tiny to Castle / Island / Lakefront. Claiming can auto-create a private home
          interior linked to this exterior.
        </p>
        <ul className="mt-4 space-y-2">
          {vacant.map((p) => (
            <li
              key={p.plotId}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-[rgba(61,231,255,0.1)] px-3 py-2 text-sm"
            >
              <span className="text-[var(--text-muted)]">
                <span className="text-white">{p.deedSize}</span> · ({p.coords.col},{p.coords.row}) ·{" "}
                {p.biome}
              </span>
              <button
                type="button"
                className="btn-primary focus-ring text-xs"
                disabled={pending || Boolean(minePlot)}
                onClick={() =>
                  post({
                    action: "claim",
                    plotId: p.plotId,
                    autoBuildHome: true,
                    homeName: "Neighborhood Home",
                  })
                }
              >
                Claim (Credits)
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-5" aria-labelledby="projects">
        <h2 id="projects" className="font-display text-lg text-white">
          Community projects
        </h2>
        <ul className="mt-3 space-y-2">
          {nbhd.projects.map((p) => (
            <li
              key={p.projectId}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-[rgba(61,231,255,0.1)] px-3 py-2 text-sm"
            >
              <span>
                <span className="text-white">{p.name}</span>
                <span className="ml-2 text-[11px] text-[var(--text-dim)]">
                  {p.donatedMaterials}/{p.goalMaterials}
                  {p.completed ? " · complete" : ""}
                </span>
              </span>
              {!p.completed ? (
                <button
                  type="button"
                  className="btn-secondary focus-ring text-xs"
                  disabled={pending}
                  onClick={() =>
                    post({
                      action: "donate",
                      neighborhoodId: nbhd.neighborhoodId,
                      projectId: p.projectId,
                      materials: 5,
                    })
                  }
                >
                  Donate materials
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-5" aria-labelledby="buildings">
        <h2 id="buildings" className="font-display text-lg text-white">
          Public buildings
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {nbhd.publicBuildings.map((b) => (
            <li
              key={b.key}
              className="rounded border border-[rgba(61,231,255,0.1)] p-3 text-sm"
            >
              <span className={b.unlocked ? "text-white" : "text-[var(--text-dim)]"}>{b.label}</span>
              <p className="text-[11px] text-[var(--text-dim)]">
                {b.unlocked ? "Unlocked" : `Unlocks at ${b.unlockStage}`}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            disabled={pending || !minePlot}
            onClick={() =>
              post({ action: "elect_mayor", neighborhoodId: nbhd.neighborhoodId })
            }
          >
            Stand for mayor
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            disabled={pending}
            onClick={() =>
              post({
                action: "event",
                neighborhoodId: nbhd.neighborhoodId,
                title: "Weekend Market",
                kind: "weekend_market",
                hours: 6,
              })
            }
          >
            Host weekend market
          </button>
          {minePlot ? (
            <button
              type="button"
              className="btn-secondary focus-ring text-sm"
              disabled={pending}
              onClick={() =>
                post({
                  action: "storefront",
                  plotId: minePlot.plotId,
                  storeName: "Keeper Goods",
                  hoursLabel: "dawn–dusk",
                  displayItemKeys: ["lantern_ember", "rug_moss"],
                })
              }
            >
              Open storefront
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
