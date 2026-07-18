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
  acceptFriendRequest,
  blockPlayer,
  declineFriendRequest,
  ensureSocialProfile,
  getSocialHubData,
  listFriendRequests,
  listFriends,
  partyInviteStub,
  removeFriend,
  reportPlayer,
  resolveOwnerByHandle,
  sendFriendRequest,
  parseAvatarKey,
  setAvatar,
  setDisplayName,
  setHandle,
  setMessagePrivacy,
  unblockPlayer,
} from "@/lib/social";

const bodySchema = z.object({
  action: z.enum([
    "request",
    "accept",
    "decline",
    "cancel",
    "remove",
    "block",
    "unblock",
    "report",
    "party_invite",
    "set_handle",
    "set_display_name",
    "set_privacy",
    "set_avatar",
  ]),
  handle: z.string().min(1).max(40).optional(),
  peerOwnerKey: z.string().min(1).max(80).optional(),
  requestId: z.string().min(1).max(80).optional(),
  note: z.string().max(120).optional(),
  reason: z.string().max(120).optional(),
  details: z.string().max(400).optional(),
  displayName: z.string().min(2).max(32).optional(),
  messagePrivacy: z.enum(["friends_only", "anyone"]).optional(),
  /** Avatar selection — prefer `avatarKey` (`pet:…` / `npc:…` / …). */
  avatarKey: z.string().min(3).max(120).optional(),
  avatarKind: z.enum(["pet", "npc", "lore", "brand"]).optional(),
  petPublicId: z.string().min(1).max(80).optional(),
  npcSlug: z.string().min(1).max(80).optional(),
  characterId: z.string().min(1).max(80).optional(),
  brandId: z.string().min(1).max(40).optional(),
});

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-friends-get",
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
  const view = url.searchParams.get("view");

  const payload =
    view === "requests"
      ? { requests: listFriendRequests(owner.ownerKey) }
      : view === "summary"
        ? { hub: getSocialHubData(owner.ownerKey) }
        : {
            friends: listFriends(owner.ownerKey),
            requests: listFriendRequests(owner.ownerKey),
            hub: getSocialHubData(owner.ownerKey),
          };

  const res = NextResponse.json({
    ok: true,
    requestId: guard.requestId,
    enabled: true,
    prismaReady: featureFlagDefaults.FRIENDS_AND_PM_PRISMA_ENABLED,
    ...payload,
    ...guestIdentityFields(owner.isGuest, owner.guestToken),
  });
  if (owner.isGuest) attachGuestCookie(res, owner.guestToken);
  return res;
}

