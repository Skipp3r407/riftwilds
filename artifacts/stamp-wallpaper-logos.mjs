/**
 * Audit + stamp Riftwilds primary logo (bottom-right) on downloadable wallpapers.
 * Skips files that already look stamped (avoids double-stacking).
 *
 * Placement matches prior pass (agent 0c9718b4):
 *   LOGO_WIDTH=300, PAD_X=48, PAD_Y=40, soft dark scrim behind logo.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public/assets/wallpapers");
const LOGO = path.join(ROOT, "public/assets/brand/riftwilds-logo.png");
const ARTIFACTS = path.join(ROOT, "artifacts");
const BACKUP = path.join(ARTIFACTS, "wallpapers-pre-logo-pass2");
const REPORT = path.join(ARTIFACTS, "wallpaper-logo-audit.json");

const TARGET_W = 1920;
const TARGET_H = 1080;
const LOGO_WIDTH = 300;
const PAD_X = 48;
const PAD_Y = 40;

/** Mean absolute error under logo alpha; below this ⇒ already stamped. */
const ALREADY_STAMPED_MAE = 42;

async function makeLogoParts(baseW, baseH) {
  const logoBuf = await sharp(LOGO)
    .resize({ width: LOGO_WIDTH, withoutEnlargement: true })
    .ensureAlpha()
    .png()
    .toBuffer();
  const meta = await sharp(logoBuf).metadata();
  const lw = meta.width;
  const lh = meta.height;
  const left = baseW - lw - PAD_X;
  const top = baseH - lh - PAD_Y;
  const scrimW = lw + 28;
  const scrimH = lh + 20;
  const scrimLeft = left - 14;
  const scrimTop = top - 10;
  const scrim = await sharp({
    create: {
      width: scrimW,
      height: scrimH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0.35 },
    },
  })
    .png()
    .toBuffer();
  return {
    logoBuf,
    composites: [
      { input: scrim, left: Math.max(0, scrimLeft), top: Math.max(0, scrimTop) },
      { input: logoBuf, left, top },
    ],
    left,
    top,
    lw,
    lh,
  };
}

