import { describe, expect, it } from "vitest";
import {
  bottomLeftHudStackClass,
  chatUsesBottomLeftStack,
  interactPromptDockClass,
  minimapUsesTopRightStack,
  presenceUsesBottomLeftStack,
  topRightHudStackClass,
  townActivityUsesTopRightStack,
  toolbarUsesBottomCenterDock,
  worldClockDockClass,
} from "@/components/live-world/hud-slots";

describe("hud slots", () => {
  it("docks minimap into top-right stack by default corner", () => {
    expect(
      minimapUsesTopRightStack({ minimapCorner: "top-right", hudPanelLayout: {} }),
    ).toBe(true);
    expect(
      minimapUsesTopRightStack({ minimapCorner: "top-left", hudPanelLayout: {} }),
    ).toBe(false);
  });

  it("keeps stack class below expanded status", () => {
    expect(topRightHudStackClass(false)).toContain("top-20");
    expect(topRightHudStackClass(true)).toContain("top-12");
  });

  it("keeps world pulse docked until free-positioned", () => {
    expect(townActivityUsesTopRightStack({ hudPanelLayout: {} })).toBe(true);
  });

  it("docks chat + presence into bottom-left stack until free-positioned", () => {
    expect(chatUsesBottomLeftStack({ hudPanelLayout: {} })).toBe(true);
    expect(presenceUsesBottomLeftStack({ hudPanelLayout: {} })).toBe(true);
    expect(
      chatUsesBottomLeftStack({ hudPanelLayout: { chat: { x: 12, y: 40 } } }),
    ).toBe(false);
    expect(
      presenceUsesBottomLeftStack({
        hudPanelLayout: { presence: { x: 8, y: 8 } },
      }),
    ).toBe(false);
    expect(bottomLeftHudStackClass()).toContain("flex-col-reverse");
    expect(bottomLeftHudStackClass()).toContain("bottom-3");
  });

  it("raises world clock and interact prompt above docked toolbar", () => {
    expect(toolbarUsesBottomCenterDock({ hudPanelLayout: {} })).toBe(true);
    expect(
      worldClockDockClass({ hudPanelLayout: {}, toolbarCollapsed: true }),
    ).toContain("bottom-12");
    expect(
      worldClockDockClass({ hudPanelLayout: {}, toolbarCollapsed: false }),
    ).toContain("bottom-[4.75rem]");
    expect(
      interactPromptDockClass({ hudPanelLayout: {}, toolbarCollapsed: true }),
    ).toContain("bottom-36");
    expect(
      interactPromptDockClass({
        hudPanelLayout: { toolbar: { x: 10, y: 10 } },
        toolbarCollapsed: true,
      }),
    ).toContain("md:bottom-16");
  });
});
