export const FEEDBACK_SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024;
export const FEEDBACK_SCREENSHOT_MAX_COUNT = 3;

export const FEEDBACK_SCREENSHOT_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type FeedbackScreenshotMime = (typeof FEEDBACK_SCREENSHOT_MIME)[number];

/** Relative public URL pattern for stored feedback screenshots. */
export const feedbackScreenshotUrlSchema =
  /^\/uploads\/feedback\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp)$/i;

export function isAllowedScreenshotMime(mime: string): mime is FeedbackScreenshotMime {
  return (FEEDBACK_SCREENSHOT_MIME as readonly string[]).includes(mime);
}
