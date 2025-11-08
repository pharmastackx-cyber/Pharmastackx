import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import BulkUpload from '@/models/BulkUpload';
import Product from '@/models/Product';

export async function GET() {
  await dbConnect();
  const uploads = await BulkUpload.find().sort({ uploadedAt: -1 });
  return NextResponse.json({ uploads });
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { fileName, products } = await req.json();

    if (!fileName || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ message: 'fileName and a non-empty products array are required' }, { status: 400 });
    }

    const bulkUpload = await BulkUpload.create({ csvName: fileName });

    const productsToSave = products.map((p: any) => ({
      ...p,
      bulkUploadId: bulkUpload._id,
    }));

    const savedProducts = await Product.insertMany(productsToSave);

    return NextResponse.json({ message: 'Bulk upload successful', savedProducts }, { status: 201 });

  } catch (error) {
    console.error('Error during bulk upload:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
        return NextResponse.json({ message: 'Data validation failed', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
