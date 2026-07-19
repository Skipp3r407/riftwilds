import { NextResponse } from "next/server";
import {
  getNakamaPublicConfig,
  nakamaConsoleUrl,
  nakamaFeatureMatrix,
} from "@/lib/nakama/config";
import { probeNakamaHealth } from "@/lib/nakama/client";
import type { NakamaStatusPayload } from "@/lib/nakama/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const cfg = getNakamaPublicConfig();
  const features = nakamaFeatureMatrix();

  let reachable: boolean | null = null;
  let probeError: string | undefined;
  if (cfg.enabled) {
    const probe = await probeNakamaHealth();
    reachable = probe.ok;
    probeError = probe.error;
  }

  const payload: NakamaStatusPayload & { dockerHint?: string; probeError?: string } = {
    enabled: cfg.enabled,
    reachable,
    host: cfg.host,
    port: cfg.port,
    useSSL: cfg.useSSL,
    consoleUrl: nakamaConsoleUrl(cfg),
    features,
    redisIncluded: true,
    note:
      "Nakama augments guest/SIWS, TCG invites, friends/PM, guilds shell, demo leaderboards, and Credits tournaments — it does not replace them.",
    probeError,
    dockerHint: reachable
      ? undefined
      : "If Docker Desktop is not installed, install it then run: docker compose up -d. See docs/nakama.md.",
  };

  return NextResponse.json(payload);
}
