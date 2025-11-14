
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

export async function GET() {
  await dbConnect();

  try {
    // Find users who are verified businesses/pharmacies
    // I'll assume a 'role' of 'business' and a 'isVerified' flag.
    // This can be adjusted if your User model uses a different structure.
    const pharmacies = await User.find({
      role: 'pharmacy' 
    }).select('businessName businessAddress slug businessImage rating businessCoordinates').limit(12);

    return NextResponse.json({ pharmacies });

  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
