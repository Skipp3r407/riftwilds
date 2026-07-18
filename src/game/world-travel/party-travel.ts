/**
 * Party travel accept/decline stubs + optional NPC caravan stubs.
 */

import { REGION_BY_SLUG } from "@/game/world-maps/regions";
import { fastTravelFeeCredits } from "@/game/world-travel/gateways";
import type { CaravanStub, PartyTravelInvite } from "@/game/world-travel/types";

let invites: PartyTravelInvite[] = [];
let inviteSeq = 0;

export function createPartyTravelInvite(params: {
  leaderName: string;
  toRegionId: string;
  ttlMs?: number;
}): PartyTravelInvite {
  const invite: PartyTravelInvite = {
    id: `party-travel-${++inviteSeq}`,
    leaderName: params.leaderName,
    toRegionId: params.toRegionId,
    toName: REGION_BY_SLUG[params.toRegionId]?.name ?? params.toRegionId,
    expiresAt: Date.now() + (params.ttlMs ?? 60_000),
    status: "pending",
  };
  invites.push(invite);
  return invite;
}

export function respondPartyTravelInvite(
  inviteId: string,
  accept: boolean,
): PartyTravelInvite | null {
  const invite = invites.find((i) => i.id === inviteId);
  if (!invite || invite.status !== "pending") return null;
  if (Date.now() > invite.expiresAt) {
    invite.status = "expired";
    return invite;
  }
  invite.status = accept ? "accepted" : "declined";
  return invite;
}

export function listPendingPartyInvites(): PartyTravelInvite[] {
  const now = Date.now();
  for (const i of invites) {
    if (i.status === "pending" && now > i.expiresAt) i.status = "expired";
  }
  return invites.filter((i) => i.status === "pending");
}

export function clearPartyInvitesForTests(): void {
  invites = [];
  inviteSeq = 0;
}

export const NPC_CARAVAN_STUBS: CaravanStub[] = [
  {
    id: "caravan-commons-elderwood",
    npcName: "Trailwright Bren",
    fromRegionId: "riftwild-commons",
    toRegionId: "elderwood-forest",
    feeCredits: 0,
    note: "Stub — walking convoy along the Rootroad. Credits fee never SOL.",
  },
  {
    id: "caravan-stoneheart-stormspire",
    npcName: "Ashhaul Caravan",
    fromRegionId: "stoneheart-canyon",
    toRegionId: "stormspire-peaks",
    feeCredits: fastTravelFeeCredits("stoneheart-canyon", "stormspire-peaks").fee,
    note: "Stub — optional paid Credits ride after Gateways unlock.",
  },
];

export function listCaravanStubsFrom(regionId: string): CaravanStub[] {
  return NPC_CARAVAN_STUBS.filter((c) => c.fromRegionId === regionId);
}
