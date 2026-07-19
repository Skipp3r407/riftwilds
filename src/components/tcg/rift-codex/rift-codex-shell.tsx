"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { FamilyProgress } from "@/game/tcg/card-families";
import {
  claimFamilyReward,
  loadCodexLocalState,
  markFamilyOpened,
  recordMuseumVisit,
  setCodexSection,
  shouldPlayDiscoveryCinematic,
  type CodexLocalState,
  type CodexSectionId,
} from "@/game/tcg/codex-progress";
import {
  buildCollectionMap,
  computeCodexStats,
} from "@/game/tcg/codex-stats";
import { CodexToc, type CodexTocCategory } from "@/components/tcg/rift-codex/codex-toc";
import { CodexSpeciesIndex } from "@/components/tcg/rift-codex/codex-species-index";
import { CodexFamilySpread } from "@/components/tcg/rift-codex/codex-family-spread";
import { CodexStatsPanel } from "@/components/tcg/rift-codex/codex-stats-panel";
import { CodexCollectionMap } from "@/components/tcg/rift-codex/codex-collection-map";
import { CodexDiscoveryBanner } from "@/components/tcg/rift-codex/codex-discovery-banner";
import { MuseumHall } from "@/components/tcg/rift-codex/museum-hall";
import { CodexBinderPanel } from "@/components/tcg/rift-codex/codex-binder-panel";
import { playSfx } from "@/hooks/use-sfx";
import { enterSoundscape } from "@/lib/audio/adaptive-engine";
import { cn } from "@/lib/utils/cn";

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

type Props = {
  families: FamilyProgress[];
  flatCards: FlatRow[];
  /** When set, open directly on this family spread. */
  initialFamilyId?: string | null;
  /** Force initial section (e.g. museum route). */
  initialSection?: CodexSectionId;
  onInspectCard: (defId: string) => void;
};

type View =
  | { kind: "toc" }
  | { kind: "families" }
  | { kind: "family"; id: string }
  | { kind: "stats" }
  | { kind: "map" }
  | { kind: "museum" }
  | { kind: "binder" };

function sectionToView(section: CodexSectionId, familyId?: string | null): View {
  if (familyId) return { kind: "family", id: familyId };
  switch (section) {
    case "families":
      return { kind: "families" };
    case "stats":
      return { kind: "stats" };
    case "map":
      return { kind: "map" };
    case "museum":
      return { kind: "museum" };
    case "binder":
      return { kind: "binder" };
    default:
      return { kind: "toc" };
  }
}

