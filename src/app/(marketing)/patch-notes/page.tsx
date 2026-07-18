import type { Metadata } from "next";
import { PatchNotesView } from "@/components/marketing/patch-notes";
import { listPatchNotes } from "@/content/patch-notes";
import { projectConfig } from "@/lib/config/project";

export const metadata: Metadata = {
  title: "Patch Notes | Updates",
  description:
    "Riftwilds patch notes — features, fixes, and known issues for every push. Newest updates first.",
  openGraph: {
    title: "Riftwilds Patch Notes",
    description: "What shipped in each Riftwilds update — Added, Fixed, Changed, and Known issues.",
    type: "website",
    siteName: projectConfig.PROJECT_NAME,
    images: [{ url: "/assets/marketing/og-default.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Riftwilds Patch Notes",
    description: "Release notes for every Riftwilds push.",
    images: ["/assets/marketing/og-default.png"],
  },
  alternates: {
    canonical: "/patch-notes",
  },
};

export default function PatchNotesPage() {
  return <PatchNotesView entries={listPatchNotes()} />;
}
