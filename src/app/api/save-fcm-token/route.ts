
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req: NextRequest) {
  // --- Start of Fix ---
  // Restore the `await` keyword. The cookies() function is asynchronous.
  const cookieStore = await cookies();
  // --- End of Fix ---
  
  const sessionToken = cookieStore.get('session_token');

  if (!sessionToken) {
    return NextResponse.json({ message: 'Unauthorized: No session token' }, { status: 401 });
  }

  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ message: 'FCM token is required' }, { status: 400 });
    }

    const payload = jwt.verify(sessionToken.value, JWT_SECRET) as { userId: string };
    const userId = payload.userId;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    await dbConnect();

    // Find the user and add the new token, with a check to ensure it worked.
    const updatedUser = await User.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: token },
    }, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found or could not be updated.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'FCM token saved successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error saving FCM token:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
