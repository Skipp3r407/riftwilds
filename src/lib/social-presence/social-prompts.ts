/**
 * Random social prompts — nudge meaningful engagement, not AFK standing.
 */

import { SOCIAL_PROMPT_POOL } from "@/lib/social-presence/config";
import type { SocialPrompt } from "@/lib/social-presence/types";

export function pickSocialPrompt(
  userId: string,
  regionSlug?: string | null,
  now = Date.now(),
): SocialPrompt {
  const bucket = Math.floor(now / (5 * 60_000));
  const seed = [...`${userId}:${bucket}:${regionSlug ?? ""}`].reduce(
    (a, c) => a + c.charCodeAt(0),
    0,
  );
  const pick = SOCIAL_PROMPT_POOL[seed % SOCIAL_PROMPT_POOL.length]!;
  return {
    id: `prompt_${bucket}_${seed % SOCIAL_PROMPT_POOL.length}`,
    text: pick.text,
    suggestedAction: pick.suggestedAction,
    regionSlug: regionSlug ?? undefined,
  };
}
