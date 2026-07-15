import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const hasRedis = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const redis = hasRedis ? Redis.fromEnv() : null;

export const chatRatelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, '1 h'), prefix: 'chatbot:chat' })
  : null;

export const bookingRatelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '1 h'), prefix: 'chatbot:booking' })
  : null;

/**
 * Both limiters are null when Upstash Redis isn't provisioned (e.g. local dev
 * without `vercel env pull`). Callers should treat a null limiter as "allow" —
 * see README for provisioning Upstash via the Vercel Marketplace before prod.
 */
export async function checkRateLimit(limiter: Ratelimit | null, identifier: string) {
  if (!limiter) return { success: true } as const;
  return limiter.limit(identifier);
}
