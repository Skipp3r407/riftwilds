/**
 * Fan Kit downloads — wallpapers, logo pack, frames, stickers, brand blurb.
 * Original Riftwilds IP. Personal / fan use; not for resale.
 */

export type FanKitAsset = {
  id: string;
  title: string;
  description: string;
  href: string;
  thumbSrc: string;
  kind: "wallpaper" | "logo" | "frame" | "sticker" | "key-art" | "coloring";
  tags: string[];
  downloadName?: string;
};

export const FAN_KIT_CREDIT =
  "Free for personal, kids, streamer, and fan use. Please credit Riftwilds and do not resell the pack.";

export const BRAND_GUIDELINES = [
  "Name: Riftwilds. Creatures: Riftlings. Players: Keepers / Riftkeepers.",
  "Dark ethereal fantasy — charcoal shell, copper vein circuits, cyan riftlight, amber core. Avoid purple-spam chrome.",
  "Credits are in-world currency. Never frame Credits as SOL or “buy coin → hatch SOL pet.”",
  "Keep family-friendly tone for kids coloring, comics, and Commons visits.",
  "Logo mark + wordmark stay intact; don’t stretch, recolor into neon purple, or crop the egg mark oddly.",
];

/** Wallpapers: reuse `@/content/wallpapers` + WallpaperDownloads (full catalog). */

export const FAN_KIT_LOGO_PACK: FanKitAsset[] = [
  {
    id: "logo-full",
    title: "Full logo lockup",
    description: "Transparent logo for overlays and thumbnails.",
    href: "/assets/brand/riftwilds-logo.png",
    thumbSrc: "/assets/brand/riftwilds-logo.png",
    kind: "logo",
    tags: ["brand"],
    downloadName: "riftwilds-logo.png",
  },
  {
    id: "logo-full-2x",
    title: "Full logo lockup (2×)",
    description: "Retina-ready transparent lockup.",
    href: "/assets/brand/riftwilds-logo@2x.png",
    thumbSrc: "/assets/brand/riftwilds-logo.png",
    kind: "logo",
    tags: ["brand", "retina"],
    downloadName: "riftwilds-logo@2x.png",
  },
  {
    id: "logo-full-svg",
    title: "Full logo lockup (SVG)",
    description: "Scalable vector lockup for print and overlays.",
    href: "/assets/brand/riftwilds-logo.svg",
    thumbSrc: "/assets/brand/riftwilds-logo.png",
    kind: "logo",
    tags: ["brand", "vector"],
    downloadName: "riftwilds-logo.svg",
  },
  {
    id: "logo-mark",
    title: "Egg mark",
    description: "Icon mark for avatars and app icons.",
    href: "/assets/brand/riftwilds-mark.png",
    thumbSrc: "/assets/brand/riftwilds-mark.png",
    kind: "logo",
    tags: ["brand", "icon"],
    downloadName: "riftwilds-mark.png",
  },
  {
    id: "logo-mark-2x",
    title: "Egg mark (2×)",
    description: "1024px egg mark for high-DPI icons.",
    href: "/assets/brand/riftwilds-mark@2x.png",
    thumbSrc: "/assets/brand/riftwilds-mark.png",
    kind: "logo",
    tags: ["brand", "icon", "retina"],
    downloadName: "riftwilds-mark@2x.png",
  },
  {
    id: "logo-mark-svg",
    title: "Egg mark (SVG)",
    description: "Scalable vector egg mark.",
    href: "/assets/brand/riftwilds-mark.svg",
    thumbSrc: "/assets/brand/riftwilds-mark.png",
    kind: "logo",
    tags: ["brand", "icon", "vector"],
    downloadName: "riftwilds-mark.svg",
  },
  {
    id: "logo-wordmark",
    title: "Wordmark",
    description: "Horizontal Riftwilds wordmark.",
    href: "/assets/brand/riftwilds-wordmark.png",
    thumbSrc: "/assets/brand/riftwilds-wordmark.png",
    kind: "logo",
    tags: ["brand"],
    downloadName: "riftwilds-wordmark.png",
  },
  {
    id: "logo-wordmark-2x",
    title: "Wordmark (2×)",
    description: "Retina-ready wordmark.",
    href: "/assets/brand/riftwilds-wordmark@2x.png",
    thumbSrc: "/assets/brand/riftwilds-wordmark.png",
    kind: "logo",
    tags: ["brand", "retina"],
    downloadName: "riftwilds-wordmark@2x.png",
  },
  {
    id: "logo-wordmark-svg",
    title: "Wordmark (SVG)",
    description: "Scalable vector wordmark.",
    href: "/assets/brand/riftwilds-wordmark.svg",
    thumbSrc: "/assets/brand/riftwilds-wordmark.png",
    kind: "logo",
    tags: ["brand", "vector"],
    downloadName: "riftwilds-wordmark.svg",
  },
  {
    id: "logo-coin",
    title: "Credits coin icon",
    description: "In-world Credits symbol (not SOL).",
    href: "/assets/brand/rift-coin-icon.svg",
    thumbSrc: "/assets/brand/rift-coin-icon.svg",
    kind: "logo",
    tags: ["credits"],
    downloadName: "riftwilds-credits-coin.svg",
  },
];

