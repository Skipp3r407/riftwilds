"use client";

import Link from "next/link";
import { ProfileDashboard } from "@/components/profile";
import { PageHeader } from "@/components/shared/page-header";
import { RiftPageShell } from "@/components/ui/rift-page-shell";
import { RiftPanel } from "@/components/ui/rift-panel";

export default function ProfilePage() {
  return (
    <RiftPageShell mood="hearth">
      <div className="space-y-6">
        <PageHeader
          kicker="Account"
          titleSlug="profile"
          title="Keeper Profile"
          description="Your Riftwilds identity — display name, biography hooks, wallet (optional), $RIFT tier, roster stats, loadout, and preferences. Email/social login first; wallet later. Holdings never imply guaranteed returns."
          status="Keeper HUD"
          statusTone="info"
        />
        <RiftPanel material="marble" padding="sm">
          <p className="text-sm text-white">Profile enrichment</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Biography, gallery, and public Riftling showcase hooks live on pet pages and collection.
            Soft identity (no wallet) is supported via{" "}
            <Link href="/login" className="text-[var(--cyan)]">
              Account
            </Link>
            ; full dashboard at{" "}
            <Link href="/dashboard" className="text-[var(--cyan)]">
              /dashboard
            </Link>
            .
          </p>
        </RiftPanel>
        <ProfileDashboard />
      </div>
    </RiftPageShell>
  );
}
