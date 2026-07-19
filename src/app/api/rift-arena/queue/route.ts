import { NextResponse } from "next/server";
import { z } from "zod";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { assertMatchmakingOpen } from "@/game/rift-arena/admin-config";
import {
  cancelFreePlay,
  enqueueFreePlay,
  freeQueueSize,
  tryPairFreePlay,
} from "@/game/rift-arena/free-queue";
import {
  getActiveCommanderHeroId,
  getActiveDeckList,
} from "@/game/tcg/collection-store";
import {
  materializeDeck,
  validateContentDeckList,
  validateDeckList,
} from "@/game/tcg/deck";
import {
  attachGuestToLobby,
  markLobbyStarted,
} from "@/game/tcg/invite-store";
import { startPrivateTcgMatch } from "@/game/tcg/match-store";
import {
  attachTcgGuestCookie,
  resolveTcgOwnerKey,
} from "@/game/tcg/owner-key";

const bodySchema = z.object({
  action: z.enum(["enqueue", "cancel"]),
  displayName: z.string().min(1).max(40).optional(),
  ticketId: z.string().min(4).max(48).optional(),
});

function resolveDeck(ownerKey: string) {
  const deckList = getActiveDeckList(ownerKey);
  const constructed = validateDeckList(deckList);
  const valid = constructed.ok ? constructed : validateContentDeckList(deckList);
  if (!valid.ok) return null;
  return {
    deck: materializeDeck(deckList),
    commanderHeroId: getActiveCommanderHeroId(ownerKey),
  };
}

export async function POST(req: Request) {
  if (!featureFlagDefaults.RIFT_ARENA_HUB_ENABLED) {
    return NextResponse.json({ error: "RIFT_ARENA_DISABLED" }, { status: 403 });
  }
  if (!featureFlagDefaults.RIFT_ARENA_FREE_MATCHMAKING_ENABLED) {
    return NextResponse.json({ error: "FREE_QUEUE_DISABLED" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { key, guestToken } = await resolveTcgOwnerKey();

  if (parsed.data.action === "cancel") {
    if (!parsed.data.ticketId) {
      return NextResponse.json({ error: "TICKET_REQUIRED" }, { status: 400 });
    }
    cancelFreePlay(parsed.data.ticketId);
    const res = NextResponse.json({ ok: true, queueSize: freeQueueSize() });
    return attachTcgGuestCookie(res, guestToken);
  }

  const open = assertMatchmakingOpen();
  if (!open.ok) {
    return NextResponse.json({ error: open.error }, { status: 503 });
  }

  const ticket = enqueueFreePlay({
    ownerKey: key,
    displayName: parsed.data.displayName,
  });

  const pair = tryPairFreePlay();
  if (!pair) {
    const res = NextResponse.json({
      ok: true,
      ticket,
      queueSize: freeQueueSize(),
      pair: null,
      note: "Waiting for another free player — SOL never required.",
    });
    return attachTcgGuestCookie(res, guestToken);
  }

  // Ensure lobby seats match pair (host already created; guest attached).
  attachGuestToLobby(pair.lobbyCode, pair.guestKey, pair.guestName);

  const hostDeck = resolveDeck(pair.hostKey);
  const guestDeck = resolveDeck(pair.guestKey);
  if (!hostDeck || !guestDeck) {
    const res = NextResponse.json({
      ok: true,
      ticket,
      queueSize: freeQueueSize(),
      pair: { lobbyCode: pair.lobbyCode, matchStarted: false },
      warning: "DECK_INVALID_FOR_PAIR — open invite lobby manually",
    });
    return attachTcgGuestCookie(res, guestToken);
  }

  const rec = startPrivateTcgMatch({
    hostKey: pair.hostKey,
    guestKey: pair.guestKey,
    hostName: pair.hostName,
    guestName: pair.guestName,
    hostDeck: hostDeck.deck,
    guestDeck: guestDeck.deck,
    hostCommanderHeroId: hostDeck.commanderHeroId,
    guestCommanderHeroId: guestDeck.commanderHeroId,
  });
  markLobbyStarted(pair.lobbyCode, rec.state.publicId);

  const res = NextResponse.json({
    ok: true,
    ticket,
    queueSize: freeQueueSize(),
    pair: {
      lobbyCode: pair.lobbyCode,
      matchPublicId: rec.state.publicId,
      matchStarted: true,
      youAre: key === pair.hostKey ? "host" : "guest",
    },
    invitePath: `/tcg/battle?invite=${pair.lobbyCode}`,
  });
  return attachTcgGuestCookie(res, guestToken);
}

export async function GET() {
  return NextResponse.json({
    queueSize: freeQueueSize(),
    enabled: featureFlagDefaults.RIFT_ARENA_FREE_MATCHMAKING_ENABLED,
  });
}
