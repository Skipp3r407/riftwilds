"use client";

import { useEffect, useState } from "react";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import { listEmotes, getEmoteDef } from "@/game/live-world/systems/emotes/catalog";
import { isEmoteUnlocked } from "@/game/live-world/systems/emotes/unlocks";
import { PING_LABEL } from "@/game/live-world/systems/emotes/pings";
import type { PingKind } from "@/game/live-world/systems/emotes/types";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { playSfx } from "@/hooks/use-sfx";

type Props = {
  bridge: LiveWorldBridge;
};

const PINGS: PingKind[] = [
  "follow_me",
  "help",
  "ready",
  "not_ready",
  "look_here",
  "celebrate",
  "danger",
  "thanks",
];

export function LiveWorldEmotePanel({ bridge }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"solo" | "social" | "pings" | "unlocks" | "privacy">("solo");
  const [, bump] = useState(0);

  useEffect(() => {
    return bridge.emoteUi.subscribe((ui) => setOpen(ui.mode === "panel"));
  }, [bridge]);

  if (!featureFlagDefaults.LIVE_WORLD_EMOTES_ENABLED || !open) return null;

  const unlocks = bridge.emotes.getUnlocks();
  const favorites = bridge.emotes.getFavorites();
  const privacy = bridge.emotes.getPrivacy();
  const solo = listEmotes({ kind: "solo" });
  const social = listEmotes({ kind: "social" });
  const creditEmotes = listEmotes().filter((e) => e.tier !== "free");

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="max-h-[90%] w-full max-w-lg overflow-auto rounded-lg border border-[var(--border)] bg-[#0c1420] p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-lg text-white">Emotes</h3>
            <p className="text-[11px] text-[var(--text-dim)]">
              Cosmetic only — no combat or Credits advantages from gestures.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary focus-ring text-xs"
            onClick={() => bridge.closeEmoteUi()}
          >
            Close
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          {(["solo", "social", "pings", "unlocks", "privacy"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`rounded px-2 py-1 text-[11px] capitalize ${
                tab === t ? "bg-[var(--cyan)]/20 text-[var(--cyan)]" : "text-[var(--text-dim)]"
              }`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "solo" ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {solo.map((e) => {
              const locked = !isEmoteUnlocked(unlocks, e.key);
              return (
                <button
                  key={e.key}
                  type="button"
                  disabled={locked}
                  className="focus-ring flex flex-col items-center gap-1 rounded border border-[var(--border)] bg-black/30 p-2 text-center disabled:opacity-40"
                  onClick={() => {
                    const result = bridge.playEmote(e.key, "wheel");
                    if (!result.ok) {
                      bridge.chat.send("system", result.reason, { from: "System" });
                      bridge.bumpChat();
                      playSfx("ui.error");
                    } else {
                      playSfx("ui.click");
                      bridge.closeEmoteUi();
                    }
                  }}
                  onContextMenu={(ev) => {
                    ev.preventDefault();
                    const empty = favorites.wheelSlots.findIndex((s) => !s);
                    const idx = empty >= 0 ? empty : 0;
                    bridge.emotes.assignWheelSlot(idx, e.key);
                    bump((n) => n + 1);
                    playSfx("ui.click");
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={e.iconPath}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                    onError={(ev) => {
                      (ev.target as HTMLImageElement).replaceWith(
                        Object.assign(document.createElement("span"), {
                          textContent: e.glyph,
                          className: "text-2xl",
                        }),
                      );
                    }}
                  />
                  <span className="text-[11px] text-white">{e.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {tab === "social" ? (
          <div className="space-y-2">
            <p className="text-[11px] text-[var(--text-muted)]">
              Paired emotes need mutual consent. Multiplayer targets arrive in Phase 2 — you can
              still practice the request flow locally.
            </p>
            {social.map((e) => (
              <button
                key={e.key}
                type="button"
                className="focus-ring flex w-full items-center gap-3 rounded border border-[var(--border)] bg-black/30 px-3 py-2 text-left"
                onClick={() => {
                  const result = bridge.emotes.requestSocial({
                    emoteKey: e.key,
                    toId: "demo-keeper",
                    fromLabel: "Keeper",
                  });
                  if (!result.ok) {
                    bridge.chat.send("system", result.reason, { from: "System" });
                    bridge.bumpChat();
                    playSfx("ui.error");
                    return;
                  }
                  bridge.consentPrompt.set(result.request);
                  playSfx("ui.click");
                }}
              >
                <span className="text-xl">{e.glyph}</span>
                <span>
                  <span className="block text-sm text-white">{e.label}</span>
                  <span className="text-[10px] text-[var(--text-dim)]">{e.description}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {tab === "pings" ? (
          <div className="grid grid-cols-2 gap-2">
            {PINGS.map((p) => (
              <button
                key={p}
                type="button"
                className="btn-secondary focus-ring text-xs"
                onClick={() => {
                  const result = bridge.emotes.firePing(p);
                  if (!result.ok) {
                    bridge.chat.send("system", result.reason, { from: "System" });
                    bridge.bumpChat();
                    playSfx("ui.error");
                  } else {
                    playSfx("ui.click");
                    bridge.closeEmoteUi();
                  }
                }}
              >
                {PING_LABEL[p]}
              </button>
            ))}
          </div>
        ) : null}

        {tab === "unlocks" ? (
          <div className="space-y-2">
            <p className="text-[11px] text-[var(--amber)]">
              Credits unlocks are cosmetic only. Premium labels never grant power or SOL benefits.
            </p>
            {creditEmotes.map((e) => {
              const owned = isEmoteUnlocked(unlocks, e.key);
              return (
                <div
                  key={e.key}
                  className="flex items-center justify-between gap-2 rounded border border-[var(--border)] px-3 py-2"
                >
                  <div>
                    <p className="text-sm text-white">
                      {e.glyph} {e.label}
                    </p>
                    <p className="text-[10px] text-[var(--text-dim)]">
                      {e.tier === "premium_cosmetic" ? "Premium cosmetic · " : ""}
                      {e.creditsCost ?? 0} Credits · {e.unlockHint}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary focus-ring text-xs"
                    disabled={owned}
                    onClick={() => {
                      // Local stub spend — real ledger debit is Phase 2 economy hook.
                      const result = bridge.emotes.unlockWithCredits(e.key, 99999);
                      if (!result.ok) {
                        bridge.chat.send("system", result.reason, { from: "System" });
                        bridge.bumpChat();
                        playSfx("ui.error");
                      } else {
                        bridge.chat.send("system", result.note, { from: "System" });
                        bridge.bumpChat();
                        bump((n) => n + 1);
                        playSfx("ui.click");
                      }
                    }}
                  >
                    {owned ? "Owned" : "Unlock"}
                  </button>
                </div>
              );
            })}
            <div className="mt-3">
              <p className="mb-1 text-[11px] text-[var(--text-muted)]">
                Wheel favorites (right-click an emote in Solo to assign)
              </p>
              <div className="flex flex-wrap gap-1">
                {favorites.wheelSlots.map((key, i) => (
                  <span
                    key={i}
                    className="rounded border border-[var(--border)] px-2 py-1 text-[10px] text-[var(--text-dim)]"
                  >
                    {i + 1}: {key ? getEmoteDef(key)?.label ?? key : "—"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {tab === "privacy" ? (
          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between gap-2">
              <span className="text-[var(--text-muted)]">Allow social emote requests</span>
              <input
                type="checkbox"
                checked={privacy.allowSocialRequests}
                onChange={(e) => {
                  bridge.emotes.setPrivacy({
                    ...privacy,
                    allowSocialRequests: e.target.checked,
                  });
                  bump((n) => n + 1);
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-2">
              <span className="text-[var(--text-muted)]">Friends-only social (Phase 2)</span>
              <input
                type="checkbox"
                checked={privacy.friendsOnlySocial}
                onChange={(e) => {
                  bridge.emotes.setPrivacy({
                    ...privacy,
                    friendsOnlySocial: e.target.checked,
                  });
                  bump((n) => n + 1);
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-2">
              <span className="text-[var(--text-muted)]">Hide remote emote bubbles</span>
              <input
                type="checkbox"
                checked={privacy.hideRemoteBubbles}
                onChange={(e) => {
                  bridge.emotes.setPrivacy({
                    ...privacy,
                    hideRemoteBubbles: e.target.checked,
                  });
                  bump((n) => n + 1);
                }}
              />
            </label>
            <p className="text-[11px] text-[var(--text-dim)]">
              Mute / block lists are stored locally until moderation services ship. Blocked players
              cannot send you social emote requests.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
