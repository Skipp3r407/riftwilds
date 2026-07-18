import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import {
  activatePreset,
  getActiveLoadout,
  getAppearance,
  listCompatibleOwned,
  listPresets,
} from "@/lib/equipment/loadout-store";
import { listOwnedItems } from "@/lib/equipment/inventory-store";
import { LOADOUT_PRESET_NAMES } from "@/lib/equipment/types";
import { toPrismaLoadoutKeys } from "@/lib/equipment/compatibility";

type Params = { params: Promise<{ publicId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { publicId } = await params;
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const loadout = getActiveLoadout(ownerKey, publicId);
  const appearance = getAppearance(ownerKey, publicId);
  const compatible = listCompatibleOwned({ ownerKey, publicPetId: publicId });
  const presets = listPresets(ownerKey, publicId).map((p) => ({
    name: p.presetName,
    active: p.active,
    revision: p.revision,
    slots: p.slots,
  }));

  const res = NextResponse.json({
    publicPetId: publicId,
    loadout: {
      ...loadout,
      prismaKeys: toPrismaLoadoutKeys(loadout.slots),
    },
    appearance,
    ownedEquippable: compatible,
    inventoryCount: listOwnedItems(ownerKey).length,
    presets,
    presetNames: LOADOUT_PRESET_NAMES,
    neverRequiresSol: true,
    rankedNote: "Cosmetics stay visible in ranked; paid gear power is normalized.",
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

const activateSchema = z.object({
  action: z.literal("activate_preset"),
  presetName: z.string().min(1).max(64),
});

export async function POST(req: Request, { params }: Params) {
  const { publicId } = await params;
  const parsed = activateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const loadout = activatePreset(ownerKey, publicId, parsed.data.presetName);
  const appearance = getAppearance(ownerKey, publicId);
  const res = NextResponse.json({
    ok: true,
    loadout,
    appearance,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
