"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type EditionRow = {
  editionId: string;
  gameplayCardId: string;
  gameplayCardName: string;
  name: string;
  treatment: string;
  imagePath: string | null;
  owned: boolean;
  supplyCap: number | null;
  solPrice?: string;
  riftShardPrice?: number;
  goldPrice?: number;
  tradeable: boolean;
  mintable: boolean;
  deckNote: string;
  grantsGameplayPower: false;
};

export function CollectibleBrowser() {
  const [editions, setEditions] = useState<EditionRow[]>([]);
  const [selected, setSelected] = useState<EditionRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/economy/sol/collectibles?userId=demo-keeper");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "LOAD_FAILED");
        setEditions(data.editions ?? []);
        setNote(data.note ?? "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load editions");
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--text-muted)]">
        Cosmetic editions linked to TCG gameplay cards. Artwork uses existing faces under{" "}
        <code className="text-[var(--cyan)]">/assets/tcg/cards/</code>. Editions never change
        ATK/HP/energy.
      </p>
      {note ? <p className="text-xs text-[var(--text-dim)]">{note}</p> : null}
      {error ? <p className="text-sm text-[var(--coral)]">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {editions.map((ed) => (
            <li key={ed.editionId}>
              <button
                type="button"
                onClick={() => setSelected(ed)}
                className={cn(
                  "panel w-full overflow-hidden p-3 text-left transition",
                  selected?.editionId === ed.editionId && "border-[var(--cyan)]",
                )}
              >
                <div className="relative aspect-[500/700] w-full overflow-hidden rounded-lg bg-black/30">
                  {ed.imagePath ? (
                    <Image
                      src={ed.imagePath}
                      alt={ed.name}
                      fill
                      sizes="220px"
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-3 text-center text-xs text-[var(--text-muted)]">
                      {ed.gameplayCardName}
                    </div>
                  )}
                </div>
                <p className="mt-2 font-display text-sm text-white">{ed.name}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {ed.treatment}
                  {ed.owned ? " · owned" : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>

        <aside className="panel space-y-3 p-5">
          {selected ? (
            <>
              <h2 className="font-display text-xl text-white">{selected.name}</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Gameplay card:{" "}
                <Link
                  href="/tcg/collection"
                  className="text-[var(--cyan)] underline underline-offset-2"
                >
                  {selected.gameplayCardName}
                </Link>{" "}
                ({selected.gameplayCardId})
              </p>
              <ul className="space-y-1 text-sm text-[var(--text-muted)]">
                <li>Treatment: {selected.treatment}</li>
                <li>Supply cap: {selected.supplyCap ?? "open"}</li>
                <li>
                  Prices:{" "}
                  {[
                    selected.solPrice ? `${selected.solPrice} SOL (optional)` : null,
                    selected.riftShardPrice != null
                      ? `${selected.riftShardPrice} Rift Shards`
                      : null,
                    selected.goldPrice != null ? `${selected.goldPrice} Gold` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </li>
                <li>Tradeable: {String(selected.tradeable)} · Mintable: {String(selected.mintable)}</li>
                <li>Gameplay power: false</li>
              </ul>
              <p className="text-xs text-[var(--amber)]">{selected.deckNote}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href="/marketplace" className="btn-secondary focus-ring text-sm">
                  Marketplace
                </Link>
                <Link href="/tcg/collection" className="btn-primary focus-ring text-sm">
                  Use gameplay copy in deck
                </Link>
              </div>
              <p className="text-xs text-[var(--text-dim)]">
                SOL purchase path stays production-disabled. Soft simulation lives under Wallet
                Center / purchase API.
              </p>
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Select an edition to inspect metadata.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
