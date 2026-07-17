import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`PAGE:${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`CON:${m.text()}`);
});
page.on("requestfailed", (r) =>
  errors.push(`REQ:${r.url()} ${r.failure()?.errorText ?? ""}`),
);

await page.goto("http://127.0.0.1:3001/live-world", { waitUntil: "load" });
await page.waitForTimeout(5000);
console.log("errors", errors.slice(0, 50));
console.log("next scripts", await page.locator('script[src*="_next"]').count());
const state = await page.evaluate(() => ({
  nextData: typeof window.__NEXT_DATA__ !== "undefined",
  buttons: [...document.querySelectorAll("button")].map((b) => b.textContent?.trim()),
}));
console.log("state", state);
await browser.close();
