import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, subject, htmlContent, textContent, variables, category, status } = body;

    if (!name || !slug || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      const template = createEmailTemplate({
        name,
        slug,
        subject,
        htmlContent: htmlContent || '',
        textContent: textContent || '',
        variables: variables || [],
        category: category || 'transactional',
        status: status || 'draft',
      });

      return NextResponse.json({ success: true, template });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  } catch (error) {
    console.error('Email template creation error:', error);
    return NextResponse.json({ error: 'Failed to create email template' }, { status: 500 });
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

    const template = updateEmailTemplate(id, updates);

    if (!template) {
      return NextResponse.json({ error: 'Email template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error('Email template update error:', error);
    return NextResponse.json({ error: 'Failed to update email template' }, { status: 500 });
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

    const success = deleteEmailTemplate(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Email template delete error:', error);
    return NextResponse.json({ error: 'Failed to delete email template' }, { status: 500 });
  }
}