export const FAN_KIT_FRAMES: FanKitAsset[] = [
  {
    id: "frame-amber-hearth",
    title: "Amber Hearth frame",
    description: "Warm circular avatar frame with hearth glow.",
    href: "/assets/fan-kit/frames/amber-hearth.svg",
    thumbSrc: "/assets/fan-kit/frames/amber-hearth.svg",
    kind: "frame",
    tags: ["avatar"],
    downloadName: "riftwilds-frame-amber-hearth.svg",
  },
  {
    id: "frame-rift-cyan",
    title: "Rift Cyan frame",
    description: "Soft cyan riftlight ring for profile pics.",
    href: "/assets/fan-kit/frames/rift-cyan.svg",
    thumbSrc: "/assets/fan-kit/frames/rift-cyan.svg",
    kind: "frame",
    tags: ["avatar"],
    downloadName: "riftwilds-frame-rift-cyan.svg",
  },
  {
    id: "frame-keeper-seal",
    title: "Keeper Seal frame",
    description: "Parchment-and-bronze seal for Keepers.",
    href: "/assets/fan-kit/frames/keeper-seal.svg",
    thumbSrc: "/assets/fan-kit/frames/keeper-seal.svg",
    kind: "frame",
    tags: ["avatar"],
    downloadName: "riftwilds-frame-keeper-seal.svg",
  },
  {
    id: "frame-commons-laurel",
    title: "Commons Laurel frame",
    description: "Leafy Commons welcome frame.",
    href: "/assets/fan-kit/frames/commons-laurel.svg",
    thumbSrc: "/assets/fan-kit/frames/commons-laurel.svg",
    kind: "frame",
    tags: ["avatar"],
    downloadName: "riftwilds-frame-commons-laurel.svg",
  },
];

export const FAN_KIT_STICKERS: FanKitAsset[] = [
  {
    id: "sticker-spark",
    title: "Spark sticker",
    description: "Die-cut transparent Spark the Glowpup sticker (PNG).",
    href: "/assets/fan-kit/stickers/spark.png",
    thumbSrc: "/assets/fan-kit/stickers/spark.png",
    kind: "sticker",
    tags: ["riftling"],
    downloadName: "riftwilds-sticker-spark.png",
  },
  {
    id: "sticker-egg",
    title: "Hatch egg sticker",
    description: "Cozy egg with soft leaf nest (PNG).",
    href: "/assets/fan-kit/stickers/hatch-egg.png",
    thumbSrc: "/assets/fan-kit/stickers/hatch-egg.png",
    kind: "sticker",
    tags: ["egg"],
    downloadName: "riftwilds-sticker-hatch-egg.png",
  },
  {
    id: "sticker-cindercub",
    title: "Cindercub sticker",
    description: "Ember cub with cyan crystals (PNG).",
    href: "/assets/fan-kit/stickers/cindercub.png",
    thumbSrc: "/assets/fan-kit/stickers/cindercub.png",
    kind: "sticker",
    tags: ["riftling"],
    downloadName: "riftwilds-sticker-cindercub.png",
  },
  {
    id: "sticker-mossprig",
    title: "Mossprig sticker",
    description: "Grove sprout friend sticker (PNG).",
    href: "/assets/fan-kit/stickers/mossprig.png",
    thumbSrc: "/assets/fan-kit/stickers/mossprig.png",
    kind: "sticker",
    tags: ["riftling"],
    downloadName: "riftwilds-sticker-mossprig.png",
  },
  {
    id: "sticker-bubbloon",
    title: "Bubbloon sticker",
    description: "Tide-bubble companion sticker (PNG).",
    href: "/assets/fan-kit/stickers/bubbloon.png",
    thumbSrc: "/assets/fan-kit/stickers/bubbloon.png",
    kind: "sticker",
    tags: ["riftling"],
    downloadName: "riftwilds-sticker-bubbloon.png",
  },
  {
    id: "sticker-commons",
    title: "Commons crest sticker",
    description: "Gateway stone crest for chats and scrapbooks (PNG).",
    href: "/assets/fan-kit/stickers/commons-crest.png",
    thumbSrc: "/assets/fan-kit/stickers/commons-crest.png",
    kind: "sticker",
    tags: ["commons"],
    downloadName: "riftwilds-sticker-commons-crest.png",
  },
  {
    id: "sticker-keeper",
    title: "Keeper badge sticker",
    description: "Keeper seal badge for Discord nicknames (PNG).",
    href: "/assets/fan-kit/stickers/keeper-badge.png",
    thumbSrc: "/assets/fan-kit/stickers/keeper-badge.png",
    kind: "sticker",
    tags: ["keeper"],
    downloadName: "riftwilds-sticker-keeper-badge.png",
  },
  {
    id: "sticker-heart",
    title: "Care heart sticker",
    description: "Soft care-heart for wholesome moments (PNG).",
    href: "/assets/fan-kit/stickers/care-heart.png",
    thumbSrc: "/assets/fan-kit/stickers/care-heart.png",
    kind: "sticker",
    tags: ["care"],
    downloadName: "riftwilds-sticker-care-heart.png",
  },
];

