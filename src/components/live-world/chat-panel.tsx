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
import { MessageSquare, Pin, PinOff } from "lucide-react";

type Props = {
  bridge: LiveWorldBridge;
  chatMode?: ChatDisplayMode;
  onChatModeChange?: (mode: ChatDisplayMode) => void;
  onRevealHud?: () => void;
  /** When true, parent owns placement (bottom-left HUD stack). */
  stacked?: boolean;
  panelLayout?: HudPanelLayout;
  onPanelPositionChange?: (position: HudPanelPosition) => void;
};

const TABS: ChatChannel[] = ["nearby", "party", "whisper", "system"];
/** Idle collapse for auto-hide / transparent (pinned stays open). */
const CHAT_IDLE_HIDE_MS = 6000;

export function LiveWorldChatPanel({
  bridge,
  chatMode = "auto-hide",
  onChatModeChange,
  onRevealHud,
  stacked = false,
  panelLayout,
  onPanelPositionChange,
}: Props) {
  const [open, setOpen] = useState(chatMode === "pinned");
  const [compose, setCompose] = useState(chatMode === "pinned");
  const [tab, setTab] = useState<ChatChannel>("nearby");
  const [draft, setDraft] = useState("");
  const [rev, setRev] = useState(0);
  const [unread, setUnread] = useState(0);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [floatExpanded, setFloatExpanded] = useState(false);
  const onRevealHudRef = useRef(onRevealHud);
  onRevealHudRef.current = onRevealHud;
  const lastChatRevRef = useRef<number | null>(null);
  const activityAtRef = useRef(Date.now());
  const openRef = useRef(open);
  openRef.current = open;
  const pinnedRef = useRef(chatMode === "pinned");
  pinnedRef.current = chatMode === "pinned";
  const autoHidesRef = useRef(true);
  autoHidesRef.current = chatMode === "auto-hide" || chatMode === "transparent";

  const isPinned = chatMode === "pinned";
  const autoHides = chatMode === "auto-hide" || chatMode === "transparent";

  const bumpActivity = () => {
    activityAtRef.current = Date.now();
  };

  const collapseToPeek = () => {
    setOpen(false);
    setCompose(false);
    getInputManager().setTypingFocused(false);
    getInputManager().closePanel();
    inputRef.current?.blur();
  };

  const revealChat = (withCompose: boolean) => {
    setOpen(true);
    setCompose(withCompose);
    setUnread(0);
    bumpActivity();
    onRevealHudRef.current?.();
    getInputManager().setActivePanel("chat");
    if (withCompose) {
      queueMicrotask(() => inputRef.current?.focus());
    }
  };

  useEffect(() => {
    if (chatMode === "collapsed") {
      setOpen(false);
      setCompose(false);
    }
    if (chatMode === "pinned") {
      setOpen(true);
      setCompose(true);
    }
    if (chatMode === "auto-hide" || chatMode === "transparent") {
      setOpen(false);
      setCompose(false);
    }
  }, [chatMode]);

  useEffect(() => {
    const unsubBridge = bridge.chatRevision.subscribe((r) => {
      setRev(r);
      // Skip the immediate sync from createChannel.subscribe — only toast on new messages.
      if (lastChatRevRef.current === null) {
        lastChatRevRef.current = r;
        return;
      }
      if (r === lastChatRevRef.current) return;
      lastChatRevRef.current = r;
      onRevealHudRef.current?.();
      if (!autoHidesRef.current) return;
      bumpActivity();
      // Keep the world clear: flash peek badge instead of forcing the panel open.
      if (!openRef.current) {
        setUnread((n) => n + 1);
      }
    });
    const unsubInput = getInputManager().subscribe(() => {
      const input = getInputManager();
      if (input.wasJustPressed("openChat")) {
        playSfx("ui.chat_open");
        revealChat(true);
        return;
      }
      if (!input.wasJustPressed("escape")) return;
      if (!openRef.current || pinnedRef.current) return;
      playSfx("ui.chat_close");
      collapseToPeek();
    });
    return () => {
      unsubBridge();
      unsubInput();
    };
  }, [bridge]);

  // Visible chat must NOT mark typing-focused — that zeroes WASD. Only the
  // actual <input> focus (below) blocks movement while composing a message.
  useEffect(() => {
    if (!open || !compose) {
      getInputManager().setTypingFocused(false);
    }
  }, [open, compose]);

  // Idle → peek (auto-hide / transparent only). Paused while hovering or typing.
  useEffect(() => {
    if (!autoHides || !open || isPinned) return;
    const id = window.setInterval(() => {
      if (hovered || getInputManager().isTypingFocused()) {
        bumpActivity();
        return;
      }
      if (Date.now() - activityAtRef.current < CHAT_IDLE_HIDE_MS) return;
      playSfx("ui.chat_close");
      collapseToPeek();
    }, 400);
    return () => window.clearInterval(id);
  }, [autoHides, open, isPinned, hovered]);

  // Click / tap outside collapses (unless pinned).
  useEffect(() => {
    if (!open || isPinned || !autoHides) return;
    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) {
        bumpActivity();
        return;
      }
      playSfx("ui.chat_close");
      collapseToPeek();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, isPinned, autoHides]);

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
    bumpActivity();
    if (!isPinned) {
      setCompose(false);
    }
  };

  const togglePin = () => {
    if (!onChatModeChange) return;
    playSfx("ui.click");
    if (isPinned) {
      onChatModeChange("auto-hide");
    } else {
      onChatModeChange("pinned");
      revealChat(true);
    }
  };

  const showInput = isPinned || compose;
  const panelBg =
    chatMode === "transparent"
      ? "bg-[rgba(14,16,20,0.55)]"
      : "bg-[rgba(14,16,20,0.88)]";
  // Compact dock so the world stays center stage.
  const width = floatExpanded
    ? "w-[min(100%-1.5rem,300px)]"
    : "w-[min(100%-1.5rem,210px)]";
  const defaultClass = stacked
    ? `pointer-events-auto relative z-30 ${width}`
    : `pointer-events-auto absolute bottom-3 left-3 z-30 ${width}`;
  const canDrag = typeof onPanelPositionChange === "function";
  const unreadLabel = unread > 9 ? "9+" : String(unread);

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
          className={`${stacked ? LW_HUD_PEEK : `${LW_HUD_GLASS} min-h-9 px-3 py-1.5`} focus-ring relative gap-1.5`}
          data-no-drag
          data-testid="live-world-chat-peek"
          aria-label={unread > 0 ? `Open chat, ${unread} new` : "Open chat"}
          title="Open chat (Enter)"
          onClick={() => {
            playSfx("ui.chat_open");
            revealChat(true);
          }}
        >
          <MessageSquare
            className="h-3.5 w-3.5 shrink-0 text-[var(--amber)]"
            aria-hidden
          />
          <span className="font-display text-[11px] tracking-wide text-[var(--text)]">
            Chat
          </span>
          <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
            Enter
          </span>
          {unread > 0 ? (
            <span
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-[var(--stroke-bronze)] bg-[rgba(255,184,77,0.92)] px-1 font-display text-[9px] font-semibold leading-none text-[rgba(20,14,8,0.95)] shadow-[0_0_10px_rgba(255,184,77,0.45)]"
              data-testid="live-world-chat-unread"
              aria-hidden
            >
              {unreadLabel}
            </span>
          ) : null}
        </button>
      </div>
    ) : (
      <div
        className={`${LW_HUD_GLASS} overflow-hidden ${panelBg}`}
        onPointerEnter={() => {
          setHovered(true);
          bumpActivity();
        }}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={() => bumpActivity()}
      >
        <div
          className={`flex items-center gap-1 border-b border-[var(--stroke-bronze)]/50 px-1.5 py-1 ${
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
          <MessageSquare
            className="ml-0.5 h-3 w-3 shrink-0 text-[var(--amber)]/80"
            aria-hidden
          />
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              data-no-drag
              className={`rounded-md px-1.5 py-0.5 text-[9px] capitalize transition-colors ${
                tab === t
                  ? "bg-[rgba(255,184,77,0.14)] text-[var(--amber)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
              onClick={() => {
                setTab(t);
                bumpActivity();
              }}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            data-no-drag
            className="text-[9px] text-[var(--text-muted)] hover:text-[var(--text)]"
            title="Expand / float resize stub"
            onClick={() => {
              setFloatExpanded((v) => !v);
              bumpActivity();
            }}
          >
            {floatExpanded ? "−" : "+"}
          </button>
          {onChatModeChange ? (
            <button
              type="button"
              data-no-drag
              data-testid="live-world-chat-pin"
              className={`rounded-md p-0.5 ${
                isPinned
                  ? "text-[var(--amber)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
              title={isPinned ? "Unpin chat (auto-hide)" : "Pin chat open"}
              aria-pressed={isPinned}
              aria-label={isPinned ? "Unpin chat" : "Pin chat open"}
              onClick={togglePin}
            >
              {isPinned ? (
                <Pin className="h-3 w-3" aria-hidden />
              ) : (
                <PinOff className="h-3 w-3" aria-hidden />
              )}
            </button>
          ) : null}
          <button
            type="button"
            data-no-drag
            className="ml-auto text-[9px] text-[var(--text-muted)] hover:text-[var(--text)]"
            title="Minimize chat (Esc)"
            onClick={() => {
              playSfx("ui.chat_close");
              collapseToPeek();
            }}
          >
            Esc
          </button>
        </div>
        <ul
          className="max-h-[4.75rem] space-y-0.5 overflow-y-auto px-2 py-1.5 text-[10px] leading-snug"
          data-testid="live-world-chat-log"
        >
          {messages.slice(-24).map((m) => (
            <li key={m.id}>
              <span className="text-[var(--cyan)]">{m.from}</span>
              {m.whisperTo ? (
                <span className="text-[var(--text-dim)]"> → {m.whisperTo}</span>
              ) : null}
              <span className="text-[var(--text-muted)]">: {m.body}</span>
            </li>
          ))}
        </ul>
        {showInput ? (
          <form
            className="flex gap-1 border-t border-[var(--stroke-bronze)]/50 p-1.5"
            data-testid="live-world-chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                bumpActivity();
              }}
              onFocus={() => getInputManager().setTypingFocused(true)}
              onBlur={() => getInputManager().setTypingFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  if (isPinned) {
                    (e.target as HTMLInputElement).blur();
                    return;
                  }
                  playSfx("ui.chat_close");
                  collapseToPeek();
                }
              }}
              placeholder="Message…"
              className="focus-ring min-w-0 flex-1 rounded-md border border-[var(--stroke)] bg-[rgba(8,10,14,0.55)] px-2 py-1 text-[11px] text-[var(--text)]"
              maxLength={240}
              autoComplete="off"
            />
            <button type="submit" className="btn-primary focus-ring px-2 py-1 text-[10px]">
              Send
            </button>
          </form>
        ) : (
          <button
            type="button"
            data-testid="live-world-chat-compose-hint"
            className="w-full border-t border-[var(--stroke-bronze)]/50 px-2 py-1 text-left text-[9px] text-[var(--text-dim)] hover:text-[var(--text-muted)]"
            onClick={() => {
              setCompose(true);
              bumpActivity();
              getInputManager().setActivePanel("chat");
              queueMicrotask(() => inputRef.current?.focus());
            }}
          >
            Press Enter to type…
          </button>
        )}
      </div>
    );

  const shellProps = {
    ref: rootRef,
    "data-testid": "live-world-chat" as const,
    "data-chat-mode": chatMode,
    "data-chat-open": open ? ("1" as const) : ("0" as const),
  };

  if (!canDrag) {
    return (
      <div {...shellProps} className={defaultClass}>
        {content()}
      </div>
    );
  }

  return (
    <div {...shellProps}>
      <DraggableHudPanel
        panelId="chat"
        position={panelLayout?.chat}
        onPositionChange={onPanelPositionChange}
        defaultClassName={defaultClass}
      >
        {({ dragHandleProps }) => (
          <div data-chat-mode={chatMode}>{content(dragHandleProps)}</div>
        )}
      </DraggableHudPanel>
    </div>
  );
}
