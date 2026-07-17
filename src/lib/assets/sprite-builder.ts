import fs from "node:fs/promises";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";

export type SheetFrame = {
  /** Absolute path to a frame PNG. */
  absolutePath: string;
  /** Optional label for atlas. */
  name?: string;
};

export type SpriteSheetOptions = {
  frameWidth: number;
  frameHeight: number;
  columns?: number;
  padding?: number;
  background?: { r: number; g: number; b: number; alpha: number };
};

export type SpriteSheetResult = {
  sheetPath: string;
  atlasPath: string;
  frameCount: number;
  columns: number;
  rows: number;
};

/**
 * Pack discrete frame PNGs into a horizontal/grid sheet + simple JSON atlas.
 * Does not invent animation frames — only packs existing masters.
 */
export async function buildSpriteSheet(
  frames: SheetFrame[],
  sheetAbsolutePath: string,
  opts: SpriteSheetOptions,
): Promise<SpriteSheetResult> {
  if (!frames.length) throw new Error("No frames to pack");

  const columns = opts.columns ?? Math.min(frames.length, 8);
  const rows = Math.ceil(frames.length / columns);
  const pad = opts.padding ?? 0;
  const fw = opts.frameWidth;
  const fh = opts.frameHeight;
  const bg = opts.background ?? { r: 0, g: 0, b: 0, alpha: 0 };

  const sheetW = columns * fw + (columns + 1) * pad;
  const sheetH = rows * fh + (rows + 1) * pad;

  const composites: OverlayOptions[] = [];
  const atlasFrames: Record<
    string,
    { x: number; y: number; w: number; h: number; name: string }
  > = {};

  for (let i = 0; i < frames.length; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = pad + col * (fw + pad);
    const y = pad + row * (fh + pad);
    const resized = await sharp(frames[i]!.absolutePath)
      .resize(fw, fh, { fit: "contain", background: bg })
      .png()
      .toBuffer();
    composites.push({ input: resized, left: x, top: y });
    const name = frames[i]!.name ?? `frame_${i}`;
    atlasFrames[name] = { x, y, w: fw, h: fh, name };
  }

  await fs.mkdir(path.dirname(sheetAbsolutePath), { recursive: true });
  await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 4,
      background: bg,
    },
  })
    .composite(composites)
    .png()
    .toFile(sheetAbsolutePath);

  const atlasPath = sheetAbsolutePath.replace(/\.png$/i, "-atlas.json");
  const atlas = {
    meta: {
      image: path.basename(sheetAbsolutePath),
      size: { w: sheetW, h: sheetH },
      frameCount: frames.length,
      frameWidth: fw,
      frameHeight: fh,
      columns,
      rows,
    },
    frames: atlasFrames,
  };
  await fs.writeFile(atlasPath, JSON.stringify(atlas, null, 2), "utf8");

  return {
    sheetPath: sheetAbsolutePath,
    atlasPath,
    frameCount: frames.length,
    columns,
    rows,
  };
}
