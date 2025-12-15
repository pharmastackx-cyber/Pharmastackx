
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import User from '../../../models/User';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = 10; // Number of items per page

    const query = { 
      role: 'pharmacist'
    };

    const pharmacists = await User.find(query)
      .select('username email specialties stateOfPractice profilePicture') // Adjusted fields
      .limit(limit)
      .skip(page * limit)
      .lean();

    if (!pharmacists || pharmacists.length === 0) {
      return NextResponse.json({ success: true, pharmacists: [] });
    }

    return NextResponse.json({ success: true, pharmacists });
  } catch (error) {
    console.error('Error fetching pharmacists:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
