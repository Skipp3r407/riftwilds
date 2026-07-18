import { describe, expect, it } from "vitest";
import {
  DEFAULT_IMMERSIVE_SETTINGS,
  normalizeImmersiveSettings,
  resolveGraphicsQuality,
} from "@/game/live-world/systems/immersive";
import {
  DEPTH,
  depthAt,
  isBehindOccluder,
  type Occluder,
} from "@/game/live-world/systems/premium/depth-layers";
import {
  KEEPER_DISPLAY,
  PET_DISPLAY,
  actorContactShadow,
} from "@/game/live-world/systems/premium/actor-presentation";
import { npcDisplayHeight } from "@/game/live-world/npcs/overworld-npcs";

describe("HUD world-first defaults", () => {
  it("collapses Level-2 chrome and uses auto-hide chat", () => {
    const s = normalizeImmersiveSettings({});
    expect(s.chatMode).toBe("auto-hide");
    expect(s.townActivityCollapsed).toBe(true);
    expect(s.toolbarCollapsed).toBe(true);
    expect(s.presenceHudCollapsed).toBe(true);
    expect(s.nearbyDrawerOpen).toBe(false);
  });

  it("defaults graphics to Low (Ultra never default)", () => {
    expect(DEFAULT_IMMERSIVE_SETTINGS.graphicsQuality).toBe("low");
    expect(resolveGraphicsQuality("low").propBudget).toBe("low");
    expect(resolveGraphicsQuality("ultra").propBudget).toBe("full");
    expect(resolveGraphicsQuality("ultra").particleScale).toBeGreaterThan(
      resolveGraphicsQuality("low").particleScale,
    );
  });
});

describe("2.5D depth + character presentation", () => {
  it("keeps roof band above building and actor above street props", () => {
    expect(DEPTH.buildingRoof).toBeGreaterThan(DEPTH.building);
    expect(DEPTH.actor).toBeGreaterThan(DEPTH.streetProp);
    expect(DEPTH.canopy).toBe(DEPTH.actor);
  });

  it("Y-sorts southern actors in front of northern roofs", () => {
    const roof = depthAt(DEPTH.buildingRoof, 200);
    const playerSouth = depthAt(DEPTH.actor, 280);
    expect(playerSouth).toBeGreaterThan(roof);
  });

  it("fades roofs when player is behind footprint", () => {
    const o = {
      id: "roof",
      kind: "roof",
      sprite: {} as Occluder["sprite"],
      footX: 100,
      footY: 200,
      halfW: 40,
      heightPx: 120,
      baseAlpha: 0.22,
      fadeWhenBehind: true,
    } satisfies Occluder;
    expect(isBehindOccluder(100, 140, o)).toBe(true);
    expect(isBehindOccluder(100, 220, o)).toBe(false);
  });

  it("uses cozy chibi Keeper / pet scale with readable NPC heights", () => {
    // Cute RPG village scale — chunky but not oversized 2.5D giants
    expect(KEEPER_DISPLAY.w).toBeGreaterThanOrEqual(36);
    expect(KEEPER_DISPLAY.w).toBeLessThanOrEqual(52);
    expect(KEEPER_DISPLAY.h).toBeGreaterThanOrEqual(40);
    expect(KEEPER_DISPLAY.h).toBeLessThanOrEqual(56);
    expect(PET_DISPLAY.w).toBeGreaterThanOrEqual(28);
    expect(PET_DISPLAY.w).toBeLessThanOrEqual(40);
    expect(npcDisplayHeight("plaza-guard-a")).toBeGreaterThanOrEqual(48);
    expect(npcDisplayHeight("riftling-ember")).toBeGreaterThanOrEqual(40);
  });

  it("grounds actors with directional contact shadows", () => {
    const s = actorContactShadow(KEEPER_DISPLAY.w, KEEPER_DISPLAY.h, "keeper");
    expect(s.offsetX).toBeGreaterThan(0);
    expect(s.width).toBeGreaterThan(20);
    expect(s.alpha).toBeGreaterThan(0.1);
  });
});
