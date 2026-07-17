"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ImageButton } from "@/components/ui/image-button";

const emptySubscribe = () => () => {};

function shortAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function ConnectPlaceholder() {
  return (
    <ImageButton variant="primary" size="sm" className="px-3 py-2 text-xs opacity-90 md:text-sm" disabled>
      Connect Wallet
    </ImageButton>
  );
}

function WalletConnectButtonLive() {
  const { publicKey, connected, disconnect, signMessage } = useWallet();
  const { setVisible } = useWalletModal();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setVisible(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const nonceRes = await fetch(`/api/auth/nonce?wallet=${publicKey.toBase58()}`);
      const nonceJson = (await nonceRes.json()) as {
        message?: string;
        error?: { message: string };
      };
      if (!nonceRes.ok || !nonceJson.message) {
        throw new Error(nonceJson.error?.message ?? "Failed to get nonce");
      }
      const encoded = new TextEncoder().encode(nonceJson.message);
      const signature = await signMessage(encoded);
      const signatureBase58 = (await import("bs58")).default.encode(signature);
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          signature: signatureBase58,
          message: nonceJson.message,
        }),
      });
      const verifyJson = (await verifyRes.json()) as { error?: { message: string } };
      if (!verifyRes.ok) {
        throw new Error(verifyJson.error?.message ?? "Signature verification failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }, [publicKey, signMessage, setVisible]);

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <ImageButton
          variant="secondary"
          size="sm"
          className="px-3 py-2 text-xs md:text-sm"
          onClick={() => void authenticate()}
          disabled={busy}
        >
          {busy ? "Signing…" : shortAddress(publicKey.toBase58())}
        </ImageButton>
        <ImageButton
          variant="ghost"
          size="sm"
          className="px-2 py-1.5 text-xs text-[var(--text-muted)]"
          onClick={() => void disconnect()}
        >
          Disconnect
        </ImageButton>
        {error ? <span className="sr-only">{error}</span> : null}
      </div>
    );
  }

  return (
    <ImageButton
      variant="primary"
      size="sm"
      className="px-3 py-2 text-xs md:text-sm"
      onClick={() => setVisible(true)}
    >
      Connect Wallet
    </ImageButton>
  );
}

/** Avoid useWallet() during SSR before WalletProvider exists. */
export function WalletConnectButton() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  if (!mounted) return <ConnectPlaceholder />;
  return <WalletConnectButtonLive />;
}
