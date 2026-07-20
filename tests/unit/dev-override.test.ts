import { describe, expect, it } from "vitest";
import {
  assertNoDevOverrideInProductionBuild,
  isDevOverrideRuntimeAllowed,
  mintDevOverrideToken,
  parseDevOverrideToken,
  DEV_OVERRIDE_USER_ID,
} from "@/lib/auth/dev-override";
import {
  canEnterLiveWorld,
  isLiveWorldEntryOpen,
  liveWorldAccessBadge,
} from "@/lib/config/feature-flags";

describe("Development Override policy", () => {
  it("allows development NODE_ENV", () => {
    expect(
      isDevOverrideRuntimeAllowed({ NODE_ENV: "development" } as NodeJS.ProcessEnv),
    ).toBe(true);
  });

  it("allows non-prod when DEV_OVERRIDE is true", () => {
    expect(
      isDevOverrideRuntimeAllowed({
        NODE_ENV: "test",
        DEV_OVERRIDE: "true",
      } as NodeJS.ProcessEnv),
    ).toBe(true);
  });

  it("never allows production even with flags", () => {
    expect(
      isDevOverrideRuntimeAllowed({
        NODE_ENV: "production",
        DEV_OVERRIDE: "true",
        NEXT_PUBLIC_DEV_OVERRIDE: "true",
      } as NodeJS.ProcessEnv),
    ).toBe(false);
  });

  it("mints and parses a signed local token", () => {
    const env = {
      NODE_ENV: "development",
      SESSION_SECRET: "unit-test-secret-at-least-32-chars!!",
    } as NodeJS.ProcessEnv;
    const token = mintDevOverrideToken(3600, Date.now(), env);
    const payload = parseDevOverrideToken(token, env);
    expect(payload?.sub).toBe(DEV_OVERRIDE_USER_ID);
    expect(payload?.developer).toBe(true);
    expect(payload?.role).toBe("admin");
  });

  it("rejects forged tokens", () => {
    const env = {
      NODE_ENV: "development",
      SESSION_SECRET: "unit-test-secret-at-least-32-chars!!",
    } as NodeJS.ProcessEnv;
    expect(parseDevOverrideToken("devov.notvalid.sig", env)).toBeNull();
  });

  it("fails production build when override flags remain", () => {
    expect(() =>
      assertNoDevOverrideInProductionBuild({
        NODE_ENV: "production",
        DEV_OVERRIDE: "true",
      } as NodeJS.ProcessEnv),
    ).toThrow(/DEV_OVERRIDE/);
  });
});

describe("Live World DEV access via override", () => {
  it("opens entry in development without public access", () => {
    expect(
      isLiveWorldEntryOpen(
        { LIVE_WORLD_PUBLIC_ACCESS_ENABLED: false },
        { nodeEnv: "development" },
      ),
    ).toBe(true);
    expect(
      canEnterLiveWorld(
        {
          LIVE_WORLD_PUBLIC_ACCESS_ENABLED: false,
          PLAYABLE_LIVE_WORLD_ENABLED: true,
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

  it("stays closed in production without public access", () => {
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
      liveWorldAccessBadge(
        { LIVE_WORLD_PUBLIC_ACCESS_ENABLED: false },
        { nodeEnv: "production" },
      ),
    ).toBe("Coming Soon");
  });
});
