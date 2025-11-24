import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import Product from '@/models/Product';
import { isValidObjectId } from 'mongoose';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

export const dynamic = 'force-dynamic';
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const businessName = searchParams.get('businessName');

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token');
    let userRole: string | null = null;

    if (sessionToken) {
      try {
        // If a token exists, verify it to get the user's role
        const payload = jwt.verify(sessionToken.value, JWT_SECRET) as { userId: string };
        const user = await User.findById(payload.userId).select('role').lean();
        if (user) {
          userRole = user.role;
        }
      } catch (e) {
        // If the token is invalid or expired, treat them as a public user.
        userRole = null;
      }

      }

      let query: any = {};

      // This is the 3-way logic you correctly described:
    if (userRole === 'admin') {
      // 1. If the user is an admin, the query is empty. They see everything.
    } else if (businessName) {
      // 2. If a businessName is specified, fetch all items for that business.
      //    (This covers vendors viewing their own stock).
      query.businessName = businessName;
    } else {
      // 3. If none of the above, it's a public user. They only see published items.
      query.isPublished = true;
    }
    const items = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ items });

  } catch (error) {
      console.error('Error fetching stock:', error);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const { 
      itemName, 
      activeIngredient, 
      category, 
      amount, 
      businessName, 
      imageUrl, 
      coordinates, 
      info, 
      POM,
      slug
    } = body;

    if (!itemName || !activeIngredient || !category || !amount || !businessName) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a new product instance with all fields
    const newProduct = new Product({
      itemName,
      activeIngredient,
      category,
      amount,
      businessName,
      imageUrl: imageUrl || '', // Provide default if not present
      coordinates: coordinates || '', // Provide default if not present
      info: info || '', // Provide default if not present
      POM: POM || false, // Provide default if not present
      slug: slug
    });


    const savedProduct = await newProduct.save();
    
    return NextResponse.json({ message: 'Product added successfully', product: savedProduct }, { status: 201 });

  } catch (error) {
    console.error('Error adding stock:', error);
    
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add stock' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ error: 'Invalid or missing product ID' }, { status: 400 });
        }

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting stock:', error);
        return NextResponse.json({ error: 'Failed to delete stock' }, { status: 500 });
    }
}
