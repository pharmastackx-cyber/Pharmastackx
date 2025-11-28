
import { NextResponse, NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { dbConnect } from '@/lib/mongoConnect';
import Product, { IProduct } from '@/models/Product';
import { isValidObjectId } from 'mongoose';

// --- PROMPT ENGINEERING (Unchanged) ---
const fullEnrichmentPrompt = `
You are an expert pharmaceutical data analyst. Your task is to fully enrich a new, unknown product based on its name. Follow these rules:
1.  **ANALYZE RAW DATA:** You will get a <RAW_INVENTORY_DATA> JSON object.
2.  **EXTRACT CORE INFO:** The user's file is the source of truth for price and stock.
    *   \`amount_in_stock\`: Find the quantity (e.g., from 'stock', 'quantity'). Must be an integer.
    *   \`amount\`: Find the price (e.g., from 'price', 'amount', '₦'). Must be a number.
3.  **ENRICH FROM KNOWLEDGE:** Based on the product name, fill in the details.
    *   \`cleaned_name\`: The proper, full product name. Do not change key details.
    *   \`active_ingredient\`: The main active ingredient(s).
    *   \`drug_class\`: The pharmaceutical class.
    *   \`unit_form\`: The product's packaging form (e.g., "Box of 30 tablets", "500ml bottle").
    *   \`is_pom\`: True if it is a Prescription-Only Medicine.
4.  **FIND IMAGE:** Find a public, representative image URL. If you cannot find one with high confidence, you MUST return an empty string ("").
5.  **OUTPUT FORMAT:** Return ONLY a single, valid JSON object.

Required JSON Output:
{
  "cleaned_name": "string",
  "active_ingredient": "string",
  "drug_class": "string",
  "unit_form": "string",
  "is_pom": "boolean",
  "amount_in_stock": "number",
  "amount": "number",
  "found_image_url": "string"
}`;

const validationPrompt = `
You are an expert pharmaceutical data analyst. Your task is to validate a user's product against a potential database match that has a medium confidence score.
1.  **ANALYZE DATA:** You will get <RAW_INVENTORY_DATA> from the user and a <DATABASE_MATCH> from our system.
2.  **PRIORITIZE DATABASE:** The <DATABASE_MATCH> is likely correct. Use its 'active_ingredient', 'drug_class', and 'unit_form' unless they are clearly wrong.
3.  **CLEAN USER'S NAME:** Clean up the user's item name from <RAW_INVENTORY_DATA> to create 'cleaned_name'.
4.  **EXTRACT USER'S DATA:** The user's file is the source of truth for 'amount' and 'amount_in_stock'.
5.  **CONFIDENCE & PUBLISH:** Based on your analysis, set 'is_published' to true if you are confident the match is correct, otherwise false.
6.  **DO NOT FIND IMAGE:** You do not need to find an image.
7.  **OUTPUT FORMAT:** Return ONLY a single, valid JSON object.

Required JSON Output:
{
  "cleaned_name": "string",
  "active_ingredient": "string",
  "drug_class": "string",
  "unit_form": "string",
  "is_pom": "boolean",
  "amount_in_stock": "number",
  "amount": "number",
  "is_published": "boolean"
}`;


/**
 * =================================================================================
 * CORE AI ENRICHMENT LOGIC
 * =================================================================================
 * This shared function contains the tiered AI logic for enriching a single product.
 * It is used by both the automated cron job and the manual trigger.
 */
async function enrichProduct(product: IProduct, genAI: GoogleGenerativeAI): Promise<any> {
    const itemName = product.itemName;
    
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

    // --- 1. VECTOR SEARCH ---
    const queryVector = (await embeddingModel.embedContent(itemName)).embedding.values;
    const similarProducts = await Product.aggregate([
        { $vectorSearch: { index: "vector_index", path: "itemNameVector", queryVector, numCandidates: 100, limit: 1 } },
        { $project: { _id: 0, itemName: 1, activeIngredient: 1, category: 1, imageUrl: 1, POM: 1, info: 1, score: { $meta: "vectorSearchScore" } } },
    ]);
    const topMatch = similarProducts.length > 0 ? similarProducts[0] : null;
    const matchScore = topMatch ? topMatch.score * 100 : 0;
    
    let updateData: any;

    // --- 2. TIERED LOGIC ---
    try {
        // TIER 1: HIGH CONFIDENCE (>= 90%) - NO AI
        if (matchScore >= 90) {
            console.log(`[Enrich-Product] High Confidence Match for "${itemName}" (${matchScore.toFixed(2)}%).`);
            updateData = {
                activeIngredient: topMatch.activeIngredient,
                category: topMatch.category,
                imageUrl: topMatch.imageUrl || product.imageUrl || '',
                info: topMatch.info,
                POM: topMatch.POM,
                isPublished: true, // Auto-publish on high confidence
            };
        } else {
            const generationModel = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" },
            });

            // TIER 2: MEDIUM CONFIDENCE (70-89%) - VALIDATE WITH AI
            if (matchScore >= 70) {
                console.log(`[Enrich-Product] Medium Confidence Match for "${itemName}" (${matchScore.toFixed(2)}%). Validating.`);
                const prompt = `<RAW_INVENTORY_DATA>\n${JSON.stringify(product)}\n</RAW_INVENTORY_DATA>\n\n<DATABASE_MATCH>\n${JSON.stringify(topMatch)}\n</DATABASE_MATCH>`;
                const result = await generationModel.generateContent([validationPrompt, prompt]);
                const aiData = JSON.parse(result.response.text());

                const newVector = aiData.cleaned_name ? (await embeddingModel.embedContent(aiData.cleaned_name)).embedding.values : queryVector;
                updateData = {
                    itemName: aiData.cleaned_name || itemName,
                    activeIngredient: aiData.active_ingredient,
                    category: aiData.drug_class,
                    info: aiData.unit_form,
                    POM: aiData.is_pom,
                    isPublished: aiData.is_published || false,
                    itemNameVector: newVector,
                };
            } 
            // TIER 3: LOW/NO CONFIDENCE (< 70%) - FULL ENRICHMENT
            else {
                console.log(`[Enrich-Product] Low Confidence Match for "${itemName}" (${matchScore.toFixed(2)}%). Full Enrichment.`);
                const prompt = `<RAW_INVENTORY_DATA>\n${JSON.stringify(product)}\n</RAW_INVENTORY_DATA>`;
                const result = await generationModel.generateContent([fullEnrichmentPrompt, prompt]);
                const aiData = JSON.parse(result.response.text());

                const newVector = aiData.cleaned_name ? (await embeddingModel.embedContent(aiData.cleaned_name)).embedding.values : queryVector;
                updateData = {
                    itemName: aiData.cleaned_name || itemName,
                    activeIngredient: aiData.active_ingredient,
                    category: aiData.drug_class,
                    info: aiData.unit_form,
                    imageUrl: aiData.found_image_url || product.imageUrl || '',
                    POM: aiData.is_pom,
                    isPublished: false, // Always requires manual review on full enrichment
                    itemNameVector: newVector,
                };
            }
        }
    } catch (aiError: any) {
        console.warn(`[Enrich-Product] AI enrichment failed for "${itemName}". Error: ${aiError.message}`);
        // Return a 'failed' status update
        return { enrichmentStatus: 'completed', category: 'Enrichment-Failed' }; // Mark as 'completed' to avoid retries
    }

    return { ...updateData, enrichmentStatus: 'completed' };
}


