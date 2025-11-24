import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import Product from '@/models/Product';
import { isValidObjectId } from 'mongoose';

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const { id } = await req.json();

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ message: 'A valid product ID is required' }, { status: 400 });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { isPublished: true },
            { new: true } // This option returns the updated document
        );

        if (!updatedProduct) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            message: 'Product published successfully', 
            product: updatedProduct 
        });

    } catch (error: any) {
        console.error('Error publishing product:', error);
        return NextResponse.json({ message: 'Internal server error', details: error.message }, { status: 500 });
    }
}
