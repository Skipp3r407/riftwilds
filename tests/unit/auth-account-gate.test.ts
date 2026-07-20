import { describe, expect, it } from "vitest";
import { evaluateAccountStatus } from "@/lib/auth/account-status";
import {
  buildLoginRedirectPath,
  isProtectedApiPath,
  isProtectedPath,
  isPublicAuthPath,
} from "@/lib/auth/protected-routes";
import { hashPassword, isValidUsername, passwordPolicyError, verifyPassword } from "@/lib/auth/password";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

describe("NO ACCOUNT = NO GAMEPLAY routes", () => {
  it("keeps auth/legal pages public", () => {
    expect(isPublicAuthPath("/login")).toBe(true);
    expect(isPublicAuthPath("/signup")).toBe(true);
    expect(isPublicAuthPath("/legal/terms")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
  });

  it("gates gameplay surfaces", () => {
    for (const path of [
      "/play",
      "/tcg/battle",
      "/hatchery",
      "/live-world",
      "/marketplace",
      "/guilds",
      "/comics",
      "/housing",
      "/arena",
      "/profile",
      "/wallet",
      "/quests",
    ]) {
      expect(isProtectedPath(path), path).toBe(true);
    }
  });

  it("gates gameplay APIs", () => {
    expect(isProtectedApiPath("/api/hatchery/eggs")).toBe(true);
    expect(isProtectedApiPath("/api/tcg/deck")).toBe(true);
    expect(isProtectedApiPath("/api/auth/login")).toBe(false);
  });

  it("preserves return URL on login redirect", () => {
    expect(buildLoginRedirectPath("/tcg/battle")).toBe(
      "/login?returnUrl=%2Ftcg%2Fbattle",
    );
  });
});

describe("account status rules", () => {
  it("allows active + onboarded", () => {
    const d = evaluateAccountStatus({
      status: "ACTIVE",
      onboardingComplete: true,
    });
    expect(d.ok).toBe(true);
  });

  it("blocks banned and clears session", () => {
    const d = evaluateAccountStatus({
      status: "BANNED",
      onboardingComplete: true,
    });
    expect(d.ok).toBe(false);
    if (!d.ok) {
      expect(d.clearSession).toBe(true);
      expect(d.reason).toBe("BANNED");
    }
  });

  it("sends pending verification to verify-email", () => {
    const d = evaluateAccountStatus({
      status: "PENDING_VERIFICATION",
      onboardingComplete: false,
    });
    expect(d.ok).toBe(false);
    if (!d.ok) {
      expect(d.redirectTo).toContain("/verify-email");
      expect(d.clearSession).toBe(false);
    }
  });

  it("requires onboarding before play", () => {
    const d = evaluateAccountStatus({
      status: "ACTIVE",
      onboardingComplete: false,
    });
    expect(d.ok).toBe(false);
    if (!d.ok) {
      expect(d.reason).toBe("ONBOARDING_REQUIRED");
    }
  });
});

describe("password helpers", () => {
  it("hashes and verifies", async () => {
    const hash = await hashPassword("CorrectHorse9");
    expect(await verifyPassword("CorrectHorse9", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("enforces password policy and username rules", () => {
    expect(passwordPolicyError("short")).toBeTruthy();
    expect(passwordPolicyError("longenough1")).toBeNull();
    expect(isValidUsername("Keeper_1")).toBe(true);
    expect(isValidUsername("1bad")).toBe(false);
  });
});

describe("feature flags", () => {
  it("requires account and disables optional guest play", () => {
    expect(featureFlagDefaults.AUTH_ACCOUNT_REQUIRED_FOR_PLAY).toBe(true);
    expect(featureFlagDefaults.AUTH_WALLET_OPTIONAL_PLAY).toBe(false);
  });
});
