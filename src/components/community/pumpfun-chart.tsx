"use client";

import type { PumpfunPublicConfig } from "@/lib/community/pumpfun-config";

type Props = {
  config: PumpfunPublicConfig;
};

export function PumpfunChart({ config }: Props) {
  if (!config.configured) {
    return (
      <div className="panel flex min-h-[320px] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="font-display text-lg text-white">Chart awaiting mint</p>
        <p className="max-w-md text-sm text-[var(--text-muted)]">
          Set <code className="text-[var(--cyan)]">NEXT_PUBLIC_PUMPFUN_MINT</code> and optionally{" "}
          <code className="text-[var(--cyan)]">NEXT_PUBLIC_PUMPFUN_URL</code> to embed the live
          chart. We do not invent price data.
        </p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--stroke)] px-4 py-3">
        <p className="font-display text-sm text-white">Live chart</p>
        {config.chartExternalUrl ? (
          <a
            href={config.chartExternalUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[var(--cyan)] underline"
          >
            Open on {config.pumpFunUrl ? "Pump.fun / Dex" : "DexScreener"}
          </a>
        ) : null}
      </div>
      {config.chartEmbedUrl ? (
        <iframe
          title="Token chart"
          src={config.chartEmbedUrl}
          className="h-[420px] w-full border-0 bg-black"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : null}
      <p className="px-4 py-2 text-[10px] text-[var(--text-dim)]">
        Best-effort DexScreener embed. If the frame is blank, use the external link — Pump.fun may
        block iframes.
      </p>
    </div>
  );
}
