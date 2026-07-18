"use client";

import { CollapsibleHudPanel, LW_HUD_BTN } from "@/components/live-world/hud-chrome";
import { DraggableHudPanel } from "@/components/live-world/draggable-hud-panel";
import type { SocialPresenceSnapshot } from "@/lib/social-presence/types";
import type { HudPanelLayout, HudPanelPosition } from "@/game/live-world/systems/immersive/types";

type Props = {
  snapshot: SocialPresenceSnapshot | null;
  toast?: string | null;
  onClaimIdle?: () => void;
  onQuickAction?: (kind: string) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  panelLayout?: HudPanelLayout;
  onPanelPositionChange?: (position: HudPanelPosition) => void;
};

export function SocialPresenceHud({
  snapshot,
  toast,
  onClaimIdle,
  onQuickAction,
  collapsed = false,
  onCollapsedChange,
  panelLayout,
  onPanelPositionChange,
}: Props) {
  if (!snapshot?.enabled) return null;

  const afkOk = snapshot.antiAfk.ok;
  const featuredSelf = snapshot.featured;
  const canCollapse = typeof onCollapsedChange === "function";
  const canDrag = typeof onPanelPositionChange === "function";

  const body = (
    <>
      <p className="text-[10px] text-[var(--text-muted)]">
        {snapshot.status}
        {snapshot.inRestZone ? ` · Rest +${snapshot.restBonusPercent}%` : ""}
        {snapshot.densityBonusPercent > 0
          ? ` · Crowd +${snapshot.densityBonusPercent}%`
          : ""}
      </p>
      <p
        className={`mt-1 text-[10px] ${
          afkOk ? "text-[var(--emerald)]" : "text-[var(--amber,#ffb84d)]"
        }`}
      >
        {afkOk ? "Engaged" : "AFK paused — move, chat, emote, or interact"}
      </p>
      {snapshot.socialPrompt ? (
        <p className="mt-1.5 text-[10px] leading-snug text-[var(--text-dim)]">
          {snapshot.socialPrompt.text}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[
          ["WAVE", "Wave"],
          ["SIT", "Sit"],
          ["DANCE", "Dance"],
          ["CAMPFIRE_REST", "Campfire"],
          ["HELP_NEWBIE", "Help"],
        ].map(([kind, label]) => (
          <button
            key={kind}
            type="button"
            className={LW_HUD_BTN}
            onClick={() => onQuickAction?.(kind)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className={`${LW_HUD_BTN} border-[var(--cyan)]/40 bg-[var(--cyan)]/10 text-[var(--cyan)]`}
          onClick={() => onClaimIdle?.()}
          title="Soft Credits/cosmetics after genuine activity — never SOL"
        >
          Claim idle
        </button>
      </div>
    </>
  );

  const extras = (
    <>
      {featuredSelf.length > 0 && !collapsed ? (
        <div className="rounded-xl border border-[var(--amber,#ffb84d)]/35 bg-[rgba(8,12,22,0.72)] px-3 py-2 text-[10px] text-[var(--amber,#ffb84d)]">
          Featured this hour:{" "}
          {featuredSelf.map((f) => `${f.title} (${f.displayName})`).join(" · ")}
        </div>
      ) : null}

      {toast ? (
        <p className="rounded bg-black/70 px-2 py-1 text-[11px] text-[var(--text-muted)]">
          {toast}
        </p>
      ) : null}
    </>
  );

  const defaultClass =
    "pointer-events-none absolute bottom-3 left-3 z-30 flex max-w-[20rem] flex-col gap-2 md:bottom-4 md:left-4";

  const panel = canCollapse ? (
    <CollapsibleHudPanel
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      title="Presence"
      peekLabel="Presence"
      peekExtra={
        <span className="text-[10px] text-[var(--cyan)]">{snapshot.presenceXp} XP</span>
      }
      headerExtra={
        <span className="text-[11px] text-[var(--cyan)]">{snapshot.presenceXp} XP</span>
      }
      testId="social-presence-hud"
      panelClassName="max-w-[20rem]"
    >
      {body}
    </CollapsibleHudPanel>
  ) : (
    <div
      className="pointer-events-auto rounded-xl border border-[var(--stroke)] bg-[rgba(8,12,22,0.78)] px-3 py-2 backdrop-blur-md"
      data-testid="social-presence-hud"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-sm text-white">Presence</p>
        <p className="text-[11px] text-[var(--cyan)]">{snapshot.presenceXp} XP</p>
      </div>
      <div className="mt-1">{body}</div>
    </div>
  );

  if (!canDrag || !canCollapse) {
    return (
      <div className={defaultClass}>
        {panel}
        {extras}
      </div>
    );
  }

  return (
    <DraggableHudPanel
      panelId="presence"
      position={panelLayout?.presence}
      onPositionChange={onPanelPositionChange}
      defaultClassName={defaultClass}
    >
      {({ dragHandleProps }) => (
        <>
          <CollapsibleHudPanel
            collapsed={collapsed}
            onCollapsedChange={onCollapsedChange}
            title="Presence"
            peekLabel="Presence"
            peekExtra={
              <span className="text-[10px] text-[var(--cyan)]">{snapshot.presenceXp} XP</span>
            }
            headerExtra={
              <span className="text-[11px] text-[var(--cyan)]">{snapshot.presenceXp} XP</span>
            }
            testId="social-presence-hud"
            panelClassName="max-w-[20rem]"
            dragHandleProps={dragHandleProps}
          >
            {body}
          </CollapsibleHudPanel>
          {extras}
        </>
      )}
    </DraggableHudPanel>
  );
}
