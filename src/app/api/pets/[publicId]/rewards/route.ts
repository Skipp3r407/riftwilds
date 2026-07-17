import { NextResponse } from "next/server";
import { attachGuestCookie, resolveOwnerKey } from "@/lib/auth/owner-key";
import { getPet, petCareSummary } from "@/game/eggs/hatchery-store";
import { assertOwnership } from "@/lib/security/authorization";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  flagsFromPetCondition,
  getPetRewardVaultView,
  registerPetForRewards,
  setPetRewardSelection,
} from "@/lib/rewards";
import { createRequestId } from "@/lib/utils/request-id";

type Params = { params: Promise<{ publicId: string }> };

function syncPetRegistration(
  publicId: string,
  ownerKey: string,
  pet: NonNullable<ReturnType<typeof getPet>>,
) {
  const summary = petCareSummary(pet);
  const flags = flagsFromPetCondition(pet.condition);
  const ownershipHours = Math.max(
    0,
    (Date.now() - new Date(pet.createdAt).getTime()) / 3_600_000,
  );
  const existing = getPetRewardVaultView({
    publicPetId: publicId,
    viewerWalletKey: ownerKey,
    isOwner: true,
  });
  // Preserve explicit selection; only default from care hint on first register.
  const selected =
    existing != null
      ? !existing.inactiveReasons.includes("not_selected")
      : summary.rewardEligibleHint;

  return registerPetForRewards({
    publicPetId: publicId,
    petName: pet.name,
    walletKey: ownerKey,
    careScore: summary.careScore,
    ...flags,
    isListedForSale: false,
    ownershipHours,
    meetsMinTokenBalance: true,
    petSelectedForRewards: selected,
    tokenHoldHours: 0,
    walletBlocked: false,
    transferredRecently: false,
  });
}

export async function GET(_req: Request, { params }: Params) {
  const requestId = createRequestId();
  const { publicId } = await params;
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const pet = getPet(publicId);
  if (!pet) {
    return NextResponse.json({ requestId, error: "PET_NOT_FOUND" }, { status: 404 });
  }

  let isOwner = false;
  try {
    assertOwnership(pet.ownerKey, ownerKey);
    isOwner = true;
  } catch {
    isOwner = false;
  }

  if (!featureFlagDefaults.HOLDER_REWARD_VAULT_ENABLED) {
    const res = NextResponse.json({
      requestId,
      error: "VAULT_DISABLED",
      message: "Community Reward Treasury / Pet Reward system is disabled by feature flag.",
    }, { status: 503 });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  if (isOwner) {
    syncPetRegistration(publicId, ownerKey, pet);
  } else {
    // Public read: register a shell only if missing — never clobber owner eligibility.
    const existing = getPetRewardVaultView({
      publicPetId: publicId,
      viewerWalletKey: null,
      isOwner: false,
    });
    if (!existing) {
      registerPetForRewards({
        publicPetId: publicId,
        petName: pet.name,
        walletKey: pet.ownerKey,
        careScore: petCareSummary(pet).careScore,
        ...flagsFromPetCondition(pet.condition),
        petSelectedForRewards: false,
        meetsMinTokenBalance: false,
      });
    }
  }

  const view = getPetRewardVaultView({
    publicPetId: publicId,
    viewerWalletKey: isOwner ? ownerKey : null,
    isOwner,
  });

  if (!view) {
    return NextResponse.json({ requestId, error: "VAULT_VIEW_UNAVAILABLE" }, { status: 404 });
  }

  const res = NextResponse.json({ requestId, vault: view });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

export async function POST(req: Request, { params }: Params) {
  const requestId = createRequestId();
  const { publicId } = await params;
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const pet = getPet(publicId);
  if (!pet) {
    return NextResponse.json({ requestId, error: "PET_NOT_FOUND" }, { status: 404 });
  }
  try {
    assertOwnership(pet.ownerKey, ownerKey);
  } catch {
    return NextResponse.json({ requestId, error: "FORBIDDEN" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { action?: string; selected?: boolean };
  syncPetRegistration(publicId, ownerKey, pet);

  if (body.action === "select" && typeof body.selected === "boolean") {
    setPetRewardSelection(publicId, body.selected);
  }

  const view = getPetRewardVaultView({
    publicPetId: publicId,
    viewerWalletKey: ownerKey,
    isOwner: true,
  });

  const res = NextResponse.json({ requestId, vault: view });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
