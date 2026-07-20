import { NextResponse } from "next/server";
import { z } from "zod";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { guestIdentityFields } from "@/lib/auth/owner-key";
import {
  createTcgLobby,
  getTcgLobby,
  lobbyPublicView,
} from "@/game/tcg/invite-store";
import { getTcgMatch, snapshotTcgMatch } from "@/game/tcg/match-store";
import {
  attachTcgGuestCookie,
  resolveTcgOwnerKey,
} from "@/game/tcg/owner-key";

const createSchema = z.object({
  hostName: z
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

/** Create a private lobby (room code + shareable link). */
export async function POST(req: Request) {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { key, guestToken } = await resolveTcgOwnerKey();
  const lobby = createTcgLobby({
    hostKey: key,
    hostName: parsed.data.hostName,
  });

  const origin = new URL(req.url).origin;
  const invitePath = `/tcg/battle?invite=${lobby.code}`;
  const res = NextResponse.json({
    ...lobbyPublicView(lobby),
    invitePath,
    inviteUrl: `${origin}${invitePath}`,
    youAre: "host" as const,
    ...guestIdentityFields(Boolean(guestToken), guestToken),
  });
  return attachTcgGuestCookie(res, guestToken);
}

/** Poll lobby / recover started match snapshot. */
export async function GET(req: Request) {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }

  const code = new URL(req.url).searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "CODE_REQUIRED" }, { status: 400 });
  }

  const { key, guestToken } = await resolveTcgOwnerKey();
  const lobby = getTcgLobby(code);
  if (!lobby) {
    return NextResponse.json({ error: "LOBBY_NOT_FOUND" }, { status: 404 });
  }

  const youAre =
    lobby.hostKey === key ? "host" : lobby.guestKey === key ? "guest" : "spectator";

  let match = null;
  if (lobby.matchPublicId && (youAre === "host" || youAre === "guest")) {
    const rec = getTcgMatch(lobby.matchPublicId, key);
    if (rec) match = snapshotTcgMatch(rec, key);
  }

  const origin = new URL(req.url).origin;
  const invitePath = `/tcg/battle?invite=${lobby.code}`;
  const res = NextResponse.json({
    ...lobbyPublicView(lobby),
    invitePath,
    inviteUrl: `${origin}${invitePath}`,
    youAre,
    match,
    ...guestIdentityFields(Boolean(guestToken), guestToken),
  });
  return attachTcgGuestCookie(res, guestToken);
}
