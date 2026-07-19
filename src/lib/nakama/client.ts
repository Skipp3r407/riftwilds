import { Client } from "@heroiclabs/nakama-js";
import { getNakamaPublicConfig } from "@/lib/nakama/config";

let sharedClient: Client | null = null;
let sharedKey: string | null = null;

/** Singleton Nakama JS client (browser or Node). Safe to call repeatedly. */
export function getNakamaClient(forceNew = false): Client {
  const cfg = getNakamaPublicConfig();
  const key = `${cfg.host}:${cfg.port}:${cfg.useSSL}:${cfg.serverKey}`;
  if (!forceNew && sharedClient && sharedKey === key) return sharedClient;

  sharedClient = new Client(cfg.serverKey, cfg.host, String(cfg.port), cfg.useSSL);
  if (cfg.trace) {
    // Soft debug — avoid dumping tokens.
    console.info("[nakama] client ready", {
      host: cfg.host,
      port: cfg.port,
      useSSL: cfg.useSSL,
    });
  }
  sharedKey = key;
  return sharedClient;
}

export function resetNakamaClient(): void {
  sharedClient = null;
  sharedKey = null;
}

/** Best-effort health probe against the Nakama HTTP API. */
export async function probeNakamaHealth(
  timeoutMs = 2500,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const cfg = getNakamaPublicConfig();
  if (!cfg.enabled) {
    return { ok: false, error: "NAKAMA_DISABLED" };
  }
  const scheme = cfg.useSSL ? "https" : "http";
  const url = `${scheme}://${cfg.host}:${cfg.port}/healthcheck`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "NAKAMA_UNREACHABLE",
    };
  } finally {
    clearTimeout(timer);
  }
}