export function RiftCodexShell({
  families,
  flatCards,
  initialFamilyId,
  initialSection = "toc",
  onInspectCard,
}: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [, startTransition] = useTransition();
  const [local, setLocal] = useState<CodexLocalState | null>(null);
  const [view, setView] = useState<View>(() =>
    sectionToView(initialSection, initialFamilyId),
  );
  const [pageKey, setPageKey] = useState(0);
  const [query, setQuery] = useState("");
  const [affinity, setAffinity] = useState("ALL");
  const [cinematic, setCinematic] = useState<{
    title: string;
    affinity: string;
  } | null>(null);

  useEffect(() => {
    setLocal(loadCodexLocalState());
    void enterSoundscape("codex", { fadeMs: 800 });
    playSfx("codex.page_turn");
  }, []);

  useEffect(() => {
    if (initialFamilyId) {
      setView({ kind: "family", id: initialFamilyId });
      const play = shouldPlayDiscoveryCinematic(initialFamilyId);
      const fp = families.find((f) => f.family.id === initialFamilyId);
      const next = markFamilyOpened(initialFamilyId, { cinematic: play });
      setLocal(next);
      if (play && fp) {
        setCinematic({
          title: fp.family.title,
          affinity: fp.family.affinity,
        });
        playSfx("codex.discover");
      }
    }
  }, [initialFamilyId, families]);

  const stats = useMemo(() => computeCodexStats(families), [families]);
  const regions = useMemo(() => buildCollectionMap(families), [families]);

  const activeFamily = useMemo(() => {
    if (view.kind !== "family") return null;
    return families.find((f) => f.family.id === view.id) ?? null;
  }, [view, families]);

  function turnTo(next: View, section?: CodexSectionId) {
    playSfx("codex.page_turn");
    startTransition(() => {
      setPageKey((k) => k + 1);
      setView(next);
      if (section) setLocal(setCodexSection(section));
    });
  }

  function openFamily(familyId: string) {
    const play = shouldPlayDiscoveryCinematic(familyId);
    const fp = families.find((f) => f.family.id === familyId);
    const next = markFamilyOpened(familyId, { cinematic: play });
    setLocal(next);
    turnTo({ kind: "family", id: familyId }, "families");
    if (play && fp) {
      setCinematic({ title: fp.family.title, affinity: fp.family.affinity });
      playSfx("codex.discover");
    }
    if (typeof window !== "undefined" && window.location.pathname === "/tcg/codex") {
      router.replace(`/tcg/codex/${familyId}`, { scroll: false });
    }
  }

  function onTocCategory(cat: CodexTocCategory) {
    if (cat === "museum") {
      setLocal(recordMuseumVisit());
      turnTo({ kind: "museum" }, "museum");
      return;
    }
    if (cat === "families") {
      turnTo({ kind: "families" }, "families");
      return;
    }
    turnTo({ kind: cat }, cat);
  }

  const rewardClaimed =
    activeFamily && local
      ? Boolean(local.discoveries[activeFamily.family.id]?.rewardClaimed)
      : false;

  return (
    <div
      className="rift-codex"
      data-audio-cue="codex.book.open"
      data-section={view.kind}
    >
      <div className="rift-codex__leather" aria-hidden />
      <div className="rift-codex__filigree" aria-hidden />

      <div className="rift-codex__toolbar">
        <button
          type="button"
          className={cn(view.kind === "toc" && "is-active")}
          onClick={() => turnTo({ kind: "toc" }, "toc")}
          data-audio-cue="codex.page.turn"
        >
          Contents
        </button>
        <button
          type="button"
          className={cn(
            (view.kind === "families" || view.kind === "family") && "is-active",
          )}
          onClick={() => turnTo({ kind: "families" }, "families")}
        >
          Species
        </button>
        <button
          type="button"
          className={cn(view.kind === "stats" && "is-active")}
          onClick={() => turnTo({ kind: "stats" }, "stats")}
        >
          Stats
        </button>
        <button
          type="button"
          className={cn(view.kind === "map" && "is-active")}
          onClick={() => turnTo({ kind: "map" }, "map")}
        >
          Map
        </button>
        <button
          type="button"
          className={cn(view.kind === "museum" && "is-active")}
          onClick={() => {
            setLocal(recordMuseumVisit());
            turnTo({ kind: "museum" }, "museum");
          }}
        >
          Museum
        </button>
        <button
          type="button"
          className={cn(view.kind === "binder" && "is-active")}
          onClick={() => turnTo({ kind: "binder" }, "binder")}
        >
          Binder
        </button>
      </div>

      <div className="rift-codex__book">
        <div className="rift-codex__spine" aria-hidden />
        <div className="rift-codex__parchment">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${view.kind}-${pageKey}-${activeFamily?.family.id ?? ""}`}
              className="rift-codex__page-motion"
              initial={
                reduceMotion ? false : { opacity: 0, rotateY: -8, x: 24 }
              }
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={
                reduceMotion
                  ? undefined
                  : { opacity: 0, rotateY: 6, x: -18 }
              }
              transition={{ duration: reduceMotion ? 0.01 : 0.38 }}
            >
              {view.kind === "toc" ? (
                <CodexToc
                  families={families}
                  stats={stats}
                  onOpenCategory={onTocCategory}
                  onOpenFamily={openFamily}
                />
              ) : null}

              {view.kind === "families" ? (
                <CodexSpeciesIndex
                  families={families}
                  stats={stats}
                  query={query}
                  affinity={affinity}
                  onQueryChange={setQuery}
                  onAffinityChange={setAffinity}
                  onOpenFamily={openFamily}
                />
              ) : null}

              {view.kind === "family" && activeFamily ? (
                <CodexFamilySpread
                  progress={activeFamily}
                  rewardClaimed={rewardClaimed}
                  onClaimReward={() => {
                    setLocal(
                      claimFamilyReward(
                        activeFamily.family.id,
                        activeFamily.family.completionReward.id,
                      ),
                    );
                  }}
                  onInspectCard={onInspectCard}
                />
              ) : null}

              {view.kind === "family" && !activeFamily ? (
                <p className="rift-codex__empty">Family not found in Codex.</p>
              ) : null}

              {view.kind === "stats" ? (
                <CodexStatsPanel stats={stats} onOpenFamily={openFamily} />
              ) : null}
              {view.kind === "map" ? (
                <CodexCollectionMap
                  regions={regions}
                  onOpenFamily={openFamily}
                />
              ) : null}
              {view.kind === "museum" ? (
                <MuseumHall
                  families={families}
                  visits={local?.museumVisits ?? 0}
                  onOpenFamily={openFamily}
                />
              ) : null}
              {view.kind === "binder" ? (
                <CodexBinderPanel
                  families={families}
                  flatCards={flatCards}
                  onInspectCard={onInspectCard}
                  onOpenFamily={openFamily}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <CodexDiscoveryBanner
        open={Boolean(cinematic)}
        familyTitle={cinematic?.title ?? ""}
        affinity={cinematic?.affinity ?? ""}
        onDone={() => setCinematic(null)}
      />
    </div>
  );
}
