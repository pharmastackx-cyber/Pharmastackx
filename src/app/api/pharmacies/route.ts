
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    // 1. Get the search query from the URL
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get('search');

    // 2. Build the base MongoDB query object
    const query: any = {
      role: 'pharmacy',
      // Only return pharmacies that have a slug, meaning their store is set up.
      slug: { $exists: true, $ne: null },
    };

    // 3. If a search query is provided, add it to the query
    if (searchQuery) {
      // Use $regex for a powerful, case-insensitive search across multiple fields
      const searchRegex = new RegExp(searchQuery, 'i');
      query.$or = [
        { businessName: { $regex: searchRegex } },
        { businessAddress: { $regex: searchRegex } },
      ];
    }

    // 4. Find pharmacies, applying a limit only if it's NOT a search
    const pharmaciesQuery = User.find(query)
                              .select('businessName businessAddress slug')
                              .sort({ businessName: 1 }); // Sort results alphabetically

    if (!searchQuery) {
      // For the initial page load, limit the results to a dozen.
      pharmaciesQuery.limit(12);
    }

    const pharmacies = await pharmaciesQuery.exec();

    return NextResponse.json({ pharmacies });

  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
}
