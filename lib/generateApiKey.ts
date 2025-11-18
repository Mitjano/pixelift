import { nanoid } from "nanoid";

/**
 * Generate a secure API key
 * Format: pk_live_xxx or pk_test_xxx
 */
export function generateApiKey(environment: "live" | "test" = "live"): string {
  const prefix = `pk_${environment}_`;
  const randomPart = nanoid(32); // 32 characters = ~191 bits of entropy
  return `${prefix}${randomPart}`;
}

/**
 * Validate API key format
 */
export function validateApiKeyFormat(key: string): boolean {
  const regex = /^pk_(live|test)_[A-Za-z0-9_-]{32}$/;
  return regex.test(key);
}

/**
 * Extract environment from API key
 */
export function getKeyEnvironment(key: string): "live" | "test" | null {
  if (key.startsWith("pk_live_")) return "live";
  if (key.startsWith("pk_test_")) return "test";
  return null;
}

/**
 * Mask API key for display (show only last 4 characters)
 */
export function maskApiKey(key: string): string {
  if (key.length < 12) return "****";
  const lastFour = key.slice(-4);
  const prefix = key.split("_").slice(0, 2).join("_");
  return `${prefix}_****${lastFour}`;
}
