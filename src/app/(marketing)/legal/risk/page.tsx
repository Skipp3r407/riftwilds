import { LegalShell } from "@/components/marketing/legal-shell";

export const metadata = { title: "Risk Disclosure" };

export default function RiskPage() {
  return (
    <LegalShell title="Token & Game Risk Disclosure">
      <p>
        This game and its related token involve digital assets whose value may change rapidly. The token
        is not a promise of profit, guaranteed rewards, ownership in a company, or guaranteed game access
        forever. Only interact with verified official links and never share your seed phrase.
      </p>
      <p className="mt-4">
        Sensitive financial features require acceptance of the current disclosure version before activation.
      </p>
    </LegalShell>
  );
}
