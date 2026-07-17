import type { Metadata, Viewport } from "next";
import { Manrope, Orbitron } from "next/font/google";
import { WalletProviderDynamic } from "@/components/wallet/wallet-provider-dynamic";
import { QueryProvider } from "@/components/shared/query-provider";
import { MusicPlayer } from "@/components/shared/music-player";
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
    icon: [{ url: "/assets/brand/riftwilds-mark.png?v=theme2", type: "image/png" }],
    apple: [{ url: "/assets/brand/riftwilds-mark.png?v=theme2", type: "image/png" }],
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
          <WalletProviderDynamic>{children}</WalletProviderDynamic>
        </QueryProvider>
        <MusicPlayer />
      </body>
    </html>
  );
}
