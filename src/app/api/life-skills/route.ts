import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { lifeSkillsSnapshot, practiceLifeSkill } from "@/lib/life-skills";
import { withApiGuard } from "@/lib/security/api-guard";

const bodySchema = z.object({
  skillId: z.enum([
    "foraging",
    "fishing",
    "cooking",
    "crafting",
    "riftling_care",
    "performance",
    "cartography",
    "gardening",
  ]),
  engaged: z.boolean().default(true),
});

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "life-skills",
    limit: 100,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const res = NextResponse.json({
    requestId: guard.requestId,
    ...lifeSkillsSnapshot(ownerKey),
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "life-skills-practice",
    limit: 80,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const result = practiceLifeSkill({
    userId: ownerKey,
    skillId: parsed.data.skillId,
    engaged: parsed.data.engaged,
    requestId: guard.requestId,
  });
  const res = NextResponse.json({
    ...result,
    requestId: guard.requestId,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
