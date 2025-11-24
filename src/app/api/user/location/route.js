import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongoConnect';
import User from '../../../../models/User';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = jwt.verify(sessionToken, JWT_SECRET);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { coordinates } = body;
    
    if (!coordinates || typeof coordinates.latitude === 'undefined' || typeof coordinates.longitude === 'undefined') {
      return NextResponse.json({ error: 'Coordinates object with latitude and longitude are missing' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      payload.userId,
      {
        
        $set: {
          businessCoordinates: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          }
        }
      },
      { new: true }
    ).select('slug businessCoordinates');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('API /user/location error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
