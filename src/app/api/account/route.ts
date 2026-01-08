
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function GET() {
  await dbConnect();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token');

  if (!sessionToken) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const payload = jwt.verify(sessionToken.value, JWT_SECRET) as { userId: string };
    const userId = payload.userId;

    if (!userId) {
      throw new Error('Invalid token payload');
    }

    // Correctly populate the pharmacy details without overwriting the object
    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'pharmacy',
        select: 'businessName' 
      })
      .lean();

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error('Account API Error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
    await dbConnect();
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token');

    if (!sessionToken) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const payload = jwt.verify(sessionToken.value, JWT_SECRET) as { userId: string };
        const userId = payload.userId;

        if (!userId) {
            throw new Error('Invalid token payload');
        }

        const body = await req.json();
        // Destructure only the fields that are meant to be updated from this endpoint
        const { 
            username, 
            profilePicture, 
            businessName, 
            businessAddress, 
            city, 
            state,
            mobile,
            stateOfPractice,
            licenseNumber
        } = body;

        // Ensure only truthy values are being set to avoid overwriting with null/undefined
        const updateData: { [key: string]: any } = { 
            username, 
            profilePicture, 
            businessName, 
            businessAddress, 
            city, 
            state,
            mobile,
            stateOfPractice,
            licenseNumber
        };

        // Remove undefined keys so they don't overwrite existing values in the database
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })
        .select('-password')
        .populate({
            path: 'pharmacy',
            select: 'businessName'
        })
        .lean();

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(updatedUser, { status: 200 });

    } catch (error) {
        console.error('Account Update Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
