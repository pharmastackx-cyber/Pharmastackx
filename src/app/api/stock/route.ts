
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import Product from '@/models/Product';
import { isValidObjectId } from 'mongoose';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

// Helper to escape special characters for RegExp
function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\\\]/g, '\\\\$&'); // $& means the whole matched string
}

// Helper function to check if an item is incomplete
const isItemIncomplete = (item: any): boolean => {
    const hasMissingInfo = (
        !item.activeIngredient || item.activeIngredient === 'N/A' ||
        !item.category || item.category === 'N/A' ||
        !item.imageUrl || item.imageUrl.trim() === '' ||
        !item.info || item.info.trim() === ''
    );
    return hasMissingInfo;
};

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
        const payload = jwt.verify(sessionToken.value, JWT_SECRET) as { userId: string };
        const user = await User.findById(payload.userId).select('role').lean();
        if (user) userRole = user.role;
      } catch (e) {
        userRole = null;
      }
    }

    let query: any = {};
    if (userRole === 'admin' || userRole === 'stockManager') {
      // No filter for admin or stockManager - fetch all products
    } else if (businessName) {
      query.businessName = businessName;
    } else {
      // Default for public view if not admin and no businessName is provided
      query.isPublished = true;
    }

    const itemsFromDB = await Product.find(query).sort({ createdAt: -1 }).lean();

    if (userRole === 'admin' || userRole === 'stockManager') {
      return NextResponse.json({ items: itemsFromDB });
    }

    const itemsWithSuggestionFlag = await Promise.all(
      itemsFromDB.map(async (item) => {
        if (item.itemName && isItemIncomplete(item)) {
          
          // --- THE FIX ---
          // Escape the item name to prevent invalid RegExp errors from special characters like '('.
          const safeItemNameForRegex = escapeRegex(item.itemName);
          
          const suggestionSource = await Product.findOne({
            itemName: { $regex: new RegExp(safeItemNameForRegex, 'i') },
            _id: { $ne: item._id },
            isPublished: true,
            imageUrl: { $ne: null, $nin: [''] },
            category: { $ne: null, $nin: ['', 'N/A'] },
            activeIngredient: { $ne: null, $nin: ['', 'N/A'] },
          }).select('_id').lean();

          if (suggestionSource) {
            return { ...item, hasSuggestion: true };
          }
        }
        return { ...item, hasSuggestion: false };
      })
    );

    return NextResponse.json({ items: itemsWithSuggestionFlag });

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

    const existingProduct = await Product.findOne({ itemName, businessName });
    if (existingProduct) {
      return NextResponse.json({ error: 'Product with this name already exists for this business' }, { status: 409 });
    }

    const result = await embeddingModel.embedContent(itemName);
    const newVector = result.embedding.values;

    const newProduct = new Product({
      itemName,
      activeIngredient,
      category,
      amount,
      businessName,
      imageUrl: imageUrl || '',
      coordinates: coordinates || '',
      info: info || '',
      POM: POM || false,
      slug: slug,
      isPublished: true,
      itemNameVector: newVector,
      enrichmentStatus: 'completed' // Mark manually added items as complete
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
