/**
 * Server/script-safe image generation provider abstraction.
 * Never import browser secrets; keys come from process.env only.
 */

export type ImageProviderId = "cursor-local" | "openai" | "replicate" | "none";

export type GenerateImageRequest = {
  /** Stable asset id (manifest key). */
  id: string;
  /** Full text prompt for the image model. */
  prompt: string;
  /** Relative path under public/, e.g. assets/worlds/ember-crater/card.png */
  outputRelPath: string;
  width?: number;
  height?: number;
  aspectRatio?: "1:1" | "4:3" | "3:4" | "16:9" | "9:16";
  /** Soft matte key after download (icons/portraits). */
  maskTransparent?: boolean;
  category?: string;
  tags?: string[];
};

export type GenerateImageResult = {
  id: string;
  ok: boolean;
  provider: ImageProviderId;
  outputRelPath: string;
  /** Absolute filesystem path when written. */
  absolutePath?: string;
  status: "generated" | "queued" | "skipped" | "failed" | "pending_manual";
  message?: string;
  bytes?: number;
};

export type ImageProvider = {
  id: ImageProviderId;
  generate(req: GenerateImageRequest): Promise<GenerateImageResult>;
};

export function resolveImageProviderId(): ImageProviderId {
  const raw = (process.env.IMAGE_PROVIDER ?? "cursor-local").toLowerCase().trim();
  if (raw === "openai" || raw === "replicate" || raw === "cursor-local" || raw === "none") {
    return raw;
  }
  return "cursor-local";
}

export function getImageApiKey(): string | undefined {
  return (
    process.env.IMAGE_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.REPLICATE_API_TOKEN ||
    undefined
  );
}

/** Shared style suffix — original Riftwilds IP; never reference other franchises. */
export const RIFTWILDS_STYLE_SUFFIX =
  "Original Riftwilds IP only — never copy other games or brands. " +
  "Hybrid classic fantasy for a browser MMORPG: warm medieval atmosphere (timber, stone, moss, lived-in town clutter), " +
  "colorful readable silhouettes, soft Diablo-like torch drama at night, clear Zelda-like interaction readability. " +
  "Painterly digital illustration, soft-isometric or top-down game-ready art. " +
  "Palette: earth greens and browns and sandstone first; cyan rift energy and amber hearth as accents only — no purple AI-fantasy default. " +
  "Avoid hyper-realism, anime, voxel, pixel art, and generic asset-store PBR. " +
  "No text, logos, watermarks, or UI chrome in the image.";
