import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllTickets } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get all tickets and filter by user email
    const allTickets = getAllTickets();
    const userTickets = allTickets.filter(
      (ticket) => ticket.userEmail === session.user.email
    );

    // Sort by creation date (newest first)
    userTickets.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      tickets: userTickets
    });
  } catch (error) {
    console.error('Failed to fetch user tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
