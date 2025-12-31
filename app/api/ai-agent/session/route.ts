/**
 * AI Agent Session API
 *
 * POST /api/ai-agent/session - Create new session
 * GET /api/ai-agent/session - List user sessions
 * DELETE /api/ai-agent/session?id=xxx - Delete session
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { nanoid } from 'nanoid';
import { getStateManager } from '@/lib/ai-agent';
import type { OrchestratorConfig } from '@/lib/ai-agent';

// Default system prompt for AI Agent
const DEFAULT_SYSTEM_PROMPT = `You are PixeLift AI Agent - an intelligent assistant specialized in image editing and processing.

IMPORTANT: When a user sends an image, it is already included in the message as base64. You can see and analyze the image directly. When you need to process the image with a tool, use the special value "UPLOADED_IMAGE" as the image_url parameter - the system will automatically use the uploaded image.

Available tools:
- remove_background: Remove background from images (use image_url: "UPLOADED_IMAGE")
- upscale_image: Upscale images 2x or 4x (use image_url: "UPLOADED_IMAGE", scale: "2x" or "4x")
- compress_image: Compress images for web (use image_url: "UPLOADED_IMAGE", quality: 80)
- convert_format: Convert image format (use image_url: "UPLOADED_IMAGE", format: "png"/"jpg"/"webp")
- resize_image: Resize image dimensions (use image_url: "UPLOADED_IMAGE", width/height)
- crop_image: Crop image (use image_url: "UPLOADED_IMAGE", x, y, width, height)
- generate_image: Generate new image from text prompt
- analyze_image: Analyze image content (use image_url: "UPLOADED_IMAGE")
- extract_text: Extract text from image OCR (use image_url: "UPLOADED_IMAGE")

When a user asks you to process an uploaded image:
1. You can see the image - describe what you see briefly
2. Choose the appropriate tool and call it with image_url: "UPLOADED_IMAGE"
3. The system will use the uploaded image automatically

Always respond in the user's language (Polish if they write in Polish).
Be helpful and concise.`;

/**
 * POST - Create new AI Agent session
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    // Generate unique session ID
    const sessionId = `agent_${nanoid(12)}`;

    // Build config
    const config: OrchestratorConfig = {
      model: body.model || 'anthropic/claude-sonnet-4',
      systemPrompt: body.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      temperature: body.temperature ?? 0.7,
      maxTokens: body.maxTokens ?? 4096,
      maxSteps: body.maxSteps ?? 10,
      availableTools: body.availableTools, // undefined = all tools
    };

    // Get user credits (placeholder - integrate with your credits system)
    const availableCredits = 100; // TODO: Get from user record

    // Create session in state manager
    const stateManager = getStateManager();
    const agentSession = stateManager.createSession({
      sessionId,
      userId: session.user.id,
      status: 'idle',
      config,
      messages: [],
      steps: [],
      totalCreditsUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      session: {
        id: sessionId,
        status: agentSession.status,
        config: {
          model: config.model,
          temperature: config.temperature,
          maxSteps: config.maxSteps,
        },
        availableCredits,
        createdAt: agentSession.createdAt,
      },
    });
  } catch (error) {
    console.error('[ai-agent/session] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

/**
 * GET - List user's AI Agent sessions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    const stateManager = getStateManager();

    // If specific session requested
    if (sessionId) {
      const agentSession = stateManager.getSession(sessionId);
      if (!agentSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      if (agentSession.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json({
        session: {
          id: agentSession.sessionId,
          status: agentSession.status,
          steps: agentSession.steps.length,
          creditsUsed: agentSession.totalCreditsUsed,
          images: stateManager.getImages(sessionId),
          createdAt: agentSession.createdAt,
          updatedAt: agentSession.updatedAt,
        },
      });
    }

    // List all sessions for user
    const sessionIds = await stateManager.getUserSessions(session.user.id);
    const sessions = sessionIds
      .map((id) => stateManager.getSession(id))
      .filter((s) => s !== null)
      .map((s) => ({
        id: s!.sessionId,
        status: s!.status,
        steps: s!.steps.length,
        creditsUsed: s!.totalCreditsUsed,
        createdAt: s!.createdAt,
        updatedAt: s!.updatedAt,
      }));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('[ai-agent/session] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete AI Agent session
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const stateManager = getStateManager();
    const agentSession = stateManager.getSession(sessionId);

    if (!agentSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (agentSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await stateManager.deleteSession(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ai-agent/session] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
