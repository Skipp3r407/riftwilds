import { NextResponse } from "next/server";
import { z } from "zod";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
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
  getTcgLobby,
  lobbyPublicView,
  markLobbyStarted,
} from "@/game/tcg/invite-store";
import {
  getTcgMatch,
  snapshotTcgMatch,
  startPrivateTcgMatch,
} from "@/game/tcg/match-store";
import {
  attachTcgGuestCookie,
  resolveTcgOwnerKey,
} from "@/game/tcg/owner-key";
import { appendReplayHook } from "@/game/rift-arena/replay-hooks";

const bodySchema = z.object({
  code: z.string().min(4).max(12),
  guestName: z
    .string()
    .max(40)
    .optional()
    .transform((s) => {
      if (s == null) return undefined;
      const cleaned = s
        .replace(/<[^>]*>/g, "")
        .replace(/[<>]/g, "")
        .trim();
      return cleaned.length > 0 ? cleaned.slice(0, 40) : undefined;
    }),
});

function resolveDeck(ownerKey: string) {
  const deckList = getActiveDeckList(ownerKey);
  const constructed = validateDeckList(deckList);
  const valid = constructed.ok ? constructed : validateContentDeckList(deckList);
  if (!valid.ok) return { ok: false as const, reason: valid.reason };
  return {
    ok: true as const,
    deck: materializeDeck(deckList),
    commanderHeroId: getActiveCommanderHeroId(ownerKey),
  };
}

/** Join a private lobby; when both seats filled, start a local private match. */
export async function POST(req: Request) {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { key, guestToken } = await resolveTcgOwnerKey();
  const attached = attachGuestToLobby(
    parsed.data.code,
    key,
    parsed.data.guestName,
  );
  if (!attached.ok) {
    return NextResponse.json({ error: attached.error }, { status: 400 });
  }

  let lobby = attached.lobby;

  // Host calling join while waiting — return lobby only.
  if (lobby.hostKey === key && !lobby.guestKey) {
    const origin = new URL(req.url).origin;
    const invitePath = `/tcg/battle?invite=${lobby.code}`;
    const res = NextResponse.json({
      ...lobbyPublicView(lobby),
      invitePath,
      inviteUrl: `${origin}${invitePath}`,
      youAre: "host" as const,
      match: null,
    });
    return attachTcgGuestCookie(res, guestToken);
  }

  // Already started — return snapshot for either seat.
  if (lobby.status === "STARTED" && lobby.matchPublicId) {
    const rec = getTcgMatch(lobby.matchPublicId, key);
    if (!rec) {
      return NextResponse.json({ error: "MATCH_NOT_FOUND" }, { status: 404 });
    }
    const youAre = lobby.hostKey === key ? "host" : "guest";
    const res = NextResponse.json({
      ...lobbyPublicView(lobby),
      youAre,
      match: snapshotTcgMatch(rec, key),
    });
    return attachTcgGuestCookie(res, guestToken);
  }

  if (!lobby.guestKey || lobby.hostKey === lobby.guestKey) {
    return NextResponse.json({ error: "WAITING_FOR_GUEST" }, { status: 409 });
  }

  // Only the joining guest (or a second call once both seated) starts the match.
  const hostDeck = resolveDeck(lobby.hostKey);
  const guestDeck = resolveDeck(lobby.guestKey);
  if (!hostDeck.ok) {
    return NextResponse.json(
      { error: "HOST_INVALID_DECK", reason: hostDeck.reason },
      { status: 400 },
    );
  }
  if (!guestDeck.ok) {
    return NextResponse.json(
      { error: "GUEST_INVALID_DECK", reason: guestDeck.reason },
      { status: 400 },
    );
  }

  const rec = startPrivateTcgMatch({
    hostKey: lobby.hostKey,
    guestKey: lobby.guestKey,
    hostName: lobby.hostName,
    guestName: lobby.guestName ?? parsed.data.guestName,
    hostDeck: hostDeck.deck,
    guestDeck: guestDeck.deck,
    hostCommanderHeroId: hostDeck.commanderHeroId,
    guestCommanderHeroId: guestDeck.commanderHeroId,
  });
  lobby = markLobbyStarted(lobby.code, rec.state.publicId) ?? lobby;

  appendReplayHook({
    matchPublicId: rec.state.publicId,
    kind: "MATCH_CREATED",
    mode: "private",
    actorKey: key,
    payload: { inviteCode: lobby.code },
  });

  const youAre = lobby.hostKey === key ? "host" : "guest";
  const origin = new URL(req.url).origin;
  const invitePath = `/tcg/battle?invite=${lobby.code}`;
  const refreshed = getTcgLobby(lobby.code) ?? lobby;
  const res = NextResponse.json({
    ...lobbyPublicView(refreshed),
    invitePath,
    inviteUrl: `${origin}${invitePath}`,
    youAre,
    match: snapshotTcgMatch(rec, key),
  });
  return attachTcgGuestCookie(res, guestToken);
}
