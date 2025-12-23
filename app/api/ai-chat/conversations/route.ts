/**
 * API Route: AI Chat Conversations
 *
 * GET /api/ai-chat/conversations - Lista konwersacji użytkownika
 * POST /api/ai-chat/conversations - Utwórz nową konwersację
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { DEFAULT_MODEL_ID } from '@/lib/ai-chat';

/**
 * GET - Lista konwersacji
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parametry paginacji
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const archived = searchParams.get('archived') === 'true';
    const folderId = searchParams.get('folderId');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Buduj warunki where
    const where: Record<string, unknown> = {
      userId: user.id,
      isArchived: archived,
    };

    if (folderId) {
      where.folderId = folderId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { messages: { some: { content: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // Pobierz konwersacje
    const [conversations, total] = await Promise.all([
      prisma.chatConversation.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { lastMessageAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          model: true,
          messageCount: true,
          totalTokens: true,
          creditsUsed: true,
          isPinned: true,
          isArchived: true,
          createdAt: true,
          lastMessageAt: true,
          folder: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      }),
      prisma.chatConversation.count({ where }),
    ]);

    return NextResponse.json({
      conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST - Utwórz nową konwersację
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      model = DEFAULT_MODEL_ID,
      systemPrompt,
      temperature = 0.7,
      folderId,
    } = body;

    // Utwórz konwersację
    const conversation = await prisma.chatConversation.create({
      data: {
        userId: user.id,
        slug: `chat-${nanoid(10)}`,
        title: title || 'Nowa rozmowa',
        model,
        systemPrompt,
        temperature,
        folderId,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        model: true,
        systemPrompt: true,
        temperature: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
