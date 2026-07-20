import { chromium } from "playwright";
import path from "node:path";

const BASE = "http://localhost:3000";
const OUT = path.resolve("artifacts");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(`${BASE}/tcg/collection`, {
    waitUntil: "commit",
    timeout: 60_000,
  });
  await page.waitForSelector("text=Collection Book", { timeout: 30_000 });
  await page.waitForTimeout(800);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    buttons.find((b) => b.textContent?.trim() === "Binder")?.click();
  });
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    buttons.find((b) => /flat binder/i.test(b.textContent || ""))?.click();
  });
  await page.waitForTimeout(600);

  // Scroll category chips into view
  await page.evaluate(() => {
    const chip =
      document.querySelector(".collection-book__chips--category") ||
      Array.from(document.querySelectorAll("*")).find((n) =>
        /Companion|Companions/.test(n.textContent || ""),
      );
    chip?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(OUT, "preview-tcg-collection.png"),
    fullPage: false,
  });
  console.log("saved collection");

  await page.goto(`${BASE}/tcg/admin`, {
    waitUntil: "commit",
    timeout: 60_000,
  });
  await page.waitForSelector("text=Card Studio", { timeout: 30_000 });
  await page.waitForTimeout(800);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    buttons
      .find((b) => /^Item\b/i.test(b.textContent?.trim() || ""))
      ?.click();
  });
  await page.waitForTimeout(700);

  // Scroll Medicine Pack card into view
  await page.evaluate(() => {
    const label = Array.from(document.querySelectorAll("*")).find((n) =>
      /Medicine Pack/i.test(n.textContent || ""),
    );
    label?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(OUT, "preview-tcg-admin.png"),
    fullPage: false,
  });
  console.log("saved admin");

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
