import type { Metadata } from "next";
import { FanKitHub } from "@/components/fan-kit/fan-kit-hub";
import { projectConfig } from "@/lib/config/project";

export const metadata: Metadata = {
  title: "Fan Kit | Downloads & Share",
  description:
    "Free Riftwilds Fan Kit — wallpapers, stickers, 300 DPI printables, avatar frames, coloring, soundtrack teasers, and shareable moment cards for Keepers, kids, and streamers.",
  openGraph: {
    title: "Riftwilds Fan Kit",
    description:
      "Downloads, stickers, 300 DPI printables, coloring, and share cards for the Riftwilds community.",
    type: "website",
    siteName: projectConfig.PROJECT_NAME,
    images: [{ url: "/assets/marketing/og-default.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Riftwilds Fan Kit",
    description: "Wallpapers, stickers, coloring, and shareable moments.",
    images: ["/assets/marketing/og-default.png"],
  },
};

export default function FanKitPage() {
  return <FanKitHub />;
}
