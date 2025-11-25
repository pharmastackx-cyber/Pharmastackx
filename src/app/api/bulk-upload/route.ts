import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import BulkUpload from '@/models/BulkUpload';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const businessName = searchParams.get('businessName');
  if (!businessName) {
    return NextResponse.json({ message: 'businessName query parameter is required' }, { status: 400 });
  }
  try {
    const uploads = await BulkUpload.find({ businessName })
      .sort({ uploadedAt: -1 })
      .limit(20);
    return NextResponse.json({ uploads });
  } catch (error) {
    console.error('Error fetching bulk upload history:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { fileName, products, businessName } = await req.json();

    if (!fileName || !Array.isArray(products) || !businessName) {
      return NextResponse.json({ message: 'fileName, businessName, and a products array are required' }, { status: 400 });
    }
    
    if (products.length === 0) {
       return NextResponse.json({ message: 'Cannot process an empty list of products.' }, { status: 400 });
    }

    const bulkUpload = await BulkUpload.create({
      csvName: fileName,
      itemCount: products.length, // This is the initial attempted count
      businessName: businessName,
    });

    const savedProducts: any[] = [];
    const warnings: { message: string; item: any }[] = [];
    const errors: { message: string; item: any }[] = [];

    // Process each product individually to prevent one bad row from failing the whole batch
    for (const [index, p] of products.entries()) {
      const productIdentifier = p.itemName || `Row ${index + 2}`;

      // --- 1. Critical Validation: Check for a valid item name ---
      if (!p.itemName || p.itemName.trim() === '') {
        errors.push({
          message: `Missing critical field: Item Name.`,
          item: { ...p, row: index + 2 }
        });
        continue; // Skip this product and move to the next one
      }

      // Prevent duplicate entries
      const existingProduct = await Product.findOne({ itemName: p.itemName, businessName: p.businessName });
      if (existingProduct) {
        errors.push({
          message: `Product with this name already exists for this business.`,
          item: { ...p, row: index + 2 }
        });
        continue;
      }

      // --- 2. Data Normalization & Warning Generation ---
      const productData = {
        itemName: p.itemName,
        activeIngredient: p.activeIngredient || 'N/A',
        category: p.category || 'N/A',
        amount: Number(p.amount) || 0,
        imageUrl: p.imageUrl || '',
        businessName: p.businessName,
        coordinates: p.coordinates || '',
        info: String(p.info || ''),
        POM: [true, 'true', 'yes', '1'].includes(p.POM),
        slug: p.slug,
        bulkUploadId: bulkUpload._id,
      };

      // Generate warnings for data we had to fix
      if (!p.activeIngredient) {
          warnings.push({ message: `Missing Active Ingredient (defaulted to 'N/A').`, item: { itemName: productIdentifier } });
      }
      if (!p.category) {
           warnings.push({ message: `Missing Category (defaulted to 'N/A').`, item: { itemName: productIdentifier } });
      }
      if (!p.amount || Number(p.amount) === 0) {
           warnings.push({ message: `Missing or zero Amount/Price (defaulted to 0).`, item: { itemName: productIdentifier } });
      }

      // --- 3. Database Operation ---
      try {
        // Use Product.create which triggers Mongoose validation for the single item
        const savedProduct = await Product.create(productData);
        savedProducts.push(savedProduct);
      } catch (dbError: any) {
        // Catch validation errors from the database for this specific row
        errors.push({
          message: `Data validation failed: ${dbError.message}`,
          item: { ...p, row: index + 2 }
        });
      }
    }

    // --- 4. Finalize and Respond ---
    // Update the bulk upload record with the actual count of *successful* uploads
    const finalBulkUploadRecord = await BulkUpload.findByIdAndUpdate(
        bulkUpload._id, 
        { itemCount: savedProducts.length },
        { new: true } // Return the updated document
    );


    return NextResponse.json({
      message: 'Bulk upload processed.',
      savedProducts,
      warnings,
      errors,
      bulkUploadRecord: finalBulkUploadRecord,
    }, { status: 201 });

  } catch (error: any) {
    // This catches fatal errors, like if the request body is malformed
    console.error('Fatal error during bulk upload:', error);
    return NextResponse.json({ message: 'An internal server error occurred during the upload process.', details: error.message }, { status: 500 });
  }
}

