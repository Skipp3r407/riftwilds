import { beforeEach, describe, expect, it } from "vitest";
import { resetAnalyticsForTests } from "@/lib/analytics/events";
import { getCreditBalance, resetCreditLedgerForTests } from "@/lib/credits/ledger";
import {
  activateWorldEvent,
  cancelWorldEvent,
  ensureDemoWorldEvent,
  evaluateWorldEventAntiAfk,
  emptyWorldEventParticipant,
  appendWorldEventSignals,
  idleAloneQualifiesForWorldEvent,
  listHappeningNowWorldEvents,
  listWorldEventCatalog,
  recordWorldEventParticipation,
  resetWorldEventsStoreForTests,
  tickWorldEventScheduler,
} from "@/lib/world-events";

describe("dynamic world events catalog", () => {
  it("ships the ten story spectacle keys", () => {
    const keys = listWorldEventCatalog().map((d) => d.key);
    expect(keys).toContain("dragon_city_attack");
    expect(keys).toContain("caravan_ambush");
    expect(keys).toContain("goblin_invasion");
    expect(keys).toContain("bridge_collapse");
    expect(keys).toContain("wandering_world_boss");
    expect(keys).toContain("traveling_circus");
    expect(keys).toContain("meteor_crash");
    expect(keys).toContain("rare_rift_opening");
    expect(keys).toContain("shipwreck");
    expect(keys).toContain("haunted_forest_night");
    expect(keys).toHaveLength(10);
  });
});

describe("scheduler + participation", () => {
  beforeEach(() => {
    resetWorldEventsStoreForTests();
    resetCreditLedgerForTests();
    resetAnalyticsForTests();
  });

  it("activates an event with announcements, map hooks, NPC reactions, world changes", () => {
    const inst = activateWorldEvent({
      key: "dragon_city_attack",
      skipAnnounce: true,
      triggerReason: "ADMIN",
      now: Date.parse("2026-07-18T18:00:00Z"),
    });
    expect(inst.phase).toBe("ACTIVE");
    expect(inst.announcements.length).toBeGreaterThan(0);
    expect(inst.worldChanges.length).toBeGreaterThan(0);
    expect(inst.npcReactions.length).toBeGreaterThan(0);
    expect(inst.tempQuests.length).toBeGreaterThan(0);
    expect(listHappeningNowWorldEvents(Date.parse("2026-07-18T18:00:00Z"))[0]?.label).toBe(
      inst.name,
    );
  });

  it("blocks AFK / idle participation and awards engaged keepers", () => {
    expect(idleAloneQualifiesForWorldEvent()).toBe(false);
    const now = Date.parse("2026-07-18T19:00:00Z");
    activateWorldEvent({
      key: "goblin_invasion",
      skipAnnounce: true,
      now,
    });

    const afk = recordWorldEventParticipation({
      userId: "afk-keeper",
      action: "DEFEND",
      signals: ["UI"],
      now: now + 1_000,
    });
    // UI alone may pass signal window but not MOVE/INTERACT — treat as blocked
    expect(afk.ok).toBe(false);

    const ok = recordWorldEventParticipation({
      userId: "hero-keeper",
      action: "ARRIVE",
      signals: ["MOVE", "INTERACT"],
      now: now + 2_000,
    });
    expect(ok.ok).toBe(true);
    expect(ok.pointsGained).toBeGreaterThan(0);

    // Stack defend actions toward qualify
    let last = ok;
    for (let i = 0; i < 4; i++) {
      last = recordWorldEventParticipation({
        userId: "hero-keeper",
        action: "DEFEND",
        signals: ["MOVE", "COMBAT"],
        now: now + 3_000 + i * 1_000,
      });
      expect(last.ok).toBe(true);
    }
    expect(last.participant?.qualified).toBe(true);
    expect(getCreditBalance("hero-keeper")).toBeGreaterThan(0);
  });

  it("anti-AFK rejects motionless participants", () => {
    let p = emptyWorldEventParticipant("u1", "evt1");
    const now = Date.now();
    p = appendWorldEventSignals(p, ["CAMERA"], now - 120_000);
    const verdict = evaluateWorldEventAntiAfk(p, now);
    expect(verdict.ok).toBe(false);
  });

  it("can cancel and schedule tick", () => {
    const now = Date.parse("2026-07-18T20:00:00Z");
    ensureDemoWorldEvent(now);
    const cancelled = cancelWorldEvent("test", now + 10);
    expect(cancelled?.phase).toBe("CANCELLED");
    const tick = tickWorldEventScheduler(now + 20, { forceSpawn: true });
    expect(tick.spawned).toBe(true);
    expect(tick.instance?.phase).toMatch(/ANNOUNCED|ACTIVE/);
  });
});
