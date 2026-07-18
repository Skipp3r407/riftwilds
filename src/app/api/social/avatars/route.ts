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
  getAvatarCatalog,
  parseAvatarKey,
  purchaseSpeciesAvatarWithCredits,
  purchaseSpeciesAvatarWithSol,
  setAvatar,
} from "@/lib/social";

const bodySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("pet"),
    petPublicId: z.string().min(1).max(80),
  }),
  z.object({
    kind: z.literal("species"),
    speciesSlug: z.string().min(1).max(80),
  }),
  z.object({
    kind: z.literal("npc"),
    npcSlug: z.string().min(1).max(80),
  }),
  z.object({
    kind: z.literal("lore"),
    characterId: z.string().min(1).max(80),
  }),
  z.object({
    kind: z.literal("brand"),
    brandId: z.string().min(1).max(40).optional(),
  }),
  z.object({
    kind: z.literal("key"),
    key: z.string().min(3).max(120),
  }),
  z.object({
    kind: z.literal("purchase_credits"),
    speciesSlug: z.string().min(1).max(80),
    requestId: z.string().min(4).max(120).optional(),
  }),
  z.object({
    kind: z.literal("purchase_sol"),
    speciesSlug: z.string().min(1).max(80),
    requestId: z.string().min(4).max(120).optional(),
  }),
]);

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-avatars-get",
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
  const catalog = getAvatarCatalog(owner.ownerKey);

  const res = NextResponse.json({
    ok: true,
    requestId: guard.requestId,
    enabled: true,
    ...catalog,
    ...guestIdentityFields(owner.isGuest, owner.guestToken),
  });
  if (owner.isGuest) attachGuestCookie(res, owner.guestToken);
  return res;
}

export async function POST(request: Request) {
  const owner = await resolvePersistenceOwner();
  const guard = await withApiGuard({
    bucket: "social-avatars-post",
    limit: 40,
    windowMs: 60_000,
    clientKey: owner.ownerKey,
    actorId: owner.userId,
    auditAction: "social_avatar_set",
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

  ensureSocialProfile(owner.ownerKey);

  const body = parsed.data;

  if (body.kind === "purchase_credits") {
    const result = purchaseSpeciesAvatarWithCredits({
      ownerKey: owner.ownerKey,
      speciesSlug: body.speciesSlug,
      requestId: body.requestId ?? `avatar-credits:${owner.ownerKey}:${body.speciesSlug}:${guard.requestId}`,
    });
    if (!result.ok) {
      const status =
        result.error === "insufficient_credits"
          ? 402
          : result.error === "already_unlocked"
            ? 409
            : result.error === "not_found"
              ? 404
              : 400;
      return jsonError(result.message, status, result.error, guard.requestId);
    }
    const res = jsonOk(
      {
        purchased: true,
        method: "credits",
        key: result.key,
        balance: result.balance,
        profile: result.profile,
        catalog: getAvatarCatalog(owner.ownerKey),
        ...guestIdentityFields(owner.isGuest, owner.guestToken),
      },
      guard.requestId,
    );
    if (owner.isGuest) attachGuestCookie(res, owner.guestToken);
    return res;
  }

  if (body.kind === "purchase_sol") {
    const result = purchaseSpeciesAvatarWithSol({
      ownerKey: owner.ownerKey,
      speciesSlug: body.speciesSlug,
      requestId: body.requestId ?? `avatar-sol:${owner.ownerKey}:${body.speciesSlug}:${guard.requestId}`,
    });
    if (!result.ok) {
      const status =
        result.error === "sol_coming_soon"
          ? 503
          : result.error === "already_unlocked"
            ? 409
            : result.error === "not_found"
              ? 404
              : 400;
      return jsonError(result.message, status, result.error, guard.requestId);
    }
    const res = jsonOk(
      {
        purchased: true,
        method: "sol",
        key: result.key,
        note: result.note,
        profile: result.profile,
        catalog: getAvatarCatalog(owner.ownerKey),
        ...guestIdentityFields(owner.isGuest, owner.guestToken),
      },
      guard.requestId,
    );
    if (owner.isGuest) attachGuestCookie(res, owner.guestToken);
    return res;
  }

  const input =
    body.kind === "key"
      ? parseAvatarKey(body.key)
      : body.kind === "pet"
        ? { kind: "pet" as const, petPublicId: body.petPublicId }
        : body.kind === "species"
          ? { kind: "species" as const, speciesSlug: body.speciesSlug }
          : body.kind === "npc"
            ? { kind: "npc" as const, npcSlug: body.npcSlug }
            : body.kind === "lore"
              ? { kind: "lore" as const, characterId: body.characterId }
              : { kind: "brand" as const, brandId: body.brandId };

  if (!input) {
    return jsonError("Unrecognized avatar key.", 400, "validation_error", guard.requestId);
  }

  const result = setAvatar(owner.ownerKey, input);
  if (!result.ok) {
    const status =
      result.error === "not_owned" ? 403 : result.error === "locked" ? 403 : 404;
    return jsonError(result.message, status, result.error, guard.requestId);
  }

  const res = jsonOk(
    {
      profile: result.profile,
      key: result.key,
      src: result.src,
      catalog: getAvatarCatalog(owner.ownerKey),
      ...guestIdentityFields(owner.isGuest, owner.guestToken),
    },
    guard.requestId,
  );
  if (owner.isGuest) attachGuestCookie(res, owner.guestToken);
  return res;
}
