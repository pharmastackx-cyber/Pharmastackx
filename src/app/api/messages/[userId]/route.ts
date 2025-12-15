
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongoConnect';
import Message from "@/models/Message";
import User from "@/models/User"; // Keep this for populating

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  await dbConnect();
  const cookieStore = await cookies(); // Added await
  const sessionToken = cookieStore.get('session_token');

  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(sessionToken.value, JWT_SECRET) as { userId: string };
    const currentUserId = payload.userId;
    const otherUserId = params.userId;

    const messages = await Message.find({
      $or: [
        { from: currentUserId, to: otherUserId },
        { from: otherUserId, to: currentUserId },
      ],
    })
    .sort({ createdAt: 'asc' })
    .populate('from', 'username profilePicture') // Populate sender info
    .lean(); // Use lean for performance

    const formattedMessages = messages.map(msg => ({
      ...msg,
      // The `from` field is now populated, so we can access its `_id`
      sender: msg.from?._id?.toString() === currentUserId ? 'currentUser' : 'otherUser',
    }));

    return NextResponse.json(formattedMessages, { status: 200 });

  } catch (error) {
    console.error("Error fetching messages:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
