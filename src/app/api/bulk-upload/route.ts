
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import BulkUpload from '@/models/BulkUpload';
import Product from '@/models/Product';
import Fuse from 'fuse.js';

// Helper to find a value by case-insensitive key search from the parsed CSV data
const findValueByKey = (obj: any, possibleKeys: string[]): any => {
    if (!obj) return undefined;
    const lowerCaseKeys = possibleKeys.map(k => k.toLowerCase());
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const lowerCaseKey = key.trim().toLowerCase();
            if (lowerCaseKeys.includes(lowerCaseKey)) {
                return obj[key];
            }
        }
    }
    return undefined;
};

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
    const { fileName, products: rawProducts, businessName, coordinates } = await req.json();

    if (!fileName || !Array.isArray(rawProducts) || !businessName) {
      return NextResponse.json({ message: 'fileName, businessName, and a products array are required' }, { status: 400 });
    }
    if (rawProducts.length === 0) {
       return NextResponse.json({ message: 'Cannot process an empty list of products.' }, { status: 400 });
    }

    console.log(`[Bulk-Upload] Received ${rawProducts.length} items for ${businessName} from ${fileName}.`);

    // --- 1. Create the initial bulk upload log ---
    const bulkUpload = await BulkUpload.create({
      csvName: fileName,
      itemCount: rawProducts.length, // Initial count
      businessName: businessName,
    });

    // --- 2. Fetch all products from the DB for fuzzy matching ---
    const allDbProducts = await Product.find({}, 'itemName activeIngredient category POM info imageUrl').lean();

    // --- 3. Setup Fuse.js for fuzzy searching ---
    const fuse = new Fuse(allDbProducts, {
      keys: ['itemName'],
      includeScore: true,
      threshold: 0.3, 
    });

    const productsToInsert: any[] = [];
    const errors: any[] = [];
    let highConfidenceMatches = 0;
    let lowConfidenceDrafts = 0;

    // --- 4. Process each uploaded product with the fuzzy match strategy ---
    for (const [index, rawItem] of rawProducts.entries()) {
      const itemName = findValueByKey(rawItem, ['item name', 'product', 'name', 'item', 'product name']);
      const itemAmount = Number(findValueByKey(rawItem, ['amount', 'price', 'sellingprice', '₦'])) || 0;
      const itemStock = Number(findValueByKey(rawItem, ['stock', 'quantity', 'qty', 'in stock'])) || 0;

      if (!itemName || String(itemName).trim() === '') {
        errors.push({ message: `Missing 'Item Name' in one row.`, item: { row: index + 2 } });
        continue;
      }

      const results = fuse.search(String(itemName).trim());
      const topMatch = results.length > 0 ? results[0] : null;
      
      const isHighConfidence = topMatch && topMatch.score != null && topMatch.score <= 0.1;

      // --- STRATEGY 1: HIGH CONFIDENCE MATCH (=> 90%) ---
      if (isHighConfidence) {
        highConfidenceMatches++;
        const dbProduct = topMatch.item;
        productsToInsert.push({
          itemName: String(itemName).trim(),
          activeIngredient: dbProduct.activeIngredient,
          category: dbProduct.category,
          amount: itemAmount,
          stock: itemStock,
          imageUrl: dbProduct.imageUrl || '',
          businessName: businessName,
          isPublished: true, // AUTO-PUBLISH
          POM: dbProduct.POM,
          slug: businessName.toLowerCase().replace(/\s+/g, '-'),
          info: dbProduct.info,
          coordinates: coordinates || '',
          bulkUploadId: bulkUpload._id,
          enrichmentStatus: 'completed', // Mark as completed
        });
      } 
      // --- STRATEGY 2: LOW/NO CONFIDENCE MATCH (< 90%) ---
      else {
        lowConfidenceDrafts++;
        productsToInsert.push({
          itemName: String(itemName).trim(),
          amount: itemAmount,
          stock: itemStock,
          businessName: businessName,
          isPublished: false, // SAVE AS DRAFT
          slug: businessName.toLowerCase().replace(/\s+/g, '-'),
          coordinates: coordinates || '',
          bulkUploadId: bulkUpload._id,
          enrichmentStatus: 'pending', // Mark for background AI
        });
      }
    }

    // --- 5. Perform a single bulk insert operation ---
    let savedProductsCount = 0;
    if (productsToInsert.length > 0) {
      const result = await Product.insertMany(productsToInsert, { ordered: false });
      savedProductsCount = result.length;
    }

    // --- 6. Finalize the log and respond ---
    const finalBulkUploadRecord = await BulkUpload.findByIdAndUpdate(
        bulkUpload._id, 
        { 
            status: 'Processed', 
            itemCount: savedProductsCount,
            summary: `Published: ${highConfidenceMatches}, Drafts: ${lowConfidenceDrafts}`
        },
        { new: true }
    );

    const summary = `Processing complete. Instantly published ${highConfidenceMatches} items. Saved ${lowConfidenceDrafts} items as drafts for background enrichment.`;
    console.log(`[Bulk-Upload] ${summary}`);

    return NextResponse.json({ 
        message: summary,
        bulkUploadRecord: finalBulkUploadRecord,
        publishedCount: highConfidenceMatches,
        draftCount: lowConfidenceDrafts,
        errors: errors,
    }, { status: 201 });

  } catch (error: any) {
    console.error('[Bulk-Upload] Fatal error:', error);
    return NextResponse.json({ message: 'An internal server error occurred during the upload process.', details: error.message }, { status: 500 });
  }
}
