import { describe, expect, it, beforeEach } from "vitest";
import {
  resetPersistenceStoreForTests,
  startWorldSession,
  heartbeatWorldSession,
  markSessionDisconnect,
  attemptReconnect,
  beginDisconnectRecovery,
  buildRestoreResult,
  validatePositionDelta,
  combatDisconnectPolicy,
  createEmptySave,
  getCheckpoint,
  putCheckpoint,
  sweepStaleSessions,
  RECONNECT_GRACE_MS,
  HEARTBEAT_MISS_TTL_MS,
} from "@/lib/persistence";

describe("persistence session / disconnect", () => {
  beforeEach(() => {
    resetPersistenceStoreForTests();
  });

  it("starts session and accepts heartbeats", () => {
    const session = startWorldSession({
      ownerKey: "sess-1",
      mapId: "riftwild-commons",
      x: 1024,
      y: 768,
    });
    const hb = heartbeatWorldSession({
      ownerKey: "sess-1",
      sessionId: session.id,
      position: { mapId: "riftwild-commons", x: 1030, y: 770 },
    });
    expect(hb.ok).toBe(true);
    if (hb.ok) {
      expect(hb.session.posX).toBe(1030);
      expect(hb.session.status).toBe("ACTIVE");
    }
  });

  it("rejects teleport heartbeats", () => {
    const session = startWorldSession({
      ownerKey: "sess-tp",
      mapId: "riftwild-commons",
      x: 1024,
      y: 768,
    });
    const hb = heartbeatWorldSession({
      ownerKey: "sess-tp",
      sessionId: session.id,
      position: { mapId: "riftwild-commons", x: 5000, y: 5000 },
    });
    expect(hb.ok).toBe(false);
    if (!hb.ok) expect(hb.code).toBe("teleport_rejected");
  });

  it("disconnect enters reconnect grace and combat is not invulnerable", () => {
    const session = startWorldSession({ ownerKey: "sess-dc" });
    session.inCombat = true;
    const dc = beginDisconnectRecovery({
      sessionId: session.id,
      ownerKey: "sess-dc",
    });
    expect(dc.ok).toBe(true);
    if (dc.ok) {
      expect(dc.invulnerable).toBe(false);
      expect(dc.combatWarning).toBeTruthy();
      expect(dc.graceMs).toBe(RECONNECT_GRACE_MS);
    }
    const policy = combatDisconnectPolicy(true);
    expect(policy.invulnerable).toBe(false);
  });

  it("reconnect within grace restores active session", () => {
    const session = startWorldSession({
      ownerKey: "sess-rc",
      mapId: "riftwild-commons",
      x: 1024,
      y: 768,
    });
    markSessionDisconnect({ sessionId: session.id, ownerKey: "sess-rc" });
    const rc = attemptReconnect({
      ownerKey: "sess-rc",
      sessionId: session.id,
      heartbeat: {
        position: { mapId: "riftwild-commons", x: 1028, y: 770 },
      },
    });
    expect(rc.ok).toBe(true);
    if (rc.ok) {
      expect(rc.sessionId).toBe(session.id);
      expect(rc.restored.source).toBe("active_session");
    }
  });

  it("position fallback chain uses safe checkpoint", () => {
    putCheckpoint({
      ownerKey: "fb-1",
      userId: null,
      mapId: "riftwild-commons",
      posX: 900,
      posY: 800,
      zoneId: "commons-inn-rest",
      zoneKind: "INN",
      restBonusApplied: false,
      loggedOutAt: Date.now(),
      requestId: "cp-1",
    });
    const save = createEmptySave("fb-1");
    save.mapId = "riftwild-commons";
    save.posX = 50;
    save.posY = 50;
    const restored = buildRestoreResult({
      session: null,
      save,
      checkpoint: getCheckpoint("fb-1"),
      preferSafeOnUnsafeLogout: true,
    });
    expect(restored.source).toBe("safe_checkpoint");
    expect(restored.position.x).toBe(900);
  });

  it("validatePositionDelta allows small moves", () => {
    const ok = validatePositionDelta({
      previous: { mapId: "riftwild-commons", x: 100, y: 100 },
      next: { mapId: "riftwild-commons", x: 140, y: 120 },
    });
    expect(ok.ok).toBe(true);
  });

  it("sweepStaleSessions can expire reconnecting leases", () => {
    const session = startWorldSession({ ownerKey: "sess-exp" });
    session.lastHeartbeatAt = Date.now() - HEARTBEAT_MISS_TTL_MS - 1000;
    session.status = "RECONNECTING";
    session.reconnectDeadline = Date.now() - 1;
    const n = sweepStaleSessions(Date.now());
    expect(n).toBeGreaterThanOrEqual(1);
  });
});
