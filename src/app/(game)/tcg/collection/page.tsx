"use client";

import { useEffect, useState } from "react";
import { SoundscapeMount } from "@/components/audio/soundscape-mount";
import { recordQuestMetric } from "@/game/quests/quest-demo-store";
import { TcgCardDetailModal } from "@/components/tcg/tcg-card-detail-modal";
import { RiftCodexShell } from "@/components/tcg/rift-codex";
import { RiftPageShell } from "@/components/ui/rift-page-shell";
import { RiftPanel } from "@/components/ui/rift-panel";
import { RiftButton } from "@/components/ui/rift-button";
import { playSfx } from "@/hooks/use-sfx";
import type { FamilyProgress } from "@/game/tcg/card-families";
import type { TcgCollectionCardRow } from "@/game/tcg/types";

export default function TcgCollectionPage() {
  const [cards, setCards] = useState<TcgCollectionCardRow[]>([]);
  const [families, setFamilies] = useState<FamilyProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inspectDefId, setInspectDefId] = useState<string | null>(null);

  useEffect(() => {
    recordQuestMetric("binder_open", 1);
    playSfx("collection.open");
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
        const rows = (col.cards ?? []) as TcgCollectionCardRow[];
        setCards(rows);
        setFamilies((fam.families ?? []) as FamilyProgress[]);
        if (rows.length > 0) {
          recordQuestMetric("tcg_card_collect", Math.min(rows.length, 3));
          recordQuestMetric("tcg_deck_set", 1);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "LOAD_FAILED");
      }
    })();
  }, []);

  return (
    <RiftPageShell mood="library">
      <SoundscapeMount mode="collection" fadeMs={750} />
      <div className="tcg-surface-hero tcg-surface-hero--library mb-6">
        <div className="tcg-surface-hero__plate" aria-hidden />
        <div className="tcg-surface-hero__body">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--amber)]">
                Riftwilds Library
              </p>
              <h1 className="font-display mt-1 text-3xl text-[var(--text)]">
                Collection Book
              </h1>
              <p className="mt-1 max-w-xl text-sm text-white/75">
                Rift Codex is the premium book — contents, species spreads, atlas,
                stats, museum plates, and a hatchery-linked binder. Credits packs
                grow the collection; SOL is never required.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <RiftButton href="/tcg/codex" tone="gold" size="sm">
                Open Rift Codex
              </RiftButton>
              <RiftButton href="/tcg/museum" tone="obsidian" size="sm">
                Museum
              </RiftButton>
              <RiftButton href="/tcg/battle" tone="arcane" size="sm">
                Practice battle
              </RiftButton>
              <RiftButton href="/tcg/deck-builder" tone="ghost" size="sm">
                Deck Atelier
              </RiftButton>
              <RiftButton href="/hatchery" tone="ghost" size="sm">
                Hatchery
              </RiftButton>
            </div>
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {!error && families.length === 0 && cards.length === 0 ? (
        <RiftPanel material="obsidian">
          <p className="text-sm text-[var(--text-muted)]">Opening the library…</p>
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
