"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ImageButton } from "@/components/ui/image-button";
import { useViewOnlyWallet } from "@/components/wallet/view-only-wallet-context";
import { cn } from "@/lib/utils/cn";

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

function ConnectOptionsModal({
  open,
  onClose,
  onWalletAdapter,
  onPasteConnect,
}: {
  open: boolean;
  onClose: () => void;
  onWalletAdapter: () => void;
  onPasteConnect: (address: string) => { ok: true } | { ok: false; error: string };
}) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setShowPaste(false);
      setDraft("");
      setError(null);
      return;
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && showPaste) {
      inputRef.current?.focus();
    }
  }, [open, showPaste]);

  if (!open) return null;

  function submitPaste(e: FormEvent) {
    e.preventDefault();
    const result = onPasteConnect(draft);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    onClose();
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (draft) {
        setDraft("");
        setError(null);
      } else {
        setShowPaste(false);
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-3 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-sm p-4 shadow-[0_0_40px_rgba(61,231,255,0.12)] sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="page-kicker">Wallet</p>
            <h2 id={titleId} className="font-display text-lg text-white">
              Connect
            </h2>
          </div>
          <button
            type="button"
            className="btn-ghost focus-ring px-2 py-1 text-xs text-[var(--text-muted)]"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
          Use a Solana wallet to sign and spend, or paste an address for view-only lookups.
        </p>

        <div className="mt-4 grid gap-2">
          <ImageButton
            variant="primary"
            size="sm"
            className="w-full justify-center px-3 py-2.5 text-sm"
            onClick={() => {
              onWalletAdapter();
              onClose();
            }}
          >
            Connect wallet
          </ImageButton>
          <p className="text-center text-[10px] text-[var(--text-dim)]">
            Phantom, Solflare, and other adapters
          </p>

          <button
            type="button"
            className={cn(
              "btn-secondary focus-ring mt-1 w-full px-3 py-2.5 text-sm",
              showPaste && "border-[var(--stroke-strong)]",
            )}
            aria-expanded={showPaste}
            onClick={() => {
              setShowPaste((v) => !v);
              setError(null);
            }}
          >
            Paste wallet address
          </button>
        </div>

        {showPaste ? (
          <form className="mt-3 grid gap-2" onSubmit={submitPaste}>
            <label htmlFor="view-only-wallet-input" className="sr-only">
              Solana wallet address
            </label>
            <input
              ref={inputRef}
              id="view-only-wallet-input"
              name="wallet"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="Paste Solana address…"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={onInputKeyDown}
              className={cn(
                "w-full rounded-[var(--radius-md)] border border-[var(--stroke)]",
                "bg-[rgba(8,12,22,0.85)] px-3 py-2.5 text-sm text-white",
                "placeholder:text-[var(--text-dim)] focus-ring",
              )}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "view-only-wallet-error" : "view-only-wallet-hint"}
            />
            <p id="view-only-wallet-hint" className="text-[10px] leading-relaxed text-[var(--amber)]">
              View-only — no signer. You can check balances and profile, but cannot send SOL or
              sign transactions.
            </p>
            {error ? (
              <p id="view-only-wallet-error" className="text-xs text-[var(--danger)]" role="alert">
                {error}
              </p>
            ) : null}
            <ImageButton
              type="submit"
              variant="secondary"
              size="sm"
              className="w-full justify-center px-3 py-2 text-sm"
              disabled={!draft.trim()}
            >
              Connect view-only
            </ImageButton>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function WalletConnectButtonLive() {
  const { publicKey, connected, disconnect, signMessage } = useWallet();
  const { setVisible } = useWalletModal();
  const { address: viewOnlyAddress, connectViewOnly, disconnectViewOnly } = useViewOnlyWallet();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const authenticate = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setModalOpen(true);
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
  }, [publicKey, signMessage]);

  const handleDisconnect = useCallback(async () => {
    disconnectViewOnly();
    if (connected) {
      await disconnect();
    }
  }, [connected, disconnect, disconnectViewOnly]);

  const openAdapter = useCallback(() => {
    disconnectViewOnly();
    setVisible(true);
  }, [disconnectViewOnly, setVisible]);

  // Clear stale pasted identity once a real adapter session is active.
  useEffect(() => {
    if (connected && publicKey && viewOnlyAddress) {
      disconnectViewOnly();
    }
  }, [connected, publicKey, viewOnlyAddress, disconnectViewOnly]);

  // Real adapter takes priority over pasted view-only.
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
          onClick={() => void handleDisconnect()}
        >
          Disconnect
        </ImageButton>
        {error ? <span className="sr-only">{error}</span> : null}
      </div>
    );
  }

  if (viewOnlyAddress) {
    return (
      <div className="flex max-w-[min(100%,14rem)] items-center gap-1.5 sm:gap-2">
        <div className="min-w-0">
          <ImageButton
            variant="secondary"
            size="sm"
            className="max-w-full px-2.5 py-2 text-xs md:px-3 md:text-sm"
            onClick={() => setModalOpen(true)}
            title={`${viewOnlyAddress} (view-only)`}
          >
            <span className="inline-flex max-w-full items-center gap-1.5">
              <span className="truncate">{shortAddress(viewOnlyAddress)}</span>
              <span className="shrink-0 rounded border border-[var(--amber)]/40 bg-[rgba(255,184,77,0.12)] px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--amber)]">
                View-only
              </span>
            </span>
          </ImageButton>
        </div>
        <ImageButton
          variant="ghost"
          size="sm"
          className="shrink-0 px-2 py-1.5 text-xs text-[var(--text-muted)]"
          onClick={() => void handleDisconnect()}
        >
          Disconnect
        </ImageButton>
        <ConnectOptionsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onWalletAdapter={openAdapter}
          onPasteConnect={connectViewOnly}
        />
      </div>
    );
  }

  return (
    <>
      <ImageButton
        variant="primary"
        size="sm"
        className="px-3 py-2 text-xs md:text-sm"
        onClick={() => setModalOpen(true)}
        aria-haspopup="dialog"
      >
        Connect Wallet
      </ImageButton>
      <ConnectOptionsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onWalletAdapter={openAdapter}
        onPasteConnect={connectViewOnly}
      />
    </>
  );
}

/** Avoid useWallet() during SSR before WalletProvider exists. */
export function WalletConnectButton() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  if (!mounted) return <ConnectPlaceholder />;
  return <WalletConnectButtonLive />;
}
