/**
 * API Route: AI Chat Conversation [id]
 *
 * GET /api/ai-chat/conversations/[id] - Pobierz konwersację z wiadomościami
 * PATCH /api/ai-chat/conversations/[id] - Aktualizuj konwersację
 * DELETE /api/ai-chat/conversations/[id] - Usuń konwersację
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET - Pobierz konwersację z wiadomościami
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Pobierz konwersację
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        OR: [
          { id, userId: user.id },
          { slug: id, userId: user.id },
          { shareToken: id, isPublic: true }, // Publiczne konwersacje
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            model: true,
            inputTokens: true,
            outputTokens: true,
            creditsUsed: true,
            responseTime: true,
            attachments: true,
            rating: true,
            isError: true,
            errorMessage: true,
            createdAt: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH - Aktualizuj konwersację
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Sprawdź czy konwersacja istnieje i należy do użytkownika
    const existing = await prisma.chatConversation.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const body = await request.json();
    const allowedFields = [
      'title',
      'model',
      'systemPrompt',
      'temperature',
      'folderId',
      'isPinned',
      'isArchived',
      'isPublic',
    ];

    // Filtruj tylko dozwolone pola
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Generuj shareToken jeśli ustawiamy isPublic na true
    if (body.isPublic === true && !existing.shareToken) {
      const { nanoid } = await import('nanoid');
      updateData.shareToken = nanoid(16);
    }

    // Aktualizuj konwersację
    const conversation = await prisma.chatConversation.update({
      where: { id: existing.id },
      data: updateData,
      select: {
        id: true,
        slug: true,
        title: true,
        model: true,
        systemPrompt: true,
        temperature: true,
        isPinned: true,
        isArchived: true,
        isPublic: true,
        shareToken: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Update conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE - Usuń konwersację
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Sprawdź czy konwersacja istnieje i należy do użytkownika
    const existing = await prisma.chatConversation.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Usuń konwersację (cascade usunie też wiadomości)
    await prisma.chatConversation.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
