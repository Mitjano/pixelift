import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/content-hub/keywords/bulk - Bulk operations on keywords
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ids, data } = body;

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing action or ids' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'delete':
        // Bulk delete keywords
        result = await prisma.keywordBank.deleteMany({
          where: { id: { in: ids } }
        });
        return NextResponse.json({
          success: true,
          deleted: result.count
        });

      case 'updateStatus':
        // Bulk update status
        if (!data?.status) {
          return NextResponse.json(
            { error: 'Missing status' },
            { status: 400 }
          );
        }
        result = await prisma.keywordBank.updateMany({
          where: { id: { in: ids } },
          data: { status: data.status }
        });
        return NextResponse.json({
          success: true,
          updated: result.count
        });

      case 'updateCluster':
        // Bulk update cluster
        result = await prisma.keywordBank.updateMany({
          where: { id: { in: ids } },
          data: { cluster: data?.cluster || null }
        });
        return NextResponse.json({
          success: true,
          updated: result.count
        });

      case 'updatePriority':
        // Bulk update priority
        if (typeof data?.priority !== 'number') {
          return NextResponse.json(
            { error: 'Missing priority' },
            { status: 400 }
          );
        }
        result = await prisma.keywordBank.updateMany({
          where: { id: { in: ids } },
          data: { priority: data.priority }
        });
        return NextResponse.json({
          success: true,
          updated: result.count
        });

      case 'archive':
        // Archive keywords
        result = await prisma.keywordBank.updateMany({
          where: { id: { in: ids } },
          data: { status: 'archived' }
        });
        return NextResponse.json({
          success: true,
          archived: result.count
        });

      case 'restore':
        // Restore archived keywords
        result = await prisma.keywordBank.updateMany({
          where: { id: { in: ids } },
          data: { status: 'new' }
        });
        return NextResponse.json({
          success: true,
          restored: result.count
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
