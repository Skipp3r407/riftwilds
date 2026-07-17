import { existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import path from "path";
import sharp from "sharp";
import { SHEETS_DIR, ATLASES_DIR, assertNotSourceWrite, BATTLE } from "./lib";

async function atlasForSheet(sheetPath: string) {
  const meta = await sharp(sheetPath).metadata();
  const fw = BATTLE.frameWidth;
  const fh = BATTLE.frameHeight;
  const cols = Math.floor((meta.width ?? 0) / fw);
  const rows = Math.floor((meta.height ?? 0) / fh);
  const frames: Record<string, { frame: { x: number; y: number; w: number; h: number } }> = {};
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      frames[`frame_${String(i).padStart(2, "0")}`] = {
        frame: { x: c * fw, y: r * fh, w: fw, h: fh },
      };
      i++;
    }
  }

  const base = path.basename(sheetPath, ".png");
  const out = path.join(ATLASES_DIR, `${base.replace(/-sheet$/, "")}-atlas.json`);
  assertNotSourceWrite(out);
  mkdirSync(ATLASES_DIR, { recursive: true });
  writeFileSync(
    out,
    JSON.stringify(
      {
        frames,
        meta: {
          image: path.basename(sheetPath),
          size: { w: meta.width, h: meta.height },
          scale: "1",
        },
      },
      null,
      2,
    ),
  );
  console.log("Atlas", out);
}

async function main() {
  if (!existsSync(SHEETS_DIR)) {
    console.log("No sheets directory — atlas skipped.");
    return;
  }
  const sheets = readdirSync(SHEETS_DIR).filter((f) => f.endsWith(".png"));
  if (!sheets.length) {
    console.log("No sheet PNGs — atlas skipped.");
    return;
  }
  for (const sheet of sheets) {
    await atlasForSheet(path.join(SHEETS_DIR, sheet));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