export const FAN_KIT_KEY_ART: FanKitAsset[] = [
  {
    id: "key-og",
    title: "Default key art (OG)",
    description: "Primary share / press key art.",
    href: "/assets/marketing/og-default.png",
    thumbSrc: "/assets/marketing/og-default.png",
    kind: "key-art",
    tags: ["press", "og"],
    downloadName: "riftwilds-key-art.png",
  },
  {
    id: "key-commons-region",
    title: "Commons region art",
    description: "Riftwild Commons landmark for stream overlays.",
    href: "/assets/regions/riftwild-commons.png",
    thumbSrc: "/assets/regions/riftwild-commons.png",
    kind: "key-art",
    tags: ["press", "commons"],
    downloadName: "riftwilds-commons-key-art.png",
  },
];

export type ShareMoment = {
  id: string;
  title: string;
  caption: string;
  /** Path to share (relative site path) */
  sharePath: string;
  imageSrc: string;
  hook: string;
};

/** OG previews live under share/og/ (distinct scenes; not the legacy egg-in-rings templates). */
export const SHARE_MOMENTS: ShareMoment[] = [
  {
    id: "moment-hatch",
    title: "I hatched a Riftling",
    caption: "Claim a free egg and meet your first companion in Riftwilds.",
    sharePath: "/hatchery",
    imageSrc: "/assets/fan-kit/share/og/moment-hatch.svg",
    hook: "Hatch free",
  },
  {
    id: "moment-comics",
    title: "Legends of the Rift",
    caption: "Read the official comic series — original lore, cozy pages.",
    sharePath: "/comics",
    imageSrc: "/assets/fan-kit/share/og/moment-comics.svg",
    hook: "Read comics",
  },
  {
    id: "moment-commons",
    title: "Visit the Commons",
    caption: "Walk Riftwild Commons in Live World — plaza vibes, NPCs, friends.",
    sharePath: "/live-world",
    imageSrc: "/assets/fan-kit/share/og/moment-commons.svg",
    hook: "Enter Live World",
  },
  {
    id: "moment-coloring",
    title: "Kids coloring pack",
    caption: "28 printable Riftling coloring pages — free for families.",
    sharePath: "/coloring",
    imageSrc: "/assets/fan-kit/share/og/moment-coloring.svg",
    hook: "Color & print",
  },
  {
    id: "moment-printables",
    title: "300 DPI printables",
    caption: "Stickers, posters, bookmarks, and circus party invites — print-ready.",
    sharePath: "/printables",
    imageSrc: "/assets/fan-kit/share/og/moment-printables.svg",
    hook: "Download printables",
  },
  {
    id: "moment-keeper",
    title: "Become a Keeper",
    caption: "Care, explore, and collect cosmetics — Credits ≠ SOL.",
    sharePath: "/about",
    imageSrc: "/assets/fan-kit/share/og/moment-keeper.svg",
    hook: "Learn the story",
  },
  {
    id: "moment-soundtrack",
    title: "Listen to the Rift",
    caption: "Ambience teasers from the Riftwilds soundtrack.",
    sharePath: "/fan-kit#listen",
    imageSrc: "/assets/fan-kit/share/og/moment-listen.svg",
    hook: "Listen",
  },
];

export type ListenTrack = {
  id: string;
  label: string;
  blurb: string;
  src: string;
};

/** Short looping previews reuse existing soundtrack stems. */
export const LISTEN_TRACKS: ListenTrack[] = [
  {
    id: "airy",
    label: "Airy Commons",
    blurb: "Soft plaza breeze — gentle welcome theme.",
    src: "/sounds/music/airy.mp3",
  },
  {
    id: "magic-space",
    label: "Rift Glow",
    blurb: "Wonder-forward rift ambience for hatch moments.",
    src: "/sounds/music/magic-space.mp3",
  },
  {
    id: "sector",
    label: "Keeper Roads",
    blurb: "Traveling pulse for region hops and festivals.",
    src: "/sounds/music/sector.mp3",
  },
  {
    id: "pulse",
    label: "Festival Pulse",
    blurb: "A brighter loop for circus nights and gatherings.",
    src: "/sounds/music/pulse.mp3",
  },
];
