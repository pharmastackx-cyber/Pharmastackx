
import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/mongoConnect';
import Product from '../../../../models/Product';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemName = searchParams.get('itemName');

  if (!itemName) {
    return NextResponse.json({ message: 'Item name is required' }, { status: 400 });
  }

  try {
    await dbConnect();


    const suggestionSource = await Product.findOne({
      itemName: { $regex: new RegExp(itemName, 'i') },
      isPublished: true,
      
      
      imageUrl: { $ne: null, $nin: [''] }, 
      category: { $ne: null, $nin: ['', 'N/A'] },
      activeIngredient: { $ne: null, $nin: ['', 'N/A'] },
   
    }).lean();

    if (!suggestionSource) {
      return NextResponse.json({ message: 'No suggestions found' }, { status: 404 });
    }

    
    const suggestion = {
      activeIngredient: suggestionSource.activeIngredient,
      category: suggestionSource.category,
      imageUrl: suggestionSource.imageUrl,
      info: suggestionSource.info,
      POM: suggestionSource.POM,
    };

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('[SUGGESTIONS_API]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
