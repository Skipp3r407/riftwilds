/**
 * Procedural Art Expansion — pipeline hooks for region packs / seasons / festivals.
 * Does not generate images; declares jobs for scripts/assets pipelines.
 */

export type ArtJobKind =
  | "region_overlay"
  | "festival_decor"
  | "furniture_variant"
  | "weather_fx"
  | "boss_silhouette"
  | "emote_sheet"
  | "codex_illumination";

export type ArtPipelineJob = {
  id: string;
  kind: ArtJobKind;
  promptKey: string;
  outputPathHint: string;
  priority: number;
  packId: string;
  metadata: Record<string, string>;
};

export function buildArtJobsForPack(input: {
  packId: string;
  regionSlugs?: string[];
  festivalKeys?: string[];
}): ArtPipelineJob[] {
  const jobs: ArtPipelineJob[] = [];
  for (const slug of input.regionSlugs ?? []) {
    jobs.push({
      id: `${input.packId}_overlay_${slug}`,
      kind: "region_overlay",
      promptKey: `region-overlay/${slug}`,
      outputPathHint: `public/assets/worlds/${slug}/overlays/`,
      priority: 2,
      packId: input.packId,
      metadata: { regionSlug: slug },
    });
    jobs.push({
      id: `${input.packId}_weather_${slug}`,
      kind: "weather_fx",
      promptKey: `weather-fx/${slug}`,
      outputPathHint: `public/assets/effects/weather/${slug}/`,
      priority: 3,
      packId: input.packId,
      metadata: { regionSlug: slug },
    });
  }
  for (const fest of input.festivalKeys ?? []) {
    jobs.push({
      id: `${input.packId}_fest_${fest}`,
      kind: "festival_decor",
      promptKey: `festival/${fest}`,
      outputPathHint: `public/assets/events/${fest}/`,
      priority: 2,
      packId: input.packId,
      metadata: { festivalKey: fest },
    });
  }
  return jobs;
}
