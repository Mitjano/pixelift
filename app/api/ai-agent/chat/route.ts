/**
 * AI Agent Chat API
 *
 * POST /api/ai-agent/chat - Send message to agent (streaming)
 */

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { createOrchestrator, getStateManager } from '@/lib/ai-agent';
import type { AgentEvent } from '@/lib/ai-agent';

/**
 * POST - Send message to AI Agent (streaming response)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { sessionId, message, images } = body;

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!message && (!images || images.length === 0)) {
      return new Response(JSON.stringify({ error: 'Message or images required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get session from state manager
    const stateManager = getStateManager();
    const agentSession = stateManager.getSession(sessionId);

    if (!agentSession) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (agentSession.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user credits (placeholder - integrate with your credits system)
    const availableCredits = 100; // TODO: Get from user record

    // Create orchestrator
    const orchestrator = createOrchestrator(
      sessionId,
      session.user.id,
      agentSession.config,
      availableCredits
    );

    // Build user message with images if provided
    let userMessage = message || '';
    if (images && images.length > 0) {
      // Add image references to message
      userMessage += images.length === 1
        ? '\n\n[User uploaded 1 image]'
        : `\n\n[User uploaded ${images.length} images]`;

      // Store images in session
      for (const img of images) {
        stateManager.addImage(sessionId, {
          id: img.id || `img_${Date.now()}`,
          url: img.url,
          format: img.format || 'unknown',
          width: img.width || 0,
          height: img.height || 0,
          size: img.size || 0,
          createdAt: new Date(),
          source: 'upload',
        });
      }
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Run agent with streaming
          const eventGenerator = orchestrator.runStream(userMessage);

          for await (const event of eventGenerator) {
            const sseData = formatSSEEvent(event);
            controller.enqueue(encoder.encode(sseData));
          }

          // Update session state
          const updatedSession = orchestrator.getSession();
          stateManager.updateSession(sessionId, {
            status: updatedSession.status,
            steps: updatedSession.steps,
            totalCreditsUsed: updatedSession.totalCreditsUsed,
            messages: updatedSession.messages,
          });

          controller.close();
        } catch (error) {
          console.error('[ai-agent/chat] Stream error:', error);
          const errorEvent: AgentEvent = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          controller.enqueue(encoder.encode(formatSSEEvent(errorEvent)));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[ai-agent/chat] POST error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Format agent event as SSE
 */
function formatSSEEvent(event: AgentEvent): string {
  const data = JSON.stringify(event);
  return `data: ${data}\n\n`;
}
