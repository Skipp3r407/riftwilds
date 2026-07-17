import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

test.describe("NPC population", () => {
  test("named catalog has 54 NPCs in generated content", () => {
    const catalog = fs.readFileSync(
      path.join(ROOT, "src/content/npcs/catalog.generated.ts"),
      "utf8",
    );
    const namedMatches = catalog.match(/"kind": "named"/g) ?? [];
    expect(namedMatches.length).toBe(54);
  });

  test("Commons blueprint references starter cast", () => {
    const bp = fs.readFileSync(
      path.join(ROOT, "src/game/world-maps/blueprints/riftwild-commons.ts"),
      "utf8",
    );
    for (const id of [
      "rowan-vale",
      "elara-venn",
      "mira-shellbright",
      "bram-ironroot",
      "captain-orren",
    ]) {
      expect(bp).toContain(id);
    }
  });

  test("Live World page loads enter CTA", async ({ page }) => {
    await page.goto("/live-world");
    await expect(page.getByRole("button", { name: /ENTER THE LIVE WORLD/i })).toBeVisible({
      timeout: 30_000,
    });
  });
});
