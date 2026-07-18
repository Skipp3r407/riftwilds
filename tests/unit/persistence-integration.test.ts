/**
 * Integration-style coverage for session → autosave → logout → restore
 * without HTTP (in-process persistence core).
 */
import { describe, expect, it, beforeEach } from "vitest";
import {
  resetPersistenceStoreForTests,
  startWorldSession,
  heartbeatWorldSession,
  autosaveWorldState,
  performLogout,
  restoreWorldState,
  beginDisconnectRecovery,
  attemptReconnect,
  notifyPersistenceHook,
  assertCanLeaveWorld,
} from "@/lib/persistence";

describe("persistence integration flow", () => {
  beforeEach(() => {
    resetPersistenceStoreForTests();
  });

  it("session → play → safe logout → restore at checkpoint", () => {
    const session = startWorldSession({
      ownerKey: "keeper-1",
      mapId: "riftwild-commons",
      x: 1024,
      y: 768,
    });

    expect(
      heartbeatWorldSession({
        ownerKey: "keeper-1",
        sessionId: session.id,
        position: { mapId: "riftwild-commons", x: 1040, y: 780 },
      }).ok,
    ).toBe(true);

    notifyPersistenceHook("keeper-1", "quest_progress");

    const saved = autosaveWorldState({
      ownerKey: "keeper-1",
      sessionId: session.id,
      position: { mapId: "riftwild-commons", x: 1040, y: 780 },
      playState: {
        flags: ["met-guide"],
        regionsVisited: ["riftwild-commons"],
        demoCredits: 99999,
      },
      categories: ["B_PROGRESSION"],
      requestId: "flow-auto-1",
      force: true,
    });
    expect(saved.ok).toBe(true);
    if (saved.ok) {
      expect(saved.save.playState?.flags).toContain("met-guide");
      expect(saved.save.playState?.demoCredits).toBeUndefined();
    }

    const logout = performLogout({
      ownerKey: "keeper-1",
      mode: "safe",
      position: { mapId: "riftwild-commons", x: 1040, y: 780 },
      requestId: "flow-logout-1",
    });
    expect(logout.ok).toBe(true);

    const restored = restoreWorldState("keeper-1");
    expect(restored.safeCheckpoint).toBeTruthy();
    expect(restored.playState?.flags).toContain("met-guide");
  });

  it("combat disconnect → reconnect remains vulnerable", () => {
    const session = startWorldSession({ ownerKey: "keeper-2" });
    heartbeatWorldSession({
      ownerKey: "keeper-2",
      sessionId: session.id,
      position: { mapId: "riftwild-commons", x: 1024, y: 768 },
      inCombat: true,
    });
    const dc = beginDisconnectRecovery({
      sessionId: session.id,
      ownerKey: "keeper-2",
    });
    expect(dc.ok && dc.invulnerable === false).toBe(true);

    const rc = attemptReconnect({
      ownerKey: "keeper-2",
      sessionId: session.id,
      heartbeat: {
        position: { mapId: "riftwild-commons", x: 1024, y: 768 },
        inCombat: true,
      },
    });
    expect(rc.ok).toBe(true);
    if (rc.ok) {
      expect(rc.restored.inCombat).toBe(true);
      expect(rc.warnings.some((w) => /vulnerable|combat/i.test(w))).toBe(true);
    }
  });

  it("blocks leave during marketplace settlement", () => {
    const blocked = assertCanLeaveWorld({ marketplaceSettlementPending: true });
    expect(blocked.ok).toBe(false);
  });
});
