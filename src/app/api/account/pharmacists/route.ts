
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';
import { cookies } from 'next/headers';

interface DecodedToken {
    userId: string;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    const user = await User.findById(decoded.userId).lean();

    if (!user || user.role !== 'pharmacy') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const pharmacyId = user._id;

    const pharmacists = await User.find({
      role: 'pharmacist',
      pharmacy: pharmacyId,
    }).select('username email profilePicture').lean();

    return NextResponse.json({ pharmacists }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching pharmacists for account:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
