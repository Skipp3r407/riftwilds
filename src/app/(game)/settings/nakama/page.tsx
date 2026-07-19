"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { NakamaStatusPanel } from "@/components/nakama/nakama-status-panel";

export default function NakamaSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Settings"
        titleSlug="social"
        title="Nakama"
        description="Local multiplayer backend bridge. Enable via NEXT_PUBLIC_NAKAMA_ENABLED after docker compose up."
        status="Bridge"
        statusTone="info"
      />
      <NakamaStatusPanel />
      <p className="text-xs text-[var(--text-dim)]">
        Also see{" "}
        <Link href="/social" className="text-[var(--cyan)]">
          Social Hub
        </Link>
        ,{" "}
        <Link href="/login" className="text-[var(--cyan)]">
          Account
        </Link>
        , and{" "}
        <Link href="/tcg/battle" className="text-[var(--cyan)]">
          Rift Battle invites
        </Link>
        .
      </p>
    </div>
  );
}
