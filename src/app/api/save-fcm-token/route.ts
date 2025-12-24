
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
    console.log("Cookie from request:", sessionCookie);

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
    console.log("User found before update:", userBeforeUpdate);

    if (!userBeforeUpdate) {
        console.log("User with this ID not found in the database.");
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { fcmTokens: fcmToken } },
      { new: true }
    );

    console.log("User after update:", updatedUser);

    if (updatedUser.fcmTokens.includes(fcmToken)) {
      console.log("FCM token successfully added to user's token list.");
    } else {
      console.log("Token was not added. This is the problem!");
      console.log("Current fcmTokens array:", updatedUser.fcmTokens);
    }

    return NextResponse.json({ message: 'FCM token saved successfully.' });

  } catch (error) {
    console.error("--- ERROR in /api/save-fcm-token ---");
    console.error("Full Error Object:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid session token.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
