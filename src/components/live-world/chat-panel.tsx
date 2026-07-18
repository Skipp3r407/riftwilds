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

type Props = {
  bridge: LiveWorldBridge;
  chatMode?: ChatDisplayMode;
  onRevealHud?: () => void;
  panelLayout?: HudPanelLayout;
  onPanelPositionChange?: (position: HudPanelPosition) => void;
};

const TABS: ChatChannel[] = ["nearby", "party", "whisper", "system"];

export function LiveWorldChatPanel({
  bridge,
  chatMode = "pinned",
  onRevealHud,
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
    chatMode === "transparent" ? "bg-[#0a101c]/55" : "bg-[#0a101c]/95";
  const width = floatExpanded ? "w-[min(100%-1.5rem,480px)]" : "w-[min(100%-1.5rem,360px)]";
  const defaultClass = `pointer-events-auto absolute bottom-3 left-3 z-30 ${width}`;
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
        {dragHandleProps ? <HudDragGrip className="text-white/70" /> : null}
        <button
          type="button"
          className="btn-secondary focus-ring text-xs"
          data-no-drag
          onClick={() => {
            playSfx("ui.chat_open");
            setOpen(true);
            onRevealHud?.();
            getInputManager().setActivePanel("chat");
          }}
        >
          Chat (Enter)
        </button>
      </div>
    ) : (
      <div className={`overflow-hidden rounded-md border border-[var(--border)] ${panelBg} shadow-xl`}>
        <div
          className={`flex items-center gap-1 border-b border-[var(--border)] px-2 py-1 ${
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
          {dragHandleProps ? <HudDragGrip className="text-white/60" /> : null}
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              data-no-drag
              className={`rounded px-2 py-0.5 text-[10px] capitalize ${
                tab === t ? "bg-[var(--cyan)]/20 text-[var(--cyan)]" : "text-[var(--text-dim)]"
              }`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            data-no-drag
            className="text-[10px] text-[var(--text-dim)]"
            title="Expand / float resize stub"
            onClick={() => setFloatExpanded((v) => !v)}
          >
            {floatExpanded ? "Shrink" : "Expand"}
          </button>
          <button
            type="button"
            data-no-drag
            className="ml-auto text-[10px] text-[var(--text-dim)]"
            onClick={() => {
              playSfx("ui.chat_close");
              setOpen(false);
              getInputManager().closePanel();
            }}
          >
            Esc
          </button>
        </div>
        <ul className="max-h-36 space-y-1 overflow-y-auto px-2 py-2 text-[11px]">
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
          className="flex gap-1 border-t border-[var(--border)] p-2"
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
            className="focus-ring min-w-0 flex-1 rounded border border-[var(--border)] bg-black/40 px-2 py-1 text-xs text-white"
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
