import { describe, expect, it } from "vitest";
import {
  clampHudPanelPosition,
  clearHudPanelLayout,
  hasCustomHudPanelPosition,
  normalizeHudPanelLayout,
  snapHudPanelPosition,
} from "@/game/live-world/systems/immersive/hud-panel-layout";
import { DEFAULT_IMMERSIVE_SETTINGS } from "@/game/live-world/systems/immersive/types";
import {
  normalizeImmersiveSettings,
  resetHudPanelLayoutSettings,
} from "@/game/live-world/systems/immersive/settings";
import {
  minimapUsesTopRightStack,
  townActivityUsesTopRightStack,
} from "@/components/live-world/hud-slots";

describe("hud panel layout", () => {
  it("normalizes and drops invalid panel positions", () => {
    const layout = normalizeHudPanelLayout({
      chat: { x: 12.4, y: 40.6 },
      minimap: { x: Number.NaN, y: 1 } as never,
      presence: null as never,
    });
    expect(layout.chat).toEqual({ x: 12, y: 41 });
    expect(layout.minimap).toBeUndefined();
    expect(layout.presence).toBeUndefined();
  });

  it("clamps and snaps near edges", () => {
    const clamped = clampHudPanelPosition(-40, 9999, 100, 80, 400, 300);
    expect(clamped.x).toBe(4);
    expect(clamped.y).toBe(300 - 80 - 4);

    const snapped = snapHudPanelPosition(
      { x: 10, y: 8 },
      100,
      80,
      400,
      300,
    );
    expect(snapped.x).toBe(4);
    expect(snapped.y).toBe(4);
  });

  it("persists layout through immersive settings normalize", () => {
    const n = normalizeImmersiveSettings({
      hudPanelLayout: { townActivity: { x: 20, y: 30 } },
    });
    expect(n.hudPanelLayout.townActivity).toEqual({ x: 20, y: 30 });
    expect(hasCustomHudPanelPosition(n.hudPanelLayout, "townActivity")).toBe(true);
  });

  it("reset clears free-form positions and restores minimap corner", () => {
    const next = resetHudPanelLayoutSettings({
      ...DEFAULT_IMMERSIVE_SETTINGS,
      minimapCorner: "bottom-left",
      hudPanelLayout: { chat: { x: 1, y: 2 }, toolbar: { x: 3, y: 4 } },
    });
    expect(next.hudPanelLayout).toEqual(clearHudPanelLayout());
    expect(next.minimapCorner).toBe("top-right");
  });

  it("breaks top-right stack when panels are free-positioned", () => {
    expect(
      minimapUsesTopRightStack({
        minimapCorner: "top-right",
        hudPanelLayout: {},
      }),
    ).toBe(true);
    expect(
      minimapUsesTopRightStack({
        minimapCorner: "top-right",
        hudPanelLayout: { minimap: { x: 8, y: 8 } },
      }),
    ).toBe(false);
    expect(townActivityUsesTopRightStack({ hudPanelLayout: {} })).toBe(true);
    expect(
      townActivityUsesTopRightStack({
        hudPanelLayout: { townActivity: