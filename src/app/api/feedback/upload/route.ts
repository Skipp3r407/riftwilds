import { mkdir } from "fs/promises";
import path from "path";
import {
  FEEDBACK_SCREENSHOT_MAX_COUNT,
  saveFeedbackScreenshot,
} from "@/lib/feedback/screenshots";
import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";

/**
 * Local screenshot intake for bug reports.
 * Stores under public/uploads/feedback/ and returns public URL paths.
 */
export async function POST(req: Request) {
  const guard = await withApiGuard({
    bucket: "feedback-upload",
    limit: 10,
    windowMs: 60_000,
    clientKey: req.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError(
      "Send multipart form data with image files.",
      400,
      "bad_request",
      guard.requestId,
    );
  }

  const files = form
    .getAll("files")
    .filter((v): v is File => typeof File !== "undefined" && v instanceof File);

  if (files.length === 0) {
    return jsonError(
      "Attach at least one PNG, JPG, or WebP screenshot.",
      400,
      "validation_error",
      guard.requestId,
    );
  }
  if (files.length > FEEDBACK_SCREENSHOT_MAX_COUNT) {
    return jsonError(
      `You can upload up to ${FEEDBACK_SCREENSHOT_MAX_COUNT} screenshots.`,
      400,
      "validation_error",
      guard.requestId,
    );
  }

  // Ensure base dir exists even if first save races.
  await mkdir(path.join(process.cwd(), "public", "uploads", "feedback"), {
    recursive: true,
  });

  const urls: string[] = [];
  for (const file of files) {
    const saved = await saveFeedbackScreenshot(file);
    if (!saved.ok) {
      return jsonError(saved.message, 400, "validation_error", guard.requestId);
    }
    urls.push(saved.url);
  }

  console.info("[feedback-upload]", {
    count: urls.length,
    urls,
    requestId: guard.requestId,
  });

  return jsonOk({ urls, message: "Screenshots uploaded." }, guard.requestId);
}
