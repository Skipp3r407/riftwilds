"use client";

import { useEffect, useState } from "react";
import { RiftCodexShell } from "@/components/tcg/rift-codex";
import { TcgCardDetailModal } from "@/components/tcg/tcg-card-detail-modal";
import { RiftPageShell } from "@/components/ui/rift-page-shell";
import { RiftPanel } from "@/components/ui/rift-panel";
import { RiftButton } from "@/components/ui/rift-button";
import type { FamilyProgress } from "@/game/tcg/card-families";
import type { TcgCollectionCardRow } from "@/game/tcg/types";
import { recordQuestMetric } from "@/game/quests/quest-demo-store";

export default function RiftCodexIndexPage() {
  const [cards, setCards] = useState<TcgCollectionCardRow[]>([]);
  const [families, setFamilies] = useState<FamilyProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inspectDefId, setInspectDefId] = useState<string | null>(null);

  useEffect(() => {
    recordQuestMetric("binder_open", 1);
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
      <RiftPanel material="marble" className="mb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--amber)]">
              Premium collection book
            </p>
            <h1 className="font-display mt-1 text-3xl text-[var(--text)]">
              Rift Codex
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[var(--text-muted)]">
              Family-first discovery, habitat atlas, lore spreads, and cosmetic
              completion rewards. Binder links Hatchery ownership and Credits
              packs — SOL never required.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RiftButton href="/tcg/museum" tone="gold" size="sm">
              Museum hall
            </RiftButton>
            <RiftButton href="/tcg/collection" tone="obsidian" size="sm">
              Collection Book
            </RiftButton>
            <RiftButton href="/hatchery" tone="ghost" size="sm">
              Hatchery
            </RiftButton>
            <RiftButton href="/tcg/battle" tone="arcane" size="sm">
              Practice battle
            </RiftButton>
          </div>
        </div>
      </RiftPanel>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {!error && families.length === 0 ? (
        <RiftPanel material="obsidian">
          <p className="text-sm text-[var(--text-muted)]">Opening the Codex…</p>
        </RiftPanel>
      ) : (
        <RiftCodexShell
          families={families}
          flatCards={cards}
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
