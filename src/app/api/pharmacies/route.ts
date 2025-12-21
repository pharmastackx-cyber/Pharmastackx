
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

const PHARMACIES_PER_PAGE = 5;

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const searchQuery = searchParams.get('search') || '';
    const fetchAll = searchParams.get('all') === 'true';

    const query: any = { role: 'pharmacy' };
    if (searchQuery) {
      query.businessName = { $regex: searchQuery, $options: 'i' };
    }

    let pharmaciesQuery = User.find(query)
      .select('_id businessName slug businessAddress city state')
      .sort({ businessName: 1 });

    if (!fetchAll) {
      pharmaciesQuery = pharmaciesQuery
        .skip(page * PHARMACIES_PER_PAGE)
        .limit(PHARMACIES_PER_PAGE);
    }

    const pharmacies = await pharmaciesQuery.lean();

    return NextResponse.json({ pharmacies }, { status: 200 });

  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
