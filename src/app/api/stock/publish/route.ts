
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import Product from '@/models/Product';
import { isValidObjectId } from 'mongoose';

// A mapping of field names to the user-friendly, specific error messages you requested.
const errorMessages: { [key: string]: string } = {
    itemName: 'Please review the item name.',
    activeIngredient: 'Please include the active ingredient. You can get this by Googling the brand name.',
    category: 'Please include the category the drug falls under.',
    amount: 'Please add a price for the product.',
    imageUrl: 'Please upload an image of the product by clicking the upload button.',
    info: 'Please fill in the info with the unit quantity for the stated price (e.g., \'1 sachet\', \'1 pack\', \'1 tube\', \'1 50ml bottle\', etc.).',
    businessName: 'The business name is missing from this item.', // A fallback error
};

/**
 * Validates the product and returns a list of missing or invalid fields.
 * @param product The product object to validate.
 * @returns An array of strings, where each string is the name of an invalid field.
 */
const getIncompleteFields = (product: any): string[] => {
    if (!product) return Object.keys(errorMessages); // If no product, all fields are missing.

    const missingFields: string[] = [];
    type StringField = 'itemName' | 'activeIngredient' | 'category' | 'imageUrl' | 'info' | 'businessName';
    const requiredStringFields: StringField[] = [

        'itemName',
        'activeIngredient',
        'category',
        'imageUrl',
        'info',
        'businessName',
    ];

    for (const field of requiredStringFields) {
        // Check for missing, empty, or placeholder values.
        if (!product[field] || String(product[field]).trim() === '' || product[field] === 'N/A') {
            missingFields.push(field);
        }
    }

    // Specifically check the amount.
    if (typeof product.amount !== 'number' || product.amount <= 0) {
        missingFields.push('amount');
    }

    return missingFields;
};

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const { id } = await req.json();

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ message: 'A valid product ID is required' }, { status: 400 });
        }

        const productToPublish = await Product.findById(id);

        if (!productToPublish) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        // 1. Get the list of all incomplete fields.
        const incompleteFields = getIncompleteFields(productToPublish);

        // 2. Check if the list is empty. If not, build the detailed error message.
        if (incompleteFields.length > 0) {
            const detailedErrorMessage = incompleteFields
                .map(field => errorMessages[field]) // Map each field name to its custom message
                .join(' \n'); // Join them together for a clean, readable list.

            return NextResponse.json(
                { message: `Cannot publish. Please fix the following issues:\n${detailedErrorMessage}` },
                { status: 400 }
            );
        }

        // 3. If all checks pass, publish the product.
        productToPublish.isPublished = true;
        const updatedProduct = await productToPublish.save();

        return NextResponse.json({ 
            message: 'Product published successfully', 
            product: updatedProduct 
        });

    } catch (error: any) {
        console.error('Error publishing product:', error);
        return NextResponse.json({ message: 'Internal server error', details: error.message }, { status: 500 });
    }
}
