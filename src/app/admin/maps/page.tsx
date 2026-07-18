"use client";

import Link from "next/link";
import { REGION_IDENTITIES } from "@/game/world-maps/regions";
import { getBlueprint } from "@/game/world-maps/blueprints";

export default function AdminMapsPage() {
  return (
    <div className="space-y-6 p-6">
      <header>
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Admin</p>
        <h1 className="font-display text-2xl text-white">Map tools</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Blueprint schema inspector for Live World regions. JSON exports live under{" "}
          <code className="text-[var(--cyan)]">public/maps/&#123;slug&#125;/blueprint.json</code>.
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {REGION_IDENTITIES.map((r) => {
          const bp = getBlueprint(r.slug);
          return (
            <article key={r.slug} className="panel p-4">
              <h2 className="font-display text-base text-white">{r.name}</h2>
              <p className="mt-1 text-[11px] text-[var(--text-dim)]">
                {r.playability} · {bp.completeness} · {bp.cols}×{bp.rows}
              </p>
              <ul className="mt-2 space-y-0.5 text-xs text-[var(--text-muted)]">
                <li>Zones: {bp.zones.length}</li>
                <li>Objects: {bp.objects.length}</li>
                <li>Colliders: {bp.colliders.length}</li>
                <li>Pathways: {bp.pathways.length}</li>
                <li>Minimap pins: {bp.minimap.landmarkPins.length}</li>
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/maps/${r.slug}/blueprint.json`}
                  className="btn-secondary focus-ring text-[10px]"
                  target="_blank"
                >
                  Blueprint JSON
                </Link>
                <Link
                  href={`/assets/maps/${r.slug}-overview.png`}
                  className="btn-secondary focus-ring text-[10px]"
                  target="_blank"
                >
                  Overview art
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
