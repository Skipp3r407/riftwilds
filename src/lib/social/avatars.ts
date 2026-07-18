/**
 * Social profile avatars — auto-built from owned pets + in-game characters.
 * Persists as SocialProfile.avatarSrc (+ avatarKey) on the in-memory social store.
 */

import { getPet, listPetsForOwner } from "@/game/eggs/hatchery-store";
import { NAMED_NPCS } from "@/content/npcs";
import {
  brandMarkPath,
  creaturePortraitPath,
  creatureThumbPath,
} from "@/lib/assets/paths";
import { getSocialStore } from "@/lib/social/store";
import type { SocialProfile } from "@/lib/social/types";

/** Caller must `ensureSocialProfile` first. */
function requireProfile(ownerKey: string): SocialProfile {
  const profile = getSocialStore().profiles.get(ownerKey);
  if (!profile) {
    throw new Error(`social_profile_missing:${ownerKey}`);
  }
  return profile;
}

export type SocialAvatarKind = "pet" | "npc" | "lore" | "brand";

export type SocialAvatarOption = {
  key: string;
  kind: SocialAvatarKind;
  label: string;
  subtitle?: string;
  /** Display / persist path (portrait quality). */
  src: string;
  /** Lighter thumb for dense picker grids. */
  thumbSrc: string;
  unlocked: boolean;
  lockedReason?: string;
};

export type SocialAvatarSection = {
  id: "pets" | "characters" | "brand";
  title: string;
  description: string;
  options: SocialAvatarOption[];
};

export type SocialAvatarCatalog = {
  selectedKey: string | null;
  selectedSrc: string;
  sections: SocialAvatarSection[];
};

export type SetAvatarInput =
  | { kind: "pet"; petPublicId: string }
  | { kind: "npc"; npcSlug: string }
  | { kind: "lore"; characterId: string }
  | { kind: "brand"; brandId?: string };

/** Curated lore / hero portraits (avoid importing the full About module). */
const LORE_AVATARS: Array<{
  id: string;
  label: string;
  subtitle: string;
  src: string;
}> = [
  {
    id: "elara-venn",
    label: "Elara Venn",
    subtitle: "First Riftkeeper",
    src: "/assets/about/comic/comic-elara-portrait.png",
  },
  {
    id: "first-riftling",
    label: "The First Riftling",
    subtitle: "Origin companion",
    src: "/assets/about/comic/comic-first-riftling-hatch.png",
  },
];

const BRAND_AVATARS: Array<{
  id: string;
  label: string;
  subtitle: string;
  src: string;
}> = [
  {
    id: "mark",
    label: "Riftwilds Mark",
    subtitle: "Brand emblem",
    src: brandMarkPath,
  },
];

export function petAvatarKey(petPublicId: string): string {
  return `pet:${petPublicId}`;
}

export function npcAvatarKey(slug: string): string {
  return `npc:${slug}`;
}

export function loreAvatarKey(id: string): string {
  return `lore:${id}`;
}

export function brandAvatarKey(id: string): string {
  return `brand:${id}`;
}

function stripQuery(src: string): string {
  return src.split("?")[0] ?? src;
}

/** Named active NPCs unlocked by default as cosmetic avatars. */
export function listCharacterAvatarOptions(): SocialAvatarOption[] {
  const npcs: SocialAvatarOption[] = NAMED_NPCS.filter((n) => n.active).map((n) => ({
    key: npcAvatarKey(n.slug),
    kind: "npc" as const,
    label: n.displayName,
    subtitle: n.title || n.occupation || "Keeper",
    src: n.portraitAsset,
    thumbSrc: n.thumbnailAsset || n.portraitAsset,
    unlocked: true,
  }));

  const lore: SocialAvatarOption[] = LORE_AVATARS.map((c) => ({
    key: loreAvatarKey(c.id),
    kind: "lore" as const,
    label: c.label,
    subtitle: c.subtitle,
    src: c.src,
    thumbSrc: c.src,
    unlocked: true,
  }));

  return [...npcs, ...lore].sort((a, b) => a.label.localeCompare(b.label));
}

export function listBrandAvatarOptions(): SocialAvatarOption[] {
  return BRAND_AVATARS.map((b) => ({
    key: brandAvatarKey(b.id),
    kind: "brand" as const,
    label: b.label,
    subtitle: b.subtitle,
    src: b.src,
    thumbSrc: stripQuery(b.src),
    unlocked: true,
  }));
}

