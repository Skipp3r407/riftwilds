import { NextResponse } from "next/server";
import { parseFeedbackSubmission } from "@/lib/feedback/schema";
import { storeFeedback } from "@/lib/feedback/store";
import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { recordAudit } from "@/lib/security/audit-log";

/**
 * Public feedback / bug report intake.
 * No wallet required. Persists to in-memory ring buffer + console stub
 * until Prisma PlayerFeedback migration is approved.
 */
export async function POST(req: Request) {
  const guard = await withApiGuard({
    bucket: "feedback",
    limit: 5,
    windowMs: 60_000,
    clientKey: req.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError("Send a JSON body with your report.", 400, "bad_request", guard.requestId);
  }

  const parsed = parseFeedbackSubmission(raw);
  if (!parsed.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "validation_error",
        message: parsed.message,
        fieldErrors: parsed.fieldErrors,
        requestId: guard.requestId,
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
          "X-Request-Id": guard.requestId,
        },
      },
    );
  }

  // Honeypot: pretend success so bots don't learn.
  if (parsed.honeypotFilled) {
    return jsonOk(
      { message: "Thanks — we received your report." },
      guard.requestId,
    );
  }

  const { website: _hp, ...payload } = parsed.data;
  const userAgent = req.headers.get("user-agent");

  const stored = storeFeedback({
    kind: payload.kind,
    payload,
    userAgent,
    requestId: guard.requestId,
  });

  const emailHint = payload.email
    ? payload.email.replace(/(^.).*(@.*$)/, "$1***$2")
    : null;

  console.info("[feedback-stub]", {
    id: stored.id,
    kind: payload.kind,
    email: emailHint,
    category: payload.kind === "feedback" ? payload.category : undefined,
    severity: payload.kind === "bug" ? payload.severity : undefined,
    title: payload.kind === "bug" ? payload.title : undefined,
    source: payload.source ?? "unknown",
    at: stored.createdAt,
    requestId: guard.requestId,
  });

  recordAudit({
    actorId: null,
    action: "feedback_submitted",
    entityType: "feedback",
    entityId: stored.id,
    requestId: guard.requestId,
    metadata: {
      kind: payload.kind,
      category: payload.kind === "feedback" ? payload.category : undefined,
      severity: payload.kind === "bug" ? payload.severity : undefined,
    },
  });

  return jsonOk(
    {
      message:
        payload.kind === "bug"
          ? "Thanks — your bug report is in. We’ll use it to improve Riftwilds."
          : "Thanks — your feedback is in. We’ll use it to improve Riftwilds.",
      id: stored.id,
    },
    guard.requestId,
  );
}
