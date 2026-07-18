import { projectConfig } from "@/lib/config/project";

export const PRESS_BLURB = {
  title: `What is ${projectConfig.PROJECT_NAME}?`,
  subtitle: "Streamer & creator one-pager",
  bullets: [
    "A cozy fantasy creature world — hatch Riftlings, care for them, explore Live World Commons, and read original comics.",
    "Family-friendly surface with coloring pages, wallpapers, and a free Hatchery start. No pay-to-win gate for the core care loop.",
    "Optional crypto layer for curious Keepers ($RIFT / Credits lore) — Credits are not SOL, and nothing here promises profit.",
  ],
  talkingPoints: [
    "Start free at the Hatchery — claim an egg, meet a Riftling.",
    "Show Legends of the Rift comics + Live World plaza walk.",
    "Point kids/parents to /coloring, /printables (300 DPI), and /fan-kit (safe downloads).",
    "Creator Hub for community packs; Fan Kit for logos & stickers.",
  ],
  keyArtHref: "/assets/marketing/og-default.png",
  keyArtDownloadName: "riftwilds-key-art.png",
  links: [
    { href: "/", label: "Home" },
    { href: "/about", label: "Origin story" },
    { href: "/comics", label: "Comics" },
    { href: "/live-world", label: "Live World" },
    { href: "/hatchery", label: "Hatchery" },
    { href: "/fan-kit", label: "Fan Kit" },
    { href: "/creators", label: "Creator Hub" },
  ],
} as const;

export const KIDS_CORNER = {
  title: "Parents & Kids Corner",
  lede: "Riftwilds is built to feel like a warm fantasy storybook first — hatch, care, color, and read.",
  points: [
    {
      title: "Safety-minded play",
      body: "Core care and comics don’t require spending. Live World chat is community-facing — parents should supervise younger players online.",
    },
    {
      title: "Coloring, printables & comics",
      body: "Free line-art coloring pages, 300 DPI full-color printables (stickers, posters, cards), and Legends of the Rift comics for shared couch time.",
    },
    {
      title: "No pay-to-win care",
      body: "You don’t need to buy a coin to love your Riftling. Credits are in-world cosmetics/progress flavor — not SOL, not a cash pet.",
    },
    {
      title: "Crypto is optional",
      body: "Token pages exist for curious Keepers. Kids can enjoy Hatchery, comics, and coloring without touching crypto at all.",
    },
  ],
} as const;
