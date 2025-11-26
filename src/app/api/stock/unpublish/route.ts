import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import Product from '@/models/Product';
import { isValidObjectId } from 'mongoose';

export async function POST(req: NextRequest) {
    await dbConnect(); // Correct way to connect to your DB

    try {
        const { id } = await req.json();

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ message: 'A valid product ID is required' }, { status: 400 });
        }

        const productToUnpublish = await Product.findById(id);

        if (!productToUnpublish) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        // If the product is already unpublished, no need to do anything.
        if (!productToUnpublish.isPublished) {
            return new NextResponse(null, { status: 204 });
        }

        // Set the product to be unpublished and save it.
        productToUnpublish.isPublished = false;
        await productToUnpublish.save();

        // Send a "204 No Content" response. This is the correct way to signal
        // a successful operation that doesn't need to return any data.
        // Your frontend is already prepared to handle this correctly.
        return new NextResponse(null, { status: 204 });

    } catch (error: any) {
        console.error('Error unpublishing product:', error);
        return NextResponse.json({ message: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
