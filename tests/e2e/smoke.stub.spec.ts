import { test, expect } from "@playwright/test";

/**
 * Smoke e2e — enable with RUN_E2E=1 when a server is up on PLAYWRIGHT_BASE_URL.
 * Prefer production build (`next start`) for stability; wallet / SOL spend paths
 * are intentionally not exercised.
 *
 * Avoid getByText matching hidden nav dropdown menuitems.
 */
const enabled = process.env.RUN_E2E === "1";

test.describe.configure({ mode: "serial" });

test.describe("riftwilds smoke", () => {
  test.skip(!enabled, "Set RUN_E2E=1 and start next server to run");
  test.setTimeout(60_000);

  test("home / about shows Riftwilds brand", async ({ page }) => {
    const res = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(res).toBeTruthy();
    expect((res?.status() ?? 500) < 400 || res?.status() === 307).toBeTruthy();
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByRole("heading").filter({ hasText: /Riftwilds|Story|Rift/i }).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test("hatchery claim → list → hatch (demo, no SOL)", async ({ page }) => {
    await page.goto("/hatchery", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 20_000 });

    const claimBtn = page.getByRole("button", { name: /claim/i }).first();
    await expect(claimBtn).toBeVisible({ timeout: 15_000 });
    await claimBtn.click();
    await expect(page.getByRole("button", { name: /skip wait|hatch/i }).first()).toBeVisible({
      timeout: 15_000,
    });

    const skip = page.getByRole("button", { name: /skip wait/i }).first();
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
    }

    const hatch = page.getByRole("button", { name: /^hatch$/i }).first();
    if (await hatch.isVisible().catch(() => false)) {
      await hatch.click();
      await expect(
        page.getByRole("heading").or(page.locator("body")).getByText(/affinity|rarity|temperament|hatched/i).first(),
      ).toBeVisible({ timeout: 20_000 });
    }
  });

  test("marketplace and shop render demo catalogs", async ({ page }) => {
    await page.goto("/marketplace", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("body")).toContainText(/Demo|listing|catalog|Marketplace/i);

    await page.goto("/shop", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 25_000 });
    await expect(page.locator("body")).toContainText(/Shop|Featured|Weapons|credits|SOL/i);
  });

  test("rewards center uses community treasury framing", async ({ page }) => {
    await page.goto("/rewards", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading").filter({ hasText: /Reward/i }).first()).toBeVisible({
      timeout: 20_000,
    });
    const body = await page.locator("body").innerText();
    expect(body.toLowerCase()).toMatch(/verified|treasury|deposit|community/);
    expect(body.toLowerCase()).not.toMatch(
      /buying the (pump\.fun )?coin automatically (pays|generates|earns)/,
    );
  });

  test("live-world page soft-gates with Coming Soon", async ({ page }) => {
    await page.goto("/live-world", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("body")).toContainText(/Coming Soon|Live World|Rift Battle/i);
  });

  test("major nav routes respond", async ({ page }) => {
    const routes = [
      "/play",
      "/dashboard",
      "/world",
      "/arena",
      "/treasury",
      "/token",
      "/about",
      "/quests",
      "/ecosystem",
    ];
    for (const route of routes) {
      const res = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(res?.ok() || (res?.status() ?? 500) < 400).toBeTruthy();
      await expect(page.locator("body")).toBeVisible();
      await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 15_000 });
    }
  });
});
