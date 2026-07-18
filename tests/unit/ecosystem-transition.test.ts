import { describe, expect, it } from "vitest";
import { existsSync } from "fs";
import path from "path";
import { AUTH_PROVIDERS, listAuthProviders } from "@/lib/auth/providers";
import {
  getAuthOnboardingPlan,
  planWalletLinkMerge,
  createDemoSoftIdentity,
} from "@/lib/auth/modular-auth";
import { buildGlobalActivityFeed } from "@/lib/ecosystem/activity-feed";
import { getCommunityTreasuryDashboard } from "@/lib/ecosystem/treasury";
import { getRewardCenterDashboard } from "@/lib/ecosystem/reward-center";
import { buildPlayerDashboardSnapshot } from "@/lib/ecosystem/player-dashboard";
import { getLivePresenceSnapshot } from "@/lib/ecosystem/presence";
import { getCreatorHubSnapshot } from "@/lib/ecosystem/creator-hub";
import { listBrowseCategories } from "@/lib/marketplace/browse-categories";
import { getSocialHubSnapshot } from "@/game/social/stubs";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { headerNavGroups } from "@/lib/config/nav";

const ROOT = path.resolve(__dirname, "../..");

describe("ecosystem transition foundations", () => {
  it("ships architecture doc", () => {
    expect(existsSync(path.join(ROOT, "docs/ECOSYSTEM_TRANSITION.md"))).toBe(true);
  });

  it("recommends email/social first with optional wallet", () => {
    const plan = getAuthOnboardingPlan();
    expect(plan.recommendedFirst).toBe("email_or_social");
    expect(plan.walletRequiredForPlay).toBe(false);
    expect(plan.flags.walletOptionalPlay).toBe(true);
    expect(listAuthProviders({ priority: "primary" }).length).toBeGreaterThan(0);
    expect(AUTH_PROVIDERS.some((p) => p.id === "wallet_siws" && p.implemented)).toBe(true);
  });

  it("plans wallet link merges without dropping progress", () => {
    const merge = planWalletLinkMerge({
      accountUserId: "u1",
      walletOnlyUserId: "u2",
      walletAddress: "So11111111111111111111111111111111111111112",
    });
    expect(merge.preserve).toContain("creatures");
    expect(createDemoSoftIdentity().walletLinked).toBe(false);
  });

  it("builds activity, treasury, rewards, dashboard, presence, creators", () => {
    const feed = buildGlobalActivityFeed({ limit: 5 });
    expect(feed.length).toBeGreaterThan(0);
    expect(feed.every((i) => !/earn sol by buying/i.test(i.detail))).toBe(true);

    const treasury = getCommunityTreasuryDashboard();
    expect(treasury.buckets.length).toBeGreaterThanOrEqual(4);
    expect(treasury.disclaimers.some((d) => /blank|n\/a/i.test(d))).toBe(true);

    const rewards = getRewardCenterDashboard();
    expect(rewards.framing.toLowerCase()).toContain("not from buying");
    expect(rewards.sources.some((s) => s.kind === "pet")).toBe(true);

    const dash = buildPlayerDashboardSnapshot({ petCount: 2, displayName: "Mira" });
    expect(dash.panels.some((p) => p.id === "roster")).toBe(true);
    expect(dash.displayName).toBe("Mira");

    const presence = getLivePresenceSnapshot();
    expect(presence.globalOnline).toBeNull();
    expect(presence.channels.length).toBeGreaterThan(3);

    const creators = getCreatorHubSnapshot();
    expect(creators.creators.length).toBeGreaterThan(0);
    const themes = new Set([
      ...creators.creators.map((c) => c.bgTheme),
      ...creators.offers.map((o) => o.bgTheme),
    ]);
    expect(themes.size).toBe(creators.creators.length + creators.offers.length);
    for (const card of [...creators.creators, ...creators.offers]) {
      expect(card.bgSrc).toContain(`/assets/creators/backgrounds/${card.bgTheme}.svg`);
    }
  });

  it("scaffolds marketplace browse categories beyond listings", () => {
    const cats = listBrowseCategories({ includeScaffold: true });
    expect(cats.some((c) => c.id === "COSMETICS")).toBe(true);
    expect(cats.some((c) => c.id === "WISHLISTS")).toBe(true);
    expect(cats.some((c) => c.id === "HOUSING")).toBe(true);
  });

  it("exposes social hub stubs", () => {
    const hub = getSocialHubSnapshot();
    expect(hub.friends.length).toBeGreaterThan(0);
    expect(hub.calendar.length).toBeGreaterThan(0);
    expect(hub.posts.length).toBeGreaterThan(0);
  });

  it("enables post-grad nav destinations", () => {
    expect(featureFlagDefaults.ECOSYSTEM_POST_GRAD_NAV_ENABLED).toBe(true);
    expect(featureFlagDefaults.ECOSYSTEM_PLAYER_DASHBOARD_ENABLED).toBe(true);
    expect(featureFlagDefaults.ECOSYSTEM_REWARD_CENTER_ENABLED).toBe(true);
    const ids = headerNavGroups.map((g) => g.id);
    expect(ids).toContain("community");
    const play = headerNavGroups.find((g) => g.id === "play");
    expect(play?.items.some((i) => i.href === "/dashboard")).toBe(true);
    const economy = headerNavGroups.find((g) => g.id === "economy");
    expect(economy?.items.some((i) => i.href === "/treasury")).toBe(true);
    expect(economy?.items.some((i) => i.href === "/rewards")).toBe(true);
  });
});
