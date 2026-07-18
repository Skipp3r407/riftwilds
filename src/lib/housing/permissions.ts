import type {
  HomePermissionGrant,
  HousingRole,
  PermissionFlag,
  PlayerHome,
} from "@/lib/housing/types";

const ROLE_DEFAULTS: Record<HousingRole, PermissionFlag[]> = {
  owner: [
    "enter",
    "build",
    "decorate",
    "storage_take",
    "storage_deposit",
    "craft",
    "farm",
    "invite",
    "manage_permissions",
    "host_events",
    "edit_music",
    "edit_lighting",
  ],
  co_owner: [
    "enter",
    "build",
    "decorate",
    "storage_take",
    "storage_deposit",
    "craft",
    "farm",
    "invite",
    "host_events",
    "edit_music",
    "edit_lighting",
  ],
  family: [
    "enter",
    "decorate",
    "storage_deposit",
    "storage_take",
    "craft",
    "farm",
    "edit_music",
  ],
  guild: ["enter", "craft", "farm", "storage_deposit"],
  friends: ["enter", "storage_deposit"],
  visitors: ["enter"],
  public: ["enter"],
};

export function defaultPermissionGrants(ownerUserId: string): HomePermissionGrant[] {
  return [
    { role: "owner", subjectId: ownerUserId, flags: ROLE_DEFAULTS.owner },
    { role: "co_owner", subjectId: null, flags: ROLE_DEFAULTS.co_owner },
    { role: "family", subjectId: null, flags: ROLE_DEFAULTS.family },
    { role: "guild", subjectId: null, flags: ROLE_DEFAULTS.guild },
    { role: "friends", subjectId: null, flags: ROLE_DEFAULTS.friends },
    { role: "visitors", subjectId: null, flags: ROLE_DEFAULTS.visitors },
    { role: "public", subjectId: null, flags: ROLE_DEFAULTS.public },
  ];
}

export function resolveRole(home: PlayerHome, userId: string): HousingRole {
  if (home.ownerUserId === userId) return "owner";
  const subject = home.permissions.find(
    (p) => p.subjectId === userId && (p.role === "co_owner" || p.role === "family"),
  );
  if (subject) return subject.role;
  // Broader roles are policy-based; callers pass social context via grant overrides.
  return "visitors";
}

export function hasPermission(
  home: PlayerHome,
  userId: string,
  flag: PermissionFlag,
  opts?: { isFriend?: boolean; isGuildMate?: boolean; forceRole?: HousingRole },
): boolean {
  if (home.ownerUserId === userId) return true;

  const subjectGrant = home.permissions.find((p) => p.subjectId === userId);
  if (subjectGrant?.flags.includes(flag)) return true;

  let role: HousingRole = opts?.forceRole ?? "visitors";
  if (opts?.isGuildMate) role = "guild";
  if (opts?.isFriend) role = "friends";
  if (home.visitPolicy === "PUBLIC" || home.featured) {
    if (flag === "enter") role = role === "visitors" ? "public" : role;
  } else if (home.visitPolicy === "PRIVATE" && role === "visitors") {
    return false;
  } else if (home.visitPolicy === "GUILD" && !opts?.isGuildMate && role === "visitors") {
    return false;
  } else if (home.visitPolicy === "FRIENDS" && !opts?.isFriend && role === "visitors") {
    return false;
  }

  const roleGrant = home.permissions.find((p) => p.role === role && p.subjectId == null);
  const flags = roleGrant?.flags ?? ROLE_DEFAULTS[role];
  return flags.includes(flag);
}

export function grantSubjectRole(
  home: PlayerHome,
  subjectId: string,
  role: "co_owner" | "family",
  actorUserId: string,
): { ok: true; home: PlayerHome } | { ok: false; error: string; message: string } {
  if (!hasPermission(home, actorUserId, "manage_permissions")) {
    return { ok: false, error: "forbidden", message: "Cannot manage permissions." };
  }
  home.permissions = home.permissions.filter((p) => p.subjectId !== subjectId);
  home.permissions.push({
    role,
    subjectId,
    flags: ROLE_DEFAULTS[role],
  });
  home.updatedAt = new Date().toISOString();
  home.revision += 1;
  return { ok: true, home };
}

export function assertNoPermissionAbuse(
  home: PlayerHome,
  actorUserId: string,
  flag: PermissionFlag,
): { ok: true } | { ok: false; error: string; message: string } {
  if (!hasPermission(home, actorUserId, flag)) {
    return {
      ok: false,
      error: "forbidden",
      message: `Missing permission: ${flag}`,
    };
  }
  return { ok: true };
}
