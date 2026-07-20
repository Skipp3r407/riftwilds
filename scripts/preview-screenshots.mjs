/**
 * Local preview screenshots for TCG redesign.
 * Usage: node scripts/preview-screenshots.mjs
 *
 * Prefers a real signup when /api/auth/register works.
 * Falls back to AUTH_LOCAL_PREVIEW_BYPASS pages when Postgres is unavailable.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = "http://localhost:3000";
const OUT = path.resolve("artifacts");
const stamp = Date.now().toString(36);
const email = `preview.${stamp}@riftwilds.local`;
const password = "PreviewPass1!";
const username = `prev${stamp.slice(-6)}`;

async function waitReady(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1200);
}

async function shot(page, name, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await waitReady(page);
  const file = path.join(OUT, `preview-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  const finalUrl = page.url();
  const blocked = /\/login|\/signup|\/verify-email/.test(finalUrl);
  console.log(`${blocked ? "AUTH_BLOCK" : "OK"} ${name} -> ${file} (url=${finalUrl})`);
  return { name, file, url: finalUrl, blocked };
}

async function tryAuth(page) {
  const reg = await page.request.post(`${BASE}/api/auth/register`, {
    data: {
      email,
      password,
      acceptTerms: true,
      acceptPrivacy: true,
      rememberMe: true,
    },
  });
  const regJson = await reg.json().catch(() => ({}));
  console.log("register", reg.status(), regJson.ok, regJson.accountStatus, regJson.next);
  if (!reg.ok() || !regJson.ok) {
    return { mode: "bypass", detail: regJson?.error?.message ?? `HTTP ${reg.status()}` };
  }

  const onboard = await page.request.post(`${BASE}/api/auth/onboarding/complete`, {
    data: {
      displayName: "Preview Keeper",
      username,
      dateOfBirth: "1995-06-15",
      region: "US",
      acceptTerms: true,
      acceptPrivacy: true,
      starterKeeperId: "ember",
      claimStarterEgg: true,
      tutorialIntroSeen: true,
    },
  });
  const onboardJson = await onboard.json().catch(() => ({}));
  console.log(
    "onboarding",
    onboard.status(),
    onboardJson.ok,
    onboardJson.state?.complete,
    onboardJson.next,
  );
  if (!onboard.ok() || !onboardJson.ok) {
    return { mode: "bypass", detail: onboardJson?.error?.message ?? `HTTP ${onboard.status()}` };
  }
  return { mode: "session", email };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    baseURL: BASE,
  });
  const page = await context.newPage();

  const auth = await tryAuth(page);
  console.log("auth mode:", auth.mode, auth.detail || auth.email || "");

  const results = [];
  results.push(await shot(page, "home-logo", `${BASE}/?home=1`));
  results.push(await shot(page, "tcg-collection", `${BASE}/tcg/collection`));
  results.push(await shot(page, "tcg-admin", `${BASE}/tcg/admin`));
  results.push(await shot(page, "tcg-deck-builder", `${BASE}/tcg/deck-builder`));
  results.push(await shot(page, "tcg-battle", `${BASE}/tcg/battle`));

  await browser.close();

  console.log("\n=== PREVIEW REPORT ===");
  console.log(`auth: ${auth.mode}${auth.email ? ` (${auth.email})` : ""}${auth.detail ? ` — ${auth.detail}` : ""}`);
  for (const r of results) {
    console.log(`${r.blocked ? "AUTH_BLOCK" : "OK"} ${r.name}: ${r.url}`);
  }
  if (results.some((r) => r.blocked)) process.exitCode = 2;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
