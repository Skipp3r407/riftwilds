import { expect, test } from "@playwright/test";

/**
 * New-player path through Live World UI (Phase 1 local demo).
 * Complements unit quest/dialogue tests with real browser entry.
 */

const enabled = process.env.RUN_E2E === "1";

test.describe("New player playthrough", () => {
  test.skip(!enabled, "Set RUN_E2E=1 and start next server to run");
  test.setTimeout(90_000);

  test("landing → Live World → enter Commons canvas", async ({ page }) => {
    await page.goto("/live-world", { waitUntil: "domcontentloaded" });
    const enter = page.getByRole("button", { name: /ENTER THE LIVE WORLD/i });
    await expect(enter).toBeVisible({ timeout: 20000 });
    await enter.click();

    // Entered shell shows Exit control even before Phaser paints canvas
    await expect(page.getByRole("button", { name: /Exit world/i })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByTestId("live-world-canvas")).toBeVisible({ timeout: 15000 });

    // Phaser injects a canvas when boot succeeds
    await expect(page.locator('[data-testid="live-world-canvas"] canvas').first()).toBeVisible({
      timeout: 45000,
    });
  });

  test("hatchery and arena routes remain reachable mid-journey", async ({ page }) => {
    await page.goto("/hatchery");
    await expect(page.locator("body")).toContainText(/Hatch|Egg|Riftling/i, {
      timeout: 15000,
    });
    await page.goto("/arena/training");
    await expect(page.locator("body")).toBeVisible();
  });
});
