import type { Metadata } from "next";
import { AboutExperience } from "@/components/about";
import { ABOUT_META, characterProfiles, aboutChapters } from "@/content/about/riftwilds-origin";
import { projectConfig } from "@/lib/config/project";

export const metadata: Metadata = {
  title: { absolute: ABOUT_META.title },
  description: ABOUT_META.description,
  openGraph: {
    title: ABOUT_META.title,
    description: ABOUT_META.description,
    type: "website",
    siteName: projectConfig.PROJECT_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: ABOUT_META.title,
    description: ABOUT_META.description,
  },
  keywords: [
    "Riftwilds",
    "Riftlings",
    "Riftkeepers",
    "Aeryndra",
    "origin story",
    "how Riftlings were born",
    "fantasy game lore",
    "Elara Venn",
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: ABOUT_META.title,
      description: ABOUT_META.description,
      about: {
        "@type": "VideoGame",
        name: projectConfig.PROJECT_NAME,
        genre: "Creature collecting adventure",
        gamePlatform: "Web browser",
      },
    },
    {
      "@type": "CreativeWork",
      name: "The Story of the Riftwilds",
      genre: "Fictional universe lore",
      abstract: ABOUT_META.description,
      character: characterProfiles.map((c) => ({
        "@type": "Person",
        name: c.name,
        description: c.role,
      })),
      mentions: aboutChapters.map((c) => c.heading),
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AboutExperience />
    </>
  );
}
