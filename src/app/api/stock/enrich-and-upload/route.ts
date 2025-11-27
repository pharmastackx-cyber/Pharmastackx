import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { dbConnect } from '@/lib/mongoConnect';
import DraftStock from '@/models/DraftStock';
import Product from '@/models/Product'; // Import the Product model for vector search

// --- Initialize the AI Model ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// --- The Master Prompt for the AI ---
const masterPrompt = `
You are an expert pharmaceutical data analyst. Your task is to process raw, messy inventory data and enrich it into a clean, structured JSON format. Follow these rules strictly:

1.  **VALIDATE THE MATCH:** You will be given a <RAW_INVENTORY_DATA> item and a potential <DATABASE_MATCH> from our system. 
    *   Compare the item names carefully. If they are clearly the same product (ignoring minor typos or abbreviations), set "confidence_score" to 95-100.
    *   If they are related but different (e.g., different dosages), set "confidence_score" to 70-90.
    *   If they are completely different, set "confidence_score" to 0.

2.  **EXTRACT FROM RAW DATA:** The user's uploaded file is the source of truth for price and stock. You MUST extract these from the <RAW_INVENTORY_DATA>.
    *   \`amount_in_stock\`: Find the quantity from columns like 'stock', 'quantity', 'qty', etc. It must be an integer.
    *   \`amount\`: Find the price from columns like 'price', 'amount', 'sellingprice', '₦', etc. It must be a number. Ignore columns like 'cost price'.

3.  **ENRICH DETAILS:** Based on the product name, fill in the other fields using your internal knowledge.
    *   \`cleaned_name\`: The proper, full product name, but as a rule never change the key details in the name, its almost not necessary to change the name except title..no full name change.
    *   \`active_ingredient\`: The main active ingredient(s).
    *   \`drug_class\`: The pharmaceutical class of the drug.
    *   \`unit_form\`: A brief description of the product's packaging form, such as "Box of 30 tablets", "500ml bottle", "10g tube", or "Sachet", note that this would be usually 1 sachet for tabs, 1 bottle or soemthing like that , it will hardly be box since its retail but can be pack instead of sachets usually for products that a pack contains full dose of multiple sachets eg. amlodipine has two sachets in a pack and are sold by most pharmacies as a pack not sachet but soem still sell as sachet but most tablets will be 1 sachet  .
    *   \`is_pom\`: Set to true if it is a Prescription-Only Medicine, otherwise false.

4.  **OUTPUT FORMAT:** You MUST return ONLY a single, valid JSON object for each item. Do not include any text, explanations, or markdown formatting before or after the JSON.

Here is your required JSON output structure:
{
  "cleaned_name": "string",
  "active_ingredient": "string",
  "drug_class": "string",
  "unit_form": "string",
  "is_pom": "boolean",
  "amount_in_stock": "number",
  "amount": "number",
  "confidence_score": "number (0-100)"
}
`;



export async function POST(req: Request) {
  try {
    await dbConnect();
    const { products: rawProducts, businessName } = await req.json();

    if (!rawProducts || !Array.isArray(rawProducts) || rawProducts.length === 0) {
      return NextResponse.json({ message: 'No products to process.' }, { status: 400 });
    }

    console.log(`Received ${rawProducts.length} raw products for enrichment for business: ${businessName}.`);

    // Model for generating the structured JSON
    const generationModel = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });
    
    // Model for creating the vector embeddings
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

    const processingResults = await Promise.allSettled(rawProducts.map(async (rawItem: any) => {
      try {
        // --- Vector Search Implementation ---
        const itemName = (rawItem['item name'] || rawItem['product']).trim();
        const queryVector = (await embeddingModel.embedContent(itemName)).embedding.values;

        const similarProducts = await Product.aggregate([
          {
            $vectorSearch: {
              index: "vector_index", // The name of the index you will create in Atlas
              path: "itemNameVector",
              queryVector: queryVector,
              numCandidates: 150,
              limit: 5,
            },
          },
          {
            $project: {
              _id: 1,
              itemName: 1,
              imageUrl: 1,
              score: { $meta: "vectorSearchScore" },
            },
          },
        ]);

         // --- THE ONLY DEBUG LOG ---
        console.log(`\n--- [${itemName}] ---`);
        console.log('Raw Vector Search Results:', JSON.stringify(similarProducts, null, 2));
        // --- END DEBUG LOG ---

        const dbMatch = similarProducts.length > 0 && similarProducts[0].score > 0.4 ? similarProducts[0] : null;
        
        
        const userPrompt = `
        <RAW_INVENTORY_DATA>
        ${JSON.stringify(rawItem)}
        </RAW_INVENTORY_DATA>

        <DATABASE_MATCH>
        ${JSON.stringify(dbMatch)}
        </DATABASE_MATCH>
        `;

        const result = await generationModel.generateContent([masterPrompt, userPrompt]);
        const responseText = result.response.text();
        const aiEnrichedData = JSON.parse(responseText);
        const willAssignImage = dbMatch && aiEnrichedData.confidence_score > 50;

        console.log(`AI Confidence: ${aiEnrichedData.confidence_score}. Match Found: ${!!dbMatch}. Image Assigned: ${willAssignImage}`);
   

        const finalProduct = {
          itemName: aiEnrichedData.cleaned_name,
          activeIngredient: aiEnrichedData.active_ingredient,
          category: aiEnrichedData.drug_class,
          amount: Number(aiEnrichedData.amount) || 0,
          imageUrl: willAssignImage ? (dbMatch as any).imageUrl : '',
          businessName: businessName,
          isPublished: false,
          POM: aiEnrichedData.is_pom,
          slug: businessName.toLowerCase().replace(/\s+/g, '-'),
          info: aiEnrichedData.unit_form, 
          coordinates: ''
      };
      
        
        return finalProduct;
      } catch (error: any) {
        console.error('Error processing single item with AI:', { rawItem, error });
        throw { message: error.message, item: rawItem };
      }
    }));

    const enrichedProducts = processingResults
      .filter(p => p.status === 'fulfilled')
      .map((p: PromiseFulfilledResult<any>) => p.value);
      
    const errors = processingResults
      .filter(p => p.status === 'rejected')
      .map((p: PromiseRejectedResult) => p.reason);

    let savedProducts: any[] = [];
    if (enrichedProducts.length > 0) {
        console.log(`AI processing complete. Saving ${enrichedProducts.length} products to the database.`);
        savedProducts = await DraftStock.insertMany(enrichedProducts, { ordered: false });
        console.log(`Successfully saved ${savedProducts.length} products to DraftStock.`);
    } else {
        console.log('No products were successfully enriched to be saved.');
    }

    if (errors.length > 0) {
        console.log(`${errors.length} items failed during AI enrichment.`);
    }

    return NextResponse.json({ 
        message: `Processed ${rawProducts.length} items. Saved ${savedProducts.length}.`,
        savedProducts: savedProducts, 
        warnings: [],
        errors: errors,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Fatal error in enrich-and-upload endpoint:", error);
    if (error.code === 11000) {
        return NextResponse.json({ 
            message: 'Database error: Duplicate items detected.', 
            details: 'Some of the items you tried to upload already exist in the draft stock.' 
        }, { status: 409 });
    }
    return NextResponse.json({ message: 'An unexpected server error occurred.', details: error.message }, { status: 500 });
  }
}
