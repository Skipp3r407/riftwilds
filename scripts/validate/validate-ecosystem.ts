/**
 * Validates post–Pump.fun ecosystem transition foundations.
 * Exit 1 on structural failure.
 */

import { existsSync } from "fs";
import path from "path";
import { featureFlagDefaults } from "../../src/lib/config/feature-flags";
import { headerNavGroups, primaryNav } from "../../src/lib/config/nav";
import { AUTH_PROVIDERS } from "../../src/lib/auth/providers";
import { getAuthOnboardingPlan } from "../../src/lib/auth/modular-auth";
import { buildGlobalActivityFeed } from "../../src/lib/ecosystem/activity-feed";
import { getCommunityTreasuryDashboard } from "../../src/lib/ecosystem/treasury";
import { getRewardCenterDashboard } from "../../src/lib/ecosystem/reward-center";
import { listBrowseCategories } from "../../src/lib/marketplace/browse-categories";

const ROOT = path.resolve(__dirname, "../..");
const errors: string[] = [];

function assert(cond: boolean, msg: string) {
  if (!cond) errors.push(msg);
}

assert(
  existsSync(path.join(ROOT, "docs/ECOSYSTEM_TRANSITION.md")),
  "Missing docs/ECOSYSTEM_TRANSITION.md",
);

const requiredPages = [
  "src/app/(game)/dashboard/page.tsx",
  "src/app/(game)/rewards/page.tsx",
  "src/app/(marketing)/treasury/page.tsx",
  "src/app/(marketing)/analytics/token/page.tsx",
  "src/app/(game)/restoration/page.tsx",
  "src/app/(game)/social/page.tsx",
  "src/app/(marketing)/creators/page.tsx",
  "src/app/(marketing)/login/page.tsx",
];
for (const p of requiredPages) {
  assert(existsSync(path.join(ROOT, p)), `Missing page ${p}`);
}

assert(
  featureFlagDefaults.ECOSYSTEM_PLAYER_DASHBOARD_ENABLED === true,
  "Player dashboard flag should default on",
);
assert(
  featureFlagDefaults.AUTH_WALLET_OPTIONAL_PLAY === false,
  "Legacy guest/wallet-optional play must stay off (account required)",
);
assert(
  featureFlagDefaults.AUTH_WALLET_SIWS_ENABLED === true,
  "SIWS should remain enabled",
);

const plan = getAuthOnboardingPlan();
assert(plan.recommendedFirst === "email_or_social", "Onboarding must prefer email/social");
assert(plan.walletRequiredForPlay === false, "Play must not require wallet");
assert(
  AUTH_PROVIDERS.some((p) => p.id === "wallet_siws" && p.implemented),
  "Wallet SIWS provider must stay implemented",
);

assert(
  primaryNav.some((l) => l.href === "/dashboard"),
  "Nav missing /dashboard",
);
assert(
  primaryNav.some((l) => l.href === "/treasury"),
  "Nav missing /treasury",
);
assert(
  primaryNav.some((l) => l.href === "/rewards"),
  "Nav missing /rewards",
);
assert(
  headerNavGroups.some((g) => g.id === "community"),
  "Community nav group missing (Pump.fun secondary home)",
);

assert(buildGlobalActivityFeed({ limit: 3 }).length >= 3, "Activity feed empty");
assert(getCommunityTreasuryDashboard().buckets.length >= 4, "Treasury buckets missing");
assert(
  getRewardCenterDashboard().framing.toLowerCase().includes("not from buying"),
  "Reward center framing must reject buy-coin-earn language",
);
assert(
  listBrowseCategories().some((c) => c.id === "COSMETICS"),
  "Browse categories missing cosmetics scaffold",
);

if (errors.length) {
  console.error("validate-ecosystem FAILED:");
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}

console.log("validate-ecosystem OK");
console.log(
  JSON.stringify(
    {
      providers: AUTH_PROVIDERS.length,
      navGroups: headerNavGroups.map((g) => g.id),
      activitySample: buildGlobalActivityFeed({ limit: 2 }).map((i) => i.kind),
    },
    null,
    2,
  ),
);