/**
 * =================================================================================
 * [CRON JOB HANDLER] - GET Request (Automated Background Worker)
 * =================================================================================
 */
export async function GET(req: NextRequest) {
    console.log('[Cron-GET] Starting scheduled enrichment job.');
    try {
        await dbConnect();

        // 1. Find 'pending' items and atomically update them to 'processing'
        // This prevents multiple cron jobs from picking up the same items.
        const pendingProducts = await Product.find({ enrichmentStatus: 'pending' }).limit(5);

        if (pendingProducts.length === 0) {
            console.log('[Cron-GET] No pending products to enrich. Job finished.');
            return NextResponse.json({ message: 'No pending products to enrich.' });
        }
        
        const productIds = pendingProducts.map(p => p._id);
        await Product.updateMany({ _id: { $in: productIds } }, { $set: { enrichmentStatus: 'processing' } });
        
        console.log(`[Cron-GET] Locked ${pendingProducts.length} products for processing.`);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        let processedCount = 0;

        // 2. Loop through and enrich each product
        for (const product of pendingProducts) {
            try {
                console.log(`[Cron-GET] Enriching: "${product.itemName}" (ID: ${product._id})`);
                const updateData = await enrichProduct(product, genAI);
                await Product.updateOne({ _id: product._id }, { $set: updateData });
                processedCount++;
                console.log(`[Cron-GET] Successfully enriched and completed: "${product.itemName}"`);
            } catch (itemError: any) {
                console.error(`[Cron-GET] Failed to process product ID ${product._id}. Error: ${itemError.message}`);
                // Mark as failed to prevent retries
                await Product.updateOne({ _id: product._id }, { $set: { enrichmentStatus: 'completed', category: 'Enrichment-Failed' } });
            }
        }
        
        const summary = `Enrichment job finished. Processed ${processedCount}/${pendingProducts.length} products.`;
        console.log(`[Cron-GET] ${summary}`);
        return NextResponse.json({ message: summary, processedCount });

    } catch (error: any) {
        console.error('[Cron-GET] Fatal error in enrichment job:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal server error', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

/**
 * =================================================================================
 * [MANUAL TRIGGER HANDLER] - POST Request (User-Forced Re-enrichment)
 * =================================================================================
 */
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { productId } = await req.json();

        if (!productId || !isValidObjectId(productId)) {
            return NextResponse.json({ message: 'Valid productId is required.' }, { status: 400 });
        }

        // 1. Find the product and lock it for processing
        const product = await Product.findById(productId);

        if (!product) {
            return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        }

        console.log(`[POST-Manual] Starting manual re-enrichment for "${product.itemName}" (ID: ${productId})`);
        product.enrichmentStatus = 'processing';
        await product.save();
        
        // 2. Enrich the product
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const updateData = await enrichProduct(product, genAI);
        
        // 3. Update the product with the new data
        const updatedProduct = await Product.findByIdAndUpdate(productId, { $set: updateData }, { new: true });

        console.log(`[POST-Manual] Successfully re-enriched and saved: "${updatedProduct?.itemName}"`);

        return NextResponse.json({
            message: 'Product re-enriched successfully.',
            product: updatedProduct,
        }, { status: 200 });

    } catch (error: any) {
        console.error('[POST-Manual] Fatal error in manual enrichment:', error);
        return new NextResponse(JSON.stringify({ message: 'An internal server error occurred.', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
