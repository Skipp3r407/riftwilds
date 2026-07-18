import { describe, expect, it, beforeEach } from "vitest";
import {
  resetPersistenceStoreForTests,
  performLogout,
  evaluateLogoutSafety,
  autosaveWorldState,
  restoreWorldState,
  startWorldSession,
  stripUntrustedCategoryA,
  assertLogoutSafety,
} from "@/lib/persistence";
import { isSafeLogoutPosition } from "@/game/live-world/persistence/safe-logout-zones";

describe("persistence save / logout", () => {
  beforeEach(() => {
    resetPersistenceStoreForTests();
  });

  it("treats commons plaza as safe logout zone", () => {
    expect(isSafeLogoutPosition("riftwild-commons", 1024, 768)).toBe(true);
    const evaled = evaluateLogoutSafety({
      mapId: "riftwild-commons",
      x: 1024,
      y: 768,
    });
    expect(evaled.safe).toBe(true);
    expect(evaled.zone?.zoneKind).toBeTruthy();
  });

  it("safe logout writes checkpoint and does not charge SOL", () => {
    startWorldSession({ ownerKey: "u-safe", mapId: "riftwild-commons", x: 1024, y: 768 });
    const result = performLogout({
      ownerKey: "u-safe",
      mode: "safe",
      position: { mapId: "riftwild-commons", x: 1024, y: 768 },
      requestId: "logout-safe-1",
      leaveSleepingStub: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mode).toBe("safe");
      expect(result.sleepingStubCreated).toBe(false);
      expect(result.checkpoint.zoneId).toBeTruthy();
    }
  });

  it("unsafe logout restores to last safe checkpoint on next restore", () => {
    startWorldSession({ ownerKey: "u-unsafe", mapId: "riftwild-commons", x: 1024, y: 768 });
    performLogout({
      ownerKey: "u-unsafe",
      mode: "safe",
      position: { mapId: "riftwild-commons", x: 1024, y: 768 },
      requestId: "logout-seed-safe",
    });
    startWorldSession({ ownerKey: "u-unsafe", mapId: "riftwild-commons", x: 200, y: 200 });
    const unsafe = performLogout({
      ownerKey: "u-unsafe",
      mode: "unsafe",
      position: { mapId: "riftwild-commons", x: 80, y: 80 },
      requestId: "logout-unsafe-1",
    });
    expect(unsafe.ok).toBe(true);
    if (unsafe.ok) {
      expect(unsafe.mode).toBe("unsafe");
      expect(unsafe.checkpoint.x).toBe(1024);
      expect(unsafe.checkpoint.y).toBe(768);
    }
    const restored = restoreWorldState("u-unsafe");
    expect(restored.position.x).toBe(1024);
    expect(restored.position.y).toBe(768);
    expect(restored.safeCheckpoint?.zoneId).toBeTruthy();
  });

  it("rejects logout that tries to charge SOL or delete items", () => {
    const bad = assertLogoutSafety({
      ownerKey: "u1",
      mode: "safe",
      position: { mapId: "riftwild-commons", x: 1024, y: 768 },
      requestId: "x".repeat(12),
      chargeSol: true,
    } as never);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.code).toBe("logout_sol_forbidden");
  });

  it("autosave is idempotent by requestId", () => {
    const a = autosaveWorldState({
      ownerKey: "u-auto",
      position: { mapId: "riftwild-commons", x: 1100, y: 700 },
      playState: { flags: ["a"], regionsVisited: ["riftwild-commons"] },
      categories: ["B_PROGRESSION"],
      requestId: "auto-1",
      force: true,
    });
    const b = autosaveWorldState({
      ownerKey: "u-auto",
      position: { mapId: "riftwild-commons", x: 1200, y: 700 },
      playState: { flags: ["b"] },
      categories: ["B_PROGRESSION"],
      requestId: "auto-1",
      force: true,
    });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(b.idempotentReplay).toBe(true);
      expect(b.save.version).toBe(a.save.version);
    }
  });

  it("strips untrusted Category A fields from playState", () => {
    const stripped = stripUntrustedCategoryA({
      demoCredits: 999999,
      softCurrency: 999999,
      flags: ["ok"],
    });
    expect(stripped).toBeTruthy();
    expect(stripped?.demoCredits).toBeUndefined();
    expect(stripped?.softCurrency).toBeUndefined();
    expect(stripped?.demoCreditsDisplay).toBe(999999);
    expect(stripped?.flags).toEqual(["ok"]);
  });

  it("blocks safe logout during combat", () => {
    startWorldSession({ ownerKey: "u-combat", mapId: "riftwild-commons", x: 1024, y: 768 });
    const result = performLogout({
      ownerKey: "u-combat",
      mode: "safe",
      position: { mapId: "riftwild-commons", x: 1024, y: 768 },
      inCombat: true,
      requestId: "logout-combat-1",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("combat_logout_blocked");
  });
});
