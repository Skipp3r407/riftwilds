"use client";

import { useState, type FormEvent } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "fan-kit" }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.message ?? "Could not save that email yet.");
        return;
      }
      setStatus("ok");
      setMessage(data.message ?? "You’re on the list — Keeper Dispatch is coming soon.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network hiccup — try again in a moment.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="panel space-y-3 p-5" aria-label="Newsletter signup">
      <div>
        <h3 className="font-display text-lg text-white">Keeper Dispatch</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Weekly lore, comic drops, and festival heads-up. Honest stub for now — we store interest
          locally until the mailer goes live.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="keeper-dispatch-email">
          Email
        </label>
        <input
          id="keeper-dispatch-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@realm.mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--stroke)] bg-[rgba(10,12,16,0.65)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--text-dim)]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary focus-ring shrink-0 text-sm disabled:opacity-60"
        >
          {status === "loading" ? "Saving…" : "Notify me"}
        </button>
      </div>
      {message && (
        <p
          className={
            status === "ok" ? "text-xs text-[var(--emerald)]" : "text-xs text-[var(--amber)]"
          }
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
