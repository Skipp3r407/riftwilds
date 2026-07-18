export * from "@/lib/social/types";
export * from "@/lib/social/rules";
export * from "@/lib/social/sanitize";
export {
  listAvailableAvatars,
  listPetAvatarOptions,
  listCharacterAvatarOptions,
  listBrandAvatarOptions,
  setSocialAvatar,
  parseAvatarKey,
  petAvatarKey,
  npcAvatarKey,
  loreAvatarKey,
  brandAvatarKey,
} from "@/lib/social/avatars";
export type {
  SocialAvatarCatalog,
  SocialAvatarKind,
  SocialAvatarOption,
  SocialAvatarSection,
  SetAvatarInput,
} from "@/lib/social/avatars";
export {
  resetSocialStoreForTests,
  ensureSystemKeepersSeeded,
  getSocialStore,
} from "@/lib/social/store";
export {
  ensureSocialProfile,
  setDisplayName,
  setHandle,
  setMessagePrivacy,
  getAvatarCatalog,
  setAvatar,
  resolveOwnerByHandle,
  areFriends,
  isBlockedEitherWay,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  blockPlayer,
  unblockPlayer,
  reportPlayer,
  sendPrivateMessage,
  listThreadMessages,
  markThreadRead,
  listFriends,
  listFriendRequests,
  listDmThreads,
  getSocialSummary,
  getSocialHubData,
  partyInviteStub,
} from "@/lib/social/service";
