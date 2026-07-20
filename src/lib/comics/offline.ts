/**
 * Offline-ready scaffolding for the comic reader.
 * Caches issue metadata + page art URLs via Cache API when available.
 * Does not implement a full service worker — hooks for future SW registration.
 */

import type { ComicIssue } from "@/content/comics/types";

export const COMIC_OFFLINE_CACHE = "riftwilds-comics-offline-v1";

export type ComicOfflineManifest = {
  version: 1;
  slug: string;
  cachedAt: string;
  pageUrls: string[];
  coverUrls: string[];
};

export function buildOfflineManifest(issue: ComicIssue): ComicOfflineManifest {
  const pageUrls = [
    ...new Set(
      issue.pages.flatMap((p) => [
        p.artSrc,
        ...p.panels.map((panel) => panel.artSrc),
      ]).filter((u): u is string => Boolean(u)),
    ),
  ];
  const coverUrls = issue.covers.map((c) => c.src);
  return {
    version: 1,
    slug: issue.slug,
    cachedAt: new Date().toISOString(),
    pageUrls,
    coverUrls,
  };
}

/** Best-effort prefetch — no-ops when Cache API unavailable. */
export async function prefetchIssueOffline(issue: ComicIssue): Promise<{
  ok: boolean;
  cached: number;
  reason?: string;
}> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return { ok: false, cached: 0, reason: "Cache API unavailable" };
  }
  try {
    const manifest = buildOfflineManifest(issue);
    const cache = await caches.open(COMIC_OFFLINE_CACHE);
    const urls = [...manifest.coverUrls, ...manifest.pageUrls];
    let cached = 0;
    await Promise.all(
      urls.map(async (url) => {
        try {
          const res = await fetch(url, { mode: "no-cors" });
          await cache.put(url, res.clone());
          cached += 1;
        } catch {
          // skip missing plates
        }
      }),
    );
    await cache.put(
      `/comics/offline-manifest/${issue.slug}`,
      new Response(JSON.stringify(manifest), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    return { ok: true, cached };
  } catch {
    return { ok: false, cached: 0, reason: "Prefetch failed" };
  }
}

/** Future: register SW that serves COMIC_OFFLINE_CACHE. */
export function offlineReadyNote(): string {
  return "Offline scaffolding active — Cache API prefetch available; service worker registration TBD.";
}
