import { beforeEach, describe, expect, it } from "vitest";
import {
  CONTINENT_SPINE,
  CONTINENT_EDGES,
  areConnected,
  nextSpineRegion,
  GATEWAY_STONES,
  activateGatewayOnVisit,
  isRegionGatewayActivated,
  fastTravelFeeCredits,
  previewFastTravel,
  attemptFastTravel,
  isRegionUnlocked,
  getRegionUnlockView,
  grantRegionDiscoveryRewards,
  planRegionStream,
  resetStreamStateForTests,
  getWorldCompletionSnapshot,
  createPartyTravelInvite,
  respondPartyTravelInvite,
  clearPartyInvitesForTests,
  buildTransitionPlan,
  resetTravelProgressForTests,
} from "@/game/world-travel";
import { isPortalLocked, canEnterLiveWorldRegion } from "@/game/world-maps/load-blueprint";
import { getBlueprint } from "@/game/world-maps/blueprints";
import { isRegionUnlockedLocally } from "@/game/world-maps/regions";

function resetTravelStorage() {
  resetTravelProgressForTests();
  clearPartyInvitesForTests();
  resetStreamStateForTests();
}

describe("Continent connection graph", () => {
  it("defines Commons → Elderwood → Stoneheart → Stormspire → Radiant spine", () => {
    expect(CONTINENT_SPINE).toEqual([
      "riftwild-commons",
      "elderwood-forest",
      "stoneheart-canyon",
      "stormspire-peaks",
      "radiant-citadel",
    ]);
    expect(nextSpineRegion("elderwood-forest")).toBe("stoneheart-canyon");
    expect(areConnected("elderwood-forest", "stoneheart-canyon")).toBe(true);
    expect(CONTINENT_EDGES.some((e) => e.kind === "spine")).toBe(true);
  });
});

describe("Gateway network", () => {
  beforeEach(() => {
    resetTravelStorage();
  });

  it("has one Gateway Stone per region", () => {
    expect(GATEWAY_STONES).toHaveLength(12);
    expect(GATEWAY_STONES.every((g) => g.id.startsWith("gateway-"))).toBe(true);
  });

  it("activates permanently on first visit", () => {
    expect(isRegionGatewayActivated("elderwood-forest")).toBe(false);
    const first = activateGatewayOnVisit("elderwood-forest");
    expect(first.activated).toBe(true);
    expect(first.cinematicStub).toBe("gateway_activation");
    expect(isRegionGatewayActivated("elderwood-forest")).toBe(true);
    const second = activateGatewayOnVisit("elderwood-forest");
    expect(second.activated).toBe(false);
  });

  it("keeps early hub travel free (Credits never SOL)", () => {
    const fee = fastTravelFeeCredits("riftwild-commons", "ember-crater");
    expect(fee.free).toBe(true);
    expect(fee.fee).toBe(0);
  });
});

describe("Region unlocks", () => {
  it("locks Stoneheart until Elderwood visit + chapter/level", () => {
    expect(
      isRegionUnlockedLocally("stoneheart-canyon", {
        playerLevel: 1,
        storyChapters: [],
        bossesDefeated: [],
        gateways: [],
      }),
    ).toBe(false);

    expect(
      isRegionUnlocked("stoneheart-canyon", {
        playerLevel: 10,
        storyChapters: ["chapter-2"],
        bossesDefeated: [],
        gateways: [],
        regionsVisited: ["elderwood-forest"],
        reputation: {},
        completedQuests: [],
      }),
    ).toBe(true);

    const view = getRegionUnlockView("void-hollow", {
      playerLevel: 1,
      storyChapters: [],
      bossesDefeated: [],
      gateways: [],
      regionsVisited: [],
      reputation: {},
      completedQuests: [],
    });
    expect(view.unlocked).toBe(false);
    expect(view.teaser.length).toBeGreaterThan(5);
    expect(view.requirements.length).toBeGreaterThan(0);
  });

  it("opens starter hubs for Live World entry", () => {
    expect(canEnterLiveWorldRegion("riftwild-commons")).toBe(true);
    expect(canEnterLiveWorldRegion("ember-crater")).toBe(true);
  });
});

describe("Discovery rewards", () => {
  beforeEach(() => {
    resetTravelStorage();
  });

  it("grants once and ignores rediscovery", () => {
    const first = grantRegionDiscoveryRewards("moonwater-coast");
    expect(first.alreadyClaimed).toBe(false);
    expect(first.rewards.some((r) => r.kind === "credits")).toBe(true);
    expect(first.rewards.some((r) => r.kind === "codex")).toBe(true);
    const second = grantRegionDiscoveryRewards("moonwater-coast");
    expect(second.alreadyClaimed).toBe(true);
    expect(second.rewards).toHaveLength(0);
  });
});

describe("Fast travel guards", () => {
  beforeEach(() => {
    resetTravelStorage();
    activateGatewayOnVisit("riftwild-commons");
    activateGatewayOnVisit("ember-crater");
  });

  it("allows free early fast travel between activated starter Gateways", () => {
    const preview = previewFastTravel("riftwild-commons", "ember-crater");
    expect(preview.blocked).toBeNull();
    expect(preview.free).toBe(true);
    const attempt = attemptFastTravel("riftwild-commons", "ember-crater");
    expect(attempt.ok).toBe(true);
  });

  it("blocks undiscovered destinations", () => {
    const preview = previewFastTravel("riftwild-commons", "void-hollow");
    expect(preview.blocked).toBe("gateway_locked");
  });
});

describe("Blueprints include Gateway Stones", () => {
  it("places a gateway object on Commons and Elderwood", () => {
    for (const slug of ["riftwild-commons", "elderwood-forest"]) {
      const bp = getBlueprint(slug);
      expect(
        bp.objects.some(
          (o) => o.type === "gateway" || o.metadata?.gatewayStone === true,
        ),
      ).toBe(true);
    }
  });

  it("evaluates portal locks dynamically", () => {
    const bp = getBlueprint("riftwild-commons");
    const locked = bp.objects.find((o) => o.id === "commons-to-void");
    expect(locked).toBeTruthy();
    expect(isPortalLocked(locked!)).toBe(true);
  });
});

describe("Streaming + completion + party stubs", () => {
  beforeEach(() => {
    resetTravelStorage();
  });

  it("plans unload of distant regions", () => {
    const state = planRegionStream("radiant-citadel", ["stormspire-peaks"]);
    expect(state.active).toBe("radiant-citadel");
    expect(state.loaded).toContain("radiant-citadel");
  });

  it("tracks world completion percent", () => {
    activateGatewayOnVisit("riftwild-commons");
    const snap = getWorldCompletionSnapshot();
    expect(snap.regionsTotal).toBe(12);
    expect(snap.gatewaysTotal).toBe(12);
    expect(snap.percentComplete).toBeGreaterThanOrEqual(0);
  });

  it("handles party travel accept/decline stubs", () => {
    const invite = createPartyTravelInvite({
      leaderName: "Mira",
      toRegionId: "elderwood-forest",
    });
    expect(invite.status).toBe("pending");
    expect(respondPartyTravelInvite(invite.id, false)?.status).toBe("declined");
  });

  it("builds transition plans with loading art", () => {
    const plan = buildTransitionPlan("riftwild-commons", "ember-crater");
    expect(plan.loadingArtSrc).toContain("travel-loading");
    expect(plan.fadeMs).toBeGreaterThan(0);
  });
});
