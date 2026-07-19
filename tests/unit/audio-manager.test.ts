import { describe, expect, it } from "vitest";
import {
  clamp01,
  effectiveVolume,
  normalizePrefs,
} from "@/lib/audio/prefs";
import { DEFAULT_AUDIO_PREFS, type AudioPrefs } from "@/lib/audio/types";
import {
  REGION_AMBIENT,
  REGION_MUSIC,
  busForEvent,
} from "@/lib/audio/catalog";
import { distanceGain } from "@/lib/audio/positional";
import { resolveFootstepSurface } from "@/lib/audio/footsteps";
import { WORLD_PAGE_SLUGS } from "@/game/world-maps/regions";

describe("audio prefs / volume math", () => {
  it("clamps volumes to 0–1", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(0.4)).toBe(0.4);
  });

  it("effectiveVolume respects mute-all and master", () => {
    const prefs: AudioPrefs = normalizePrefs({
      mutedAll: false,
      volumes: { ...DEFAULT_AUDIO_PREFS.volumes, master: 0.5, sfx: 0.4 },
    });
    expect(effectiveVolume(prefs, "sfx")).toBeCloseTo(0.2);
    const muted = normalizePrefs({ ...prefs, mutedAll: true });
    expect(effectiveVolume(muted, "sfx")).toBe(0);
    const zeroMaster = normalizePrefs({
      volumes: { ...prefs.volumes, master: 0 },
    });
    expect(effectiveVolume(zeroMaster, "music")).toBe(0);
  });

  it("normalizePrefs fills missing groups", () => {
    const p = normalizePrefs({ mutedAll: true, volumes: { music: 0.2 } as AudioPrefs["volumes"] });
    expect(p.mutedAll).toBe(true);
    expect(p.volumes.music).toBeCloseTo(0.2);
    expect(p.volumes.ambient).toBe(DEFAULT_AUDIO_PREFS.volumes.ambient);
    expect(p.volumes.notifications).toBe(DEFAULT_AUDIO_PREFS.volumes.notifications);
  });
});

describe("audio catalog", () => {
  it("maps every world region to music + ambient recipes", () => {
    for (const slug of WORLD_PAGE_SLUGS) {
      expect(REGION_MUSIC[slug], `music missing for ${slug}`).toBeTruthy();
      expect(REGION_AMBIENT[slug], `ambient missing for ${slug}`).toBeTruthy();
      expect(REGION_MUSIC[slug]!.src.startsWith("/sounds/music/")).toBe(true);
    }
    expect(REGION_MUSIC.menu).toBeTruthy();
    expect(REGION_AMBIENT.menu).toBeTruthy();
  });

  it("routes events to volume buses", () => {
    expect(busForEvent("ui.click")).toBe("ui");
    expect(busForEvent("pets.feed")).toBe("pet");
    expect(busForEvent("combat.stinger")).toBe("combat");
    expect(busForEvent("weather.rain")).toBe("weather");
    expect(busForEvent("world.footstep")).toBe("sfx");
    expect(busForEvent("notify.toast")).toBe("notifications");
    expect(busForEvent("boss.enter")).toBe("combat");
    expect(busForEvent("voice.announcer_ready")).toBe("voice");
    expect(busForEvent("marketplace.sol_transfer")).toBe("ui");
  });
});

describe("positional + footsteps helpers", () => {
  it("distanceGain falls off to zero at radius", () => {
    expect(distanceGain(0, 0, 100, 1)).toBeCloseTo(1);
    expect(distanceGain(50, 0, 100, 1)).toBeCloseTo(0.5);
    expect(distanceGain(100, 0, 100, 1)).toBe(0);
    expect(distanceGain(200, 0, 100, 1)).toBe(0);
  });

  it("resolves footstep surfaces from terrain and region bias", () => {
    expect(resolveFootstepSurface({ terrainKind: "water" })).toBe("water");
    expect(resolveFootstepSurface({ terrainKind: "path" })).toBe("path");
    expect(resolveFootstepSurface({ regionSlug: "frostveil-basin" })).toBe("snow");
    expect(resolveFootstepSurface({ regionSlug: "alloy-ruins" })).toBe("metal");
    expect(resolveFootstepSurface({})).toBe("grass");
  });
});
