/**
 * Local private-match lobbies (room codes + shareable links).
 * Same-process only — survives Turbopack via globalThis. Not cross-server multiplayer.
 */

export type TcgLobbyStatus = "WAITING" | "STARTED" | "EXPIRED";

export type TcgLobby = {
  code: string;
  hostKey: string;
  hostName: string;
  guestKey: string | null;
  guestName: string | null;
  status: TcgLobbyStatus;
  matchPublicId: string | null;
  createdAt: number;
};

type InviteMaps = {
  byCode: Map<string, TcgLobby>;
};

const globalForInvites = globalThis as unknown as {
  __riftwildsTcgInvites?: InviteMaps;
};

const LOBBY_TTL_MS = 60 * 60 * 1000;

function inviteMaps(): InviteMaps {
  if (!globalForInvites.__riftwildsTcgInvites) {
    globalForInvites.__riftwildsTcgInvites = { byCode: new Map() };
  }
  return globalForInvites.__riftwildsTcgInvites;
}

function mintCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]!;
  }
  return code;
}

function purgeExpired(now = Date.now()): void {
  const map = inviteMaps().byCode;
  for (const [code, lobby] of map) {
    if (now - lobby.createdAt > LOBBY_TTL_MS) {
      lobby.status = "EXPIRED";
      map.delete(code);
    }
  }
}

export function createTcgLobby(input: {
  hostKey: string;
  hostName?: string;
}): TcgLobby {
  purgeExpired();
  const map = inviteMaps().byCode;
  let code = mintCode();
  let guard = 0;
  while (map.has(code) && guard < 12) {
    code = mintCode();
    guard += 1;
  }
  const lobby: TcgLobby = {
    code,
    hostKey: input.hostKey,
    hostName: input.hostName?.trim() || "Host",
    guestKey: null,
    guestName: null,
    status: "WAITING",
    matchPublicId: null,
    createdAt: Date.now(),
  };
  map.set(code, lobby);
  return lobby;
}

export function getTcgLobby(code: string): TcgLobby | null {
  purgeExpired();
  const normalized = code.trim().toUpperCase();
  return inviteMaps().byCode.get(normalized) ?? null;
}

export function attachGuestToLobby(
  code: string,
  guestKey: string,
  guestName?: string,
):
  | { ok: true; lobby: TcgLobby }
  | { ok: false; error: string } {
  const lobby = getTcgLobby(code);
  if (!lobby) return { ok: false, error: "LOBBY_NOT_FOUND" };
  if (lobby.status === "EXPIRED") return { ok: false, error: "LOBBY_EXPIRED" };
  if (lobby.status === "STARTED" && lobby.matchPublicId) {
    if (lobby.hostKey === guestKey || lobby.guestKey === guestKey) {
      return { ok: true, lobby };
    }
    return { ok: false, error: "LOBBY_FULL" };
  }
  if (lobby.hostKey === guestKey) {
    return { ok: true, lobby };
  }
  if (lobby.guestKey && lobby.guestKey !== guestKey) {
    return { ok: false, error: "LOBBY_FULL" };
  }
  lobby.guestKey = guestKey;
  lobby.guestName = guestName?.trim() || "Guest";
  return { ok: true, lobby };
}

export function markLobbyStarted(code: string, matchPublicId: string): TcgLobby | null {
  const lobby = getTcgLobby(code);
  if (!lobby) return null;
  lobby.status = "STARTED";
  lobby.matchPublicId = matchPublicId;
  return lobby;
}

export function lobbyPublicView(lobby: TcgLobby) {
  return {
    code: lobby.code,
    status: lobby.status,
    hostName: lobby.hostName,
    guestName: lobby.guestName,
    matchPublicId: lobby.matchPublicId,
    seats: {
      host: true,
      guest: !!lobby.guestKey,
    },
    note: "Local private lobby — same server process only. SOL never required.",
  };
}

export function __clearTcgInvitesForTests(): void {
  inviteMaps().byCode.clear();
}
