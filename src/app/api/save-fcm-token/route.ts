
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(request: Request) {
  console.log("--- New request to /api/save-fcm-token ---");

  try {
    await dbConnect();
    console.log("Database connection successful.");

    const { token: fcmToken } = await request.json();
    console.log("Received FCM Token on backend:", fcmToken);

    if (!fcmToken) {
      console.log("FCM token is missing in the request.");
      return NextResponse.json({ error: 'FCM token is required.' }, { status: 400 });
    }

    const sessionCookie = request.headers.get('cookie');
    const sessionToken = sessionCookie?.split('; ').find(c => c.startsWith('session_token='))?.split('=')[1];

    if (!sessionToken) {
      console.log("Session token not found in cookies.");
      return NextResponse.json({ error: 'User session not found. Please log in.' }, { status: 401 });
    }
    console.log("Extracted session token:", sessionToken);

    const decoded = jwt.verify(sessionToken, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;
    console.log("Decoded userId from token:", userId);

    if (!userId) {
      console.log("User ID is missing in the decoded session token.");
      return NextResponse.json({ error: 'Invalid session token: User ID is missing.' }, { status: 401 });
    }

    const userBeforeUpdate = await User.findById(userId);
    if (!userBeforeUpdate) {
        console.log("User with this ID not found in the database.");
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    console.log("User found before update. FCM Tokens:", userBeforeUpdate.fcmTokens);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { fcmTokens: fcmToken } },
      { new: true }
    );

    console.log("User after update attempt:", updatedUser);

    if (!updatedUser) {
        console.log("User was not found for update, despite being found moments before.");
        return NextResponse.json({ error: 'User disappeared during update operation.' }, { status: 500 });
    }

    // CORRECTED LOGIC: Check if the token was actually added
    if (updatedUser.fcmTokens && updatedUser.fcmTokens.includes(fcmToken)) {
      console.log("FCM token successfully added to user's token list.");
      return NextResponse.json({ message: 'FCM token saved successfully.' });
    } else {
      console.error("CRITICAL: Token was not added after the database update operation.");
      console.error("Current fcmTokens array on server:", updatedUser.fcmTokens);
      return NextResponse.json({ error: 'Failed to save FCM token to the database.' }, { status: 500 });
    }

  } catch (error) {
    console.error("--- ERROR in /api/save-fcm-token ---");
    console.error("Full Error Object:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid session token.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
