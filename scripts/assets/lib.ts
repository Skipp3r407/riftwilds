import path from "path";

export const ROOT = path.resolve(__dirname, "../..");
export const SOURCE_DIR = path.join(ROOT, "public/assets/creatures/source");
export const PROCESSED_DIR = path.join(ROOT, "public/assets/creatures/processed");
export const SHEETS_DIR = path.join(ROOT, "public/assets/creatures/sheets");
export const ATLASES_DIR = path.join(ROOT, "public/assets/creatures/atlases");
export const PLACEHOLDERS_DIR = path.join(ROOT, "public/assets/placeholders");

export const BATTLE = {
  frameWidth: 512,
  frameHeight: 512,
  padding: 24,
  baselineY: 450,
} as const;

export const OVERWORLD = {
  frameWidth: 128,
  frameHeight: 128,
} as const;

export function assertNotSourceWrite(target: string): void {
  const normalized = path.normalize(target);
  if (normalized.startsWith(path.normalize(SOURCE_DIR))) {
    throw new Error(`Refusing to write into source directory: ${target}`);
  }
}
