"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  getCardById,
  getCardFamilyForCardId,
  resolveCardImagePath,
} from "@/content/tcg";
import { RiftCardFrame } from "@/components/tcg/rift-card-frame";
import { TcgCardDetailModal } from "@/components/tcg/tcg-card-detail-modal";
import { RiftPageShell } from "@/components/ui/rift-page-shell";
import { RiftPanel } from "@/components/ui/rift-panel";
import { RiftButton } from "@/components/ui/rift-button";
import { playSfx } from "@/hooks/use-sfx";
import { enterSoundscape } from "@/lib/audio/adaptive-engine";
import type { DeckBuilderCardRow } from "@/game/tcg/schemas";
import {
  INVENTORY_DECK_REJECT_MESSAGE,
  isCombatEligibleCard,
} from "@/content/tcg/framework/combat-eligibility";
import { STANDARD_BATTLE_RULES } from "@/game/tcg/rules/battle-rules-config";
import type { CurveWarning } from "@/game/tcg/rules/mana-curve";

type CatalogCard = DeckBuilderCardRow & { owned: number };

const GALLERY_PREFS_KEY = "riftwilds.deck-atelier.gallery";

type GallerySize = "s" | "m" | "l" | "xl";
type OrganizeBy =
  | "none"
  | "affinity"
  | "type"
  | "faction"
  | "cost"
  | "rarity"
  | "family";

type GalleryPrefs = {
  size: GallerySize;
  stackFamilies: boolean;
  organizeBy: OrganizeBy;
};

const DEFAULT_GALLERY_PREFS: GalleryPrefs = {
  size: "m",
  stackFamilies: false,
  organizeBy: "none",
};

const GALLERY_SIZES: { id: GallerySize; label: string }[] = [
  { id: "s", label: "S" },
  { id: "m", label: "M" },
  { id: "l", label: "L" },
  { id: "xl", label: "XL" },
];

const ORGANIZE_OPTIONS: { id: OrganizeBy; label: string }[] = [
  { id: "none", label: "Default order" },
  { id: "affinity", label: "Affinity" },
  { id: "type", label: "Type" },
  { id: "faction", label: "Faction" },
  { id: "cost", label: "Cost" },
  { id: "rarity", label: "Rarity" },
  { id: "family", label: "Family" },
];

const RARITY_RANK: Record<string, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
  founder: 6,
  seasonal: 7,
  holiday: 8,
  animated: 9,
  foil: 10,
  signed: 11,
  collector: 12,
};

function rarityRank(rarity: string): number {
  return RARITY_RANK[rarity.toLowerCase()] ?? 99;
}

function frameSizeFor(gallerySize: GallerySize): "sm" | "md" | "lg" {
  if (gallerySize === "s" || gallerySize === "m") return "sm";
  if (gallerySize === "l") return "md";
  return "lg";
}

function readGalleryPrefs(): GalleryPrefs {
  if (typeof window === "undefined") return DEFAULT_GALLERY_PREFS;
  try {
    const raw = localStorage.getItem(GALLERY_PREFS_KEY);
    if (!raw) return DEFAULT_GALLERY_PREFS;
    const parsed = JSON.parse(raw) as Partial<GalleryPrefs>;
    const size = GALLERY_SIZES.some((s) => s.id === parsed.size)
      ? (parsed.size as GallerySize)
      : DEFAULT_GALLERY_PREFS.size;
    const organizeBy = ORGANIZE_OPTIONS.some((o) => o.id === parsed.organizeBy)
      ? (parsed.organizeBy as OrganizeBy)
      : DEFAULT_GALLERY_PREFS.organizeBy;
    return {
      size,
      stackFamilies: Boolean(parsed.stackFamilies),
      organizeBy,
    };
  } catch {
    return DEFAULT_GALLERY_PREFS;
  }
}

function writeGalleryPrefs(prefs: GalleryPrefs) {
  try {
    localStorage.setItem(GALLERY_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota / private mode */
  }
}

function familyMeta(cardId: string): {
  familyId: string;
  familyName: string;
  stageOrder: number;
  factionId: string | null;
} {
  const family = getCardFamilyForCardId(cardId);
  if (!family) {
    return {
      familyId: `solo:${cardId}`,
      familyName: "Standalone",
      stageOrder: 0,
      factionId: null,
    };
  }
  const stage = family.stages.find((s) => s.cardId === cardId);
  return {
    familyId: family.id,
    familyName: family.title || family.name,
    stageOrder: stage?.order ?? 0,
    factionId: family.factionId,
  };
}

/** Prefer per-card scenic face so Base / Companion / Ascendant never share one thumb. */
function displayArtForCard(card: CatalogCard): string | undefined {
  const content = getCardById(card.id);
  if (content) {
    const face = resolveCardImagePath(content);
    if (face) return face;
  }
  return card.cardImagePath || card.artPath;
}

type Faction = {
  id: string;
  name: string;
  shortName: string;
  affinity: string;
  playstyle: string;
  bannerAccent: string;
  defaultStarterDeckId: string;
  commanderHeroIds: string[];
};

type Commander = {
  id: string;
  name: string;
  title: string;
  element: string;
  difficulty: string;
};

type Payload = {
  defaults: {
    minDeckSize: number;
    maxDeckSize: number;
    constructedTargetMax: number;
    deckSize?: number;
    requireCommander?: boolean;
  };
  constructedRules?: {
    deckSize: number;
    f2pCompetitive: string;
    copyLimits: Record<string, number>;
  };
  facets?: {
    elements: string[];
    rarities: string[];
    roles: string[];
    types: string[];
  };
  f2pNote?: string;
  activeDeck: string[];
  commanderHeroId: string | null;
  factions: Faction[];
  commanders: Commander[];
  starterShowcase: { id: string; name: string; cardIds: string[] };
  catalog: CatalogCard[];
};

function countMap(ids: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const id of ids) m.set(id, (m.get(id) ?? 0) + 1);
  return m;
}

