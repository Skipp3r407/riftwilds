"use client";

import { useEffect, useState } from "react";
import { RiftCodexShell } from "@/components/tcg/rift-codex";
import { TcgCardDetailModal } from "@/components/tcg/tcg-card-detail-modal";
import { RiftPageShell } from "@/components/ui/rift-page-shell";
import { RiftPanel } from "@/components/ui/rift-panel";
import type { FamilyProgress } from "@/game/tcg/card-families";
import type { TcgCollectionCardRow } from "@/game/tcg/types";
import { recordMuseumVisit } from "@/game/tcg/codex-progress";

export default function TcgMuseumPage() {
  const [cards, setCards] = useState<TcgCollectionCardRow[]>([]);
  const [families, setFamilies] = useState<FamilyProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inspectDefId, setInspectDefId] = useState<string | null>(null);

  useEffect(() => {
    recordMuseumVisit();
    void (async () => {
      try {
        const [colRes, famRes] = await Promise.all([
          fetch("/api/tcg/collection", { credentials: "include" }),
          fetch("/api/tcg/families", { credentials: "include" }),
        ]);
        const col = await colRes.json();
        const fam = await famRes.json();
        if (!colRes.ok) throw new Error(col.error || "LOAD_FAILED");
        if (!famRes.ok) throw new Error(fam.error || "FAMILIES_FAILED");
        setCards((col.cards ?? []) as TcgCollectionCardRow[]);
        setFamilies((fam.families ?? []) as FamilyProgress[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "LOAD_FAILED");
      }
    })();
  }, []);

  return (
    <RiftPageShell mood="library">
      <RiftPanel material="gold" padding="sm" className="mb-4">
        <p className="text-sm text-amber-50/90">
          Museum Mode is a polished exhibit shell. Spatial 3D walkthrough is
          intentionally phased — sealed lines still appear as featured displays.
        </p>
      </RiftPanel>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {!error && families.length === 0 ? (
        <RiftPanel material="obsidian">
          <p className="text-sm text-[var(--text-muted)]">Lighting the hall…</p>
        </RiftPanel>
      ) : (
        <RiftCodexShell
          families={families}
          flatCards={cards}
          initialSection="museum"
          onInspectCard={setInspectDefId}
        />
      )}

      <TcgCardDetailModal
        open={!!inspectDefId}
        defId={inspectDefId}
        onClose={() => setInspectDefId(null)}
      />
    </RiftPageShell>
  );
}
