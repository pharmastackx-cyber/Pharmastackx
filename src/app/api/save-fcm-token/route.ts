
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(request: Request) {
  // --- Start of Diagnostic ---
  console.log("--- Headers for /api/save-fcm-token ---");
  console.log(request.headers);
  // --- End of Diagnostic ---
  
  await dbConnect();

  const { token: fcmToken } = await request.json();

  if (!fcmToken) {
    return NextResponse.json({ error: 'FCM token is required.' }, { status: 400 });
  }

  const sessionCookie = request.headers.get('cookie');
  const sessionToken = sessionCookie?.split('; ').find(c => c.startsWith('session_token='))?.split('=')[1];

  if (!sessionToken) {
    return NextResponse.json({ error: 'User session not found. Please log in.' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(sessionToken, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session token: User ID is missing.' }, { status: 401 });
    }

    // Find the user and add the new FCM token to the array if it's not already there
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { fcmTokens: fcmToken } }, // Use $addToSet to prevent duplicates
      { new: true, upsert: false } // `new: true` returns the modified doc, `upsert: false` doesn't create a new doc if not found
    );

    return NextResponse.json({ message: 'FCM token saved successfully.' });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid session token.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
