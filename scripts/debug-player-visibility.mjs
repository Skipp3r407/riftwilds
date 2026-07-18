import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("artifacts");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`CON:${m.text()}`);
});

await page.goto("http://localhost:3000/live-world", {
  waitUntil: "networkidle",
  timeout: 90000,
});
await page.waitForTimeout(1500);

// Scroll to shell enter, click the real button (not the header anchor).
const enterBtn = page.locator("#enter-live-world button.btn-primary");
await enterBtn.scrollIntoViewIfNeeded();
await enterBtn.click({ force: true });
await page.waitForTimeout(1000);

const afterClick = await page.evaluate(() => ({
  host: !!document.querySelector('[data-testid="live-world-host"]'),
  canvas: document.querySelectorAll("canvas").length,
  snippet: (document.querySelector("#enter-live-world")?.textContent || "").slice(0, 200),
}));
console.log("afterClick", afterClick);
if (errors.length) console.log("errors early", errors.slice(0, 10));

if (!afterClick.host) {
  // Retry via DOM click in page context
  await page.evaluate(() => {
    const b = document.querySelector("#enter-live-world button.btn-primary");
    if (b instanceof HTMLButtonElement) b.click();
  });
  await page.waitForTimeout(1500);
}

try {
  await page.waitForSelector('[data-testid="live-world-host"]', {
    timeout: 25000,
    state: "attached",
  });
} catch {
  await page.screenshot({ path: path.join(outDir, "live-world-enter-fail.png") });
  console.log("FAIL enter", await page.evaluate(() => document.body.innerText.slice(0, 800)));
  console.log("errors", errors.slice(0, 20));
  await browser.close();
  process.exit(2);
}

// Wait for Phaser ready
for (let i = 0; i < 40; i++) {
  const ready = await page.evaluate(() => {
    const g = globalThis.__LIVE_WORLD_GAME__;
    if (!g) return false;
    const scenes = g.scene?.getScenes?.(true) ?? [];
    return scenes.some((s) => s?.player);
  });
  if (ready) break;
  await page.waitForTimeout(250);
}

const before = await page.evaluate(() => {
  const g = globalThis.__LIVE_WORLD_GAME__;
  const scenes = g?.scene?.getScenes?.(true) ?? [];
  const scene = scenes.find((s) => s?.player);
  if (!scene?.player) return { ok: false, scenes: scenes.map((s) => s?.sys?.settings?.key) };
  const p = scene.player;
  const pet = scene.pet;
  // Count canopy/tree sprites near player
  let nearTrees = 0;
  let treesAbovePlayer = 0;
  for (const child of scene.children?.list ?? []) {
    const tex = child?.texture?.key || "";
    if (!tex.includes("tree") && !tex.includes("pw-prop-tree")) continue;
    const dx = Math.abs(child.x - p.x);
    const dy = Math.abs(child.y - p.y);
    if (dx < 80 && dy < 100) {
      nearTrees++;
      if (child.depth > p.depth) treesAbovePlayer++;
    }
  }
  return {
    ok: true,
    x: p.x,
    y: p.y,
    visible: p.visible,
    alpha: p.alpha,
    depth: p.depth,
    texture: p.texture?.key,
    displayW: p.displayWidth,
    displayH: p.displayHeight,
    petTex: pet?.texture?.key,
    petVisible: pet?.visible,
    nearTrees,
    treesAbovePlayer,
    dialogue: !!scene.bridge?.dialogue?.get?.(),
    menu: !!scene.bridge?.interactionMenu?.get?.(),
  };
});
console.log("before", before);

await page.screenshot({ path: path.join(outDir, "live-world-player-verify.png") });

// Focus canvas host and hold WASD
const host = page.locator('[data-testid="live-world-host"]');
await host.click({ position: { x: 200, y: 200 } }).catch(() => {});
await page.keyboard.down("KeyW");
await page.waitForTimeout(700);
await page.keyboard.down("KeyD");
await page.waitForTimeout(700);
await page.keyboard.up("KeyW");
await page.keyboard.up("KeyD");
await page.waitForTimeout(300);

const after = await page.evaluate(() => {
  const g = globalThis.__LIVE_WORLD_GAME__;
  const scenes = g?.scene?.getScenes?.(true) ?? [];
  const scene = scenes.find((s) => s?.player);
  if (!scene?.player) return null;
  const p = scene.player;
  return {
    x: p.x,
    y: p.y,
    visible: p.visible,
    alpha: p.alpha,
    depth: p.depth,
    texture: p.texture?.key,
    vx: p.body?.velocity?.x,
    vy: p.body?.velocity?.y,
  };
});
console.log("after", after);

const moved =
  before.ok &&
  after &&
  (Math.hypot(after.x - before.x, after.y - before.y) > 8 ||
    Math.abs(after.vx || 0) + Math.abs(after.vy || 0) > 1);
console.log("MOVED", !!moved, "dist", before.ok && after ? Math.hypot(after.x - before.x, after.y - before.y) : null);
console.log("VISIBLE", before.ok && before.visible && before.alpha > 0.5 && before.texture?.includes("player"));
console.log("errors", errors.slice(0, 15));

await page.screenshot({ path: path.join(outDir, "live-world-player-after-move.png") });
await browser.close();

if (!before.ok || !before.visible || !(before.alpha > 0.5) || !before.texture?.includes("player")) {
  process.exit(3);
}
if (!moved) process.exit(4);
console.log("PASS player visible + moved");
