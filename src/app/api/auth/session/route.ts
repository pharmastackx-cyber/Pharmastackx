
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

// Ensure this secret matches the one in the login route
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function GET() {
  const cookieStore = cookies();
  const sessionToken = (await cookieStore).get('session_token');

  if (!sessionToken) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();

    // Verify the token using jsonwebtoken
    const payload = jwt.verify(sessionToken.value, JWT_SECRET) as { userId: string };
    const userId = payload.userId;

    if (!userId) {
      throw new Error('Invalid token payload');
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Return the user object, which includes the role
    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('Session API Error:', error);
    // This can happen if the token is expired or malformed
    return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
  }
}
