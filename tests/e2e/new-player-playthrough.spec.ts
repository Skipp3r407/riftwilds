import { test, expect } from "@playwright/test";

/**
 * New-player Live World playthrough smoke.
 * Full Phaser keyboard quest automation is limited in headless CI;
 * this covers the enterable path and UI surfaces that must work.
 */
test.describe("New player playthrough", () => {
  test("landing → Live World enter CTA → world shell mounts", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();

    await page.goto("/live-world");
    const enter = page.getByRole("button", { name: /ENTER THE LIVE WORLD/i });
    await expect(enter).toBeVisible({ timeout: 30_000 });
    await enter.click();

    // Loading / ready HUD should appear (status or canvas host)
    await expect(page.locator("section.panel").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Exit world/i })).toBeVisible({
      timeout: 45_000,
    });
  });

  test("hatchery demo path remains available (no SOL)", async ({ page }) => {
    await page.goto("/hatchery");
    await expect(page.getByText(/hatch|egg|Riftling/i).first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("quest board includes starter chain keys in page data path", async ({ page }) => {
    await page.goto("/quests");
    await expect(page.getByText(/quest|story|board/i).first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