export async function POST(request: Request) {
  const owner = await resolvePersistenceOwner();
  const guard = await withApiGuard({
    bucket: "social-friends-post",
    limit: 40,
    windowMs: 60_000,
    clientKey: owner.ownerKey,
    actorId: owner.userId,
    auditAction: "social_friends_mutation",
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

  let result:
    | { ok: true; [key: string]: unknown }
    | { ok: false; error: string; message: string };

  switch (body.action) {
    case "request":
      if (!body.handle) {
        return jsonError("handle required.", 400, "validation_error", guard.requestId);
      }
      result = sendFriendRequest({
        fromOwnerKey: owner.ownerKey,
        toHandleOrKey: body.handle,
        note: body.note,
      });
      break;
    case "accept":
      if (!body.requestId) {
        return jsonError("requestId required.", 400, "validation_error", guard.requestId);
      }
      result = acceptFriendRequest({
        actorOwnerKey: owner.ownerKey,
        requestId: body.requestId,
      });
      break;
    case "decline":
    case "cancel":
      if (!body.requestId) {
        return jsonError("requestId required.", 400, "validation_error", guard.requestId);
      }
      result = declineFriendRequest({
        actorOwnerKey: owner.ownerKey,
        requestId: body.requestId,
      });
      break;
    case "remove":
      if (!body.peerOwnerKey && !body.handle) {
        return jsonError("peerOwnerKey or handle required.", 400, "validation_error", guard.requestId);
      }
      {
        const peer =
          body.peerOwnerKey ??
          (body.handle ? resolveOwnerByHandle(body.handle)?.ownerKey : null);
        if (!peer) {
          return jsonError("Keeper not found.", 404, "not_found", guard.requestId);
        }
        result = removeFriend({ actorOwnerKey: owner.ownerKey, peerOwnerKey: peer });
      }
      break;
    case "block":
      if (!body.handle && !body.peerOwnerKey) {
        return jsonError("handle or peerOwnerKey required.", 400, "validation_error", guard.requestId);
      }
      result = blockPlayer({
        actorOwnerKey: owner.ownerKey,
        peerHandleOrKey: body.handle ?? body.peerOwnerKey!,
        reason: body.reason,
      });
      break;
    case "unblock":
      if (!body.peerOwnerKey) {
        return jsonError("peerOwnerKey required.", 400, "validation_error", guard.requestId);
      }
      result = unblockPlayer({
        actorOwnerKey: owner.ownerKey,
        peerOwnerKey: body.peerOwnerKey,
      });
      break;
    case "report":
      if (!body.handle && !body.peerOwnerKey) {
        return jsonError("handle or peerOwnerKey required.", 400, "validation_error", guard.requestId);
      }
      result = reportPlayer({
        reporterOwnerKey: owner.ownerKey,
        targetHandleOrKey: body.handle ?? body.peerOwnerKey!,
        reason: body.reason ?? "player_report",
        details: body.details,
      });
      break;
    case "party_invite":
      if (!body.handle && !body.peerOwnerKey) {
        return jsonError("handle or peerOwnerKey required.", 400, "validation_error", guard.requestId);
      }
      result = partyInviteStub({
        actorOwnerKey: owner.ownerKey,
        peerHandleOrKey: body.handle ?? body.peerOwnerKey!,
      });
      break;
    case "set_handle":
      if (!body.handle) {
        return jsonError("handle required.", 400, "validation_error", guard.requestId);
      }
      result = setHandle(owner.ownerKey, body.handle);
      break;
    case "set_display_name":
      if (!body.displayName) {
        return jsonError("displayName required.", 400, "validation_error", guard.requestId);
      }
      result = { ok: true, profile: setDisplayName(owner.ownerKey, body.displayName) };
      break;
    case "set_privacy":
      if (!body.messagePrivacy) {
        return jsonError("messagePrivacy required.", 400, "validation_error", guard.requestId);
      }
      result = {
        ok: true,
        profile: setMessagePrivacy(owner.ownerKey, body.messagePrivacy),
      };
      break;
    case "set_avatar": {
      const fromKey = body.avatarKey ? parseAvatarKey(body.avatarKey) : null;
      const input =
        fromKey ??
        (body.avatarKind === "pet" && body.petPublicId
          ? { kind: "pet" as const, petPublicId: body.petPublicId }
          : body.avatarKind === "npc" && body.npcSlug
            ? { kind: "npc" as const, npcSlug: body.npcSlug }
            : body.avatarKind === "lore" && body.characterId
              ? { kind: "lore" as const, characterId: body.characterId }
              : body.avatarKind === "brand"
                ? { kind: "brand" as const, brandId: body.brandId }
                : null);
      if (!input) {
        return jsonError(
          "avatarKey or avatarKind + id required.",
          400,
          "validation_error",
          guard.requestId,
        );
      }
      result = setAvatar(owner.ownerKey, input);
      break;
    }
    default:
      return jsonError("Unknown action.", 400, "validation_error", guard.requestId);
  }

  if (!result.ok) {
    const status =
      result.error === "not_found"
        ? 404
        : result.error === "forbidden"
          ? 403
          : result.error === "rate_limited"
            ? 429
            : 400;
    return jsonError(result.message, status, result.error, guard.requestId);
  }

  const res = jsonOk(
    {
      ...result,
      hub: getSocialHubData(owner.ownerKey),
      ...guestIdentityFields(owner.isGuest, owner.guestToken),
    },
    guard.requestId,
  );
  if (owner.isGuest) attachGuestCookie(res, owner.guestToken);
  return res;
}
