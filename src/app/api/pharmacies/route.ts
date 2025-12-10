
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    // Get search query from URL parameters
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('search') || '';

    // Build the query object
    const query = {
      role: 'pharmacy',
      // Add search functionality if a query is provided
      ...(searchQuery && {
        $or: [
          { businessName: { $regex: searchQuery, $options: 'i' } },
          { businessAddress: { $regex: searchQuery, $options: 'i' } },
        ],
      }),
    };

    const pharmacies = await User.find(query).select(
      'businessName businessAddress slug' // Select the fields you need
    );

    console.log('Fetched Pharmacies:', pharmacies); // Log the results

    return NextResponse.json({ pharmacies });
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    return NextResponse.json({ error: 'Failed to fetch pharmacies' }, { status: 500 });
  }
}
