"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RiftCodexShell } from "@/components/tcg/rift-codex";
import { TcgCardDetailModal } from "@/components/tcg/tcg-card-detail-modal";
import { RiftPageShell } from "@/components/ui/rift-page-shell";
import type { FamilyProgress } from "@/game/tcg/card-families";
import type { TcgCollectionCardRow } from "@/game/tcg/types";

export default function TcgCodexFamilyPage() {
  const params = useParams<{ familyId: string }>();
  const familyId = params?.familyId;
  const [families, setFamilies] = useState<FamilyProgress[]>([]);
  const [cards, setCards] = useState<TcgCollectionCardRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inspectDefId, setInspectDefId] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) return;
    let cancelled = false;
    void (async () => {
      try {
        const [famRes, colRes] = await Promise.all([
          fetch("/api/tcg/families", { credentials: "include" }),
          fetch("/api/tcg/collection", { credentials: "include" }),
        ]);
        const fam = await famRes.json();
        const col = await colRes.json();
        if (!famRes.ok) throw new Error(fam.error || "LOAD_FAILED");
        if (!colRes.ok) throw new Error(col.error || "LOAD_FAILED");
        if (!cancelled) {
          setFamilies((fam.families ?? []) as FamilyProgress[]);
          setCards((col.cards ?? []) as TcgCollectionCardRow[]);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "LOAD_FAILED");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [familyId]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-red-300">{error}</p>
        <Link href="/tcg/codex" className="mt-4 inline-block text-[var(--cyan)]">
          ← Rift Codex
        </Link>
      </main>
    );
  }

  if (!familyId || families.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-[var(--text-muted)]">
        Opening Codex spread…
      </main>
    );
  }

  return (
    <RiftPageShell mood="library">
      <RiftCodexShell
        families={families}
        flatCards={cards}
        initialFamilyId={familyId}
        onInspectCard={setInspectDefId}
      />
      <TcgCardDetailModal
        open={!!inspectDefId}
        defId={inspectDefId}
        onClose={() => setInspectDefId(null)}
      />
    </RiftPageShell>
  );
}
