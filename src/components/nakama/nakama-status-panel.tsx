"use client";

import { useEffect, useState } from "react";
import { useNakamaOptional } from "@/hooks/use-nakama";
import { nakamaConsoleUrl, getNakamaPublicConfig } from "@/lib/nakama/config";

type StatusJson = {
  enabled: boolean;
  reachable: boolean | null;
  host: string;
  port: number;
  consoleUrl: string;
  features: Record<string, boolean>;
  note: string;
  dockerHint?: string;
};

export function NakamaStatusPanel() {
  const nakama = useNakamaOptional();
  const [status, setStatus] = useState<StatusJson | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const cfg = getNakamaPublicConfig();

  useEffect(() => {
    void fetch("/api/nakama/status")
      .then((r) => r.json())
      .then((data: StatusJson) => setStatus(data))
      .catch(() => setStatus(null));
  }, [nakama?.state]);

  async function onGuest() {
    // Guest Nakama login disabled — NO ACCOUNT = NO GAMEPLAY.
    return;
  }

  async function onEmail(create: boolean) {
    if (!nakama) return;
    setBusy(true);
    await nakama.connectEmail(email, password, create);
    setBusy(false);
  }

  return (
    <section className="panel space-y-4 p-4 md:p-6">
      <header className="space-y-1">
        <h2 className="font-display text-lg text-white">Nakama multiplayer</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Additive backend for realtime social / matchmaking. Existing guest, SIWS, TCG
          invites, and friends/PM keep working when Nakama is offline.
        </p>
      </header>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--text-dim)]">Client flag</dt>
          <dd className="text-white">{cfg.enabled ? "enabled" : "disabled"}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-dim)]">Session</dt>
          <dd className="text-white">{nakama?.state ?? "no provider"}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-dim)]">Server</dt>
          <dd className="text-white">
            {status?.host ?? cfg.host}:{status?.port ?? cfg.port}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--text-dim)]">Reachable</dt>
          <dd className="text-white">
            {status?.reachable === null
              ? "n/a"
              : status?.reachable
                ? "yes"
                : "no (start Docker stack)"}
          </dd>
        </div>
      </dl>

      {nakama?.session ? (
        <p className="text-xs text-[var(--text-muted)]">
          Nakama user <code className="text-[var(--cyan)]">{nakama.session.userId}</code>
          {nakama.method ? ` via ${nakama.method}` : null}
        </p>
      ) : null}

      {nakama?.error ? (
        <p className="text-sm text-[var(--warn)]" role="alert">
          {nakama.error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-secondary focus-ring"
          disabled
          title="Guest play disabled — sign in with a Riftkeeper account"
          onClick={() => void onGuest()}
        >
          Guest login (disabled)
        </button>
        <button
          type="button"
          className="btn-secondary focus-ring"
          disabled={!nakama || busy || !nakama.session}
          onClick={() => void nakama?.disconnect()}
        >
          Disconnect
        </button>
        <a
          className="btn-secondary focus-ring inline-flex items-center"
          href={status?.consoleUrl ?? nakamaConsoleUrl(cfg)}
          target="_blank"
          rel="noreferrer"
        >
          Console
        </a>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input
          className="focus-ring rounded border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm text-white"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="focus-ring rounded border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm text-white"
          type="password"
          placeholder="password (8+)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="btn-secondary focus-ring"
          disabled={!nakama || busy || !cfg.enabled}
          onClick={() => void onEmail(true)}
        >
          Create
        </button>
        <button
          type="button"
          className="btn-secondary focus-ring"
          disabled={!nakama || busy || !cfg.enabled}
          onClick={() => void onEmail(false)}
        >
          Sign in
        </button>
      </div>

      {status?.note ? (
        <p className="text-xs text-[var(--text-dim)]">{status.note}</p>
      ) : null}
      {status?.dockerHint ? (
        <p className="text-xs text-[var(--warn)]">{status.dockerHint}</p>
      ) : null}

      <p className="text-xs text-[var(--text-dim)]">
        Docs: <code className="text-[var(--text-muted)]">docs/nakama.md</code>
      </p>
    </section>
  );
}
