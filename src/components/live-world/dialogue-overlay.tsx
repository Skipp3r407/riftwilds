"use client";

import { useEffect, useState } from "react";
import type { DialoguePayload, InteractPrompt } from "@/game/live-world/types";
import { selectDialogueChoice } from "@/game/npcs/dialogue";
import { getNpcShop } from "@/game/npcs/shops";
import {
  grantShopInventory,
  loadLivePlayState,
  mirrorCreditsBalance,
  saveLivePlayState,
} from "@/game/npcs/play-state";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import { playSfx } from "@/hooks/use-sfx";
import {
  fetchCreditsBalance,
  getDemoCreditsUserId,
  syncNpcShopBuy,
} from "@/lib/credits/client";
import { flushPendingQuestCredits } from "@/lib/credits/sync-pending";
import { emitCreditsUpdated } from "@/components/credits/credits-balance-chip";

type Props = {
  dialogue: DialoguePayload | null;
  prompt: InteractPrompt;
  onAdvance: () => void;
  bridge?: LiveWorldBridge | null;
};

export function LiveWorldDialogueOverlay({
  dialogue,
  prompt,
  onAdvance,
  bridge,
}: Props) {
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopMsg, setShopMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [credits, setCredits] = useState(200);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const bal = await flushPendingQuestCredits();
      if (!cancelled) setCredits(bal);
      emitCreditsUpdated();
    })();
    return () => {
      cancelled = true;
    };
  }, [dialogue?.npcSlug, dialogue?.lineIndex]);

  if (shopId) {
    const shop = getNpcShop(shopId);
    return (
      <div className="absolute inset-x-0 bottom-0 z-30 p-3 md:p-5">
        <div className="w-full rounded-2xl border border-[var(--stroke-bronze)] bg-[rgba(22,18,14,0.94)] px-4 py-4 shadow-[inset_0_1px_0_rgba(232,213,176,0.1)] backdrop-blur-md md:px-6">
          <p className="font-display text-sm text-[var(--cyan)]">
            {shop?.title ?? "Shop"}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Credits: {credits} · Soft currency only — not SOL
          </p>
          {shopMsg ? (
            <p className="mt-2 text-sm text-[var(--emerald)]">{shopMsg}</p>
          ) : null}
          <ul className="mt-3 space-y-2">
            {(shop?.buy ?? []).map((item) => (
              <li key={item.itemId} className="flex items-center justify-between gap-3">
                <span className="text-sm text-white">
                  {item.name}{" "}
                  <span className="text-[var(--text-dim)]">({item.price} cr)</span>
                </span>
                <button
                  type="button"
                  className="btn-secondary focus-ring text-xs"
                  disabled={busy}
                  onClick={() => {
                    void (async () => {
                      setBusy(true);
                      try {
                        const debit = await syncNpcShopBuy(shopId, item.itemId);
                        if (!debit.ok) {
                          setShopMsg(debit.message || "Not enough Credits.");
                          playSfx("shop.purchase_fail");
                          if (typeof debit.balance === "number") setCredits(debit.balance);
                          return;
                        }
                        const state = loadLivePlayState();
                        const result = grantShopInventory(
                          state,
                          shopId,
                          item.itemId,
                          debit.balance,
                        );
                        setCredits(result.state.demoCredits);
                        setShopMsg(result.message);
                        saveLivePlayState(result.state);
                        playSfx(result.ok ? "shop.purchase_ok" : "shop.purchase_fail");
                        emitCreditsUpdated();
                      } finally {
                        setBusy(false);
                      }
                    })();
                  }}
                >
                  Buy
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-primary focus-ring mt-4 text-xs"
            onClick={() => {
              playSfx("ui.modal_close");
              setShopId(null);
              setShopMsg(null);
            }}
          >
            Close shop
          </button>
        </div>
      </div>
    );
  }

  if (dialogue) {
    const line = dialogue.lines[dialogue.lineIndex] ?? "…";
    const safeLine =
      !line || /undefined|null|^TODO/i.test(line)
        ? "The keeper greets you warmly."
        : line;
    const more = dialogue.lineIndex < dialogue.lines.length - 1;
    const showChoices =
      !more && dialogue.choices && dialogue.choices.length > 0 && dialogue.npcSlug;

    return (
      <div className="absolute inset-x-0 bottom-0 z-30 p-3 md:p-5">
        <div className="w-full rounded-2xl border border-[var(--stroke-bronze)] bg-[rgba(22,18,14,0.92)] px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(232,213,176,0.1)] backdrop-blur-md md:px-6">
          <div className="flex gap-3">
            {dialogue.portraitAsset ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dialogue.portraitAsset}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 shrink-0 rounded-lg border border-[var(--stroke-bronze)] object-cover bg-[rgba(42,33,24,0.85)]"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  const current = dialogue.portraitAsset ?? "";
                  const fallback = current.replace(
                    /\/dialogue-portrait\.png$/i,
                    "/portrait.png",
                  );
                  if (fallback && fallback !== el.src && !el.dataset.fallbackTried) {
                    el.dataset.fallbackTried = "1";
                    el.src = fallback;
                    return;
                  }
                  el.style.display = "none";
                }}
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm text-[var(--cyan)]">{dialogue.speaker}</p>
              <button
                type="button"
                onClick={() => {
                  playSfx("ui.click");
                  onAdvance();
                }}
                className="focus-ring mt-2 w-full text-left"
              >
                <p className="text-sm text-white md:text-base">{safeLine}</p>
                {!showChoices ? (
                  <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
                    {more ? "Tap / E / Space — continue" : "Tap / E / Space — close"}
                  </p>
                ) : null}
              </button>
            </div>
          </div>
          {showChoices ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {dialogue.choices!.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="btn-secondary focus-ring text-xs"
                  onClick={() => {
                    if (!dialogue.npcSlug || !bridge) return;
                    playSfx("ui.click");
                    const result = selectDialogueChoice(
                      {
                        npcSlug: dialogue.npcSlug,
                        speaker: dialogue.speaker,
                        portraitAsset: dialogue.portraitAsset ?? "",
                        nodeId: "active",
                        lines: dialogue.lines,
                        lineIndex: dialogue.lineIndex,
                        choices: dialogue.choices!.map((x) => ({
                          id: x.id,
                          label: x.label,
                        })),
                      },
                      c.id,
                    );
                    void flushPendingQuestCredits().then((bal) => {
                      setCredits(bal);
                      emitCreditsUpdated();
                    });
                    if (result.openShopId) {
                      playSfx("ui.modal_open");
                      setShopId(result.openShopId);
                      void fetchCreditsBalance(getDemoCreditsUserId()).then((res) => {
                        if (res.ok) {
                          setCredits(res.balance);
                          const st = loadLivePlayState();
                          mirrorCreditsBalance(st, res.balance);
                          saveLivePlayState(st);
                        }
                      });
                      return;
                    }
                    if (!result.dialogue) {
                      bridge.setNpcDialogue(null);
                      return;
                    }
                    bridge.setNpcDialogue({
                      speaker: result.dialogue.speaker,
                      lines: result.dialogue.lines,
                      lineIndex: 0,
                      npcSlug: result.dialogue.npcSlug,
                      portraitAsset: result.dialogue.portraitAsset,
                      choices: result.dialogue.choices.map((ch) => ({
                        id: ch.id,
                        label: ch.label,
                      })),
                    });
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (!prompt.visible) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 flex justify-center px-4 md:bottom-8">
      <div className="rounded-full border border-[var(--stroke-bronze)] bg-[rgba(20,16,12,0.8)] px-4 py-2 text-xs text-[var(--text-muted)] backdrop-blur-md">
        {prompt.label}
      </div>
    </div>
  );
}
