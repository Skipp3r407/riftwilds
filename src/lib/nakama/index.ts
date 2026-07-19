/**
 * Nakama integration surface for Riftwilds.
 * Additive only — feature-flagged bridges around existing auth / TCG / social systems.
 */

export {
  getNakamaPublicConfig,
  getNakamaServerSecrets,
  isNakamaSliceEnabled,
  nakamaConsoleUrl,
  nakamaDevDefaults,
  nakamaFeatureMatrix,
} from "@/lib/nakama/config";
export { getNakamaClient, probeNakamaHealth, resetNakamaClient } from "@/lib/nakama/client";
export {
  authenticateCustomId,
  authenticateEmailAccount,
  authenticateGuestDevice,
  getActiveNakamaUserId,
  logoutNakama,
  restoreOrRefreshSession,
} from "@/lib/nakama/auth";
export {
  clearNakamaSession,
  NAKAMA_SESSION_STORAGE_KEY,
  readStoredNakamaSession,
  sessionToSnapshot,
  storeNakamaSession,
} from "@/lib/nakama/session";
export { addMatchmakerTicket, createNakamaMatch } from "@/lib/nakama/matchmaking";
export { joinRoomChat, listRoomChatHistory, sendRoomChatMessage } from "@/lib/nakama/chat";
export {
  createGuildGroup,
  joinGuildGroup,
  listGuildGroups,
  listGuildMembers,
} from "@/lib/nakama/guilds";
export {
  listLeaderboardTop,
  RIFT_ARENA_LEADERBOARD_ID,
  writeLeaderboardScore,
} from "@/lib/nakama/leaderboards";
export { joinNakamaTournament, listNakamaTournaments } from "@/lib/nakama/tournaments";
export {
  PLAYER_PREFS_COLLECTION,
  readPlayerPrefs,
  writePlayerPrefs,
} from "@/lib/nakama/storage";

export { bridgeGuestToNakama } from "@/lib/nakama/bridges/guest-auth-bridge";
export { bridgeEmailToNakama } from "@/lib/nakama/bridges/email-auth-bridge";
export { bridgeTcgInviteToNakama } from "@/lib/nakama/bridges/tcg-matchmaking-bridge";
export { bridgeSocialRoomChat } from "@/lib/nakama/bridges/social-chat-bridge";
export { bridgeCreateGuild, bridgeListGuilds } from "@/lib/nakama/bridges/guilds-bridge";
export {
  bridgeLeaderboardRead,
  bridgeLeaderboardWrite,
} from "@/lib/nakama/bridges/leaderboards-bridge";
export {
  bridgeJoinTournament,
  bridgeListTournaments,
} from "@/lib/nakama/bridges/tournaments-bridge";

export type * from "@/lib/nakama/types";
