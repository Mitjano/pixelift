import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, extractApiKeyFromHeader, createAuthErrorResponse } from "@/lib/apiAuth";
import { checkRateLimit, checkConcurrentJobsLimit, incrementConcurrentJobs } from "@/lib/rateLimit";
import { addUpscaleJob } from "@/lib/queue";
import { JobInput } from "@/types/api";
import { nanoid } from "nanoid";

/**
 * POST /api/v1/upscale
 * Submit an image upscaling job
 */
export async function POST(request: NextRequest) {
  const requestId = nanoid(12);

  try {
    // 1. Authenticate API key
    const authHeader = request.headers.get("authorization");
    const apiKeyString = extractApiKeyFromHeader(authHeader);

    if (!apiKeyString) {
      return createAuthErrorResponse("Missing API key. Provide it in Authorization header.", 401);
    }

    const apiKey = await validateApiKey(apiKeyString);

    if (!apiKey) {
      return createAuthErrorResponse("Invalid or inactive API key.", 401);
    }

    // 2. Check rate limits (hourly)
    const rateLimitResult = await checkRateLimit(apiKey, "hour");

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Rate limit exceeded. Limit: ${rateLimitResult.limit} requests per hour.`,
            details: {
              limit: rateLimitResult.limit,
              remaining: rateLimitResult.remaining,
              resetAt: rateLimitResult.resetAt,
            },
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetAt.toISOString(),
          },
        }
      );
    }

    // 3. Check concurrent jobs limit
    const concurrentCheck = await checkConcurrentJobsLimit(apiKey);

    if (!concurrentCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONCURRENT_LIMIT_EXCEEDED",
            message: `Too many concurrent jobs. Limit: ${concurrentCheck.limit}.`,
            details: {
              current: concurrentCheck.current,
              limit: concurrentCheck.limit,
            },
          },
        },
        { status: 429 }
      );
    }

    // 4. Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.image_url && !body.image_data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "Either 'image_url' or 'image_data' (base64) is required.",
          },
        },
        { status: 400 }
      );
    }

    // Build job input
    const jobInput: JobInput = {
      imageUrl: body.image_url,
      imageData: body.image_data,
      scale: body.scale || 2,
      enhanceFace: body.enhance_face ?? false,
      denoise: body.denoise ?? false,
      removeArtifacts: body.remove_artifacts ?? false,
      colorCorrection: body.color_correction ?? false,
      preset: body.preset,
    };

    // Validate scale
    if (![1, 2, 4, 8].includes(jobInput.scale)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "Scale must be one of: 1, 2, 4, 8.",
          },
        },
        { status: 400 }
      );
    }

    // 5. Increment concurrent jobs counter
    await incrementConcurrentJobs(apiKey.id);

    // 6. Add job to queue
    const priority = apiKey.plan === "enterprise" ? 1 : apiKey.plan === "professional" ? 5 : 10;

    const jobId = await addUpscaleJob({
      apiKeyId: apiKey.id,
      userId: apiKey.userId,
      input: jobInput,
      webhookUrl: body.webhook_url,
      priority,
    });

    // 7. Return response
    return NextResponse.json(
      {
        success: true,
        data: {
          job_id: jobId,
          status: "pending",
          estimated_time: "15-60s",
          message: "Job submitted successfully. Use GET /api/v1/jobs/:id to check status.",
        },
        meta: {
          requestId,
          timestamp: new Date(),
          rateLimit: {
            remaining: rateLimitResult.remaining,
            limit: rateLimitResult.limit,
            reset: rateLimitResult.resetAt,
          },
        },
      },
      {
        status: 202, // Accepted
        headers: {
          "X-Request-Id": requestId,
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.resetAt.toISOString(),
        },
      }
    );
  } catch (error: any) {
    console.error("Error in /api/v1/upscale:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred.",
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        meta: {
          requestId,
          timestamp: new Date(),
        },
      },
      { status: 500 }
    );
  }
}
