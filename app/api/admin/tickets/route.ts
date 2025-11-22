import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createTicket, updateTicket, deleteTicket, addTicketMessage } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ticketId, message } = body;

    if (action === 'add_message' && ticketId && message) {
      const ticket = addTicketMessage(ticketId, session.user.email || 'Staff', message, true);
      return NextResponse.json({ success: true, ticket });
    }

    const { subject, description, status, priority, category, userId, userName, userEmail, assignedTo } = body;

    if (!subject || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ticket = createTicket({
      subject,
      description,
      status: status || 'open',
      priority: priority || 'medium',
      category: category || 'other',
      userId: userId || 'anonymous',
      userName: userName || 'Anonymous',
      userEmail: userEmail || '',
      assignedTo,
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Ticket creation error:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
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

    const ticket = updateTicket(id, updates);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Ticket update error:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
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

    const success = deleteTicket(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Ticket delete error:', error);
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}
