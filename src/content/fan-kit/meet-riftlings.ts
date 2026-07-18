import { creatureThumbPath } from "@/lib/assets/paths";
import { getSpeciesLore } from "@/content/pets/lore";

export type MeetRiftling = {
  slug: string;
  name: string;
  title: string;
  blurb: string;
  affinity: string;
  region: string;
  thumbSrc: string;
  codexHref: string;
};

/** Curated cute showcase — starter-friendly faces for new visitors. */
const MEET_SLUGS = [
  "cindercub",
  "mossprig",
  "bubbloon",
  "voltkit",
  "pebblit",
  "wisplet",
  "frostnip",
  "commonspark",
  "emberfox",
  "tideotter",
  "snowpuff",
  "dreamhare",
] as const;

export function listMeetRiftlings(): MeetRiftling[] {
  return MEET_SLUGS.map((slug) => {
    const lore = getSpeciesLore(slug);
    const name = lore?.name ?? slug;
    const short = lore?.shortBio?.trim();
    const blurb = short
      ? `${short.slice(0, 140).replace(/\s+\S*$/, "")}…`
      : `Meet ${name} — a friendly Riftling ready to hatch.`;
    return {
      slug,
      name,
      title: lore?.title ?? "Riftling companion",
      blurb,
      affinity: lore?.affinity ?? "RIFT",
      region: lore?.nativeRegion ?? "Riftwild Commons",
      thumbSrc: creatureThumbPath(slug),
      codexHref: `/codex/riftlings/${slug}`,
    };
  });
}
