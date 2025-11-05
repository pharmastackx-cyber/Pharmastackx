import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

// PUT request to update a user's role
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { role } = await req.json();

  if (!id || !role) {
    return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
  }

  try {
    await dbConnect();
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { userType: role },
      { new: true } // Return the updated document
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`Failed to update role for user ${id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
