import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/content-hub/keywords/clusters - Get all clusters with keyword counts
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');

    // Get clusters from KeywordCluster model
    const clusters = await prisma.keywordCluster.findMany({
      where: locale ? { locale } : undefined,
      orderBy: { name: 'asc' }
    });

    // Get keyword counts per cluster
    const clusterCounts = await prisma.keywordBank.groupBy({
      by: ['cluster'],
      where: {
        cluster: { not: null },
        ...(locale ? { locale } : {})
      },
      _count: { cluster: true }
    });

    // Map counts to clusters
    const countMap = new Map(
      clusterCounts.map(c => [c.cluster, c._count.cluster])
    );

    // Also get unclustered keywords count
    const unclustered = await prisma.keywordBank.count({
      where: {
        cluster: null,
        ...(locale ? { locale } : {})
      }
    });

    const clustersWithCounts = clusters.map(cluster => ({
      ...cluster,
      keywordCount: countMap.get(cluster.name) || 0
    }));

    // Add clusters that exist in KeywordBank but not in KeywordCluster
    const existingClusterNames = new Set(clusters.map(c => c.name));
    for (const [clusterName, count] of countMap) {
      if (clusterName && !existingClusterNames.has(clusterName)) {
        clustersWithCounts.push({
          id: `auto_${clusterName}`,
          name: clusterName,
          description: null,
          locale: locale || 'en',
          color: null,
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          keywordCount: count
        });
      }
    }

    return NextResponse.json({
      clusters: clustersWithCounts,
      unclustered
    });
  } catch (error) {
    console.error('Error fetching clusters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clusters' },
      { status: 500 }
    );
  }
}

// POST /api/content-hub/keywords/clusters - Create new cluster
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, locale = 'en', color, parentId } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Cluster name is required' },
        { status: 400 }
      );
    }

    // Check if cluster already exists
    const existing = await prisma.keywordCluster.findUnique({
      where: {
        name_locale: {
          name,
          locale
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Cluster already exists' },
        { status: 409 }
      );
    }

    const cluster = await prisma.keywordCluster.create({
      data: {
        name,
        description,
        locale,
        color,
        parentId
      }
    });

    return NextResponse.json(cluster);
  } catch (error) {
    console.error('Error creating cluster:', error);
    return NextResponse.json(
      { error: 'Failed to create cluster' },
      { status: 500 }
    );
  }
}

// DELETE /api/content-hub/keywords/clusters - Delete cluster (and optionally reassign keywords)
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clusterName = searchParams.get('name');
    const locale = searchParams.get('locale') || 'en';
    const reassignTo = searchParams.get('reassignTo');

    if (!clusterName) {
      return NextResponse.json(
        { error: 'Cluster name is required' },
        { status: 400 }
      );
    }

    // Reassign or unassign keywords
    await prisma.keywordBank.updateMany({
      where: {
        cluster: clusterName,
        locale
      },
      data: {
        cluster: reassignTo || null
      }
    });

    // Delete from KeywordCluster if exists
    await prisma.keywordCluster.deleteMany({
      where: {
        name: clusterName,
        locale
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cluster:', error);
    return NextResponse.json(
      { error: 'Failed to delete cluster' },
      { status: 500 }
    );
  }
}
