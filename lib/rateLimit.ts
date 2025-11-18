import { getRedisClient } from "./redis";
import { ApiKey, RateLimitConfig } from "@/types/api";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
}

/**
 * Check if API key has exceeded rate limits
 */
export async function checkRateLimit(
  apiKey: ApiKey,
  window: "hour" | "day" = "hour"
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  const now = Date.now();
  const windowMs = window === "hour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const limit =
    window === "hour"
      ? apiKey.rateLimit.requestsPerHour
      : apiKey.rateLimit.requestsPerDay;

  const key = `ratelimit:${apiKey.id}:${window}`;

  try {
    // Use sorted set to store timestamps of requests
    const windowStart = now - windowMs;

    // Remove old entries outside the current window
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    const count = await redis.zcard(key);

    if (count >= limit) {
      // Rate limit exceeded
      const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
      const resetAt = oldest.length > 0 ? new Date(parseInt(oldest[1]) + windowMs) : new Date(now + windowMs);

      return {
        allowed: false,
        remaining: 0,
        limit,
        resetAt,
      };
    }

    // Add current request
    await redis.zadd(key, now, `${now}-${Math.random()}`);

    // Set expiry on the key
    await redis.expire(key, Math.ceil(windowMs / 1000));

    return {
      allowed: true,
      remaining: limit - count - 1,
      limit,
      resetAt: new Date(now + windowMs),
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: limit,
      limit,
      resetAt: new Date(now + windowMs),
    };
  }
}

/**
 * Check concurrent jobs limit
 */
export async function checkConcurrentJobsLimit(apiKey: ApiKey): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
}> {
  const redis = getRedisClient();
  const key = `concurrent:${apiKey.id}`;

  try {
    const current = parseInt((await redis.get(key)) || "0");
    const limit = apiKey.rateLimit.concurrentJobs;

    return {
      allowed: current < limit,
      current,
      limit,
    };
  } catch (error) {
    console.error("Concurrent jobs check error:", error);
    return {
      allowed: true,
      current: 0,
      limit: apiKey.rateLimit.concurrentJobs,
    };
  }
}

/**
 * Increment concurrent jobs counter
 */
export async function incrementConcurrentJobs(apiKeyId: string): Promise<void> {
  const redis = getRedisClient();
  const key = `concurrent:${apiKeyId}`;

  try {
    await redis.incr(key);
    // Set expiry in case we miss the decrement
    await redis.expire(key, 600); // 10 minutes
  } catch (error) {
    console.error("Increment concurrent jobs error:", error);
  }
}

/**
 * Decrement concurrent jobs counter
 */
export async function decrementConcurrentJobs(apiKeyId: string): Promise<void> {
  const redis = getRedisClient();
  const key = `concurrent:${apiKeyId}`;

  try {
    const current = await redis.decr(key);
    if (current <= 0) {
      await redis.del(key);
    }
  } catch (error) {
    console.error("Decrement concurrent jobs error:", error);
  }
}
