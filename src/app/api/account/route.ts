
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

    // If user is a pharmacist and has a pharmacy, replace pharmacy object with its name
    if (user.role === 'pharmacist' && user.pharmacy && typeof user.pharmacy === 'object') {
      (user as any).pharmacy = (user.pharmacy as any).businessName;
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

        const updatedUserDoc = await User.findByIdAndUpdate(userId, {
            username,
            profilePicture,
            businessName,
            businessAddress,
            city,
            state,
            mobile,
            stateOfPractice,
            licenseNumber
        }, { new: true })
        .select('-password')
        .populate({
            path: 'pharmacy',
            select: 'businessName'
        });

        if (!updatedUserDoc) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        const updatedUser = updatedUserDoc.toObject();

        if (updatedUser.role === 'pharmacist' && updatedUser.pharmacy && typeof updatedUser.pharmacy === 'object') {
          (updatedUser as any).pharmacy = (updatedUser.pharmacy as any).businessName;
        }

        return NextResponse.json(updatedUser, { status: 200 });

    } catch (error) {
        console.error('Account Update Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
