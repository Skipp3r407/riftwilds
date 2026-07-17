import { NextResponse } from "next/server";
import { attachGuestCookie, resolveOwnerKey } from "@/lib/auth/owner-key";
import { getPet, petCareSummary } from "@/game/eggs/hatchery-store";
import { assertOwnership } from "@/lib/security/authorization";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  claimPetRewards,
  flagsFromPetCondition,
  getPetRewardVaultView,
  registerPetForRewards,
} from "@/lib/rewards";
import { createRequestId } from "@/lib/utils/request-id";
import { lamportsToSolString } from "@/lib/items/lamports";

type Params = { params: Promise<{ publicId: string }> };

export async function POST(_req: Request, { params }: Params) {
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

  if (!featureFlagDefaults.REWARD_CLAIMS_ENABLED) {
    const res = NextResponse.json(
      {
        requestId,
        error: "CLAIMS_DISABLED",
        message:
          "Reward claims are feature-flagged off (REWARD_CLAIMS_ENABLED). On-chain settlement is not active.",
      },
      { status: 403 },
    );
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  const summary = petCareSummary(pet);
  registerPetForRewards({
    publicPetId: publicId,
    petName: pet.name,
    walletKey: ownerKey,
    careScore: summary.careScore,
    ...flagsFromPetCondition(pet.condition),
    ownershipHours: Math.max(0, (Date.now() - new Date(pet.createdAt).getTime()) / 3_600_000),
    meetsMinTokenBalance: true,
    petSelectedForRewards: true,
  });

  const result = claimPetRewards({ publicPetId: publicId, walletKey: ownerKey });
  if (!result.ok) {
    const res = NextResponse.json({ requestId, error: result.reason }, { status: 400 });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  const vault = getPetRewardVaultView({
    publicPetId: publicId,
    viewerWalletKey: ownerKey,
    isOwner: true,
  });

  const res = NextResponse.json({
    requestId,
    ok: true,
    claimedLamports: result.claimedLamports.toString(),
    claimedSol: lamportsToSolString(result.claimedLamports),
    celebrationStyle: result.celebrationStyle,
    chainWrite: result.chainWrite,
    txSignature: result.txSignature,
    vault,
    message: result.chainWrite
      ? "Claim recorded with settlement shell."
      : "Claim recorded locally. On-chain transfer remains flagged off.",
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
