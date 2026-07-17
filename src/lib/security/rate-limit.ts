/**
 * In-memory rate limiter for local/dev.
 * Swap for Upstash Redis in production via RateLimitProvider.
 */

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitProvider {
  limit(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}

export const memoryRateLimiter: RateLimitProvider = {
  async limit(key, limit, windowMs) {
    const now = Date.now();
    const existing = buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      const resetAt = now + windowMs;
      buckets.set(key, { count: 1, resetAt });
      return { success: true, remaining: limit - 1, resetAt };
    }
    if (existing.count >= limit) {
      return { success: false, remaining: 0, resetAt: existing.resetAt };
    }
    existing.count += 1;
    buckets.set(key, existing);
    return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt };
  },
};

export async function enforceRateLimit(
  provider: RateLimitProvider,
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  return provider.limit(key, limit, windowMs);
}
