
import { dbConnect } from '../../../lib/mongoConnect';
import Product from '../../../../backend/models/Product';
import { NextResponse } from 'next/server';

// Helper to format the price into Nigerian Naira (NGN)
const formatPrice = (price) => {
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(0);
  }
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(numericPrice);
};

export async function GET(req) {
  try {
    await dbConnect();

    // Fetch all products as plain JavaScript objects for efficiency.
    const products = await Product.find({}).lean();
    
    const transformedProducts = [];
    const transformationErrors = [];

    for (const product of products) {
      try {
        // --- CORRECT DATA TRANSFORMATION ---
        // A product must have a name (itemName) and a price (amount).
        if (!product.itemName || typeof product.amount === 'undefined') {
          throw new Error('Product record is missing required fields: itemName or amount.');
        }

        transformedProducts.push({
          id: product._id.toString(),
          // Map `imageUrl` (from DB) to `image` (for frontend)
          image: product.imageUrl || 'https://via.placeholder.com/150',
          // Map `itemName` (from DB) to `name` (for frontend)
          name: product.itemName,
          // Map `activeIngredient` (from DB) to `activeIngredients` (for frontend)
          activeIngredients: product.activeIngredient || '',
          // Map `category` (from DB) to `drugClass` (for frontend)
          drugClass: product.category || 'N/A',
          // Use `amount` for the raw numeric price
          price: product.amount,
          // Use `amount` to create the formatted price string
          formattedPrice: formatPrice(product.amount),
          // Use `businessName` (from DB) for `pharmacy` (for frontend)
          pharmacy: product.businessName || 'Unknown Pharmacy',
          // Set a default for inStock, as it's not in the DB schema
          inStock: true, 
          // Set a default for rating
          rating: 4.5, 
        });

      } catch (error) {
        // If one product record is malformed, we log it and skip it.
        transformationErrors.push({ 
          productId: product && product._id ? product._id.toString() : 'Unknown', 
          error: error.message 
        });
      }
    }

    // This is helpful for debugging on the server if some products don't appear.
    if (transformationErrors.length > 0) {
      console.error('Errors during product transformation:', transformationErrors);
    }

    return NextResponse.json({ 
      success: true, 
      data: transformedProducts, 
      errors: transformationErrors 
    });

  } catch (error) {
    // This is a safety net for any unexpected crashes (e.g., DB connection fails).
    console.error("Fatal uncaught error in /api/products:", error);
    return NextResponse.json({ 
      success: false, 
      error: "A critical error occurred on the server." 
    }, { status: 500 });
  }
}
