import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { equipItem, unequipSlot } from "@/lib/equipment/loadout-store";
import { EQUIPMENT_SLOT_KEYS, type EquipmentSlotKey } from "@/lib/equipment/types";

type Params = { params: Promise<{ publicId: string }> };

const slotSchema = z
  .string()
  .refine((s): s is EquipmentSlotKey => (EQUIPMENT_SLOT_KEYS as string[]).includes(s), {
    message: "Invalid equipment slot",
  });

const equipSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("equip"),
    itemId: z.string().min(1).max(128),
    slot: slotSchema.optional(),
    inCombat: z.boolean().optional(),
    inCutscene: z.boolean().optional(),
    otherPlayer: z.boolean().optional(),
  }),
  z.object({
    action: z.literal("unequip"),
    slot: slotSchema,
    inCombat: z.boolean().optional(),
    inCutscene: z.boolean().optional(),
    otherPlayer: z.boolean().optional(),
  }),
]);

export async function POST(req: Request, { params }: Params) {
  const { publicId } = await params;
  const parsed = equipSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY", details: parsed.error.flatten() }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const safety = {
    inCombat: parsed.data.inCombat ?? false,
    inCutscene: parsed.data.inCutscene ?? false,
    otherPlayer: parsed.data.otherPlayer ?? false,
    actorIsOwner: !(parsed.data.otherPlayer ?? false),
  };

  const result =
    parsed.data.action === "equip"
      ? equipItem({
          ownerKey,
          publicPetId: publicId,
          itemId: parsed.data.itemId,
          slot: parsed.data.slot,
          safety,
        })
      : unequipSlot({
          ownerKey,
          publicPetId: publicId,
          slot: parsed.data.slot,
          safety,
        });

  if (!result.ok) {
    const status =
      result.reason === "NOT_OWNED" ||
      result.reason === "PET_NOT_OWNED" ||
      result.reason === "OTHER_PLAYER"
        ? 403
        : result.reason === "PET_NOT_FOUND" || result.reason === "ITEM_NOT_FOUND"
          ? 404
          : result.reason === "SAFETY_BLOCKED"
            ? 423
            : 400;
    const res = NextResponse.json(
      {
        ok: false,
        error: result.reason,
        message: result.message,
        ...guestIdentityFields(isGuest, guestToken),
      },
      { status },
    );
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  const res = NextResponse.json({
    ok: true,
    loadout: result.loadout,
    appearance: result.appearance,
    bound: result.bound ?? false,
    message: result.message,
    revision: result.loadout.revision,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
