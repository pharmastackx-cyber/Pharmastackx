import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import Product from '@/models/Product';
import { isValidObjectId } from 'mongoose';


export async function GET(req: NextRequest) {
  try {
    await dbConnect(); // connect to MongoDB

    // Fetch all products (stock items)
    const stock = await Product.find({});

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
    
    // Basic validation to ensure we have the necessary fields
    const { itemName, activeIngredient, category, amount, businessName } = body;
    if (!itemName || !activeIngredient || !category || !amount || !businessName) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProduct = new Product(body);
    const savedProduct = await newProduct.save();
    
    return NextResponse.json({ message: 'Product added successfully', product: savedProduct }, { status: 201 });

  } catch (error) {
    console.error('Error adding stock:', error);
    // Provide a more specific error message if it's a validation error
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
