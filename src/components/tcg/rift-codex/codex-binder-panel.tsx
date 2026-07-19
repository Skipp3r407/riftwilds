"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { FamilyProgress } from "@/game/tcg/card-families";
import { CollectionBook } from "@/components/tcg/collection-book";
import { getCardFamilyBySpecies } from "@/content/tcg";

type FlatRow = {
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

type HatchlingRow = {
  publicId: string;
  name: string;
  speciesSlug: string;
  speciesName: string;
  affinity: string;
  rarity: string;
  familyId: string | null;
};

type Props = {
  families: FamilyProgress[];
  flatCards: FlatRow[];
  onInspectCard: (defId: string) => void;
  onOpenFamily: (familyId: string) => void;
};

/**
 * Binder tab — hatchery ownership + Credits packs + flat card grid.
 * SOL is never required.
 */
export function CodexBinderPanel({
  families,
  flatCards,
  onInspectCard,
  onOpenFamily,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [hatchlings, setHatchlings] = useState<HatchlingRow[]>([]);
  const [eggCount, setEggCount] = useState(0);
  const [loadNote, setLoadNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/hatchery/eggs", { credentials: "include" });
        const data = await res.json();
        if (!res.ok || cancelled) return;
        const pets = (data.pets ?? []) as {
          publicId: string;
          name: string;
          speciesSlug: string;
          speciesName: string;
          affinity: string;
          rarity: string;
        }[];
        setEggCount((data.eggs ?? []).length);
        setHatchlings(
          pets.slice(0, 12).map((p) => ({
            ...p,
            familyId: getCardFamilyBySpecies(p.speciesSlug)?.id ?? null,
          })),
        );
      } catch {
        if (!cancelled) {
          setLoadNote("Hatchery snapshot unavailable — binder cards still load.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const uniqueCards = flatCards.length;
  const totalCopies = flatCards.reduce((s, r) => s + r.count, 0);
  const sealed = families.filter((f) => f.rewardReady).length;

  return (
    <div className="codex-binder" data-audio-cue="codex.section.binder">
      <header className="codex-binder__header">
        <p className="rift-codex__eyebrow">Binder · Ownership</p>
        <h2>Flat binder & hatchery links</h2>
        <p>
          Cards you own, companions from the Hatchery, and Credits pack routes.
          Free to collect — <strong>SOL is never required</strong>.
        </p>
      </header>

      <div className="codex-binder__summary">
        <div className="codex-binder__stat">
          <p>Unique cards</p>
          <strong>{uniqueCards}</strong>
        </div>
        <div className="codex-binder__stat">
          <p>Total copies</p>
          <strong>{totalCopies}</strong>
        </div>
        <div className="codex-binder__stat">
          <p>Lines sealed</p>
          <strong>
            {sealed}/{families.length}
          </strong>
        </div>
        <div className="codex-binder__stat">
          <p>Hatchlings</p>
          <strong>{hatchlings.length}</strong>
        </div>
        <div className="codex-binder__stat">
          <p>Eggs waiting</p>
          <strong>{eggCount}</strong>
        </div>
      </div>

      <section className="codex-binder__routes">
        <h3>Grow the collection</h3>
        <p>
          Hatch companions to unlock companion cards, or open Credits packs from
          the shop. Optional wallet perks stay cosmetic.
        </p>
        <div className="codex-binder__cta-row">
          <Link href="/hatchery" className="codex-binder__cta">
            Open Hatchery
          </Link>
          <Link href="/shop/packs" className="codex-binder__cta">
            Credits packs
          </Link>
          <Link href="/shop" className="codex-binder__cta codex-binder__cta--ghost">
            Item shop
          </Link>
          <Link
            href="/tcg/deck-builder"
            className="codex-binder__cta codex-binder__cta--ghost"
          >
            Deck Atelier
          </Link>
        </div>
      </section>

      <section className="codex-binder__hatchery">
        <div className="codex-binder__hatchery-head">
          <h3>Hatchery roster</h3>
          <Link href="/hatchery">Manage companions →</Link>
        </div>
        {loadNote ? <p className="codex-binder__note">{loadNote}</p> : null}
        {hatchlings.length === 0 ? (
          <p className="codex-binder__empty">
            No hatchlings yet. Claim a free starter egg in the Hatchery — no
            wallet needed.
          </p>
        ) : (
          <ul className="codex-binder__pets">
            {hatchlings.map((pet, i) => (
              <motion.li
                key={pet.publicId}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.03 }}
              >
                <div className="codex-binder__pet">
                  <span className="codex-binder__pet-aff">{pet.affinity}</span>
                  <strong>{pet.name}</strong>
                  <em>
                    {pet.speciesName} · {pet.rarity}
                  </em>
                  <div className="codex-binder__pet-links">
                    <Link href={`/codex/riftlings/${pet.speciesSlug}`}>
                      Species lore
                    </Link>
                    {pet.familyId ? (
                      <button
                        type="button"
                        onClick={() => onOpenFamily(pet.familyId!)}
                      >
                        Codex spread
                      </button>
                    ) : null}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      <section className="codex-binder__grid-wrap">
        <h3>Card binder</h3>
        <CollectionBook
          families={families}
          flatCards={flatCards}
          onInspectCard={onInspectCard}
          onOpenCodex={onOpenFamily}
          forceView="flat"
        />
      </section>
    </div>
  );
}
