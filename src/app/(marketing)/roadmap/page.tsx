import type { Metadata } from "next";
import { RoadmapView } from "@/components/marketing/roadmap-view";
import { ROADMAP_META } from "@/content/roadmap";
import { projectConfig } from "@/lib/config/project";

export const metadata: Metadata = {
  title: `${ROADMAP_META.title} | ${projectConfig.PROJECT_NAME}`,
  description: ROADMAP_META.description,
  openGraph: {
    title: `Riftwilds ${ROADMAP_META.title}`,
    description: ROADMAP_META.description,
    type: "website",
    siteName: projectConfig.PROJECT_NAME,
    images: [{ url: "/assets/marketing/og-default.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Riftwilds ${ROADMAP_META.title}`,
    description: ROADMAP_META.description,
    images: ["/assets/marketing/og-default.png"],
  },
  alternates: {
    canonical: "/roadmap",
  },
};

export default function RoadmapPage() {
  return <RoadmapView />;
}
