"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { KeybindsPanel } from "@/components/live-world/keybinds-panel";

export default function KeybindsSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Settings"
        titleSlug="keybinds"
        title="Keybinds"
        description="Remap Live World movement, HUD hotkeys, and chat. Changes persist locally and apply the next time you enter the world."
        status="Input"
        statusTone="info"
      />
      <section className="panel p-4 md:p-6">
        <KeybindsPanel />
      </section>
      <p className="text-xs text-[var(--text-dim)]">
        Also available from{" "}
        <Link href="/profile" className="text-[var(--cyan)]">
          Profile → Settings
        </Link>
        ,{" "}
        <Link href="/settings/audio" className="text-[var(--cyan)]">
          Audio
        </Link>
        , and in-world via F2.
      </p>
    </div>
  );
}