export function listPetAvatarOptions(ownerKey: string): SocialAvatarOption[] {
  return listPetsForOwner(ownerKey).map((pet) => ({
    key: petAvatarKey(pet.publicId),
    kind: "pet" as const,
    label: pet.name,
    subtitle: pet.speciesName,
    src: creaturePortraitPath(pet.speciesSlug),
    thumbSrc: creatureThumbPath(pet.speciesSlug),
    unlocked: true,
  }));
}

export function listAvailableAvatars(ownerKey: string): SocialAvatarCatalog {
  const profile = requireProfile(ownerKey);
  const pets = listPetAvatarOptions(ownerKey);
  const characters = listCharacterAvatarOptions();
  const brand = listBrandAvatarOptions();

  return {
    selectedKey: profile.avatarKey ?? null,
    selectedSrc: profile.avatarSrc,
    sections: [
      {
        id: "pets",
        title: "Your Riftlings",
        description:
          pets.length > 0
            ? "Portraits from pets you hatched and own."
            : "Hatch a Riftling to unlock pet avatars — characters below are ready now.",
        options: pets,
      },
      {
        id: "characters",
        title: "Keepers & characters",
        description: "Named town keepers, heroes, and lore figures.",
        options: characters,
      },
      {
        id: "brand",
        title: "Emblems",
        description: "Simple brand marks when you want a clean look.",
        options: brand,
      },
    ],
  };
}

function resolveAvatarSelection(
  ownerKey: string,
  input: SetAvatarInput,
):
  | { ok: true; key: string; src: string; kind: SocialAvatarKind }
  | { ok: false; error: string; message: string } {
  if (input.kind === "pet") {
    const pet = getPet(input.petPublicId);
    if (!pet || pet.ownerKey !== ownerKey) {
      return {
        ok: false,
        error: "not_owned",
        message: "You can only use avatars from Riftlings you own.",
      };
    }
    return {
      ok: true,
      kind: "pet",
      key: petAvatarKey(pet.publicId),
      src: creaturePortraitPath(pet.speciesSlug),
    };
  }

  if (input.kind === "npc") {
    const npc = NAMED_NPCS.find((n) => n.slug === input.npcSlug || n.id === input.npcSlug);
    if (!npc || !npc.active) {
      return {
        ok: false,
        error: "not_found",
        message: "That character avatar is not available.",
      };
    }
    return {
      ok: true,
      kind: "npc",
      key: npcAvatarKey(npc.slug),
      src: npc.portraitAsset,
    };
  }

  if (input.kind === "lore") {
    const lore = LORE_AVATARS.find((c) => c.id === input.characterId);
    if (!lore) {
      return {
        ok: false,
        error: "not_found",
        message: "That lore avatar is not available.",
      };
    }
    return {
      ok: true,
      kind: "lore",
      key: loreAvatarKey(lore.id),
      src: lore.src,
    };
  }

  const brandId = input.brandId ?? "mark";
  const brand = BRAND_AVATARS.find((b) => b.id === brandId);
  if (!brand) {
    return {
      ok: false,
      error: "not_found",
      message: "That emblem is not available.",
    };
  }
  return {
    ok: true,
    kind: "brand",
    key: brandAvatarKey(brand.id),
    src: brand.src,
  };
}

/**
 * Set the player's social avatar. Pet avatars require ownership;
 * NPC / lore / brand options are unlocked cosmetics.
 */
export function setSocialAvatar(
  ownerKey: string,
  input: SetAvatarInput,
):
  | { ok: true; profile: SocialProfile; key: string; src: string }
  | { ok: false; error: string; message: string } {
  const resolved = resolveAvatarSelection(ownerKey, input);
  if (!resolved.ok) return resolved;

  const profile = requireProfile(ownerKey);
  profile.avatarSrc = resolved.src;
  profile.avatarKey = resolved.key;
  profile.lastSeenAt = new Date().toISOString();

  return {
    ok: true,
    profile,
    key: resolved.key,
    src: resolved.src,
  };
}

/** Parse a stored avatar key back into a set input (for API convenience). */
export function parseAvatarKey(
  key: string,
): SetAvatarInput | null {
  const colon = key.indexOf(":");
  if (colon < 1) return null;
  const kind = key.slice(0, colon);
  const id = key.slice(colon + 1);
  if (!id) return null;
  if (kind === "pet") return { kind: "pet", petPublicId: id };
  if (kind === "npc") return { kind: "npc", npcSlug: id };
  if (kind === "lore") return { kind: "lore", characterId: id };
  if (kind === "brand") return { kind: "brand", brandId: id };
  return null;
}
