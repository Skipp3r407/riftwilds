import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  FEEDBACK_SCREENSHOT_MAX_BYTES,
  isAllowedScreenshotMime,
  type FeedbackScreenshotMime,
} from "@/lib/feedback/screenshot-limits";

export {
  FEEDBACK_SCREENSHOT_MAX_BYTES,
  FEEDBACK_SCREENSHOT_MAX_COUNT,
  FEEDBACK_SCREENSHOT_MIME,
  feedbackScreenshotUrlSchema,
  isAllowedScreenshotMime,
  type FeedbackScreenshotMime,
} from "@/lib/feedback/screenshot-limits";

const EXT_BY_MIME: Record<FeedbackScreenshotMime, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const PUBLIC_PREFIX = "/uploads/feedback";

function sniffMime(buf: Buffer): FeedbackScreenshotMime | null {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return "image/png";
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export type SaveScreenshotResult =
  | { ok: true; url: string; bytes: number; mime: FeedbackScreenshotMime }
  | { ok: false; message: string };

/**
 * Validate and persist one screenshot under public/uploads/feedback/.
 * Returns a public URL path (e.g. /uploads/feedback/abc.png).
 */
export async function saveFeedbackScreenshot(
  file: File,
): Promise<SaveScreenshotResult> {
  if (!file || typeof file.size !== "number") {
    return { ok: false, message: "Missing screenshot file." };
  }
  if (file.size <= 0) {
    return { ok: false, message: "Screenshot file is empty." };
  }
  if (file.size > FEEDBACK_SCREENSHOT_MAX_BYTES) {
    return {
      ok: false,
      message: `Each screenshot must be under ${Math.round(FEEDBACK_SCREENSHOT_MAX_BYTES / (1024 * 1024))}MB.`,
    };
  }

  const declared = (file.type || "").toLowerCase();
  if (declared && !isAllowedScreenshotMime(declared)) {
    return {
      ok: false,
      message: "Screenshots must be PNG, JPG, or WebP.",
    };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffMime(buf);
  if (!sniffed) {
    return {
      ok: false,
      message: "Couldn’t read that image — use PNG, JPG, or WebP.",
    };
  }
  if (declared && declared !== sniffed) {
    return {
      ok: false,
      message: "File type didn’t match the image contents.",
    };
  }

  const ext = EXT_BY_MIME[sniffed];
  const id = `${Date.now().toString(36)}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const filename = `${id}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "feedback");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buf);

  return {
    ok: true,
    url: `${PUBLIC_PREFIX}/${filename}`,
    bytes: buf.length,
    mime: sniffed,
  };
}
