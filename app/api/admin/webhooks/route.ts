import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createWebhook, updateWebhook, deleteWebhook, triggerWebhook } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, webhookId, event, payload } = body;

    // Handle test webhook trigger
    if (action === 'test' && webhookId) {
      await triggerWebhook(webhookId, event || 'test.event', payload || { test: true, timestamp: new Date().toISOString() });
      return NextResponse.json({ success: true, message: 'Test webhook triggered' });
    }

    // Handle create webhook
    const { name, url, events, enabled, secret, headers, retryAttempts } = body;

    if (!name || !url || !events) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const webhook = createWebhook({
      name,
      url,
      events: Array.isArray(events) ? events : events.split(',').map((e: string) => e.trim()).filter((e: string) => e),
      enabled: enabled ?? true,
      secret,
      headers: headers || {},
      retryAttempts: retryAttempts ?? 3,
    });

    return NextResponse.json({ success: true, webhook });
  } catch (error) {
    console.error('Webhook creation error:', error);
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If events is a string, convert to array
    if (updates.events && typeof updates.events === 'string') {
      updates.events = updates.events.split(',').map((e: string) => e.trim()).filter((e: string) => e);
    }

    const webhook = updateWebhook(id, updates);

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, webhook });
  } catch (error) {
    console.error('Webhook update error:', error);
    return NextResponse.json({ error: 'Failed to update webhook' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const success = deleteWebhook(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Webhook delete error:', error);
    return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
  }
}
