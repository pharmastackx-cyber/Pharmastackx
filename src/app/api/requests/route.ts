
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import MedicineRequest from '@/models/MedicineRequest';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const generationConfig = {
    temperature: 0.2,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
};

// Correctly typed Safety Settings
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

async function runAiAnalysis(userInput: string, userName: string, notes?: string) {
    const prompt = `
    You are a highly intelligent pharmaceutical assistant AI. A user at a pharmacy website could not find the medicine they were looking for. Your task is to analyze their request, standardize it, and provide actionable insights for the pharmacy staff.

    USER'S SEARCH QUERY: "${userInput}"
    USER'S NAME: "${userName}"
    ADDITIONAL NOTES: "${notes || 'None'}"

    Please analyze this request and return ONLY a single, valid JSON object with the following structure. Do not include any other text or markdown formatting.

    **Required JSON Output Format:**
    {
      "aiStandardizedName": "string", // The most likely standardized, correct pharmaceutical name for the user's query. If it's a symptom, what is the most common OTC drug for it?
      "aiSuggestedIngredients": ["string"], // An array of likely active ingredients.
      "aiRequestCategory": "specific_product" | "symptom_based" | "general_inquiry" | "unknown", // Classify the user's request.
      "aiUrgency": "low" | "medium" | "high", // Based on the query, estimate the urgency. A specific product is 'medium', a symptom like 'bad headache' is 'high'. A general inquiry is 'low'.
      "aiSuggestedAlternatives": ["string"] // Suggest 1-2 common, in-stock alternatives if applicable. e.g., for 'Panadol', suggest 'Paracetamol'. If none, return an empty array.
    }

    **Example 1:**
    Query: "panadol for kids"
    Output:
    {
      "aiStandardizedName": "Panadol Children Suspension",
      "aiSuggestedIngredients": ["Paracetamol"],
      "aiRequestCategory": "specific_product",
      "aiUrgency": "medium",
      "aiSuggestedAlternatives": ["Calpol Suspension", "Paracetamol 120mg/5ml Syrup"]
    }

    **Example 2:**
    Query: "something for a bad headache"
    Output:
    {
      "aiStandardizedName": "Ibuprofen 400mg Tablets",
      "aiSuggestedIngredients": ["Ibuprofen", "Paracetamol"],
      "aiRequestCategory": "symptom_based",
      "aiUrgency": "high",
      "aiSuggestedAlternatives": ["Nurofen Tablets", "Advil Capsules"]
    }

    **Example 3:**
    Query: "do you have vitamin c"
    Output:
    {
        "aiStandardizedName": "Vitamin C 1000mg Tablets",
        "aiSuggestedIngredients": ["Ascorbic Acid"],
        "aiRequestCategory": "general_inquiry",
        "aiUrgency": "low",
        "aiSuggestedAlternatives": []
    }
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
            safetySettings,
        });
        const responseText = result.response.text();
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedJson);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Return a default error structure if AI fails
        return {
            aiStandardizedName: "AI Analysis Failed",
            aiSuggestedIngredients: [],
            aiRequestCategory: "unknown",
            aiUrgency: "low",
            aiSuggestedAlternatives: [], // Corrected syntax
        };
    }
}


export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { medicineName, userName, contact, notes } = body;

        if (!medicineName || !userName || !contact) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const aiData = await runAiAnalysis(medicineName, userName, notes);

        const newRequest = await MedicineRequest.create({
            rawMedicineName: medicineName,
            userName,
            contact,
            notes,
            status: 'pending',
            ...aiData
        });

        return NextResponse.json({ message: 'Request submitted successfully', request: newRequest }, { status: 201 });

    } catch (error: any) {
        console.error('Error in POST /api/requests:', error);
        return NextResponse.json({ message: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}
