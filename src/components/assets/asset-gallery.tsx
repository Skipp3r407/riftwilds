"use client";

import { useMemo, useState } from "react";
import { CreatureCard } from "@/components/assets/creature-card";
import { EggCard } from "@/components/assets/egg-card";
import { STARTER_SPECIES, EGG_CLASSES, AFFINITIES } from "@/lib/assets/manifest";
import { GameImage } from "@/components/assets/game-image";
import { affinityIconPath } from "@/lib/assets/paths";

const SPECIES_META: Record<string, { name: string; affinity: string }> = {
  cindercub: { name: "Cindercub", affinity: "Ember" },
  mossprig: { name: "Mossprig", affinity: "Grove" },
  bubbloon: { name: "Bubbloon", affinity: "Tide" },
  voltkit: { name: "Voltkit", affinity: "Storm" },
  pebblit: { name: "Pebblit", affinity: "Stone" },
  wisplet: { name: "Wisplet", affinity: "Spirit" },
  frostuft: { name: "Frostuft", affinity: "Frost" },
  alloyfin: { name: "Alloyfin", affinity: "Alloy / Tide" },
  sunmote: { name: "Sunmote", affinity: "Radiant" },
  noxling: { name: "Noxling", affinity: "Void" },
  brambleback: { name: "Brambleback", affinity: "Grove / Stone" },
  zephyroo: { name: "Zephyroo", affinity: "Storm" },
  glimmermoth: { name: "Glimmermoth", affinity: "Spirit / Radiant" },
  magmole: { name: "Magmole", affinity: "Ember / Stone" },
  tiderune: { name: "Tiderune", affinity: "Tide / Spirit" },
  gearling: { name: "Gearling", affinity: "Alloy" },
  bloomble: { name: "Bloomble", affinity: "Grove" },
  astralynx: { name: "Astralynx", affinity: "Void / Radiant" },
};

type Tab = "creatures" | "eggs" | "affinities";

export function AssetGallery() {
  const [tab, setTab] = useState<Tab>("creatures");
  const species = useMemo(() => STARTER_SPECIES, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["creatures", "eggs", "affinities"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? "btn-primary px-3 py-2 text-sm" : "btn-secondary px-3 py-2 text-sm"}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "creatures" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {species.map((slug) => {
            const meta = SPECIES_META[slug]!;
            return (
              <CreatureCard
                key={slug}
                slug={slug}
                name={meta.name}
                affinity={meta.affinity}
                lore="Placeholder art — prompts in asset-prompts/creatures."
              />
            );
          })}
        </div>
      ) : null}

      {tab === "eggs" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {EGG_CLASSES.map((egg) => (
            <EggCard
              key={egg}
              eggClass={egg}
              name={`${egg[0]!.toUpperCase()}${egg.slice(1)} Egg`}
              description="Dev placeholder until approved egg art lands."
            />
          ))}
        </div>
      ) : null}

      {tab === "affinities" ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
          {AFFINITIES.map((a) => (
            <div key={a} className="panel flex flex-col items-center p-4">
              <GameImage src={affinityIconPath(a)} alt={a} width={96} height={96} />
              <p className="mt-2 font-display text-sm capitalize text-white">{a}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
