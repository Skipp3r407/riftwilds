import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  eggTypeLabel,
  getHatcheryOfferStatus,
  grantGameplayEgg,
} from "@/game/eggs/hatchery-store";
import {
  EGG_EARN_PATHS,
  QUEST_EGG_REWARD_KEYS,
  type EggEarnPathKey,
} from "@/game/eggs/earn-paths";

const bodySchema = z.object({
  /** Earn path key from EGG_EARN_PATHS (not STARTER_CLAIM / SHOP_CREDITS). */
  path: z.enum([
    "QUEST",
    "BOSS",
    "LOGIN",
    "GUILD",
    "BATTLE_PASS",
    "EXPLORATION",
    "EVENT",
    "ACHIEVEMENT",
    "BREEDING",
  ]),
  /** Optional quest catalog key for mapped egg types. */
  questKey: z.string().min(2).max(80).optional(),
  requestId: z.string().min(4).max(96).optional(),
});

const grantedByRequest = new Map<string, string>();

/**
 * POST — grant an egg from a gameplay earn path.
 * Never requires wallet / SOL / $RIFT. Not a paid gacha.
 */
export async function POST(req: Request) {
  if (!isFeatureEnabled("EGG_SYSTEM_ENABLED")) {
    return NextResponse.json({ error: "EGG_SYSTEM_DISABLED" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const pathKey = parsed.data.path as EggEarnPathKey;
  const pathDef = EGG_EARN_PATHS.find((p) => p.key === pathKey);
  if (!pathDef || pathDef.walletRequired) {
    return NextResponse.json({ error: "PATH_NOT_ALLOWED" }, { status: 400 });
  }

  const requestId =
    parsed.data.requestId ??
    `earn:${ownerKey}:${pathKey}:${parsed.data.questKey ?? "none"}`;
  const prior = grantedByRequest.get(requestId);
  if (prior) {
    const res = NextResponse.json({
      ok: true,
      replay: true,
      eggPublicId: prior,
      offer: getHatcheryOfferStatus(ownerKey),
      ...guestIdentityFields(isGuest, guestToken),
    });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  const questMap = parsed.data.questKey
    ? QUEST_EGG_REWARD_KEYS[parsed.data.questKey]
    : undefined;
  const eggType = questMap?.eggType ?? pathDef.defaultEggType;

  try {
    const egg = grantGameplayEgg(ownerKey, {
      creationSource: pathDef.creationSource as
        | "QUEST"
        | "ACHIEVEMENT"
        | "LOGIN"
        | "GUILD"
        | "BATTLE_PASS"
        | "EXPLORATION"
        | "EVENT"
        | "BREEDING",
      eggType,
    });
    grantedByRequest.set(requestId, egg.publicId);
    const res = NextResponse.json({
      ok: true,
      egg: { ...egg, eggTypeLabel: eggTypeLabel(egg.eggType) },
      path: pathDef,
      offer: getHatcheryOfferStatus(ownerKey),
      messaging: [
        "Egg earned through gameplay — no wallet required.",
        "Outcomes are rolled at hatch; nothing is a guaranteed earnings promise.",
      ],
      demo: true,
      ...guestIdentityFields(isGuest, guestToken),
    });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "GRANT_FAILED";
    const res = NextResponse.json(
      { error: msg, ...guestIdentityFields(isGuest, guestToken) },
      { status: 400 },
    );
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }
}

export async function GET() {
  return NextResponse.json({
    paths: EGG_EARN_PATHS,
    questEggRewards: QUEST_EGG_REWARD_KEYS,
    walletRequired: false,
    freeToPlay: true,
  });
}
