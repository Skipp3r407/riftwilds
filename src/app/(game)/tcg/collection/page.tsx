"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { recordQuestMetric } from "@/game/quests/quest-demo-store";

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

function BinderCardFace({ row }: { row: CardRow }) {
  const [imgFailed, setImgFailed] = useState(false);
  const face = row.def?.cardImagePath;
  const thumb = row.def?.artPath;
  const showFace = Boolean(face && !imgFailed);

  return (
    <li className="group relative overflow-hidden rounded-xl border border-[rgba(61,231,255,0.22)] bg-[linear-gradient(160deg,rgba(26,36,48,0.92)_0%,rgba(12,18,28,0.92)_100%)] shadow-[0_0_24px_rgba(61,231,255,0.06)]">
      <div className="absolute right-2 top-2 z-10 rounded-md bg-black/55 px-1.5 py-0.5 text-xs font-medium text-[var(--amber)] backdrop-blur-sm">
        ×{row.count}
      </div>

      {showFace ? (
        <div className="relative aspect-[480/672] w-full overflow-hidden bg-[#0a0e14]">
          <Image
            src={face!}
            alt={row.def?.name ?? row.defId}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            onError={() => setImgFailed(true)}
            unoptimized
          />
        </div>
      ) : (
        <div className="relative flex aspect-[480/672] flex-col p-3 text-[var(--text-primary,#f4efe6)]">
          {thumb ? (
            <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg border border-white/10 bg-black/30">
              <Image
                src={thumb}
                alt=""
                fill
                sizes="200px"
                className="object-contain p-2"
                unoptimized
              />
            </div>
          ) : null}
          <div className="flex justify-between text-sm font-medium">
            <span className="font-display tracking-wide">{row.def?.name ?? row.defId}</span>
          </div>
          {row.def && (
            <p className="mt-1 text-xs uppercase tracking-wide text-[var(--text-muted,#b7aea0)]">
              {row.def.type} · {row.def.affinity} · {row.def.riftCost} RE · power{" "}
              {row.def.power} · {row.def.rarity}
            </p>
          )}
          {row.def?.description && (
            <p className="mt-2 line-clamp-4 text-sm text-white/80">{row.def.description}</p>
          )}
        </div>
      )}
    </li>
  );
}

export default function TcgCollectionPage() {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

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

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-[rgba(255,184,77,0.28)] bg-[rgba(8,12,20,0.62)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[2px]">
        <div>
          <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--amber)]">
            Card Binder
          </p>
          <h1 className="font-display mt-1 text-3xl text-[var(--text-primary,#f4efe6)]">
            Collection
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--text-muted,#b7aea0)]">
            Shape a Rift Energy deck from your binder — primary combat for launch. Credits buy packs
            in the shop; SOL is never required.
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

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((row) => (
          <BinderCardFace key={row.defId} row={row} />
        ))}
      </ul>

      {cards.length === 0 && !error ? (
        <p className="panel mt-4 p-6 text-sm text-[var(--text-muted)]">
          Binder empty — hatch a Riftling or open a pack from the shop to seed your collection.
        </p>
      ) : null}
    </main>
  );
}
