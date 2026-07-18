import { describe, expect, it } from "vitest";
import {
  minimapUsesTopRightStack,
  topRightHudStackClass,
  townActivityUsesTopRightStack,
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
});
