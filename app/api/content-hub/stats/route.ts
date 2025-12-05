import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/content-hub/stats - Get Content Hub statistics
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');

    const localeFilter = locale ? { locale } : {};

    // Keywords stats
    const keywordsTotal = await prisma.keywordBank.count({ where: localeFilter });
    const keywordsByStatus = await prisma.keywordBank.groupBy({
      by: ['status'],
      where: localeFilter,
      _count: { status: true }
    });

    // Content Plans stats
    const plansTotal = await prisma.contentPlan.count({
      where: locale ? { targetLocale: locale } : {}
    });
    const plansByStatus = await prisma.contentPlan.groupBy({
      by: ['status'],
      where: locale ? { targetLocale: locale } : {},
      _count: { status: true }
    });

    // Articles stats
    const articlesTotal = await prisma.contentArticle.count({ where: localeFilter });
    const articlesByStatus = await prisma.contentArticle.groupBy({
      by: ['status'],
      where: localeFilter,
      _count: { status: true }
    });

    // Published articles count
    const publishedArticles = await prisma.contentArticle.count({
      where: {
        ...localeFilter,
        status: 'published'
      }
    });

    // AI generated articles
    const aiGeneratedArticles = await prisma.contentArticle.count({
      where: {
        ...localeFilter,
        aiGenerated: true
      }
    });

    // Translations count
    const translations = await prisma.contentArticle.count({
      where: {
        isTranslation: true
      }
    });

    // Alerts stats
    const alertsNew = await prisma.contentAlert.count({
      where: { status: 'new' }
    });
    const alertsByType = await prisma.contentAlert.groupBy({
      by: ['type'],
      where: { status: 'new' },
      _count: { type: true }
    });

    // Scheduled posts
    const scheduledPosts = await prisma.contentPublishSchedule.count({
      where: { status: 'scheduled' }
    });

    // Social posts
    const socialPostsScheduled = await prisma.contentSocialPost.count({
      where: { status: 'scheduled' }
    });

    // Clusters count
    const clustersCount = await prisma.keywordCluster.count({
      where: locale ? { locale } : {}
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentKeywords = await prisma.keywordBank.count({
      where: {
        ...localeFilter,
        createdAt: { gte: sevenDaysAgo }
      }
    });

    const recentArticles = await prisma.contentArticle.count({
      where: {
        ...localeFilter,
        createdAt: { gte: sevenDaysAgo }
      }
    });

    return NextResponse.json({
      keywords: {
        total: keywordsTotal,
        byStatus: Object.fromEntries(
          keywordsByStatus.map(s => [s.status, s._count.status])
        ),
        recentlyAdded: recentKeywords,
        clusters: clustersCount
      },
      plans: {
        total: plansTotal,
        byStatus: Object.fromEntries(
          plansByStatus.map(s => [s.status, s._count.status])
        )
      },
      articles: {
        total: articlesTotal,
        byStatus: Object.fromEntries(
          articlesByStatus.map(s => [s.status, s._count.status])
        ),
        published: publishedArticles,
        aiGenerated: aiGeneratedArticles,
        translations: translations,
        recentlyCreated: recentArticles
      },
      alerts: {
        new: alertsNew,
        byType: Object.fromEntries(
          alertsByType.map(a => [a.type, a._count.type])
        )
      },
      scheduled: {
        articles: scheduledPosts,
        socialPosts: socialPostsScheduled
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
