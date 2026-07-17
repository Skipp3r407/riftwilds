import { LegalShell } from "@/components/marketing/legal-shell";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy">
      <p>Placeholder pending attorney review. Wallet addresses and gameplay events may be stored to
        operate the game. Analytics should avoid sending raw wallets to third parties without disclosure.</p>
    </LegalShell>
  );
}
