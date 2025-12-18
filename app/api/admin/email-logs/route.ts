import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const emailType = url.searchParams.get('emailType');
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (emailType) where.emailType = emailType;
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { recipientEmail: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.emailLog.count({ where }),
    ]);

    // Get stats
    const stats = await prisma.emailLog.groupBy({
      by: ['status'],
      _count: true,
    });

    const categoryStats = await prisma.emailLog.groupBy({
      by: ['category'],
      _count: true,
    });

    const typeStats = await prisma.emailLog.groupBy({
      by: ['emailType'],
      _count: true,
      orderBy: { _count: { emailType: 'desc' } },
      take: 10,
    });

    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await prisma.emailLog.count({
      where: { createdAt: { gte: today } },
    });

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        todayCount,
        byStatus: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
        byCategory: categoryStats.reduce((acc, s) => ({ ...acc, [s.category]: s._count }), {}),
        topTypes: typeStats.map(t => ({ type: t.emailType, count: t._count })),
      },
    });
  } catch (error) {
    console.error('Failed to fetch email logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email logs' },
      { status: 500 }
    );
  }
}

// Manual email logging (for testing or manual entries)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      recipientEmail,
      recipientName,
      subject,
      category,
      emailType,
      status = 'sent',
      metadata,
    } = body;

    if (!recipientEmail || !subject || !category || !emailType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const log = await prisma.emailLog.create({
      data: {
        recipientEmail,
        recipientName,
        subject,
        category,
        emailType,
        fromEmail: 'Pixelift <noreply@pixelift.pl>',
        status,
        provider: 'manual',
        metadata,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Failed to create email log:', error);
    return NextResponse.json(
      { error: 'Failed to create email log' },
      { status: 500 }
    );
  }
}
