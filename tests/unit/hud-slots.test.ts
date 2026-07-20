import { describe, expect, it } from "vitest";
import {
  bottomLeftHudStackClass,
  chatUsesBottomLeftStack,
  interactPromptDockClass,
  midLeftHudStackClass,
  minimapUsesTopRightStack,
  presenceUsesBottomLeftStack,
  rightColumnHudStackClass,
  topRightHudStackClass,
  townActivityUsesMidLeftStack,
  townActivityUsesTopRightStack,
  toolbarUsesBottomCenterDock,
  worldClockDockClass,
} from "@/components/live-world/hud-slots";

describe("hud slots", () => {
  it("docks minimap into right column by default corner", () => {
    expect(
      minimapUsesTopRightStack({ minimapCorner: "top-right", hudPanelLayout: {} }),
    ).toBe(true);
    expect(
      minimapUsesTopRightStack({ minimapCorner: "top-left", hudPanelLayout: {} }),
    ).toBe(false);
  });

  it("keeps right column below unified top command bar", () => {
    expect(rightColumnHudStackClass(false)).toContain("top-[4.75rem]");
    expect(rightColumnHudStackClass(true)).toContain("top-[4.75rem]");
    expect(topRightHudStackClass(false)).toContain("top-[4.75rem]");
  });

  it("docks world pulse mid-left until free-positioned", () => {
    expect(townActivityUsesMidLeftStack({ hudPanelLayout: {} })).toBe(true);
    expect(townActivityUsesTopRightStack({ hudPanelLayout: {} })).toBe(true);
    expect(midLeftHudStackClass(false)).toContain("left-3");
    expect(
      townActivityUsesMidLeftStack({
        hudPanelLayout: { townActivity: { x: 10, y: 20 } },
      }),
    ).toBe(false);
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

  it("raises world clock and interact prompt above docked toolbar / vitals", () => {
    expect(toolbarUsesBottomCenterDock({ hudPanelLayout: {} })).toBe(true);
    expect(
      worldClockDockClass({ hudPanelLayout: {}, toolbarCollapsed: true }),
    ).toContain("bottom-12");
    expect(
      worldClockDockClass({ hudPanelLayout: {}, toolbarCollapsed: false }),
    ).toContain("bottom-[4.75rem]");
    expect(
      interactPromptDockClass({ hudPanelLayout: {}, toolbarCollapsed: true }),
    ).toContain("bottom-40");
    expect(
      interactPromptDockClass({
        hudPanelLayout: { toolbar: { x: 10, y: 10 } },
        toolbarCollapsed: true,
      }),
    ).toContain("md:bottom-28");
  });
});
