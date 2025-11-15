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

    if (!fileName || !Array.isArray(products) || products.length === 0 || !businessName) {
      return NextResponse.json({ message: 'fileName, businessName, and a non-empty products array are required' }, { status: 400 });
    }

    const bulkUpload = await BulkUpload.create({ 
      csvName: fileName,
      itemCount: products.length,
      businessName: businessName, // Saving the user's business name
    });

    const productsToSave = products.map((p: any) => ({
    
      itemName: p.itemName,
      activeIngredient: p.activeIngredient,
      category: p.category,
      amount: Number(p.amount) || 0,
      imageUrl: p.imageUrl || '',
      businessName: p.businessName,
      coordinates: p.coordinates || '',
      // Ensure info is a string
      info: String(p.info || ''),
      // Convert POM to a strict boolean
      POM: ['true', 'yes', '1'].includes(String(p.POM).toLowerCase()),
      slug: p.slug, 



      bulkUploadId: bulkUpload._id,
    }));

    const savedProducts = await Product.insertMany(productsToSave);

    return NextResponse.json({ message: 'Bulk upload successful', savedProducts, bulkUploadRecord: bulkUpload }, { status: 201 });

  } catch (error) {
    console.error('Error during bulk upload:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
        return NextResponse.json({ message: 'Data validation failed', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
