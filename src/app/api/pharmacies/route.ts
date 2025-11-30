
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

export async function GET() {
  await dbConnect();

  try {
    const pharmacies = await User.find({ role: 'pharmacy' }).select('businessName _id');
    return NextResponse.json(pharmacies);
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    return NextResponse.json({ error: 'Failed to fetch pharmacies' }, { status: 500 });
  }
}
