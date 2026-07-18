/** Mirrors Prisma enums — usable without generated client in unit tests. */

export type WorldPlaySessionStatus =
  | "ACTIVE"
  | "RECONNECTING"
  | "DISCONNECTED"
  | "LOGGED_OUT_SAFE"
  | "LOGGED_OUT_UNSAFE"
  | "EXPIRED"
  | "FORCE_ENDED";

export type SaveCategory = "A_CRITICAL" | "B_PROGRESSION" | "C_COSMETIC";

export type LogoutZoneKind = "INN" | "HOME" | "CAMP" | "SETTLEMENT" | "WAYPOINT";