async function logoPresenceMae(wallpaperPath, left, top, lw, lh, logoBuf) {
  const crop = await sharp(wallpaperPath)
    .extract({ left, top, width: lw, height: lh })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const logo = await sharp(logoBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const a = crop.data;
  const b = logo.data;
  let sum = 0;
  let weight = 0;
  for (let i = 0; i < a.length; i += 4) {
    const alpha = b[i + 3] / 255;
    if (alpha < 0.35) continue;
    const dr = Math.abs(a[i] - b[i]);
    const dg = Math.abs(a[i + 1] - b[i + 1]);
    const db = Math.abs(a[i + 2] - b[i + 2]);
    sum += ((dr + dg + db) / 3) * alpha;
    weight += alpha;
  }
  if (weight < 1) return 999;
  return sum / weight;
}

async function normalizeToCanvas(srcPath) {
  const meta = await sharp(srcPath).metadata();
  if (meta.width === TARGET_W && meta.height === TARGET_H) {
    return { buf: await sharp(srcPath).png().toBuffer(), resized: false };
  }
  const buf = await sharp(srcPath)
    .resize(TARGET_W, TARGET_H, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
  return { buf, resized: true };
}

async function stampBuffer(baseBuf, composites) {
  return sharp(baseBuf).composite(composites).png({ compressionLevel: 8 }).toBuffer();
}

async function main() {
  if (!fs.existsSync(LOGO)) {
    console.error("Missing logo:", LOGO);
    process.exit(1);
  }
  fs.mkdirSync(BACKUP, { recursive: true });
  fs.mkdirSync(ARTIFACTS, { recursive: true });

  const files = fs
    .readdirSync(OUT)
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .sort();

  const { logoBuf, composites, left, top, lw, lh } = await makeLogoParts(
    TARGET_W,
    TARGET_H,
  );

  const results = [];
  let already = 0;
  let stamped = 0;
  let failed = 0;

  for (const name of files) {
    const dest = path.join(OUT, name);
    try {
      // Normalize dimensions first into a temp inspection buffer if needed
      const { buf: normalized, resized } = await normalizeToCanvas(dest);
      const tmpInspect = path.join(ARTIFACTS, `_wp-inspect-${name}`);
      await fs.promises.writeFile(tmpInspect, normalized);

      const mae = await logoPresenceMae(tmpInspect, left, top, lw, lh, logoBuf);
      const hasLogo = mae < ALREADY_STAMPED_MAE;

      if (hasLogo && !resized) {
        already++;
        results.push({ name, action: "skip-already-stamped", mae: +mae.toFixed(2) });
        console.log(`SKIP  ${name}  mae=${mae.toFixed(1)}`);
        await fs.promises.unlink(tmpInspect).catch(() => {});
        continue;
      }

      // Backup original before overwrite
      const backupPath = path.join(BACKUP, name);
      if (!fs.existsSync(backupPath)) {
        await fs.promises.copyFile(dest, backupPath);
      }

      const stampedBuf = await stampBuffer(normalized, composites);
      await fs.promises.writeFile(dest, stampedBuf);
      stamped++;
      results.push({
        name,
        action: hasLogo && resized ? "restamp-after-resize" : "stamped",
        maeBefore: +mae.toFixed(2),
        resized,
      });
      console.log(
        `STAMP ${name}  maeBefore=${mae.toFixed(1)}${resized ? " (resized)" : ""}`,
      );
      await fs.promises.unlink(tmpInspect).catch(() => {});
    } catch (err) {
      failed++;
      results.push({ name, action: "error", error: String(err?.message || err) });
      console.error(`FAIL  ${name}`, err?.message || err);
    }
  }

  // Verify after stamp
  let withLogo = 0;
  const verify = [];
  for (const name of files) {
    const dest = path.join(OUT, name);
    try {
      const mae = await logoPresenceMae(dest, left, top, lw, lh, logoBuf);
      const ok = mae < ALREADY_STAMPED_MAE;
      if (ok) withLogo++;
      verify.push({ name, mae: +mae.toFixed(2), hasLogo: ok });
    } catch (err) {
      verify.push({ name, hasLogo: false, error: String(err?.message || err) });
    }
  }

  // Extract a few corner samples for visual QA
  const samples = [
    "commons-plaza.png",
    "creature-spark-commons.png",
    "spark-plaza-dawn.png",
    "riftpup-cyan-breach.png",
    "emberfox-crater-glow.png",
  ].filter((n) => files.includes(n));

  for (const name of samples) {
    const meta = await sharp(path.join(OUT, name)).metadata();
    const w = meta.width || TARGET_W;
    const h = meta.height || TARGET_H;
    const cw = Math.min(420, w);
    const ch = Math.min(180, h);
    await sharp(path.join(OUT, name))
      .extract({ left: w - cw, top: h - ch, width: cw, height: ch })
      .png()
      .toFile(path.join(ARTIFACTS, `wp-logo-corner-${name}`));
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totalFiles: files.length,
    alreadyHadLogo: already,
    newlyStamped: stamped,
    failed,
    finalWithLogo: withLogo,
    thresholdMae: ALREADY_STAMPED_MAE,
    placement: { LOGO_WIDTH, PAD_X, PAD_Y, TARGET_W, TARGET_H },
    results,
    verify,
  };
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));

  console.log("\n=== SUMMARY ===");
  console.log(`total files:        ${files.length}`);
  console.log(`already had logo:   ${already}`);
  console.log(`newly stamped:      ${stamped}`);
  console.log(`failed:             ${failed}`);
  console.log(`final with logo:    ${withLogo}`);
  console.log(`report:             ${REPORT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
