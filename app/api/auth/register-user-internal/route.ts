import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, updateUserLogin, createNotification } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';

// Internal endpoint for user registration during OAuth callback
// Does NOT require authentication (called by NextAuth signIn callback)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, image } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    let user = getUserByEmail(email);
    const isNewUser = !user;

    if (!user) {
      // Create new user
      const isAdmin = email === 'admin@pixelift.pl' || email === 'michalchmielarz00@gmail.com';

      console.log(`[register-user-internal] Creating new user: ${email}`);
      user = createUser({
        email,
        name: name || undefined,
        image: image || undefined,
        role: isAdmin ? 'admin' : 'user',
        status: 'active',
        credits: 3,
        totalUsage: 0,
        lastLoginAt: new Date().toISOString(),
      });
      console.log(`[register-user-internal] User created with ID: ${user.id}, role: ${user.role}`);

      // Create notification for new user registration
      createNotification({
        type: 'success',
        category: 'user',
        title: 'New User Registration',
        message: `${name || email} just registered for Pixelift`,
        metadata: { userId: user.id, email, name, role: user.role },
      });

      // Send welcome email for new users
      console.log(`[register-user-internal] Sending welcome email to: ${email}`);
      sendWelcomeEmail({
        userName: name || 'User',
        userEmail: email,
        freeCredits: 3,
      }).catch(err => console.error('[register-user-internal] Welcome email failed:', err));
    } else {
      // Update last login
      console.log(`[register-user-internal] Existing user login: ${email}, role: ${user.role}`);
      updateUserLogin(email);
    }

    return NextResponse.json({ success: true, user, isNewUser });
  } catch (error) {
    console.error('[register-user-internal] Error:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}
