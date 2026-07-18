import { describe, expect, it } from "vitest";
import {
  canEnterLiveWorld,
  featureFlagDefaults,
  isFeatureEnabled,
  isLiveWorldEntryOpen,
} from "@/lib/config/feature-flags";

describe("Live World soft-gate helpers", () => {
  it("defaults public access ON so Live World stays enterable during development", () => {
    expect(featureFlagDefaults.LIVE_WORLD_PUBLIC_ACCESS_ENABLED).toBe(true);
    expect(featureFlagDefaults.LIVE_WORLD_DEV_PREVIEW_ENABLED).toBe(true);
    expect(featureFlagDefaults.PLAYABLE_LIVE_WORLD_ENABLED).toBe(true);
    expect(isFeatureEnabled("TCG_FRAMEWORK_ENABLED")).toBe(true);
    expect(isLiveWorldEntryOpen()).toBe(true);
    expect(canEnterLiveWorld()).toBe(true);
  });

  it("opens entry when public access is enabled", () => {
    expect(
      isLiveWorldEntryOpen(
        { LIVE_WORLD_PUBLIC_ACCESS_ENABLED: true },
        { nodeEnv: "production" },
      ),
    ).toBe(true);
    expect(
      canEnterLiveWorld(
        {
          LIVE_WORLD_PUBLIC_ACCESS_ENABLED: true,
          PLAYABLE_LIVE_WORLD_ENABLED: true,
        },
        { nodeEnv: "production" },
      ),
    ).toBe(true);
  });

  it("blocks production enter when public access is off", () => {
    expect(
      isLiveWorldEntryOpen(
        {
          LIVE_WORLD_PUBLIC_ACCESS_ENABLED: false,
          LIVE_WORLD_DEV_PREVIEW_ENABLED: true,
        },
        { nodeEnv: "production" },
      ),
    ).toBe(false);
    expect(
      canEnterLiveWorld(
        {
          LIVE_WORLD_PUBLIC_ACCESS_ENABLED: false,
          LIVE_WORLD_DEV_PREVIEW_ENABLED: true,
          PLAYABLE_LIVE_WORLD_ENABLED: true,
        },
        { nodeEnv: "production" },
      ),
    ).toBe(false);
  });

  it("allows non-production preview when DEV_PREVIEW is on", () => {
    expect(
      isLiveWorldEntryOpen(
        {
          LIVE_WORLD_PUBLIC_ACCESS_ENABLED: false,
          LIVE_WORLD_DEV_PREVIEW_ENABLED: true,
        },
        { nodeEnv: "development" },
      ),
    ).toBe(true);
    expect(
      canEnterLiveWorld(
        {
          LIVE_WORLD_PUBLIC_ACCESS_ENABLED: false,
          LIVE_WORLD_DEV_PREVIEW_ENABLED: true,
          PLAYABLE_LIVE_WORLD_ENABLED: true,
        },
        { nodeEnv: "development" },
      ),
    ).toBe(true);
  });

  it("does not enter when PLAYABLE is off even if public access is on", () => {
    expect(
      canEnterLiveWorld(
        {
          LIVE_WORLD_PUBLIC_ACCESS_ENABLED: true,
          PLAYABLE_LIVE_WORLD_ENABLED: false,
        },
        { nodeEnv: "production" },
      ),
    ).toBe(false);
  });

  it("blocks non-prod preview when DEV_PREVIEW is off", () => {
    expect(
      isLiveWorldEntryOpen(
        {
          LIVE_WORLD_PUBLIC_ACCESS_ENABLED: false,
          LIVE_WORLD_DEV_PREVIEW_ENABLED: false,
        },
        { nodeEnv: "development" },
      ),
    ).toBe(false);
  });
});
