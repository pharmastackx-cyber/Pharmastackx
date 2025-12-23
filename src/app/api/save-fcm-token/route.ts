
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token');

  if (!sessionToken) {
    return NextResponse.json({ message: 'Unauthorized: No session token' }, { status: 401 });
  }

  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ message: 'FCM token is required' }, { status: 400 });
    }

    // Verify the JWT to get the user's ID
    const payload = jwt.verify(sessionToken.value, JWT_SECRET) as { userId: string };
    const userId = payload.userId;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    await dbConnect();

    // Find the user and add the new token if it doesn't already exist
    await User.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: token },
    });

    return NextResponse.json({ message: 'FCM token saved successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error saving FCM token:', error);
    // Check for specific JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
