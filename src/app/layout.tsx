import type { Metadata, Viewport } from "next";
import { Manrope, Orbitron } from "next/font/google";
import { WalletProviderDynamic } from "@/components/wallet/wallet-provider-dynamic";
import { NakamaProvider } from "@/components/nakama/nakama-provider";
import { QueryProvider } from "@/components/shared/query-provider";
import { MusicPlayer } from "@/components/shared/music-player";
import { HudInteraction } from "@/components/shared/hud-interaction";
import { MagicalDust } from "@/components/shared/magical-dust";
import { RiftCursor } from "@/components/shared/rift-cursor";
import { projectConfig } from "@/lib/config/project";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${projectConfig.PROJECT_NAME} — Hatch. Explore. Battle. Evolve.`,
    template: `%s · ${projectConfig.PROJECT_NAME}`,
  },
  description:
    "Enter the Riftwilds, hatch mysterious Riftlings, train your team, and explore a community-owned creature universe on Solana.",
  applicationName: projectConfig.PROJECT_NAME,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/assets/brand/favicon-16.png?v=theme4", sizes: "16x16", type: "image/png" },
      { url: "/assets/brand/favicon-32.png?v=theme4", sizes: "32x32", type: "image/png" },
      { url: "/assets/brand/riftwilds-mark.png?v=theme4", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/assets/brand/apple-touch-icon.png?v=theme4", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: `${projectConfig.PROJECT_NAME} — Hatch. Explore. Battle. Evolve.`,
    description:
      "Enter the Riftwilds, hatch mysterious Riftlings, train your team, and explore a community-owned creature universe on Solana.",
    siteName: projectConfig.PROJECT_NAME,
    images: [
      {
        url: "/assets/marketing/og-default.png",
        width: 1200,
        height: 675,
        alt: "Riftwilds — a living rift landscape with hatchery light and lantern plaza",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${projectConfig.PROJECT_NAME} — Hatch. Explore. Battle. Evolve.`,
    description:
      "Enter the Riftwilds, hatch mysterious Riftlings, train your team, and explore a community-owned creature universe on Solana.",
    images: ["/assets/marketing/og-default.png"],
  },
  appleWebApp: {
    capable: true,
    title: projectConfig.PROJECT_NAME,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${orbitron.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          <NakamaProvider>
            <WalletProviderDynamic>{children}</WalletProviderDynamic>
          </NakamaProvider>
        </QueryProvider>
        <HudInteraction />
        <MagicalDust />
        <RiftCursor />
        <MusicPlayer />
      </body>
    </html>
  );
}
