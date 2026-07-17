/**
 * SSE channel for Pet Reward Vault realtime events.
 * Events only fire on verified vault mutations — never timer-fabricated earnings.
 */

import { resolveOwnerKey } from "@/lib/auth/owner-key";
import { getPet } from "@/game/eggs/hatchery-store";
import { assertOwnership } from "@/lib/security/authorization";
import { subscribeVaultEvents } from "@/lib/rewards";
import type { VaultRealtimeEvent } from "@/lib/rewards/types";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

type Params = { params: Promise<{ publicId: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request, { params }: Params) {
  const { publicId } = await params;
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const pet = getPet(publicId);

  if (!featureFlagDefaults.HOLDER_REWARD_VAULT_ENABLED) {
    return new Response("Vault disabled", { status: 503 });
  }
  if (!pet) {
    return new Response("Not found", { status: 404 });
  }

  let isOwner = false;
  try {
    assertOwnership(pet.ownerKey, ownerKey);
    isOwner = true;
  } catch {
    isOwner = false;
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      send({
        type: "connected",
        publicPetId: publicId,
        isOwner,
        at: new Date().toISOString(),
        note: "Estimates update only on verified vault deposits.",
      });

      unsubscribe = subscribeVaultEvents((event: VaultRealtimeEvent) => {
        // Pool / funding / epoch — public
        if (
          event.type === "rewardPoolUpdated" ||
          event.type === "newFundingTransaction" ||
          event.type === "epochClosed"
        ) {
          send(event);
          return;
        }

        // Wallet-scoped estimates / claims — owners only, this pet
        if (event.type === "rewardEstimateUpdated" || event.type === "claimCompleted") {
          if (!isOwner) return;
          if (event.publicPetId !== publicId) return;
          if (event.walletKey !== ownerKey) return;
          send(event);
          return;
        }

        if (event.type === "petEligibilityChanged") {
          if (event.publicPetId === publicId) send(event);
        }
      });

      // Heartbeat keeps the connection alive — does NOT change estimates.
      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: heartbeat\n\n`));
      }, 25_000);

      req.signal.addEventListener("abort", () => {
        if (heartbeat) clearInterval(heartbeat);
        unsubscribe?.();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      unsubscribe?.();
    },
  });

  void isGuest;
  void guestToken;

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