function curveForDeck(
  deck: string[],
  byId: Map<string, CatalogCard>,
): number[] {
  return [0, 1, 2, 3, 4, 5, 6, 7].map((cost) =>
    deck.reduce((n, id) => {
      const c = byId.get(id);
      if (!c) return n;
      const bucket = Math.min(7, c.riftCost);
      return bucket === cost ? n + 1 : n;
    }, 0),
  );
}

export function DeckBuilder() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [deck, setDeck] = useState<string[]>([]);
  const [commanderId, setCommanderId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [affinity, setAffinity] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [rarityFilter, setRarityFilter] = useState<string>("ALL");
  const [elementFilter, setElementFilter] = useState<string>("ALL");
  const [dragId, setDragId] = useState<string | null>(null);
  const [focusListId, setFocusListId] = useState<string | null>(null);
  const [inspectDefId, setInspectDefId] = useState<string | null>(null);
  const [galleryPrefs, setGalleryPrefs] = useState<GalleryPrefs>(
    DEFAULT_GALLERY_PREFS,
  );
  const [expandedStacks, setExpandedStacks] = useState<Set<string>>(
    () => new Set(),
  );
  const deferredQuery = useDeferredValue(query);

  function openCardBio(id: string) {
    setFocusListId(id);
    setInspectDefId(id);
  }

  function patchGalleryPrefs(patch: Partial<GalleryPrefs>) {
    setGalleryPrefs((prev) => {
      const next = { ...prev, ...patch };
      writeGalleryPrefs(next);
      return next;
    });
  }

  useEffect(() => {
    setGalleryPrefs(readGalleryPrefs());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/tcg/deck");
        const json = (await res.json()) as Payload & { error?: string };
        if (!res.ok) throw new Error(json.error ?? "LOAD_FAILED");
        if (cancelled) return;
        setData(json);
        setDeck(json.activeDeck);
        setCommanderId(json.commanderHeroId);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "LOAD_FAILED");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byId = useMemo(() => {
    const m = new Map<string, CatalogCard>();
    for (const c of data?.catalog ?? []) m.set(c.id, c);
    return m;
  }, [data]);

  const deckCounts = useMemo(() => countMap(deck), [deck]);

  const targetSize =
    data?.constructedRules?.deckSize ??
    data?.defaults.deckSize ??
    data?.defaults.minDeckSize ??
    30;

  const maxZeroCost =
    data?.constructedRules?.maxZeroCostPerDeck ??
    STANDARD_BATTLE_RULES.deck.maxZeroCostPerDeck;
  const turn1Energy =
    data?.defaults?.riftEnergyStartMax ??
    STANDARD_BATTLE_RULES.energy.turn1Max;

  const validation = useMemo(() => {
    if (!data) return { ok: false, reason: "Loading…", warnings: [] as CurveWarning[] };
    if (deck.length !== targetSize) {
      return {
        ok: false,
        reason: `Need exactly ${targetSize} cards (${deck.length}/${targetSize})`,
        warnings: [] as CurveWarning[],
      };
    }
    let zeroCost = 0;
    let turn1Plays = 0;
    let costSum = 0;
    for (const [id, n] of deckCounts) {
      const card = byId.get(id);
      if (!card) return { ok: false, reason: `Unknown card ${id}`, warnings: [] as CurveWarning[] };
      if (n > card.maxCopies) {
        return { ok: false, reason: `Too many copies of ${card.name}`, warnings: [] as CurveWarning[] };
      }
      if (n > card.owned) {
        return { ok: false, reason: `Not enough owned copies of ${card.name}`, warnings: [] as CurveWarning[] };
      }
      const cost = card.riftCost ?? 0;
      costSum += cost * n;
      if (cost === 0) zeroCost += n;
      if (cost <= turn1Energy) turn1Plays += n;
    }
    if (zeroCost > maxZeroCost) {
      return {
        ok: false,
        reason: `At most ${maxZeroCost} zero-cost cards (have ${zeroCost})`,
        warnings: [] as CurveWarning[],
      };
    }
    if (!commanderId) {
      return {
        ok: false,
        reason: "Choose a commander (separate from the 30)",
        warnings: [] as CurveWarning[],
      };
    }
    const warnings: CurveWarning[] = [];
    if (turn1Plays === 0) {
      warnings.push({
        code: "NO_TURN1_PLAYS",
        severity: "error",
        message: `No cards costing ≤ ${turn1Energy} — opening turns will brick.`,
      });
    } else if (turn1Plays < 4) {
      warnings.push({
        code: "THIN_EARLY_CURVE",
        severity: "warn",
        message: `Only ${turn1Plays} cards costing ≤ ${turn1Energy}. Aim for 6–8 early plays.`,
      });
    }
    const avg = deck.length ? costSum / deck.length : 0;
    if (avg >= 3.6) {
      warnings.push({
        code: "TOO_EXPENSIVE",
        severity: "warn",
        message: `Average cost ${avg.toFixed(2)} is high — expect slow starts.`,
      });
    }
    if (zeroCost === maxZeroCost) {
      warnings.push({
        code: "ZERO_COST_FLOOD",
        severity: "info",
        message: `At the ${maxZeroCost} zero-cost deck cap.`,
      });
    }
    const hardCurveError = false;
    return {
      ok: true,
      reason: `Legal Standard deck · 0-cost ${zeroCost}/${maxZeroCost} · T1 plays ${turn1Plays}`,
      warnings,
    };
  }, [data, deck, deckCounts, byId, commanderId, targetSize, maxZeroCost, turn1Energy]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = deferredQuery.trim().toLowerCase();
    return data.catalog.filter((c) => {
      // Combat-only atelier — inventory goods never appear in the gallery.
      if (!isCombatEligibleCard(c.id)) return false;
      if (affinity !== "ALL" && c.affinity !== affinity) return false;
      if (typeFilter !== "ALL" && c.type !== typeFilter) return false;
      if (roleFilter !== "ALL" && (c.role ?? "") !== roleFilter) return false;
      if (
        rarityFilter !== "ALL" &&
        c.rarity.toLowerCase() !== rarityFilter.toLowerCase()
      ) {
        return false;
      }
      if (elementFilter !== "ALL" && c.element !== elementFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.toLowerCase().includes(q)) ||
        c.element.toLowerCase().includes(q) ||
        (c.role?.toLowerCase().includes(q) ?? false) ||
        (c.familyId?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [
    data,
    deferredQuery,
    affinity,
    typeFilter,
    roleFilter,
    rarityFilter,
    elementFilter,
  ]);

  const factionByAffinity = useMemo(() => {
    const m = new Map<string, Faction>();
    for (const f of data?.factions ?? []) m.set(f.affinity, f);
    return m;
  }, [data]);

  const factionById = useMemo(() => {
    const m = new Map<string, Faction>();
    for (const f of data?.factions ?? []) m.set(f.id, f);
    return m;
  }, [data]);

  type GalleryEntry =
    | { kind: "card"; card: CatalogCard }
    | {
        kind: "stack";
        stackKey: string;
        label: string;
        cards: CatalogCard[];
        top: CatalogCard;
      };

  type GallerySection = { key: string; label: string; entries: GalleryEntry[] };

  const gallerySections = useMemo((): GallerySection[] => {
    const organizeBy = galleryPrefs.organizeBy;
    const stackOn = galleryPrefs.stackFamilies;

    const categoryFor = (card: CatalogCard): { key: string; label: string } => {
      const meta = familyMeta(card.id);
      switch (organizeBy) {
        case "affinity":
          return { key: card.affinity, label: card.affinity };
        case "type":
          return { key: card.type, label: card.type };
        case "faction": {
          const fromFamily = meta.factionId
            ? factionById.get(meta.factionId)
            : undefined;
          const fromAffinity = factionByAffinity.get(card.affinity);
          const faction = fromFamily ?? fromAffinity;
          return {
            key: faction?.id ?? `affinity:${card.affinity}`,
            label: faction?.name ?? card.affinity,
          };
        }
        case "cost": {
          const bucket = Math.min(7, card.riftCost);
          const label = bucket === 7 ? "7+" : String(bucket);
          return { key: `cost:${bucket}`, label: `Cost ${label}` };
        }
        case "rarity":
          return {
            key: card.rarity.toLowerCase(),
            label: card.rarity.toUpperCase(),
          };
        case "family":
          return {
            key: meta.familyId.startsWith("solo:")
              ? "standalone"
              : meta.familyId,
            label: meta.familyId.startsWith("solo:")
              ? "Standalone"
              : meta.familyName,
          };
        default:
          return { key: "all", label: "Collection" };
      }
    };

    const sortCards = (list: CatalogCard[]) => {
      return [...list].sort((a, b) => {
        if (organizeBy === "cost") {
          const cost = a.riftCost - b.riftCost;
          if (cost !== 0) return cost;
        }
        if (organizeBy === "rarity") {
          const ra = rarityRank(a.rarity);
          const rb = rarityRank(b.rarity);
          if (ra !== rb) return ra - rb;
        }
        const cost = a.riftCost - b.riftCost;
        if (cost !== 0) return cost;
        return a.name.localeCompare(b.name);
      });
    };

    const sorted = sortCards(filtered);
    const buckets = new Map<string, { label: string; cards: CatalogCard[] }>();
    for (const card of sorted) {
      const cat = categoryFor(card);
      const bucket = buckets.get(cat.key);
      if (bucket) bucket.cards.push(card);
      else buckets.set(cat.key, { label: cat.label, cards: [card] });
    }

    const sectionKeys = [...buckets.keys()];
    if (organizeBy === "cost") {
      sectionKeys.sort((a, b) => {
        const na = Number(a.replace("cost:", ""));
        const nb = Number(b.replace("cost:", ""));
        return na - nb;
      });
    } else if (organizeBy === "rarity") {
      sectionKeys.sort((a, b) => rarityRank(a) - rarityRank(b));
    } else {
      sectionKeys.sort((a, b) =>
        (buckets.get(a)?.label ?? a).localeCompare(buckets.get(b)?.label ?? b),
      );
    }

    const toEntries = (cards: CatalogCard[]): GalleryEntry[] => {
      if (!stackOn) {
        return cards.map((card) => ({ kind: "card" as const, card }));
      }
      const stacks = new Map<string, CatalogCard[]>();
      for (const card of cards) {
        const meta = familyMeta(card.id);
        const key = meta.familyId.startsWith("solo:")
          ? `solo:${card.id}`
          : meta.familyId;
        const list = stacks.get(key);
        if (list) list.push(card);
        else stacks.set(key, [card]);
      }
      const entries: GalleryEntry[] = [];
      for (const [stackKey, members] of stacks) {
        if (members.length === 1 || stackKey.startsWith("solo:")) {
          entries.push({ kind: "card", card: members[0]! });
          continue;
        }
        if (expandedStacks.has(stackKey)) {
          for (const card of sortCards(members)) {
            entries.push({ kind: "card", card });
          }
          continue;
        }
        const ordered = [...members].sort(
          (a, b) =>
            familyMeta(b.id).stageOrder - familyMeta(a.id).stageOrder ||
            b.riftCost - a.riftCost ||
            a.name.localeCompare(b.name),
        );
        const top = ordered[0]!;
        entries.push({
          kind: "stack",
          stackKey,
          label: familyMeta(top.id).familyName,
          cards: ordered,
          top,
        });
      }
      return entries;
    };

    // Flat browse stays capped; organized views show every category, then share a soft cap.
    const FLAT_CAP = 80;
    const ORGANIZED_CAP = 120;

    if (organizeBy === "none") {
      return [
        {
          key: "all",
          label: "Collection",
          entries: toEntries(sorted).slice(0, FLAT_CAP),
        },
      ];
    }

    const built = sectionKeys
      .map((key) => {
        const bucket = buckets.get(key)!;
        return {
          key,
          label: bucket.label,
          entries: toEntries(bucket.cards),
        };
      })
      .filter((section) => section.entries.length > 0);

    if (built.length === 0) return built;

    const fair = Math.max(3, Math.floor(ORGANIZED_CAP / built.length));
    const clipped = built.map((section) => ({
      ...section,
      entries: section.entries.slice(0, fair),
      leftover: section.entries.slice(fair),
    }));
    let remaining =
      ORGANIZED_CAP - clipped.reduce((n, s) => n + s.entries.length, 0);
    for (const section of clipped) {
      if (remaining <= 0) break;
      const extra = section.leftover.splice(0, remaining);
      section.entries.push(...extra);
      remaining -= extra.length;
    }

    return clipped.map(({ key, label, entries }) => ({ key, label, entries }));
  }, [
    filtered,
    galleryPrefs.organizeBy,
    galleryPrefs.stackFamilies,
    expandedStacks,
    factionByAffinity,
    factionById,
  ]);

  const galleryEntryCount = useMemo(
    () => gallerySections.reduce((n, s) => n + s.entries.length, 0),
    [gallerySections],
  );

  const galleryCardCount = useMemo(
    () =>
      gallerySections.reduce(
        (n, s) =>
          n +
          s.entries.reduce(
            (m, e) => m + (e.kind === "stack" ? e.cards.length : 1),
            0,
          ),
        0,
      ),
    [gallerySections],
  );

  useEffect(() => {
    void enterSoundscape("deck", { fadeMs: 700 });
  }, []);

  function addCard(id: string) {
    const card = byId.get(id);
    if (!card) return;
    if (!isCombatEligibleCard(id)) {
      setStatus(INVENTORY_DECK_REJECT_MESSAGE);
      playSfx("deck.error");
      return;
    }
    const n = deckCounts.get(id) ?? 0;
    if (n >= card.maxCopies || n >= card.owned) {
      setStatus(`Copy limit for ${card.name}`);
      playSfx("deck.error");
      return;
    }
    if (deck.length >= (data?.defaults.maxDeckSize ?? 40)) {
      setStatus("Deck is full");
      playSfx("deck.error");
      return;
    }
    setDeck((d) => [...d, id]);
    setStatus(null);
    playSfx("deck.add");
  }

  function removeCard(id: string) {
    setDeck((d) => {
      const idx = d.lastIndexOf(id);
      if (idx < 0) return d;
      const next = [...d];
      next.splice(idx, 1);
      return next;
    });
    setStatus(null);
    playSfx("deck.remove");
  }

  function removeAllCopies(id: string) {
    setDeck((d) => d.filter((x) => x !== id));
    setFocusListId((cur) => (cur === id ? null : cur));
    setStatus(null);
    playSfx("deck.remove");
  }

  const deckRows = useMemo(() => {
    return [...deckCounts.entries()]
      .map(([id, n]) => ({ id, n, card: byId.get(id) }))
      .filter((row) => row.card)
      .sort((a, b) => {
        const cost = (a.card?.riftCost ?? 0) - (b.card?.riftCost ?? 0);
        if (cost !== 0) return cost;
        return (a.card?.name ?? a.id).localeCompare(b.card?.name ?? b.id);
      });
  }, [deckCounts, byId]);

  const curveMax = useMemo(() => Math.max(1, ...curveForDeck(deck, byId)), [deck, byId]);

  async function saveDeck() {
    setStatus(null);
    playSfx("ui.click");
    const res = await fetch("/api/tcg/deck", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "save",
        name: "Keeper Constructed",
        cardIds: deck,
        commanderHeroId: commanderId,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.reason ?? json.error ?? "Save failed");
      playSfx("deck.error");
      return;
    }
    setStatus("Deck saved — ready for Practice Board");
    playSfx("deck.save");
  }

  async function loadShowcase() {
    const res = await fetch("/api/tcg/deck", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "load_showcase" }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error ?? "Showcase load failed");
      return;
    }
    setDeck(json.activeDeck);
    setCommanderId(json.commanderHeroId);
    setFocusListId(null);
    setStatus("Loaded Showcase Twenty");
  }

  async function loadFactionStarter(deckId: string) {
    const res = await fetch("/api/tcg/deck", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "load_starter", deckId }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error ?? "Starter load failed");
      return;
    }
    setDeck(json.activeDeck);
    setCommanderId(json.commanderHeroId);
    setFocusListId(null);
    setStatus(`Loaded ${deckId}`);
  }

  if (error) {
    return (
      <RiftPageShell mood="atelier">
        <RiftPanel material="obsidian">
          <p className="text-center text-[var(--text-muted)]">
            Could not open deck builder: {error}
          </p>
        </RiftPanel>
      </RiftPageShell>
    );
  }

  if (!data) {
    return (
      <RiftPageShell mood="atelier">
        <RiftPanel material="obsidian">
          <p className="text-center text-[var(--text-muted)]">Opening atelier…</p>
        </RiftPanel>
      </RiftPageShell>
    );
  }

  const curve = curveForDeck(deck, byId);

  return (
    <RiftPageShell mood="atelier" wide>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <header className="lg:col-span-2">
          <div className="tcg-surface-hero tcg-surface-hero--atelier">
            <div className="tcg-surface-hero__plate" aria-hidden />
            <div className="tcg-surface-hero__body">
              <p className="font-display text-sm tracking-[0.2em] text-[var(--amber)] uppercase">
                Riftwilds
              </p>
              <h1 className="mt-1 font-display text-3xl text-[var(--text)] sm:text-4xl">
                Deck Atelier
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/75">
                Build exactly {targetSize} cards + 1 Commander. Copy limits follow
                rarity. Competitive decks craft with Gold / Rift Shards / Ancient
                Fragments — never SOL.
              </p>
              {data.f2pNote ? (
                <p className="mt-2 max-w-2xl text-xs text-cyan-200/80">
                  {data.f2pNote}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <RiftButton href="/tcg/battle" tone="gold" size="sm">
                  Open Practice Board
                </RiftButton>
                <RiftButton href="/tcg/collection" tone="obsidian" size="sm">
                  Binder
                </RiftButton>
                <RiftButton href="/tcg/codex" tone="obsidian" size="sm">
                  Rift Codex
                </RiftButton>
                <RiftButton
                  tone="arcane"
                  size="sm"
                  onClick={() => void loadShowcase()}
                >
                  Load Showcase 30
                </RiftButton>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {data.factions.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setAffinity(f.affinity);
                  void loadFactionStarter(f.defaultStarterDeckId);
                }}
                className="rift-btn rift-btn--sm rift-btn--ghost"
                style={{
                  borderColor: `${f.bannerAccent}66`,
                  color: f.bannerAccent,
                }}
              >
                {f.shortName} starter
              </button>
            ))}
          </div>

          <RiftPanel material="obsidian" padding="sm">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, keyword, element…"
                  className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-cyan-400/40"
                />
                <select
                  value={affinity}
                  onChange={(e) => setAffinity(e.target.value)}
                  className="rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm text-[var(--text)]"
                >
                  <option value="ALL">All affinities</option>
                  {[
                    "EMBER",
                    "TIDE",
                    "GROVE",
                    "STORM",
                    "STONE",
                    "FROST",
                    "RADIANT",
                    "VOID",
                    "ALLOY",
                    "SPIRIT",
                  ].map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm text-[var(--text)]"
                >
                  <option value="ALL">All types</option>
                  <option value="UNIT">Unit</option>
                  <option value="SPELL">Spell</option>
                  <option value="AURA">Aura</option>
                </select>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm text-[var(--text)]"
                >
                  <option value="ALL">All roles</option>
                  {(data.facets?.roles ?? []).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  className="rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm text-[var(--text)]"
                >
                  <option value="ALL">All rarities</option>
                  {(data.facets?.rarities ?? []).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <select
                  value={elementFilter}
                  onChange={(e) => setElementFilter(e.target.value)}
                  className="rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm text-[var(--text)]"
                >
                  <option value="ALL">All elements</option>
                  {(data.facets?.elements ?? []).map((el) => (
                    <option key={el} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
              </div>

              <div className="deck-atelier-toolbar">
                <div
                  className="deck-atelier-toolbar__group"
                  role="group"
                  aria-label="Card size"
                >
                  <span className="deck-atelier-toolbar__label">Size</span>
                  <div className="deck-atelier-size">
                    {GALLERY_SIZES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={cn(
                          "deck-atelier-size__btn",
                          galleryPrefs.size === s.id && "is-active",
                        )}
                        aria-pressed={galleryPrefs.size === s.id}
                        onClick={() => patchGalleryPrefs({ size: s.id })}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="deck-atelier-toolbar__group">
                  <span className="deck-atelier-toolbar__label">Stack</span>
                  <button
                    type="button"
                    className={cn(
                      "deck-atelier-toggle",
                      galleryPrefs.stackFamilies && "is-active",
                    )}
                    aria-pressed={galleryPrefs.stackFamilies}
                    onClick={() => {
                      const next = !galleryPrefs.stackFamilies;
                      patchGalleryPrefs({ stackFamilies: next });
                      if (!next) setExpandedStacks(new Set());
                    }}
                    title="Stack family stages into piles with a count badge"
                  >
                    {galleryPrefs.stackFamilies
                      ? "Families stacked"
                      : "Flat cards"}
                  </button>
                </div>

                <label className="deck-atelier-toolbar__group deck-atelier-toolbar__group--grow">
                  <span className="deck-atelier-toolbar__label">Organize</span>
                  <select
                    value={galleryPrefs.organizeBy}
                    onChange={(e) =>
                      patchGalleryPrefs({
                        organizeBy: e.target.value as OrganizeBy,
                      })
                    }
                    className="deck-atelier-organize"
                  >
                    {ORGANIZE_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </RiftPanel>

          <div className="deck-atelier-gallery-wrap">
            <ul
              className="deck-atelier-gallery"
              data-size={galleryPrefs.size}
              data-stacked={galleryPrefs.stackFamilies ? "on" : "off"}
            >
              {gallerySections.map((section) => {
                const showHeading = galleryPrefs.organizeBy !== "none";
                return (
                  <li
                    key={section.key}
                    className="deck-atelier-gallery__section"
                  >
                    {showHeading ? (
                      <h3 className="deck-atelier-gallery__heading">
                        <span>{section.label}</span>
                        <span className="deck-atelier-gallery__heading-count">
                          {section.entries.length}
                        </span>
                      </h3>
                    ) : null}
                    <ul className="deck-atelier-gallery__grid">
                      {section.entries.map((entry, entryIndex) => {
                        if (entry.kind === "stack") {
                          const card = entry.top;
                          const inDeck = deckCounts.get(card.id) ?? 0;
                          const atCap =
                            inDeck >= card.maxCopies || inDeck >= card.owned;
                          const content = getCardById(card.id);
                          const art = displayArtForCard(card);
                          const frameSize = frameSizeFor(galleryPrefs.size);
                          return (
                            <li key={entry.stackKey}>
                              <div
                                draggable={!atCap}
                                onDragStart={() => setDragId(card.id)}
                                onDragEnd={() => setDragId(null)}
                                className={cn(
                                  "deck-atelier-gallery__tile deck-atelier-stack relative",
                                  atCap && "opacity-40",
                                )}
                              >
                                <span
                                  className="deck-atelier-stack__layer"
                                  aria-hidden
                                />
                                <span
                                  className="deck-atelier-stack__layer deck-atelier-stack__layer--mid"
                                  aria-hidden
                                />
                                <RiftCardFrame
                                  size={frameSize}
                                  name={card.name}
                                  riftCost={card.riftCost}
                                  typeLine={`${content?.type ?? card.type} · ${content?.element ?? card.affinity}`}
                                  rarity={card.rarity}
                                  affinity={card.affinity}
                                  contentType={content?.type}
                                  element={content?.element}
                                  rulesText={card.description}
                                  attack={card.attack ?? content?.attack}
                                  defense={card.defense ?? content?.defense}
                                  health={card.health ?? content?.health}
                                  speed={card.speed ?? content?.speed}
                                  keywords={content?.keywords ?? card.keywords}
                                  familyId={content?.familyId ?? card.familyId}
                                  collectionNumber={content?.collectorNumber}
                                  expansionSet={content?.expansionId}
                                  artSrc={art}
                                  cardFaceSrc={card.cardImagePath}
                                  ownedCount={inDeck}
                                  dimmed={atCap}
                                  selected={focusListId === card.id}
                                  onClick={() => openCardBio(card.id)}
                                  footerSlot={
                                    <span className="text-[11px] text-amber-100/80">
                                      {entry.label}
                                    </span>
                                  }
                                />
                                <button
                                  type="button"
                                  className="deck-atelier-stack__badge"
                                  aria-label={`Expand ${entry.label} stack, ${entry.cards.length} stages`}
                                  title="Expand family stages"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedStacks((prev) => {
                                      const next = new Set(prev);
                                      next.add(entry.stackKey);
                                      return next;
                                    });
                                  }}
                                >
                                  ×{entry.cards.length}
                                </button>
                                <button
                                  type="button"
                                  className="absolute right-1.5 bottom-1.5 z-10 flex h-7 w-7 items-center justify-center rounded border border-white/20 bg-black/70 text-sm text-cyan-100 shadow-md hover:border-cyan-300/55 hover:text-cyan-50 disabled:opacity-30"
                                  aria-label={`Add ${card.name} to deck`}
                                  disabled={atCap}
                                  onClick={() => {
                                    setFocusListId(card.id);
                                    addCard(card.id);
                                  }}
                                  onPointerDown={(e) => e.stopPropagation()}
                                >
                                  +
                                </button>
                              </div>
                            </li>
                          );
                        }

                        const card = entry.card;
                        const inDeck = deckCounts.get(card.id) ?? 0;
                        const atCap =
                          inDeck >= card.maxCopies || inDeck >= card.owned;
                        const content = getCardById(card.id);
                        const art = displayArtForCard(card);
                        const frameSize = frameSizeFor(galleryPrefs.size);
                        const meta = familyMeta(card.id);
                        const isFirstOfExpandedFamily =
                          galleryPrefs.stackFamilies &&
                          !meta.familyId.startsWith("solo:") &&
                          expandedStacks.has(meta.familyId) &&
                          section.entries.findIndex(
                            (e) =>
                              e.kind === "card" &&
                              familyMeta(e.card.id).familyId === meta.familyId,
                          ) === entryIndex;

                        return (
                          <li key={card.id}>
                            <div
                              draggable={!atCap}
                              onDragStart={() => setDragId(card.id)}
                              onDragEnd={() => setDragId(null)}
                              className={cn(
                                "deck-atelier-gallery__tile relative",
                                atCap && "opacity-40",
                              )}
                            >
                              {isFirstOfExpandedFamily ? (
                                <button
                                  type="button"
                                  className="deck-atelier-stack__collapse"
                                  title="Restack family"
                                  onClick={() => {
                                    setExpandedStacks((prev) => {
                                      const next = new Set(prev);
                                      next.delete(meta.familyId);
                                      return next;
                                    });
                                  }}
                                >
                                  Restack
                                </button>
                              ) : null}
                              <RiftCardFrame
                                size={frameSize}
                                name={card.name}
                                riftCost={card.riftCost}
                                typeLine={`${content?.type ?? card.type} · ${content?.element ?? card.affinity}`}
                                rarity={card.rarity}
                                affinity={card.affinity}
                                contentType={content?.type}
                                element={content?.element}
                                rulesText={card.description}
                                attack={card.attack ?? content?.attack}
                                defense={card.defense ?? content?.defense}
                                health={card.health ?? content?.health}
                                speed={card.speed ?? content?.speed}
                                keywords={content?.keywords ?? card.keywords}
                                familyId={content?.familyId ?? card.familyId}
                                collectionNumber={content?.collectorNumber}
                                expansionSet={content?.expansionId}
                                artSrc={art}
                                cardFaceSrc={card.cardImagePath}
                                ownedCount={inDeck}
                                dimmed={atCap}
                                selected={focusListId === card.id}
                                onClick={() => openCardBio(card.id)}
                                footerSlot={
                                  <span className="text-[11px] text-amber-100/80">
                                    {inDeck}/
                                    {Math.min(card.maxCopies, card.owned)}
                                  </span>
                                }
                              />
                              <button
                                type="button"
                                className="absolute right-1.5 bottom-1.5 z-10 flex h-7 w-7 items-center justify-center rounded border border-white/20 bg-black/70 text-sm text-cyan-100 shadow-md hover:border-cyan-300/55 hover:text-cyan-50 disabled:opacity-30"
                                aria-label={`Add ${card.name} to deck`}
                                disabled={atCap}
                                onClick={() => {
                                  setFocusListId(card.id);
                                  addCard(card.id);
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                              >
                                +
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {galleryCardCount < filtered.length
              ? `Showing ${galleryCardCount} of ${filtered.length} cards`
              : `${filtered.length} card${filtered.length === 1 ? "" : "s"}`}
            {galleryPrefs.stackFamilies
              ? ` · ${galleryEntryCount} pile${galleryEntryCount === 1 ? "" : "s"}`
              : ""}
            {galleryPrefs.organizeBy !== "none"
              ? ` · grouped by ${galleryPrefs.organizeBy}`
              : ""}
            {galleryCardCount < filtered.length
              ? " — refine search to narrow."
              : ""}
          </p>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <RiftPanel
            material="arcane"
            className={cn(dragId && "ring-1 ring-cyan-400/50")}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) addCard(dragId);
              setDragId(null);
            }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-display text-lg text-[var(--text)]">Your list</h2>
              <span className="text-sm tabular-nums text-[var(--text-muted)]">
                {deck.length}/{data.defaults.maxDeckSize}
              </span>
            </div>
            <p
              className={cn(
                "mt-1 text-xs",
                validation.ok ? "text-emerald-300" : "text-amber-200",
              )}
            >
              {validation.reason}
            </p>
            <p className="mt-0.5 text-[10px] text-white/40">
              {deckRows.length} unique · click name for lore · − / + copies
            </p>

            <label className="mt-3 block text-xs text-[var(--text-muted)]">
              Commander
              <select
                value={commanderId ?? ""}
                onChange={(e) => setCommanderId(e.target.value || null)}
                className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-2 py-2 text-sm text-[var(--text)]"
              >
                <option value="">Select…</option>
                {data.commanders.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.title}
                  </option>
                ))}
              </select>
            </label>

            <div
              className="mt-3 flex h-12 items-end gap-1"
              aria-label="Energy curve"
            >
              {curve.map((n, i) => {
                const h =
                  n <= 0 ? 0 : Math.max(4, Math.round((n / curveMax) * 36));
                const isEarly = i <= turn1Energy;
                return (
                  <div
                    key={i}
                    className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
                    title={`Cost ${i === 7 ? "7+" : i}: ${n}`}
                  >
                    <span className="text-[9px] tabular-nums text-cyan-100/70">
                      {n > 0 ? n : ""}
                    </span>
                    <div
                      className={cn(
                        "w-full rounded-sm transition-[height]",
                        n > 0
                          ? isEarly
                            ? "bg-amber-400/60"
                            : "bg-cyan-400/55"
                          : "bg-white/5",
                      )}
                      style={{ height: n > 0 ? `${h}px` : "2px" }}
                    />
                    <span className="text-[9px] text-white/40">
                      {i === 7 ? "7+" : i}
                    </span>
                  </div>
                );
              })}
            </div>
            {validation.warnings?.length ? (
              <ul className="mt-2 space-y-1 text-[10px]">
                {validation.warnings.map((w) => (
                  <li
                    key={w.code}
                    className={cn(
                      w.severity === "error" && "text-rose-300",
                      w.severity === "warn" && "text-amber-200",
                      w.severity === "info" && "text-cyan-200/80",
                    )}
                  >
                    {w.message}
                  </li>
                ))}
              </ul>
            ) : null}

            {deckRows.length === 0 ? (
              <p className="mt-4 rounded-md border border-dashed border-white/15 bg-black/25 px-3 py-6 text-center text-xs text-[var(--text-muted)]">
                Your list is empty. Click a card for its bio, then + or drag to
                add it here.
              </p>
            ) : (
              <ul className="deck-atelier-list mt-3 max-h-[22rem] space-y-1 overflow-y-auto overscroll-contain pr-1">
                {deckRows.map(({ id, n, card }) => {
                  const atCap =
                    n >= (card?.maxCopies ?? 0) || n >= (card?.owned ?? 0);
                  const art = card ? displayArtForCard(card) : undefined;
                  const focused = focusListId === id;
                  return (
                    <li key={id}>
                      <div
                        className={cn(
                          "group flex w-full items-center gap-2 rounded-md border border-transparent px-1.5 py-1 text-xs text-[var(--text)]",
                          focused
                            ? "border-cyan-400/35 bg-white/10"
                            : "hover:bg-white/5",
                        )}
                      >
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-center gap-2 text-left outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/50"
                          onClick={() => openCardBio(id)}
                          title="Open Lore Journal"
                        >
                          <span className="relative h-8 w-6 shrink-0 overflow-hidden rounded-sm bg-black/50 ring-1 ring-white/10">
                            {art ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={art}
                                alt=""
                                className="h-full w-full object-cover object-top"
                                loading="lazy"
                              />
                            ) : null}
                          </span>
                          <span className="w-4 shrink-0 text-center tabular-nums text-cyan-200/80">
                            {card?.riftCost ?? "?"}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {card?.name ?? id}
                          </span>
                          <span className="shrink-0 tabular-nums text-amber-200/90">
                            ×{n}
                          </span>
                        </button>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-black/35 text-sm text-white/80 hover:border-amber-300/40 hover:text-amber-100 disabled:opacity-30"
                            aria-label={`Remove one ${card?.name ?? id}`}
                            disabled={n <= 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCard(id);
                              (e.currentTarget as HTMLButtonElement).blur();
                            }}
                          >
                            −
                          </button>
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-black/35 text-sm text-white/80 hover:border-cyan-300/40 hover:text-cyan-100 disabled:opacity-30"
                            aria-label={`Add one ${card?.name ?? id}`}
                            disabled={atCap || deck.length >= data.defaults.maxDeckSize}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFocusListId(id);
                              addCard(id);
                              (e.currentTarget as HTMLButtonElement).blur();
                            }}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-black/35 text-[10px] text-white/50 hover:border-rose-300/40 hover:text-rose-100"
                            aria-label={`Remove all ${card?.name ?? id}`}
                            title="Remove all copies"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAllCopies(id);
                              (e.currentTarget as HTMLButtonElement).blur();
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <RiftButton
                tone="gold"
                disabled={!validation.ok}
                onClick={() => void saveDeck()}
              >
                Save active deck
              </RiftButton>
              {status ? (
                <p className="text-xs text-[var(--text-muted)]">{status}</p>
              ) : null}
            </div>
          </RiftPanel>

          <RiftPanel material="obsidian" padding="sm">
            <p className="font-display text-sm text-[var(--text)]">Factions</p>
            <ul className="mt-2 space-y-2 text-xs text-[var(--text-muted)]">
              {data.factions.map((f) => (
                <li key={f.id}>
                  <span style={{ color: f.bannerAccent }}>{f.name}</span>
                  <span className="block text-white/45">{f.playstyle}</span>
                </li>
              ))}
            </ul>
          </RiftPanel>
        </aside>
      </div>

      <TcgCardDetailModal
        open={!!inspectDefId}
        defId={inspectDefId}
        onClose={() => setInspectDefId(null)}
      />
    </RiftPageShell>
  );
}
