import type { SpeciesLore } from "@/lib/pets/lore-types";
import lore_cindercub from "./cindercub";
import lore_mossprig from "./mossprig";
import lore_bubbloon from "./bubbloon";
import lore_voltkit from "./voltkit";
import lore_pebblit from "./pebblit";
import lore_wisplet from "./wisplet";
import lore_frostnip from "./frostnip";
import lore_luminara from "./luminara";
import lore_hollowshade from "./hollowshade";
import lore_gearling from "./gearling";
import lore_bramblefox from "./bramblefox";
import lore_coralurge from "./coralurge";
import lore_ashwing from "./ashwing";
import lore_quartzhorn from "./quartzhorn";
import lore_staticat from "./staticat";
import lore_glimmerp from "./glimmerp";
import lore_mistwraith from "./mistwraith";
import lore_ironbloom from "./ironbloom";
import lore_riftpup from "./riftpup";
import lore_tidewisp from "./tidewisp";
import lore_embernewt from "./embernewt";
import lore_groveowl from "./groveowl";
import lore_stormmoth from "./stormmoth";
import lore_stonegrub from "./stonegrub";
import lore_frostfin from "./frostfin";
import lore_radiantkit from "./radiantkit";
import lore_voidling from "./voidling";
import lore_cogpup from "./cogpup";
import lore_lanternjay from "./lanternjay";
import lore_craterhorn from "./craterhorn";
import lore_moonray from "./moonray";
import lore_rootling from "./rootling";
import lore_spirekite from "./spirekite";
import lore_canyonbeetle from "./canyonbeetle";
import lore_snowpuff from "./snowpuff";
import lore_citadelmoth from "./citadelmoth";
import lore_riftslug from "./riftslug";
import lore_scrapfinch from "./scrapfinch";
import lore_marshloom from "./marshloom";
import lore_commonspark from "./commonspark";
import lore_hearthstone from "./hearthstone";
import lore_tideotter from "./tideotter";
import lore_emberfox from "./emberfox";
import lore_elderfern from "./elderfern";
import lore_peakibex from "./peakibex";
import lore_fossilhound from "./fossilhound";
import lore_veilhare from "./veilhare";
import lore_auralynx from "./auralynx";
import lore_hollowmoth from "./hollowmoth";
import lore_celestora from "./celestora";

export const SPECIES_LORE_BY_SLUG: Record<string, SpeciesLore> = {
  "cindercub": lore_cindercub,
  "mossprig": lore_mossprig,
  "bubbloon": lore_bubbloon,
  "voltkit": lore_voltkit,
  "pebblit": lore_pebblit,
  "wisplet": lore_wisplet,
  "frostnip": lore_frostnip,
  "luminara": lore_luminara,
  "hollowshade": lore_hollowshade,
  "gearling": lore_gearling,
  "bramblefox": lore_bramblefox,
  "coralurge": lore_coralurge,
  "ashwing": lore_ashwing,
  "quartzhorn": lore_quartzhorn,
  "staticat": lore_staticat,
  "glimmerp": lore_glimmerp,
  "mistwraith": lore_mistwraith,
  "ironbloom": lore_ironbloom,
  "riftpup": lore_riftpup,
  "tidewisp": lore_tidewisp,
  "embernewt": lore_embernewt,
  "groveowl": lore_groveowl,
  "stormmoth": lore_stormmoth,
  "stonegrub": lore_stonegrub,
  "frostfin": lore_frostfin,
  "radiantkit": lore_radiantkit,
  "voidling": lore_voidling,
  "cogpup": lore_cogpup,
  "lanternjay": lore_lanternjay,
  "craterhorn": lore_craterhorn,
  "moonray": lore_moonray,
  "rootling": lore_rootling,
  "spirekite": lore_spirekite,
  "canyonbeetle": lore_canyonbeetle,
  "snowpuff": lore_snowpuff,
  "citadelmoth": lore_citadelmoth,
  "riftslug": lore_riftslug,
  "scrapfinch": lore_scrapfinch,
  "marshloom": lore_marshloom,
  "commonspark": lore_commonspark,
  "hearthstone": lore_hearthstone,
  "tideotter": lore_tideotter,
  "emberfox": lore_emberfox,
  "elderfern": lore_elderfern,
  "peakibex": lore_peakibex,
  "fossilhound": lore_fossilhound,
  "veilhare": lore_veilhare,
  "auralynx": lore_auralynx,
  "hollowmoth": lore_hollowmoth,
  "celestora": lore_celestora,
};

export function getSpeciesLore(slug: string): SpeciesLore | undefined {
  return SPECIES_LORE_BY_SLUG[slug];
}

export function listSpeciesLore(): SpeciesLore[] {
  return Object.values(SPECIES_LORE_BY_SLUG);
}

export const SPECIES_LORE_SLUGS = [
  "cindercub",
  "mossprig",
  "bubbloon",
  "voltkit",
  "pebblit",
  "wisplet",
  "frostnip",
  "luminara",
  "hollowshade",
  "gearling",
  "bramblefox",
  "coralurge",
  "ashwing",
  "quartzhorn",
  "staticat",
  "glimmerp",
  "mistwraith",
  "ironbloom",
  "riftpup",
  "tidewisp",
  "embernewt",
  "groveowl",
  "stormmoth",
  "stonegrub",
  "frostfin",
  "radiantkit",
  "voidling",
  "cogpup",
  "lanternjay",
  "craterhorn",
  "moonray",
  "rootling",
  "spirekite",
  "canyonbeetle",
  "snowpuff",
  "citadelmoth",
  "riftslug",
  "scrapfinch",
  "marshloom",
  "commonspark",
  "hearthstone",
  "tideotter",
  "emberfox",
  "elderfern",
  "peakibex",
  "fossilhound",
  "veilhare",
  "auralynx",
  "hollowmoth",
  "celestora"
] as const;
