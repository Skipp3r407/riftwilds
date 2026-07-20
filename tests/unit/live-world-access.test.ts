import { describe, expect, it } from "vitest";
import {
  canEnterLiveWorld,
  featureFlagDefaults,
  isFeatureEnabled,
  isLiveWorldEntryOpen,
  liveWorldAccessBadge,
} from "@/lib/config/feature-flags";

describe("Live World soft-gate helpers", () => {
  it("defaults public access OFF so Live World reads Coming Soon until launch", () => {
    expect(featureFlagDefaults.LIVE_WORLD_PUBLIC_ACCESS_ENABLED).toBe(false);
    expect(featureFlagDefaults.LIVE_WORLD_DEV_PREVIEW_ENABLED).toBe(false);
    expect(featureFlagDefaults.PLAYABLE_LIVE_WORLD_ENABLED).toBe(true);
    expect(isFeatureEnabled("TCG_FRAMEWORK_ENABLED")).toBe(true);
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

  it("allows non-production preview when DEV_PREVIEW flag is on", () => {
    expect(
      isLiveWorldEntryOpen(
        {
          LIVE_WORLD_PUBLIC_ACCESS_ENABLED: false,
          LIVE_WORLD_DEV_PREVIEW_ENABLED: true,
        },
        { nodeEnv: "test" },
      ),
    ).toBe(true);
    expect(
      canEnterLiveWorld(
        {
          LIVE_WORLD_PUBLIC_ACCESS_ENABLED: false,
          LIVE_WORLD_DEV_PREVIEW_ENABLED: true,
          PLAYABLE_LIVE_WORLD_ENABLED: true,
        },
        { nodeEnv: "test" },
      ),
    ).toBe(true);
  });

  it("auto-opens in development for local Dev Override testing", () => {
    expect(
      isLiveWorldEntryOpen(
        {
          LIVE_WORLD_PUBLIC_ACCESS_ENABLED: false,
          LIVE_WORLD_DEV_PREVIEW_ENABLED: false,
        },
        { nodeEnv: "development" },
      ),
    ).toBe(true);
    expect(
      liveWorldAccessBadge(
        { LIVE_WORLD_PUBLIC_ACCESS_ENABLED: false },
        { nodeEnv: "development" },
      ),
    ).toBe("COMING SOON · DEV ACCESS");
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

  it("blocks non-prod preview when DEV_PREVIEW is off and not development", () => {
    expect(
      isLiveWorldEntryOpen(
        {
          LIVE_WORLD_PUBLIC_ACCESS_ENABLED: false,
          LIVE_WORLD_DEV_PREVIEW_ENABLED: false,
        },
        { nodeEnv: "test" },
      ),
    ).toBe(false);
  });
});
