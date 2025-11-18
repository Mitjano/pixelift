import { db } from "@/lib/firebase";
import { collection, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { ApiKey } from "@/types/api";
import { validateApiKeyFormat } from "./generateApiKey";

/**
 * Validate API key and return key data
 */
export async function validateApiKey(key: string): Promise<ApiKey | null> {
  // Validate format first
  if (!validateApiKeyFormat(key)) {
    return null;
  }

  try {
    // Query Firestore for API key
    const apiKeysRef = collection(db, "apiKeys");
    const keyDoc = await getDoc(doc(apiKeysRef, key));

    if (!keyDoc.exists()) {
      return null;
    }

    const data = keyDoc.data();

    // Check if key is active
    if (!data.isActive) {
      return null;
    }

    // Convert Firestore Timestamp to Date
    const apiKey: ApiKey = {
      id: keyDoc.id,
      key: data.key,
      userId: data.userId,
      name: data.name,
      plan: data.plan,
      rateLimit: data.rateLimit,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastUsedAt: data.lastUsedAt?.toDate() || null,
      isActive: data.isActive,
      environment: data.environment,
    };

    // Update last used timestamp (fire and forget)
    updateDoc(doc(apiKeysRef, key), {
      lastUsedAt: Timestamp.now(),
    }).catch((error) => {
      console.error("Failed to update lastUsedAt:", error);
    });

    return apiKey;
  } catch (error) {
    console.error("Error validating API key:", error);
    return null;
  }
}

/**
 * Extract API key from Authorization header
 */
export function extractApiKeyFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;

  // Support both "Bearer <key>" and plain "<key>"
  const parts = authHeader.split(" ");

  if (parts.length === 2 && parts[0] === "Bearer") {
    return parts[1];
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return null;
}

/**
 * Create error response for authentication failures
 */
export function createAuthErrorResponse(message: string, statusCode: number = 401) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: statusCode === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
        message,
      },
    }),
    {
      status: statusCode,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
