import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import Product from '@/models/Product';
import { isValidObjectId } from 'mongoose';


export async function GET(req: NextRequest) {
  try {
    await dbConnect(); // connect to MongoDB

    const { searchParams } = new URL(req.url);
    const businessName = searchParams.get('businessName');

    const query = businessName ? { businessName } : {};
    // Fetch products based on the query
    const stock = await Product.find(query);

    return NextResponse.json({ items: stock });

  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json({ error: 'Failed to fetch stock' }, { status: 500 });
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
