import { NextResponse } from "next/server";
import { z } from "zod";
import {
  attachGuestCookie,
  guestIdentityFields,
} from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { resolvePersistenceOwner } from "@/lib/persistence/owner-resolve";
import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import {
  ensureSocialProfile,
  getSocialSummary,
  listDmThreads,
  listThreadMessages,
  markThreadRead,
  sendPrivateMessage,
} from "@/lib/social";

const bodySchema = z.object({
  action: z.enum(["send", "mark_read"]),
  handle: z.string().min(1).max(40).optional(),
  peerOwnerKey: z.string().min(1).max(80).optional(),
  threadId: z.string().min(1).max(80).optional(),
  body: z.string().min(1).max(500).optional(),
});

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-messages-get",
    limit: 90,
    windowMs: 60_000,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.FRIENDS_AND_PM_ENABLED) {
    return NextResponse.json({
      ok: false,
      enabled: false,
      requestId: guard.requestId,
      error: "disabled",
      message: "Friends & PM paused by FRIENDS_AND_PM_ENABLED.",
    });
  }

  const owner = await resolvePersistenceOwner();
  ensureSocialProfile(owner.ownerKey);
  const url = new URL(request.url);
  const threadId = url.searchParams.get("threadId");

  if (threadId) {
    const detail = listThreadMessages({
      actorOwnerKey: owner.ownerKey,
      threadId,
      markRead: url.searchParams.get("markRead") !== "0",
    });
    if (!detail.ok) {
      return jsonError(detail.message, 404, detail.error, guard.requestId);
    }
    const res = NextResponse.json({
      ok: true,
      requestId: guard.requestId,
      enabled: true,
      thread: detail.thread,
      messages: detail.messages,
      summary: getSocialSummary(owner.ownerKey),
      ...guestIdentityFields(owner.isGuest, owner.guestToken),
    });
    if (owner.isGuest) attachGuestCookie(res, owner.guestToken);
    return res;
  }

  const res = NextResponse.json({
    ok: true,
    requestId: guard.requestId,
    enabled: true,
    threads: listDmThreads(owner.ownerKey),
    summary: getSocialSummary(owner.ownerKey),
    ...guestIdentityFields(owner.isGuest, owner.guestToken),
  });
  if (owner.isGuest) attachGuestCookie(res, owner.guestToken);
  return res;
}

export async function POST(request: Request) {
  const owner = await resolvePersistenceOwner();
  const guard = await withApiGuard({
    bucket: "social-messages-post",
    limit: 30,
    windowMs: 60_000,
    clientKey: owner.ownerKey,
    actorId: owner.userId,
    auditAction: "social_messages_mutation",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.FRIENDS_AND_PM_ENABLED) {
    return jsonError(
      "Friends & PM paused by FRIENDS_AND_PM_ENABLED.",
      503,
      "disabled",
      guard.requestId,
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400, "bad_request", guard.requestId);
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError("Invalid request body.", 400, "validation_error", guard.requestId);
  }

  const body = parsed.data;
  ensureSocialProfile(owner.ownerKey);

  if (body.action === "mark_read") {
    if (!body.threadId) {
      return jsonError("threadId required.", 400, "validation_error", guard.requestId);
    }
    const result = markThreadRead({
      actorOwnerKey: owner.ownerKey,
      threadId: body.threadId,
    });
    if (!result.ok) {
      return jsonError(result.message, 404, result.error, guard.requestId);
    }
    const res = jsonOk(
      {
        threads: listDmThreads(owner.ownerKey),
        summary: getSocialSummary(owner.ownerKey),
        ...guestIdentityFields(owner.isGuest, owner.guestToken),
      },
      guard.requestId,
    );
    if (owner.isGuest) attachGuestCookie(res, owner.guestToken);
    return res;
  }

  const target = body.handle ?? body.peerOwnerKey;
  if (!target || !body.body) {
    return jsonError("handle/peerOwnerKey and body required.", 400, "validation_error", guard.requestId);
  }

  const result = sendPrivateMessage({
    fromOwnerKey: owner.ownerKey,
    toHandleOrKey: target,
    body: body.body,
  });
  if (!result.ok) {
    const status =
      result.error === "not_found"
        ? 404
        : result.error === "rate_limited"
          ? 429
          : result.error === "friends_only" || result.error === "blocked"
            ? 403
            : 400;
    return jsonError(result.message, status, result.error, guard.requestId);
  }

  const detail = listThreadMessages({
    actorOwnerKey: owner.ownerKey,
    threadId: result.threadId,
    markRead: true,
  });

  const res = jsonOk(
    {
      message: result.message,
      threadId: result.threadId,
      thread: detail.ok ? detail.thread : null,
      messages: detail.ok ? detail.messages : [result.message],
      threads: listDmThreads(owner.ownerKey),
      summary: getSocialSummary(owner.ownerKey),
      ...guestIdentityFields(owner.isGuest, owner.guestToken),
    },
    guard.requestId,
  );
  if (owner.isGuest) attachGuestCookie(res, owner.guestToken);
  return res;
}
