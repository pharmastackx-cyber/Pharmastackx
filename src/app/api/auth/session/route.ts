
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token');

  if (!sessionToken) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();

    const payload = jwt.verify(sessionToken.value, JWT_SECRET) as { userId: string };
    const userId = payload.userId;

    if (!userId) {
      throw new Error('Invalid token payload');
    }

    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // If the user is a pharmacist, load the associated pharmacy's data
    if (user.role === 'pharmacist' && user.pharmacy) {
      const pharmacy = await User.findById(user.pharmacy).select('-password').lean();
      
      if (pharmacy) {
        // Merge pharmacy data into the pharmacist's session object
        user.businessName = pharmacy.businessName;
        user.slug = pharmacy.slug;
        user.businessAddress = pharmacy.businessAddress;
        user.state = pharmacy.state;
        user.city = pharmacy.city;
        user.businessCoordinates = pharmacy.businessCoordinates;
        // Most importantly, set the role to 'pharmacy' for access control
        user.role = 'pharmacy';
      }
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('Session API Error:', error);
    return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
  }
}
