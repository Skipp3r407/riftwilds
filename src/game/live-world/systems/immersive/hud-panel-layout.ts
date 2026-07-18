/**
 * Free-form Live World HUD panel positions (px, relative to the game host).
 */

export type HudPanelId =
  | "minimap"
  | "townActivity"
  | "chat"
  | "presence"
  | "toolbar";

export type HudPanelPosition = {
  x: number;
  y: number;
};

export type HudPanelLayout = Partial<Record<HudPanelId, HudPanelPosition>>;

export const HUD_PANEL_IDS: HudPanelId[] = [
  "minimap",
  "townActivity",
  "chat",
  "presence",
  "toolbar",
];

const SNAP_PX = 12;
const EDGE_PAD = 4;

export function isHudPanelPosition(value: unknown): value is HudPanelPosition {
  if (!value || typeof value !== "object") return false;
  const v = value as HudPanelPosition;
  return Number.isFinite(v.x) && Number.isFinite(v.y);
}

/** Drop legacy free-form pairs that land on top of each other (same dock corner). */
const OVERLAP_PX = { x: 96, y: 64 };

function sanitizeOverlappingHudPanels(layout: HudPanelLayout): HudPanelLayout {
  const out: HudPanelLayout = { ...layout };
  const chat = out.chat;
  const presence = out.presence;
  if (
    chat &&
    presence &&
    Math.abs(chat.x - presence.x) < OVERLAP_PX.x &&
    Math.abs(chat.y - presence.y) < OVERLAP_PX.y
  ) {
    delete out.chat;
    delete out.presence;
  }
  return out;
}

export function normalizeHudPanelLayout(
  partial: HudPanelLayout | null | undefined,
): HudPanelLayout {
  if (!partial || typeof partial !== "object") return {};
  const out: HudPanelLayout = {};
  for (const id of HUD_PANEL_IDS) {
    const pos = partial[id];
    if (isHudPanelPosition(pos)) {
      out[id] = { x: Math.round(pos.x), y: Math.round(pos.y) };
    }
  }
  return sanitizeOverlappingHudPanels(out);
}

export function clampHudPanelPosition(
  x: number,
  y: number,
  panelW: number,
  panelH: number,
  boundsW: number,
  boundsH: number,
): HudPanelPosition {
  const maxX = Math.max(EDGE_PAD, boundsW - panelW - EDGE_PAD);
  const maxY = Math.max(EDGE_PAD, boundsH - panelH - EDGE_PAD);
  return {
    x: Math.min(maxX, Math.max(EDGE_PAD, x)),
    y: Math.min(maxY, Math.max(EDGE_PAD, y)),
  };
}

/** Snap near viewport edges when within SNAP_PX. */
export function snapHudPanelPosition(
  pos: HudPanelPosition,
  panelW: number,
  panelH: number,
  boundsW: number,
  boundsH: number,
): HudPanelPosition {
  let { x, y } = pos;
  const right = boundsW - panelW - EDGE_PAD;
  const bottom = boundsH - panelH - EDGE_PAD;
  if (Math.abs(x - EDGE_PAD) <= SNAP_PX) x = EDGE_PAD;
  else if (Math.abs(x - right) <= SNAP_PX) x = right;
  if (Math.abs(y - EDGE_PAD) <= SNAP_PX) y = EDGE_PAD;
  else if (Math.abs(y - bottom) <= SNAP_PX) y = bottom;
  return { x, y };
}

export function hasCustomHudPanelPosition(
  layout: HudPanelLayout | null | undefined,
  id: HudPanelId,
): boolean {
  return isHudPanelPosition(layout?.[id]);
}

export function clearHudPanelLayout(): HudPanelLayout {
  return {};
}
