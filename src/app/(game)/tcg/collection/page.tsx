"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { recordQuestMetric } from "@/game/quests/quest-demo-store";
import { TcgCardDetailModal } from "@/components/tcg/tcg-card-detail-modal";

type CardRow = {
  defId: string;
  count: number;
  def: {
    name: string;
    type: string;
    affinity: string;
    riftCost: number;
    power: number;
    rarity: string;
    description: string;
    cardImagePath?: string;
    artPath?: string;
  } | null;
};

/**
 * Binder tile = complete card face bitmap only.
 * Quantity badge sits outside the face chrome; no name/rules HTML overlays.
 */
function BinderCardFace({
  row,
  onInspect,
}: {
  row: CardRow;
  onInspect: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const face =
    row.def?.cardImagePath || `/assets/tcg/cards/${row.defId}.webp`;
  const showFace = Boolean(face && !imgFailed);
  const label = row.def?.name ?? row.defId;

  return (
    <li className="group relative">
      <div className="absolute -right-1 -top-1 z-10 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-[var(--amber)] shadow-md backdrop-blur-sm">
        ×{row.count}
      </div>

      <button
        type="button"
        onClick={onInspect}
        aria-label={`Inspect ${label}`}
        className="block w-full text-left focus-ring rounded-xl"
      >
        {showFace ? (
          <div className="relative aspect-[500/700] w-full overflow-hidden rounded-xl shadow-[0_0_24px_rgba(61,231,255,0.08)] transition duration-300 group-hover:scale-[1.02]">
            <Image
              src={face}
              alt={label}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
              className="object-contain"
              onError={() => setImgFailed(true)}
              unoptimized
            />
          </div>
        ) : (
          <div className="flex aspect-[500/700] items-center justify-center rounded-xl border border-[rgba(61,231,255,0.22)] bg-[rgba(12,18,28,0.9)] p-4 text-center text-sm text-[var(--text-muted,#b7aea0)]">
            {label}
            <span className="sr-only">Card image unavailable</span>
          </div>
        )}
      </button>
    </li>
  );
}

export default function TcgCollectionPage() {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inspectDefId, setInspectDefId] = useState<string | null>(null);

  useEffect(() => {
    recordQuestMetric("binder_open", 1);
    void (async () => {
      try {
        const res = await fetch("/api/tcg/collection", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "LOAD_FAILED");
        const rows = (data.cards ?? []) as CardRow[];
        setCards(rows);
        setNote(data.note ?? "");
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
    <main className="tcg-binder relative mx-auto max-w-5xl px-4 py-8">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 10%, rgba(61,231,255,0.16), transparent 45%), radial-gradient(ellipse at 80% 90%, rgba(255,184,77,0.12), transparent 40%)",
        }}
        aria-hidden
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-[rgba(255,184,77,0.28)] bg-[rgba(8,12,20,0.55)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[2px]">
        <div>
          <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--amber)]">
            Card Binder
          </p>
          <h1 className="font-display mt-1 text-3xl text-[var(--text-primary,#f4efe6)]">
            Collection
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--text-muted,#b7aea0)]">
            Tap any card for stats and creature bio. Shape a Rift Energy deck from your
            binder — SOL is never required.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/tcg/battle" className="btn-primary focus-ring !px-3 !py-2 text-sm">
            Practice battle
          </Link>
          <Link href="/shop/packs" className="btn-secondary focus-ring !px-3 !py-2 text-sm">
            Buy packs
          </Link>
          <Link href="/marketplace" className="btn-secondary focus-ring !px-3 !py-2 text-sm">
            Trade cards
          </Link>
        </div>
      </div>

      {note && (
        <p className="mb-4 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-50/90">
          {note}
        </p>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((row) => (
          <BinderCardFace
            key={row.defId}
            row={row}
            onInspect={() => setInspectDefId(row.defId)}
          />
        ))}
      </ul>

      {cards.length === 0 && !error ? (
        <p className="panel mt-4 p-6 text-sm text-[var(--text-muted)]">
          Binder empty — hatch a Riftling or open a pack from the shop to seed your collection.
        </p>
      ) : null}

      <TcgCardDetailModal
        open={!!inspectDefId}
        defId={inspectDefId}
        onClose={() => setInspectDefId(null)}
      />
    </main>
  );
}
