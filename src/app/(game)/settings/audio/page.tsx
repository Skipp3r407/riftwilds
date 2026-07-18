"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { AudioSettingsPanel } from "@/components/settings/audio-settings-panel";

export default function AudioSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Settings"
        titleSlug="audio"
        title="Audio"
        description="Master, music, ambient, UI, SFX, pet, combat, and weather buses. Mute-all respects autoplay unlock and reduced-motion preferences."
        status="Sound"
        statusTone="info"
      />
      <section className="panel p-4 md:p-6">
        <AudioSettingsPanel />
      </section>
      <p className="text-xs text-[var(--text-dim)]">
        Credits for CC0 music and original procedural SFX live in{" "}
        <code className="text-[var(--text-muted)]">public/sounds/</code>. See also{" "}
        <Link href="/settings/keybinds" className="text-[var(--cyan)]">
          keybinds
        </Link>
        .
      </p>
    </div>
  );
}
