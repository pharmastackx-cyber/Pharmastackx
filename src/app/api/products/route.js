
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

// --- NEW: Helper to parse the coordinate string --- //
const parseCoordinatesString = (coordString) => {
  if (typeof coordString !== 'string') {
    return null;
  }

  try {
    const latMatch = coordString.match(/Lat: ([\d.-]+)/);
    const lonMatch = coordString.match(/Lon: ([\d.-]+)/);

    if (latMatch && lonMatch) {
      const lat = parseFloat(latMatch[1]);
      const lon = parseFloat(lonMatch[1]);
      
      if (!isNaN(lat) && !isNaN(lon)) {
        return { lat, lon };
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing coordinate string:", coordString, error);
    return null;
  }
};

export async function GET(req) {
  try {
    await dbConnect();

    const products = await Product.find({}).lean();
    
    const transformedProducts = products.map(product => {
      try {
        if (!product.itemName || typeof product.amount === 'undefined') {
          throw new Error('Product record is missing required fields: itemName or amount.');
        }

        return {
          id: product._id.toString(),
          image: product.imageUrl || 'https://via.placeholder.com/150',
          name: product.itemName,
          activeIngredients: product.activeIngredient || '',
          drugClass: product.category || 'N/A',
          price: product.amount,
          formattedPrice: formatPrice(product.amount),
          pharmacy: product.businessName || 'Unknown Pharmacy',
          // --- FIX: Parse the coordinate string into an object --- //
          pharmacyCoordinates: parseCoordinatesString(product.coordinates),
          POM: product.POM || false,
          info: product.info,
          inStock: true, 
        };
      } catch (error) {
        console.error('Error transforming product:', { 
          productId: product && product._id ? product._id.toString() : 'Unknown', 
          error: error.message 
        });
        return null; // Exclude malformed products from the final list
      }
    }).filter(p => p !== null); // Filter out any nulls from transformation errors

    return NextResponse.json({ 
      success: true, 
      data: transformedProducts, 
    });

  } catch (error) {
    console.error("Fatal uncaught error in /api/products:", error);
    return NextResponse.json({ 
      success: false, 
      error: "A critical error occurred on the server." 
    }, { status: 500 });
  }
}
