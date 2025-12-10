/**
 * Health check endpoint for monitoring and load balancers
 * GET /api/health
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRedisClient } from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: { status: 'up' | 'down'; latency?: number };
    redis: { status: 'up' | 'down' | 'disabled'; latency?: number };
  };
}

const startTime = Date.now();

export async function GET() {
  const checks: HealthStatus['checks'] = {
    database: { status: 'down' },
    redis: { status: 'disabled' },
  };

  // Check database connection
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'up', latency: Date.now() - dbStart };
  } catch {
    checks.database = { status: 'down' };
  }

  // Check Redis connection if configured
  const redisStart = Date.now();
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
      checks.redis = { status: 'up', latency: Date.now() - redisStart };
    }
  } catch {
    checks.redis = { status: 'down' };
  }

  // Determine overall status
  const isHealthy = checks.database.status === 'up';
  const isDegraded = !isHealthy || checks.redis.status === 'down';

  const health: HealthStatus = {
    status: isHealthy ? (isDegraded ? 'degraded' : 'healthy') : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };

  const statusCode = health.status === 'unhealthy' ? 503 : 200;

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
