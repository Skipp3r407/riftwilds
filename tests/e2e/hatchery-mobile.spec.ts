import { test, expect } from "@playwright/test";

/**
 * Mobile hatchery journey — enable with RUN_E2E=1 when a server is up.
 * Runs under Playwright projects `mobile-chrome` / `mobile-safari`.
 */
const enabled = process.env.RUN_E2E === "1";

test.describe("hatchery mobile", () => {
  test.skip(!enabled, "Set RUN_E2E=1 and start next server to run");
  test.setTimeout(90_000);

  test("claim → skip wait → hatch on narrow viewport", async ({ page }) => {
    await page.goto("/hatchery", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /hatchery/i }).first()).toBeVisible({
      timeout: 20_000,
    });

    const claimBtn = page.getByRole("button", { name: /claim starter egg/i });
    await expect(claimBtn).toBeVisible({ timeout: 15_000 });
    await expect(claimBtn).toBeEnabled({ timeout: 15_000 });

    const claimBox = await claimBtn.boundingBox();
    expect(claimBox).toBeTruthy();
    expect((claimBox?.height ?? 0) >= 40).toBeTruthy();

    await claimBtn.click();
    await expect(page.getByRole("heading", { name: /your eggs/i })).toBeVisible();
    await expect(page.getByText(/1 held/i)).toBeVisible({ timeout: 15_000 });

    const skip = page.getByRole("button", { name: /skip wait/i });
    await expect(skip).toBeVisible({ timeout: 15_000 });
    const skipBox = await skip.boundingBox();
    expect((skipBox?.height ?? 0) >= 40).toBeTruthy();
    await skip.click();

    await expect(page.getByRole("heading", { name: /hatch reveal/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/\d+\s+active/i).first()).toBeVisible();
  });
});
