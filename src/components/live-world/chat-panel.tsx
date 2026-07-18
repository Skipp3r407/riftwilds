"use client";

import { useEffect, useRef, useState } from "react";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import type { ChatChannel } from "@/game/live-world/systems/chat";
import type {
  ChatDisplayMode,
  HudPanelLayout,
  HudPanelPosition,
} from "@/game/live-world/systems/immersive/types";
import { getInputManager } from "@/game/live-world/input/input-manager";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { playSfx } from "@/hooks/use-sfx";
import {
  DraggableHudPanel,
  HudDragGrip,
  type HudDragHandleProps,
} from "@/components/live-world/draggable-hud-panel";
import { LW_HUD_GLASS, LW_HUD_PEEK } from "@/components/live-world/hud-chrome";
import { ChevronUp } from "lucide-react";

type Props = {
  bridge: LiveWorldBridge;
  chatMode?: ChatDisplayMode;
  onRevealHud?: () => void;
  /** When true, parent owns placement (bottom-left HUD stack). */
  stacked?: boolean;
  panelLayout?: HudPanelLayout;
  onPanelPositionChange?: (position: HudPanelPosition) => void;
};

const TABS: ChatChannel[] = ["nearby", "party", "whisper", "system"];

export function LiveWorldChatPanel({
  bridge,
  chatMode = "pinned",
  onRevealHud,
  stacked = false,
  panelLayout,
  onPanelPositionChange,
}: Props) {
  const [open, setOpen] = useState(chatMode === "pinned");
  const [tab, setTab] = useState<ChatChannel>("nearby");
  const [draft, setDraft] = useState("");
  const [rev, setRev] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [floatExpanded, setFloatExpanded] = useState(false);

  useEffect(() => {
    if (chatMode === "collapsed") setOpen(false);
    if (chatMode === "pinned") setOpen(true);
  }, [chatMode]);

  useEffect(() => {
    const unsubBridge = bridge.chatRevision.subscribe((r) => {
      setRev(r);
      onRevealHud?.();
      if (chatMode === "auto-hide") {
        setOpen(true);
      }
    });
    const unsubInput = getInputManager().subscribe(() => {
      const panel = getInputManager().getActivePanel();
      if (panel === "chat") {
        setOpen((was) => {
          if (!was) playSfx("ui.chat_open");
          return true;
        });
        onRevealHud?.();
        queueMicrotask(() => inputRef.current?.focus());
      }
    });
    return () => {
      unsubBridge();
      unsubInput();
    };
  }, [bridge, chatMode, onRevealHud]);

  useEffect(() => {
    const input = getInputManager();
    if (!open) {
      input.setTypingFocused(false);
      return;
    }
    input.setTypingFocused(true);
    input.setActivePanel("chat");
    return () => input.setTypingFocused(false);
  }, [open]);

  if (!featureFlagDefaults.LIVE_WORLD_CHAT_ENABLED) return null;

  const messages = bridge.chat.list().filter((m) => {
    if (tab === "system") return m.channel === "system" || m.channel === "global";
    if (tab === "nearby") return m.channel === "nearby" || m.channel === "system";
    return m.channel === tab;
  });
  void rev;

  const submit = () => {
    // Emote/ping slash commands only fire from chat submit — never from WASD movement.
    const result = bridge.chat.submit(draft, { channel: tab, from: "Keeper" });
    bridge.bumpChat();
    if (!result.ok) {
      playSfx("ui.error");
      bridge.chat.send("system", result.reason, { from: "System" });
      bridge.bumpChat();
    } else {
      if (result.emoteKey && featureFlagDefaults.LIVE_WORLD_EMOTES_ENABLED) {
        if (result.pingKind) {
          const ping = bridge.emotes.firePing(
            result.pingKind as Parameters<typeof bridge.emotes.firePing>[0],
          );
          if (!ping.ok) {
            bridge.chat.send("system", ping.reason, { from: "System" });
            bridge.bumpChat();
          }
        } else {
          const played = bridge.playEmote(result.emoteKey, "chat");
          if (!played.ok) {
            bridge.chat.send("system", played.reason, { from: "System" });
            bridge.bumpChat();
          }
        }
      }
      if (draft.trim()) playSfx("ui.chat_send");
    }
    setDraft("");
  };

  const panelBg =
    chatMode === "transparent"
      ? "bg-[rgba(14,16,20,0.55)]"
      : "bg-[rgba(14,16,20,0.92)]";
  const width = floatExpanded ? "w-[min(100%-1.5rem,480px)]" : "w-[min(100%-1.5rem,360px)]";
  const defaultClass = stacked
    ? `pointer-events-auto relative z-30 ${width}`
    : `pointer-events-auto absolute bottom-3 left-3 z-30 ${width}`;
  const canDrag = typeof onPanelPositionChange === "function";

  const content = (dragHandleProps?: HudDragHandleProps) =>
    !open ? (
      <div
        className={`inline-flex items-center gap-1.5 ${dragHandleProps?.className ?? ""}`}
        {...(dragHandleProps
          ? {
              onPointerDown: dragHandleProps.onPointerDown,
              onPointerMove: dragHandleProps.onPointerMove,
              onPointerUp: dragHandleProps.onPointerUp,
              onPointerCancel: dragHandleProps.onPointerCancel,
              style: dragHandleProps.style,
              "data-hud-drag-handle": dragHandleProps["data-hud-drag-handle"],
              title: "Chat · drag to move",
            }
          : {})}
      >
        {dragHandleProps ? <HudDragGrip className="text-[var(--stone)]/80" /> : null}
        <button
          type="button"
          className={`${stacked ? LW_HUD_PEEK : `${LW_HUD_GLASS} min-h-9 px-3 py-1.5`} focus-ring gap-1.5`}
          data-no-drag
          aria-label="Open chat"
          title="Open chat (Enter)"
          onClick={() => {
            playSfx("ui.chat_open");
            setOpen(true);
            onRevealHud?.();
            getInputManager().setActivePanel("chat");
          }}
        >
          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-[var(--amber)]" aria-hidden />
          <span className="font-display text-[11px] tracking-wide text-[var(--text)]">Chat</span>
          <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
            Enter
          </span>
        </button>
      </div>
    ) : (
      <div
        className={`${LW_HUD_GLASS} overflow-hidden ${panelBg}`}
      >
        <div
          className={`flex items-center gap-1 border-b border-[var(--stroke)]/70 px-2 py-1.5 ${
            dragHandleProps?.className ?? ""
          }`}
          {...(dragHandleProps
            ? {
                onPointerDown: dragHandleProps.onPointerDown,
                onPointerMove: dragHandleProps.onPointerMove,
                onPointerUp: dragHandleProps.onPointerUp,
                onPointerCancel: dragHandleProps.onPointerCancel,
                style: dragHandleProps.style,
                "data-hud-drag-handle": dragHandleProps["data-hud-drag-handle"],
                title: dragHandleProps.title,
              }
            : {})}
        >
          {dragHandleProps ? <HudDragGrip className="text-[var(--stone)]/70" /> : null}
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              data-no-drag
              className={`rounded-md px-2 py-1 text-[10px] capitalize transition-colors ${
                tab === t
                  ? "bg-[rgba(255,184,77,0.14)] text-[var(--amber)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            data-no-drag
            className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text)]"
            title="Expand / float resize stub"
            onClick={() => setFloatExpanded((v) => !v)}
          >
            {floatExpanded ? "Shrink" : "Expand"}
          </button>
          <button
            type="button"
            data-no-drag
            className="ml-auto text-[10px] text-[var(--text-muted)] hover:text-[var(--text)]"
            onClick={() => {
              playSfx("ui.chat_close");
              setOpen(false);
              getInputManager().closePanel();
            }}
          >
            Esc
          </button>
        </div>
        <ul className="max-h-36 space-y-1 overflow-y-auto px-2.5 py-2 text-[11px]">
          {messages.slice(-40).map((m) => (
            <li key={m.id}>
              <span className="text-[var(--cyan)]">{m.from}</span>
              {m.whisperTo ? (
                <span className="text-[var(--text-dim)]"> → {m.whisperTo}</span>
              ) : null}
              <span className="text-[var(--text-muted)]">: {m.body}</span>
            </li>
          ))}
        </ul>
        <form
          className="flex gap-1.5 border-t border-[var(--stroke)]/70 p-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => getInputManager().setTypingFocused(true)}
            onBlur={() => getInputManager().setTypingFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                getInputManager().closePanel();
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder="Message or /command…"
            className="focus-ring min-w-0 flex-1 rounded-lg border border-[var(--stroke)] bg-[rgba(8,10,14,0.55)] px-2.5 py-1.5 text-xs text-[var(--text)]"
            maxLength={240}
            autoComplete="off"
          />
          <button type="submit" className="btn-primary focus-ring text-xs">
            Send
          </button>
        </form>
      </div>
    );

  if (!canDrag) {
    return (
      <div className={defaultClass} data-testid="live-world-chat" data-chat-mode={chatMode}>
        {content()}
      </div>
    );
  }

  return (
    <DraggableHudPanel
      panelId="chat"
      position={panelLayout?.chat}
      onPositionChange={onPanelPositionChange}
      defaultClassName={defaultClass}
      testId="live-world-chat"
    >
      {({ dragHandleProps }) => (
        <div data-chat-mode={chatMode}>{content(dragHandleProps)}</div>
      )}
    </DraggableHudPanel>
  );
}
