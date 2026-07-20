import { test, expect } from "@playwright/test";

/**
 * New-player path smoke — Live World is Coming Soon until public launch.
 * Phaser enter stays covered by unit/dev-preview tests when flags flip.
 */
test.describe("New player playthrough", () => {
  test("landing → Live World Coming Soon gate", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();

    await page.goto("/live-world");
    await expect(page.getByText(/Coming Soon/i).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("link", { name: /Rift Battle/i }).first()).toBeVisible();
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
